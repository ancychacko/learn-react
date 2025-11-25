// controllers/notifications.js
const pool = require("../Database/pool");

/**
 * GET /api/notifications
 * returns notifications for logged-in user (latest first)
 */
async function getNotifications(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  try {
    const r = await pool.query(
      `SELECT id, actor_id, post_id, comment_id, share_id, type, data, is_read, created_at
       FROM notifications
       WHERE recipient_id = $1
       ORDER BY created_at DESC LIMIT 200`,
      [req.session.userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("GET /api/notifications error", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /api/notifications/:id/read
 */
async function markRead(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const nid = parseInt(req.params.id, 10);
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND recipient_id = $2",
      [nid, req.session.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("mark notification read err", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/notifications/unread_count
 */
async function unreadCount(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  try {
    const r = await pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id = $1 AND is_read = false",
      [req.session.userId]
    );
    res.json({ count: r.rows[0].count });
  } catch (err) {
    console.error("GET unread count error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getNotifications, markRead, unreadCount };
