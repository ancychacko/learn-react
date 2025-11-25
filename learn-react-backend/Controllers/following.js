// controllers/following.js
const pool = require("../Database/pool");

async function getFollowing(req, res) {
  if (!req.session.userId) return res.status(401).json({ error: "Not authenticated" });
  try {
    const r = await pool.query(
      `SELECT u.id, u.name, u.avatar_url, u.title
       FROM follows f
       JOIN users u ON u.id = f.followee_id
       WHERE f.follower_id = $1
       ORDER BY u.name ASC`,
      [req.session.userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("GET /api/following error", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { getFollowing };
