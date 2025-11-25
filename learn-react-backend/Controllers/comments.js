// controllers/comments.js
const pool = require("../Database/pool");
const createNotification = require("../utils/createNotification");

/**
 * POST /api/posts/:id/comments
 * body: { content, parent_id }
 */
async function postComment(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const postId = parseInt(req.params.id, 10);
  const { content, parent_id = null } = req.body;
  if (!content || !content.trim())
    return res.status(400).json({ error: "Content required" });

  try {
    if (parent_id) {
      const parent = await pool.query(
        "SELECT id, post_id, user_id FROM comments WHERE id=$1",
        [parent_id]
      );
      if (!parent.rows.length)
        return res.status(400).json({ error: "Parent comment not found" });
      if (parent.rows[0].post_id !== postId)
        return res
          .status(400)
          .json({ error: "Parent comment belongs to another post" });
    }

    const r = await pool.query(
      "INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING id, content, parent_id, created_at, user_id",
      [postId, req.session.userId, content, parent_id]
    );

    const user = await pool.query(
      "SELECT name, avatar_url FROM users WHERE id=$1",
      [req.session.userId]
    );

    // notification: notify post owner that there is a comment (unless owner commented)
    const postOwnerRes = await pool.query(
      "SELECT user_id FROM posts WHERE id=$1",
      [postId]
    );
    if (
      postOwnerRes.rows.length &&
      postOwnerRes.rows[0].user_id !== req.session.userId
    ) {
      await createNotification({
        recipientId: postOwnerRes.rows[0].user_id,
        actorId: req.session.userId,
        type: "comment",
        postId,
        commentId: r.rows[0].id,
      });
    }

    // If this is a reply, notify parent comment owner (unless same as actor)
    if (parent_id) {
      const parentOwnerRes = await pool.query(
        "SELECT user_id FROM comments WHERE id=$1",
        [parent_id]
      );
      if (
        parentOwnerRes.rows.length &&
        parentOwnerRes.rows[0].user_id !== req.session.userId
      ) {
        await createNotification({
          recipientId: parentOwnerRes.rows[0].user_id,
          actorId: req.session.userId,
          type: "reply",
          postId,
          commentId: r.rows[0].id,
        });
      }
    }

    res.status(201).json({
      id: r.rows[0].id,
      content: r.rows[0].content,
      parent_id: r.rows[0].parent_id,
      created_at: r.rows[0].created_at,
      user_name: user.rows[0].name,
      avatar_url: user.rows[0].avatar_url,
      like_count: 0,
      liked_by_me: false,
      reply_count: 0,
      is_owner: true,
    });
  } catch (err) {
    console.error("comment err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function getComments(req, res) {
  try {
    const postId = parseInt(req.params.id, 10);
    const sort = (req.query.sort || "recent").toLowerCase();
    const me = req.session.userId || null;

    const q = `
      SELECT
        c.id, c.post_id, c.user_id, c.content, c.parent_id, c.created_at,
        u.name AS user_name, u.avatar_url,
        COALESCE(cl.count, 0) AS like_count,
        CASE WHEN $2::int IS NULL THEN false ELSE EXISTS (SELECT 1 FROM comment_likes ck WHERE ck.comment_id = c.id AND ck.user_id = $2) END AS liked_by_me,
        CASE WHEN $2::int IS NULL THEN false ELSE EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = $2 AND f.followee_id = c.user_id) END AS is_following
      FROM comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN (SELECT comment_id, COUNT(*)::int AS count FROM comment_likes GROUP BY comment_id) cl ON cl.comment_id = c.id
      WHERE c.post_id = $1
    `;
    const all = await pool.query(q, [postId, me]);

    const byId = new Map();
    const roots = [];
    all.rows.forEach((r) => {
      byId.set(r.id, {
        id: r.id,
        post_id: r.post_id,
        user_id: r.user_id,
        content: r.content,
        parent_id: r.parent_id,
        created_at: r.created_at,
        user_name: r.user_name,
        avatar_url: r.avatar_url,
        like_count: Number(r.like_count || 0),
        liked_by_me: Boolean(r.liked_by_me),
        is_following: Boolean(r.is_following),
        is_owner: me ? r.user_id === me : false,
        replies: [],
      });
    });

    byId.forEach((node) => {
      if (node.parent_id) {
        const parent = byId.get(node.parent_id);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortFn = (a, b) => {
      if (sort === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sort === "relevant") return (b.like_count || 0) - (a.like_count || 0);
      return new Date(b.created_at) - new Date(a.created_at);
    };
    function sortRec(list) {
      list.sort(sortFn);
      list.forEach((it) => {
        if (it.replies && it.replies.length) sortRec(it.replies);
      });
    }
    sortRec(roots);

    function addCounts(list) {
      list.forEach((it) => {
        it.reply_count = it.replies ? it.replies.length : 0;
        if (it.replies && it.replies.length) addCounts(it.replies);
      });
    }
    addCounts(roots);

    res.json(roots);
  } catch (err) {
    console.error("get comments err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function toggleLike(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const userId = req.session.userId;
  const commentId = parseInt(req.params.id, 10);

  try {
    const insert = await pool.query(
      `INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)
       ON CONFLICT (comment_id, user_id) DO NOTHING RETURNING id`,
      [commentId, userId]
    );

    let liked;
    if (insert.rowCount > 0) {
      liked = true;
      // notify comment owner
      const ownerRes = await pool.query(
        "SELECT user_id, post_id FROM comments WHERE id=$1",
        [commentId]
      );
      if (ownerRes.rows.length && ownerRes.rows[0].user_id !== userId) {
        await createNotification({
          recipientId: ownerRes.rows[0].user_id,
          actorId: userId,
          type: "comment_like",
          postId: ownerRes.rows[0].post_id,
          commentId,
        });
      }
    } else {
      await pool.query(
        "DELETE FROM comment_likes WHERE comment_id=$1 AND user_id=$2",
        [commentId, userId]
      );
      liked = false;
    }

    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id=$1",
      [commentId]
    );
    res.json({ liked, count: countRes.rows[0].count });
  } catch (err) {
    console.error("comment like toggle err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function editComment(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const commentId = parseInt(req.params.id, 10);
  const { content } = req.body;
  if (!content || !content.trim())
    return res.status(400).json({ error: "Content required." });

  try {
    const r = await pool.query("SELECT user_id FROM comments WHERE id=$1", [
      commentId,
    ]);
    if (!r.rows.length)
      return res.status(404).json({ error: "Comment not found" });
    if (r.rows[0].user_id !== req.session.userId)
      return res.status(403).json({ error: "Forbidden" });

    await pool.query("UPDATE comments SET content=$1 WHERE id=$2", [
      content,
      commentId,
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("edit comment err", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function deleteComment(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const commentId = parseInt(req.params.id, 10);

  try {
    const r = await pool.query("SELECT user_id FROM comments WHERE id=$1", [
      commentId,
    ]);
    if (!r.rows.length)
      return res.status(404).json({ error: "Comment not found" });
    if (r.rows[0].user_id !== req.session.userId)
      return res.status(403).json({ error: "Forbidden" });

    await pool.query("DELETE FROM comments WHERE id=$1", [commentId]);
    res.json({ ok: true });
  } catch (err) {
    console.error("delete comment err", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  postComment,
  getComments,
  toggleLike,
  editComment,
  deleteComment,
};
