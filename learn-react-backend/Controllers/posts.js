//Controllers/post.js (FINAL UPDATED VERSION)
const pool = require("../Database/pool");
const createNotification = require("../utils/createNotification");
const safeUnlink = require("../utils/safeUnlink");

/* ============================================================
   CREATE POST
============================================================ */
// async function createPost(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const { content, visibility = "Anyone" } = req.body;
//   if (!content || content.trim() === "")
//     return res.status(400).json({ error: "Post content required" });

//   let media_url = null;
//   let media_type = null;

//   if (req.file) {
//     media_url = `/uploads/${req.file.filename}`;
//     const mimetype = req.file.mimetype || "";
//     if (mimetype.startsWith("image/")) media_type = "image";
//     else if (mimetype.startsWith("video/")) media_type = "video";
//     else media_type = "file";
//   }

//   try {
//     await pool.query(
//       `INSERT INTO posts
//        (user_id, content, media_url, media_type, visibility, is_share, original_post_id)
//        VALUES ($1, $2, $3, $4, $5, false, NULL)`,
//       [req.session.userId, content, media_url, media_type, visibility]
//     );

//     res.status(201).json({ ok: true });
//   } catch (err) {
//     console.error("createPost err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }
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
      `INSERT INTO posts 
       (user_id, content, media_url, media_type, visibility, is_share, original_post_id)
       VALUES ($1, $2, $3, $4, $5, false, NULL)`,
      [req.session.userId, content, media_url, media_type, visibility]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("createPost err", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ==================================================================
   GET POSTS — FULL LINKEDIN NESTED SHARE SUPPORT
================================================================== */
// async function getPosts(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const me = req.session.userId;

//   try {
//     const q = `
//       SELECT
//         p.id, p.content, p.media_url, p.media_type, p.visibility,
//         p.created_at, p.is_share, p.original_post_id,

//         u.id AS user_id,
//         u.name AS user_name,
//         u.avatar_url,

//         COALESCE(like_counts.count, 0) AS like_count,
//         COALESCE(comment_counts.count, 0) AS comment_count,
//         COALESCE(share_counts.count, 0) AS share_count,

//         EXISTS(
//           SELECT 1 FROM likes lk
//           WHERE lk.post_id = p.id AND lk.user_id = $1
//         ) AS liked_by_me,

//         -- original post data for nested shared post
//         op.id AS op_id,
//         op.content AS op_content,
//         op.media_url AS op_media_url,
//         op.media_type AS op_media_type,
//         op.created_at AS op_created_at,

//         ou.name AS op_user_name,
//         ou.avatar_url AS op_avatar_url

//       FROM posts p
//       JOIN users u ON u.id = p.user_id

//       LEFT JOIN posts op ON op.id = p.original_post_id
//       LEFT JOIN users ou ON ou.id = op.user_id

//       LEFT JOIN (
//         SELECT post_id, COUNT(*)::int AS count
//         FROM likes GROUP BY post_id
//       ) like_counts ON like_counts.post_id = p.id

//       LEFT JOIN (
//         SELECT post_id, COUNT(*)::int AS count
//         FROM comments GROUP BY post_id
//       ) comment_counts ON comment_counts.post_id = p.id

//       LEFT JOIN (
//         SELECT post_id, COUNT(*)::int AS count
//         FROM shares GROUP BY post_id
//       ) share_counts ON share_counts.post_id = p.id

//       WHERE (
//         p.visibility = 'Anyone'
//         OR p.user_id = $1
//         OR (
//           p.visibility = 'Connections'
//           AND EXISTS (
//             SELECT 1 FROM follows f
//             WHERE f.follower_id = p.user_id
//             AND f.followee_id = $1
//           )
//         )
//       )
//       ORDER BY p.created_at DESC;
//     `;

//     const r = await pool.query(q, [me]);
//     const rows = r.rows;

//     const formatted = rows.map((p) => {
//       if (!p.is_share) return p;

//       return {
//         ...p,
//         share_comment: p.content || "",
//         shared_post: {
//           id: p.op_id,
//           content: p.op_content,
//           media_url: p.op_media_url,
//           media_type: p.op_media_type,
//           created_at: p.op_created_at,
//           user_name: p.op_user_name,
//           avatar_url: p.op_avatar_url,
//         },
//       };
//     });

//     res.json(formatted);
//   } catch (err) {
//     console.error("get posts err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }
async function getPosts(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const me = req.session.userId;

  try {
    const q = `
      SELECT
        p.id, p.content, p.media_url, p.media_type, p.visibility,
        p.created_at, p.is_share, p.original_post_id,

        u.id AS user_id,
        u.name AS user_name,
        u.avatar_url,

        COALESCE(lc.count, 0) AS like_count,
        COALESCE(cc.count, 0) AS comment_count,
        COALESCE(sc.count, 0) AS share_count,

        EXISTS(
          SELECT 1 FROM likes lk 
          WHERE lk.post_id = p.id AND lk.user_id = $1
        ) AS liked_by_me,

        op.id AS op_id,
        op.content AS op_content,
        op.media_url AS op_media_url,
        op.media_type AS op_media_type,
        op.created_at AS op_created_at,

        ou.name AS op_user_name,
        ou.avatar_url AS op_avatar_url

      FROM posts p
      JOIN users u ON u.id = p.user_id

      LEFT JOIN posts op ON op.id = p.original_post_id
      LEFT JOIN users ou ON ou.id = op.user_id

      LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM likes GROUP BY post_id) lc 
        ON lc.post_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM comments GROUP BY post_id) cc 
        ON cc.post_id = p.id
      LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM shares GROUP BY post_id) sc 
        ON sc.post_id = p.id

      ORDER BY p.created_at DESC;
    `;

    const r = await pool.query(q, [me]);

    const formatted = r.rows.map((p) => {
      if (!p.is_share) return p;

      const originalMissing = !p.op_id;

      return {
        ...p,
        share_comment: p.content || "",
        original_missing: originalMissing,
        original_post: originalMissing
          ? null
          : {
              id: p.op_id,
              user_name: p.op_user_name,
              avatar_url: p.op_avatar_url,
              content: p.op_content,
              media_url: p.op_media_url,
              media_type: p.op_media_type,
              created_at: p.op_created_at,
            },
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("get posts err", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ============================================================
   LIKE / UNLIKE
============================================================ */
async function toggleLike(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const userId = req.session.userId;
  const postId = parseInt(req.params.id, 10);

  try {
    const insert = await pool.query(
      `INSERT INTO likes (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [postId, userId]
    );

    let liked = insert.rowCount > 0;

    if (liked) {
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
      await pool.query("DELETE FROM likes WHERE post_id=$1 AND user_id=$2", [
        postId,
        userId,
      ]);
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

/* ============================================================
   EDIT POST
============================================================ */
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
      `UPDATE posts 
       SET content=$1, visibility=$2, media_url=$3, media_type=$4
       WHERE id=$5`,
      [content, visibility, media_url, media_type, postId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("post edit err", err);
    res.status(500).json({ error: "Server error" });
  }
}

/* ============================================================
   DELETE POST (SAFE MEDIA DELETE)
============================================================ */
// async function deletePost(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const postId = Number(req.params.id);

//   try {
//     const r = await pool.query(
//       "SELECT user_id, media_url FROM posts WHERE id=$1",
//       [postId]
//     );

//     if (!r.rows.length)
//       return res.status(404).json({ error: "Post not found" });

//     const post = r.rows[0];

//     if (post.user_id !== req.session.userId)
//       return res.status(403).json({ error: "Forbidden" });

//     let shouldDeleteMedia = false;

//     if (post.media_url) {
//       const check = await pool.query(
//         `SELECT COUNT(*)::int AS count
//          FROM posts
//          WHERE media_url = $1 AND id <> $2`,
//         [post.media_url, postId]
//       );

//       if (check.rows[0].count === 0) {
//         shouldDeleteMedia = true;
//       }
//     }

//     await pool.query("DELETE FROM posts WHERE id=$1", [postId]);

//     if (shouldDeleteMedia && post.media_url) {
//       safeUnlink(post.media_url);
//     }

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("delete post err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }
async function deletePost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const postId = Number(req.params.id);

  try {
    const r = await pool.query(
      "SELECT user_id, media_url FROM posts WHERE id=$1",
      [postId]
    );

    if (!r.rows.length)
      return res.status(404).json({ error: "Post not found" });

    const post = r.rows[0];

    if (post.user_id !== req.session.userId)
      return res.status(403).json({ error: "Forbidden" });

    // Allow delete even if shared posts reference it
    await pool.query(
      "UPDATE posts SET original_post_id=NULL WHERE original_post_id=$1",
      [postId]
    );

    // Safe check if media is used by another post
    let shouldDeleteMedia = false;

    if (post.media_url) {
      const check = await pool.query(
        `SELECT COUNT(*)::int AS count 
         FROM posts 
         WHERE media_url = $1 AND id <> $2`,
        [post.media_url, postId]
      );

      if (check.rows[0].count === 0) shouldDeleteMedia = true;
    }

    await pool.query("DELETE FROM posts WHERE id=$1", [postId]);

    if (shouldDeleteMedia) safeUnlink(post.media_url);

    res.json({ ok: true });
  } catch (err) {
    console.error("delete post err", err);
    res.status(500).json({ error: "Server error" });
  }
}
/* ==================================================================
   GET SINGLE POST (Nested Shared Post)
================================================================== */
async function getSinglePost(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const postId = Number(req.params.id);
  const me = req.session.userId;

  try {
    const q = `
      SELECT 
        p.*,
        u.name AS user_name,
        u.avatar_url,

        op.id AS op_id,
        op.content AS op_content,
        op.media_url AS op_media_url,
        op.media_type AS op_media_type,
        op.created_at AS op_created_at,

        ou.name AS op_user_name,
        ou.avatar_url AS op_avatar_url,

        COALESCE(lc.count, 0) AS like_count,
        COALESCE(cc.count, 0) AS comment_count,
        COALESCE(sc.count, 0) AS share_count,

        EXISTS(
          SELECT 1 FROM likes l
          WHERE l.post_id = p.id AND l.user_id = $2
        ) AS liked_by_me

      FROM posts p
      JOIN users u ON u.id = p.user_id

      LEFT JOIN posts op ON op.id = p.original_post_id
      LEFT JOIN users ou ON ou.id = op.user_id

      LEFT JOIN (
        SELECT post_id, COUNT(*)::int AS count FROM likes GROUP BY post_id
      ) lc ON lc.post_id = p.id

      LEFT JOIN (
        SELECT post_id, COUNT(*)::int AS count FROM comments GROUP BY post_id
      ) cc ON cc.post_id = p.id

      LEFT JOIN (
        SELECT post_id, COUNT(*)::int AS count FROM shares GROUP BY post_id
      ) sc ON sc.post_id = p.id

      WHERE p.id = $1
      LIMIT 1;
    `;

    const r = await pool.query(q, [postId, me]);
    if (!r.rows.length)
      return res.status(404).json({ error: "Post not found" });

    const p = r.rows[0];

    if (!p.is_share) return res.json(p);

    return res.json({
      ...p,
      share_comment: p.content,
      original_post: {
        id: p.op_id,
        content: p.op_content,
        media_url: p.op_media_url,
        media_type: p.op_media_type,
        created_at: p.op_created_at,
        user_name: p.op_user_name,
        avatar_url: p.op_avatar_url,
      },
    });
  } catch (err) {
    console.error("GET /posts/:id error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createPost,
  getPosts,
  toggleLike,
  editPost,
  deletePost,
  getSinglePost,
};
