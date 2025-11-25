// controllers/posts.js
const pool = require("../Database/pool");
const createNotification = require("../utils/createNotification");
const safeUnlink = require("../utils/safeUnlink");

/**
 * Create post - expects upload.single('media') in route if media present
 */
async function createPost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const { content, visibility = "Anyone" } = req.body;
  if (!content || content.trim() === "")
    return res.status(400).json({ error: "Post content required" });

  let media_url = null;
  let media_type = null;
  if (req.file) {
    media_url = `/uploads/${req.file.filename}`;
    const mimetype = req.file.mimetype || "";
    if (mimetype.startsWith("image/")) media_type = "image";
    else if (mimetype.startsWith("video/")) media_type = "video";
    else media_type = "file";
  }

  try {
    await pool.query(
      "INSERT INTO posts (user_id, content, media_url, media_type, visibility) VALUES ($1,$2,$3,$4,$5)",
      [req.session.userId, content, media_url, media_type, visibility]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("createPost err", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * Get posts list - respects visibility:
 * - Anyone
 * - or owner (post.user_id = me)
 * - or visibility = 'Connections' AND post owner follows me (owner -> me)
 */
async function getPosts(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const me = req.session.userId;

  try {
    const q = `
      SELECT
        p.id, p.content, p.media_url, p.media_type, p.visibility, p.created_at,
        u.id AS user_id, u.name AS user_name, u.avatar_url,
        COALESCE(like_counts.count, 0) AS like_count,
        COALESCE(comment_counts.count, 0) AS comment_count,
        COALESCE(share_counts.count, 0) AS share_count,
        EXISTS(SELECT 1 FROM likes lk WHERE lk.post_id = p.id AND lk.user_id = $1) AS liked_by_me
      FROM posts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM likes GROUP BY post_id) like_counts ON like_counts.post_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM comments GROUP BY post_id) comment_counts ON comment_counts.post_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM shares GROUP BY post_id) share_counts ON share_counts.post_id = p.id
      WHERE (
        p.visibility = 'Anyone'
        OR p.user_id = $1
        OR (p.visibility = 'Connections' AND EXISTS(
          SELECT 1 FROM follows f WHERE f.follower_id = p.user_id AND f.followee_id = $1
        ))
      )
      ORDER BY p.created_at DESC;
    `;
    const r = await pool.query(q, [me]);
    res.json(r.rows);
  } catch (err) {
    console.error("get posts err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function toggleLike(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const userId = req.session.userId;
  const postId = parseInt(req.params.id, 10);

  try {
    const insert = await pool.query(
      `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING RETURNING id`,
      [postId, userId]
    );

    let liked;
    if (insert.rowCount > 0) {
      liked = true;
      // create notification for owner (if not liking own post)
      const ownerRes = await pool.query(
        "SELECT user_id FROM posts WHERE id=$1",
        [postId]
      );
      if (ownerRes.rows.length && ownerRes.rows[0].user_id !== userId) {
        await createNotification({
          recipientId: ownerRes.rows[0].user_id,
          actorId: userId,
          type: "like",
          postId,
        });
      }
    } else {
      await pool.query(`DELETE FROM likes WHERE post_id=$1 AND user_id=$2`, [
        postId,
        userId,
      ]);
      liked = false;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM likes WHERE post_id=$1`,
      [postId]
    );
    res.json({ liked, count: countRes.rows[0].count });
  } catch (err) {
    console.error("like toggle err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function editPost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const postId = parseInt(req.params.id, 10);
  const { content, visibility = "Anyone", remove_media } = req.body;

  try {
    const r = await pool.query(
      "SELECT user_id, media_url, media_type FROM posts WHERE id=$1",
      [postId]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Post not found" });
    const post = r.rows[0];
    if (post.user_id !== req.session.userId)
      return res.status(403).json({ error: "Forbidden" });

    let media_url = post.media_url;
    let media_type = post.media_type;

    if (req.file) {
      if (post.media_url) safeUnlink(post.media_url);
      media_url = `/uploads/${req.file.filename}`;
      const mimetype = req.file.mimetype || "";
      if (mimetype.startsWith("image/")) media_type = "image";
      else if (mimetype.startsWith("video/")) media_type = "video";
      else media_type = "file";
    } else if (remove_media === "true") {
      if (post.media_url) safeUnlink(post.media_url);
      media_url = null;
      media_type = null;
    }

    await pool.query(
      `UPDATE posts SET content=$1, visibility=$2, media_url=$3, media_type=$4 WHERE id=$5`,
      [content, visibility, media_url, media_type, postId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("post edit err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function deletePost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const postId = parseInt(req.params.id, 10);

  try {
    const r = await pool.query(
      "SELECT user_id, media_url FROM posts WHERE id=$1",
      [postId]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "Post not found" });
    if (r.rows[0].user_id !== req.session.userId)
      return res.status(403).json({ error: "Forbidden" });

    await pool.query("DELETE FROM posts WHERE id=$1", [postId]);

    if (r.rows[0].media_url) safeUnlink(r.rows[0].media_url);

    res.json({ ok: true });
  } catch (err) {
    console.error("delete post err", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { createPost, getPosts, toggleLike, editPost, deletePost };
