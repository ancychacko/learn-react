//Controllers/notifications.js
// const pool = require("../Database/pool");

// /**
//  * ===========================================================
//  *  GET /api/notifications
//  *  Returns LinkedIn-style enriched notifications:
//  *  - actor_name
//  *  - actor_avatar
//  *  - post_content (for preview)
//  *  - comment_content (for preview)
//  *  - Fully supports: like, comment, share, reshare
//  * ===========================================================
//  */
// async function getNotifications(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   try {
//     const sql = `
//       SELECT
//         n.id,
//         n.actor_id,
//         n.post_id,
//         n.comment_id,
//         n.share_id,
//         n.type,
//         n.data,
//         n.is_read,
//         n.created_at,

//         -- Actor Info
//         u.name AS actor_name,
//         u.avatar_url AS actor_avatar,

//         -- Post preview
//         p.content AS post_content,
//         p.media_url AS post_media,

//         -- Comment preview
//         c.content AS comment_content

//       FROM notifications n
//       LEFT JOIN users u ON u.id = n.actor_id
//       LEFT JOIN posts p ON p.id = n.post_id
//       LEFT JOIN comments c ON c.id = n.comment_id
//       WHERE n.recipient_id = $1
//       ORDER BY n.created_at DESC
//       LIMIT 200;
//     `;

//     const result = await pool.query(sql, [req.session.userId]);
//     res.json(result.rows);

//   } catch (err) {
//     console.error("GET /api/notifications error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// /**
//  * ===========================================================
//  *  POST /api/notifications/:id/read
//  * ===========================================================
//  */
// async function markRead(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const nid = parseInt(req.params.id, 10);

//   try {
//     await pool.query(
//       "UPDATE notifications SET is_read = true WHERE id=$1 AND recipient_id=$2",
//       [nid, req.session.userId]
//     );

//     res.json({ ok: true });

//   } catch (err) {
//     console.error("mark notification read err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// /**
//  * ===========================================================
//  *  GET /api/notifications/unread_count
//  *  Used for the RED dot badge on the bell icon
//  * ===========================================================
//  */
// async function unreadCount(req, res) {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   try {
//     const r = await pool.query(
//       "SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id=$1 AND is_read=false",
//       [req.session.userId]
//     );

//     res.json({ count: r.rows[0].count });

//   } catch (err) {
//     console.error("GET unread count error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// }

// module.exports = {
//   getNotifications,
//   markRead,
//   unreadCount,
// };

// Controllers/notifications.js


const pool = require("../Database/pool");

/**
 * ===========================================================
 *  GET /api/notifications
 *  Returns LinkedIn-style notifications + hides muted actors
 * ===========================================================
 */
async function getNotifications(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  try {
    const userId = req.session.userId;

    const sql = `
      SELECT 
        n.id,
        n.actor_id,
        n.post_id,
        n.comment_id,
        n.share_id,
        n.type,
        n.data,
        n.is_read,
        n.created_at,

        -- Actor Info
        u.name AS actor_name,
        u.avatar_url AS actor_avatar,

        -- Post preview
        p.content AS post_content,
        p.media_url AS post_media,

        -- Comment preview
        c.content AS comment_content

      FROM notifications n
      LEFT JOIN users u ON u.id = n.actor_id
      LEFT JOIN posts p ON p.id = n.post_id
      LEFT JOIN comments c ON c.id = n.comment_id

      WHERE n.recipient_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM muted_notifications m
        WHERE m.user_id = $1 AND m.actor_id = n.actor_id
      )

      ORDER BY n.created_at DESC
      LIMIT 200;
    `;

    const result = await pool.query(sql, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/notifications error", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ===========================================================
 *  POST /api/notifications/:id/read
 * ===========================================================
 */
async function markRead(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const nid = parseInt(req.params.id, 10);

  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id=$1 AND recipient_id=$2",
      [nid, req.session.userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("mark notification read err", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ===========================================================
 *  DELETE /api/notifications/:id/delete
 * ===========================================================
 */
async function deleteNotification(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  try {
    await pool.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND recipient_id = $2`,
      [req.params.id, req.session.userId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("delete notification error", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ===========================================================
 *  POST /api/notifications/mute/:actorId
 *  Mutes ALL future notifications from this actor
 * ===========================================================
 */
async function muteActor(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const actorId = parseInt(req.params.actorId, 10);

  try {
    await pool.query(
      `
      INSERT INTO muted_notifications (user_id, actor_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, actor_id) DO NOTHING
      `,
      [req.session.userId, actorId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("muteActor error", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ===========================================================
 *  DELETE /api/notifications/mute/:actorId
 *  Unmute user (optional but added)
 * ===========================================================
 */
async function unmuteActor(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const actorId = parseInt(req.params.actorId, 10);

  try {
    await pool.query(
      `DELETE FROM muted_notifications WHERE user_id=$1 AND actor_id=$2`,
      [req.session.userId, actorId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("unmuteActor error", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * ===========================================================
 *  GET /api/notifications/unread_count
 *  Only count unmuted notifications
 * ===========================================================
 */
async function unreadCount(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  try {
    const r = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM notifications n
      WHERE n.recipient_id = $1 
      AND n.is_read = false
      AND NOT EXISTS (
        SELECT 1 FROM muted_notifications m
        WHERE m.user_id = $1 AND m.actor_id = n.actor_id
      )
      `,
      [req.session.userId]
    );

    res.json({ count: r.rows[0].count });
  } catch (err) {
    console.error("unreadCount error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  getNotifications,
  markRead,
  unreadCount,
  deleteNotification,
  muteActor,
  unmuteActor,
};
