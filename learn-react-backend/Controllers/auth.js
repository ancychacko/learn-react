// controllers/auth.js
const bcrypt = require("bcryptjs");
const pool = require("../Database/pool");
const safeUnlink = require("../utils/safeUnlink");

async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ error: "Name, email, and password required." });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ error: "Invalid email." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be 6+ chars." });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email already registered." });

    const password_hash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name",
      [name, email, password_hash]
    );
    res.status(201).json({ ok: true, name: insert.rows[0].name });
  } catch (err) {
    console.error("Register error", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email + password required" });

  try {
    const r = await pool.query(
      "SELECT id, name, email, password_hash, avatar_url, title FROM users WHERE email=$1",
      [email]
    );
    if (r.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.save((err) => {
      if (err) {
        console.error("Session save error", err);
        return res.status(500).json({ error: "Session error" });
      }
      res.json({
        ok: true,
        name: user.name,
        avatar_url: user.avatar_url || null,
      });
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Server error" });
  }
}

async function me(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  try {
    const r = await pool.query(
      "SELECT id, name, email, avatar_url, title FROM users WHERE id=$1",
      [req.session.userId]
    );
    if (!r.rows.length)
      return res.status(401).json({ error: "Not authenticated" });
    const u = r.rows[0];
    res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar_url: u.avatar_url || null,
      title: u.title || null,
    });
  } catch (err) {
    console.error("/api/me error", err);
    res.status(500).json({ error: "Server error" });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid", { path: "/", sameSite: "lax" });
    res.json({ ok: true });
  });
}

/**
 * profile update: accepts multipart field 'avatar' and 'title'
 * Use your existing multer middleware in the route definition (upload.single("avatar"))
 */
async function updateProfile(req, res) {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const userId = req.session.userId;
  const { title } = req.body;
  let avatar_url = null;

  try {
    if (req.file) {
      avatar_url = `/uploads/${req.file.filename}`;
      const prev = await pool.query(
        "SELECT avatar_url FROM users WHERE id=$1",
        [userId]
      );
      if (prev.rows.length && prev.rows[0].avatar_url) {
        safeUnlink(prev.rows[0].avatar_url);
      }
    }

    if (avatar_url && title !== undefined) {
      await pool.query("UPDATE users SET avatar_url=$1, title=$2 WHERE id=$3", [
        avatar_url,
        title || null,
        userId,
      ]);
    } else if (avatar_url) {
      await pool.query("UPDATE users SET avatar_url=$1 WHERE id=$2", [
        avatar_url,
        userId,
      ]);
    } else if (title !== undefined) {
      await pool.query("UPDATE users SET title=$1 WHERE id=$2", [
        title || null,
        userId,
      ]);
    }

    res.json({
      ok: true,
      avatar_url,
      title: title !== undefined ? title : undefined,
    });
  } catch (err) {
    console.error("profile update err", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = { register, login, me, logout, updateProfile };
