// //server.js
// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const session = require("express-session");
// const pg = require("pg");
// const PgSession = require("connect-pg-simple")(session);
// const bcrypt = require("bcryptjs");
// const cookieParser = require("cookie-parser");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const mime = require("mime-types");

// // -----------------------------
// // Environment / config
// // -----------------------------
// const {
//   DB_HOST,
//   DB_PORT,
//   DB_USER,
//   DB_PASSWORD,
//   DB_NAME,
//   DATABASE_URL,
//   DB_SSL,
//   PORT = 4000,
//   SESSION_SECRET = "change-me",
//   NODE_ENV,
//   CORS_ORIGINS,
// } = process.env;

// // -----------------------------
// // DB pool config
// // -----------------------------
// let poolConfig;
// if (DATABASE_URL) {
//   poolConfig = { connectionString: DATABASE_URL };
// } else {
//   poolConfig = {
//     host: DB_HOST || "localhost",
//     port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
//     user: DB_USER,
//     password: DB_PASSWORD,
//     database: DB_NAME,
//   };
// }
// if ((DB_SSL === "true" || DB_SSL === "1") && NODE_ENV === "production") {
//   poolConfig.ssl = { rejectUnauthorized: false };
// }
// const pool = new pg.Pool(poolConfig);

// // -----------------------------
// // Ensure tables exist (including new share_notifications + shares.recipients array)
// // -----------------------------
// (async () => {
//   try {
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS likes (
//         id SERIAL PRIMARY KEY,
//         post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
//         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         created_at TIMESTAMPTZ DEFAULT now(),
//         UNIQUE (post_id, user_id)
//       );

//       CREATE TABLE IF NOT EXISTS comments (
//         id SERIAL PRIMARY KEY,
//         post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
//         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         content TEXT NOT NULL,
//         parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
//         created_at TIMESTAMPTZ DEFAULT now()
//       );

//       CREATE TABLE IF NOT EXISTS shares (
//         id SERIAL PRIMARY KEY,
//         post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
//         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         recipients INTEGER[],
//         created_at TIMESTAMPTZ DEFAULT now()
//       );

//       CREATE TABLE IF NOT EXISTS share_notifications (
//         id SERIAL PRIMARY KEY,
//         post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
//         sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         created_at TIMESTAMPTZ DEFAULT now()
//       );

//       CREATE TABLE IF NOT EXISTS comment_likes (
//         id SERIAL PRIMARY KEY,
//         comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
//         user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         created_at TIMESTAMPTZ DEFAULT now(),
//         UNIQUE (comment_id, user_id)
//       );

//       CREATE TABLE IF NOT EXISTS reports (
//         id SERIAL PRIMARY KEY,
//         comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
//         reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         reason TEXT,
//         created_at TIMESTAMPTZ DEFAULT now()
//       );

//       CREATE TABLE IF NOT EXISTS follows (
//         id SERIAL PRIMARY KEY,
//         follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//         created_at TIMESTAMPTZ DEFAULT now(),
//         UNIQUE(follower_id, followee_id)
//       );
//     `);
//     // console.log("Tables ensured.");
//   } catch (err) {
//     console.error("Table creation failed:", err);
//   }
// })();

// // -----------------------------
// // App setup
// // -----------------------------
// const app = express();
// app.use(express.json());
// app.use(cookieParser());

// // -----------------------------
// // CORS
// // -----------------------------
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://172.16.2.164:3000",
//   "http://192.168.2.89:3000",
// ];
// if (CORS_ORIGINS) {
//   CORS_ORIGINS.split(",").forEach((o) => {
//     const t = o.trim();
//     if (t) allowedOrigins.push(t);
//   });
// }
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
//       return callback(new Error("CORS policy: origin not allowed"));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   })
// );

// // -----------------------------
// // Session (store in PostgreSQL)
// // -----------------------------
// app.use(
//   session({
//     store: new PgSession({
//       pool,
//       tableName: "session",
//       createTableIfMissing: true,
//     }),
//     secret: SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60 * 24,
//     },
//   })
// );

// // -----------------------------
// // File upload setup
// // -----------------------------
// const UPLOAD_DIR = path.join(__dirname, "uploads");
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// app.use(
//   "/uploads",
//   express.static(UPLOAD_DIR, { extensions: ["jpg", "png", "webp", "mp4"] })
// );

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOAD_DIR),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || "";
//     const base = path
//       .basename(file.originalname, ext)
//       .replace(/\s+/g, "-")
//       .replace(/[^a-zA-Z0-9-_]/g, "")
//       .toLowerCase();
//     cb(null, `${Date.now()}-${base}${ext}`);
//   },
// });
// const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// // -----------------------------
// // Helper functions
// // -----------------------------
// function isValidEmail(v) {
//   return /^\S+@\S+\.\S+$/.test(v);
// }
// function safeUnlink(relPath) {
//   if (!relPath) return;
//   const maybe = relPath.startsWith("/") ? relPath.slice(1) : relPath;
//   const full = path.resolve(__dirname, maybe);
//   if (full.startsWith(UPLOAD_DIR) && fs.existsSync(full)) {
//     try {
//       fs.unlinkSync(full);
//     } catch (err) {
//       console.warn("Failed to delete file", full, err);
//     }
//   }
// }
// // server.js  -- PART 2 of 3 (continuation)

// // -----------------------------
// // Auth Routes
// // -----------------------------
// app.post("/api/Register", async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password)
//     return res
//       .status(400)
//       .json({ error: "Name, email, and password required." });
//   if (!isValidEmail(email))
//     return res.status(400).json({ error: "Invalid email." });
//   if (password.length < 6)
//     return res.status(400).json({ error: "Password must be 6+ chars." });

//   try {
//     const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
//       email,
//     ]);
//     if (existing.rows.length > 0)
//       return res.status(409).json({ error: "Email already registered." });

//     const password_hash = await bcrypt.hash(password, 10);
//     // ensure INSERT still works if users table has title column; supply null
//     const insert = await pool.query(
//       "INSERT INTO users (name, email, password_hash, title) VALUES ($1, $2, $3, $4) RETURNING id, name",
//       [name, email, password_hash, null]
//     );
//     res.status(201).json({ ok: true, name: insert.rows[0].name });
//   } catch (err) {
//     console.error("Register error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.post("/api/Login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ error: "Email + password required" });
//   try {
//     // select title instead of about
//     const r = await pool.query(
//       "SELECT id, name, email, password_hash, avatar_url, title FROM users WHERE email=$1",
//       [email]
//     );
//     if (r.rows.length === 0)
//       return res.status(401).json({ error: "Invalid credentials" });

//     const user = r.rows[0];
//     const ok = await bcrypt.compare(password, user.password_hash);
//     if (!ok) return res.status(401).json({ error: "Invalid credentials" });

//     req.session.userId = user.id;
//     req.session.userName = user.name;

//     req.session.save((err) => {
//       if (err) {
//         console.error("Session save error", err);
//         return res.status(500).json({ error: "Session error" });
//       }
//       res.json({
//         ok: true,
//         name: user.name,
//         avatar_url: user.avatar_url || null,
//         title: user.title || null,
//       });
//     });
//   } catch (err) {
//     console.error("Login error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.get("/api/me", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   try {
//     const r = await pool.query(
//       "SELECT id, name, email, avatar_url, title FROM users WHERE id=$1",
//       [req.session.userId]
//     );
//     if (!r.rows.length)
//       return res.status(401).json({ error: "Not authenticated" });
//     const u = r.rows[0];
//     res.json({
//       id: u.id,
//       name: u.name,
//       email: u.email,
//       avatar_url: u.avatar_url || null,
//       title: u.title || null,
//     });
//   } catch (err) {
//     console.error("/api/me error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.post("/api/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Session destroy error", err);
//       return res.status(500).json({ error: "Failed to logout" });
//     }
//     res.clearCookie("connect.sid", { path: "/", sameSite: "lax" });
//     res.json({ ok: true });
//   });
// });

// // -----------------------------
// // Profile update (title + avatar)  <-- updated: about -> title
// // -----------------------------
// app.post("/api/profile", upload.single("avatar"), async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const userId = req.session.userId;
//   const { title } = req.body; // changed
//   let avatar_url = null;

//   try {
//     if (req.file) {
//       avatar_url = `/uploads/${req.file.filename}`;
//       const prev = await pool.query(
//         "SELECT avatar_url FROM users WHERE id=$1",
//         [userId]
//       );
//       if (prev.rows.length && prev.rows[0].avatar_url) {
//         safeUnlink(prev.rows[0].avatar_url);
//       }
//     }

//     if (avatar_url && title !== undefined) {
//       await pool.query("UPDATE users SET avatar_url=$1, title=$2 WHERE id=$3", [
//         avatar_url,
//         title || null,
//         userId,
//       ]);
//     } else if (avatar_url) {
//       await pool.query("UPDATE users SET avatar_url=$1 WHERE id=$2", [
//         avatar_url,
//         userId,
//       ]);
//     } else if (title !== undefined) {
//       await pool.query("UPDATE users SET title=$1 WHERE id=$2", [
//         title || null,
//         userId,
//       ]);
//     }

//     res.json({
//       ok: true,
//       avatar_url,
//       title: title !== undefined ? title : undefined,
//     });
//   } catch (err) {
//     console.error("profile update err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // -----------------------------
// // Posts + Likes + Comments + Shares
// // -----------------------------

// // Create post
// app.post("/api/createPost", upload.single("media"), async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const { content, visibility = "Anyone" } = req.body;
//   if (!content || content.trim() === "")
//     return res.status(400).json({ error: "Post content required" });

//   let media_url = null;
//   let media_type = null;

//   if (req.file) {
//     media_url = `/uploads/${req.file.filename}`;
//     const mimetype = req.file.mimetype || mime.lookup(req.file.filename) || "";
//     if (mimetype.startsWith("image/")) media_type = "image";
//     else if (mimetype.startsWith("video/")) media_type = "video";
//     else media_type = "file";
//   }

//   try {
//     await pool.query(
//       "INSERT INTO posts (user_id, content, media_url, media_type, visibility) VALUES ($1,$2,$3,$4,$5)",
//       [req.session.userId, content, media_url, media_type, visibility]
//     );
//     res.status(201).json({ ok: true });
//   } catch (err) {
//     console.error("createPost err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Enhanced GET posts (with likes/comments/shares)
// app.get("/api/posts", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const me = req.session.userId;

//   try {
//     const q = `
//       SELECT
//         p.id, p.content, p.media_url, p.media_type, p.visibility, p.created_at,
//         u.id AS user_id, u.name AS user_name, u.avatar_url, u.title,
//         COALESCE(like_counts.count, 0) AS like_count,
//         COALESCE(comment_counts.count, 0) AS comment_count,
//         COALESCE(share_counts.count, 0) AS share_count,
//         EXISTS(SELECT 1 FROM likes lk WHERE lk.post_id = p.id AND lk.user_id = $1) AS liked_by_me
//       FROM posts p
//       JOIN users u ON u.id = p.user_id
//       LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM likes GROUP BY post_id) like_counts ON like_counts.post_id = p.id
//       LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM comments GROUP BY post_id) comment_counts ON comment_counts.post_id = p.id
//       LEFT JOIN (SELECT post_id, COUNT(*)::int AS count FROM shares GROUP BY post_id) share_counts ON share_counts.post_id = p.id
//       WHERE p.visibility = 'Anyone' OR p.user_id = $1
//       ORDER BY p.created_at DESC;
//     `;
//     const r = await pool.query(q, [me]);
//     res.json(r.rows);
//   } catch (err) {
//     console.error("get posts err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Toggle like on a post
// app.post("/api/posts/:id/like", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const userId = req.session.userId;
//   const postId = parseInt(req.params.id, 10);

//   try {
//     const insert = await pool.query(
//       `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)
//        ON CONFLICT (post_id, user_id) DO NOTHING RETURNING id`,
//       [postId, userId]
//     );

//     let liked;
//     if (insert.rowCount > 0) {
//       liked = true;
//     } else {
//       await pool.query(`DELETE FROM likes WHERE post_id=$1 AND user_id=$2`, [
//         postId,
//         userId,
//       ]);
//       liked = false;
//     }

//     const countRes = await pool.query(
//       `SELECT COUNT(*)::int AS count FROM likes WHERE post_id=$1`,
//       [postId]
//     );
//     res.json({ liked, count: countRes.rows[0].count });
//   } catch (err) {
//     console.error("like toggle err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // server.js  -- PART 3 of 3 (continuation & finish)

// // -----------------------------
// // COMMENTS (nested) endpoints
// // -----------------------------

// // POST a top-level comment or a reply
// // body: { content: string, parent_id: integer | null }
// app.post("/api/posts/:id/comments", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const postId = parseInt(req.params.id, 10);
//   const { content, parent_id = null } = req.body;

//   if (!content || !content.trim())
//     return res.status(400).json({ error: "Content required" });

//   try {
//     // if parent_id provided, ensure the parent exists and belongs to same post
//     if (parent_id) {
//       const parent = await pool.query(
//         "SELECT id, post_id FROM comments WHERE id=$1",
//         [parent_id]
//       );
//       if (!parent.rows.length)
//         return res.status(400).json({ error: "Parent comment not found" });
//       if (parent.rows[0].post_id !== postId)
//         return res
//           .status(400)
//           .json({ error: "Parent comment belongs to another post" });
//     }

//     const r = await pool.query(
//       "INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING id, content, parent_id, created_at",
//       [postId, req.session.userId, content, parent_id]
//     );

//     const user = await pool.query(
//       "SELECT name, avatar_url FROM users WHERE id=$1",
//       [req.session.userId]
//     );

//     // return created comment with user info and counts
//     res.status(201).json({
//       id: r.rows[0].id,
//       content: r.rows[0].content,
//       parent_id: r.rows[0].parent_id,
//       created_at: r.rows[0].created_at,
//       user_name: user.rows[0].name,
//       avatar_url: user.rows[0].avatar_url,
//       like_count: 0,
//       liked_by_me: false,
//       reply_count: 0,
//       is_owner: true,
//     });
//   } catch (err) {
//     console.error("comment err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // GET comments for post (returns nested structure)
// // query param: sort=recent|oldest|relevant
// app.get("/api/posts/:id/comments", async (req, res) => {
//   try {
//     const postId = parseInt(req.params.id, 10);
//     const sort = (req.query.sort || "recent").toLowerCase();
//     const me = req.session.userId || null;

//     // Get all comments for the post with user info + like counts + liked_by_me + is_following
//     const q = `
//       SELECT
//         c.id, c.post_id, c.user_id, c.content, c.parent_id, c.created_at,
//         u.name AS user_name, u.avatar_url,
//         COALESCE(cl.count, 0) AS like_count,
//         CASE WHEN $2::int IS NULL THEN false ELSE EXISTS (SELECT 1 FROM comment_likes ck WHERE ck.comment_id = c.id AND ck.user_id = $2) END AS liked_by_me,
//         CASE WHEN $2::int IS NULL THEN false ELSE EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = $2 AND f.followee_id = c.user_id) END AS is_following
//       FROM comments c
//       JOIN users u ON u.id = c.user_id
//       LEFT JOIN (SELECT comment_id, COUNT(*)::int AS count FROM comment_likes GROUP BY comment_id) cl ON cl.comment_id = c.id
//       WHERE c.post_id = $1
//     `;
//     const all = await pool.query(q, [postId, me]);

//     // build tree in JS
//     const byId = new Map();
//     const roots = [];
//     all.rows.forEach((r) => {
//       byId.set(r.id, {
//         id: r.id,
//         post_id: r.post_id,
//         user_id: r.user_id,
//         content: r.content,
//         parent_id: r.parent_id,
//         created_at: r.created_at,
//         user_name: r.user_name,
//         avatar_url: r.avatar_url,
//         like_count: Number(r.like_count || 0),
//         liked_by_me: Boolean(r.liked_by_me),
//         is_following: Boolean(r.is_following),
//         is_owner: me ? r.user_id === me : false,
//         replies: [],
//       });
//     });

//     // attach children to parents
//     byId.forEach((node) => {
//       if (node.parent_id) {
//         const parent = byId.get(node.parent_id);
//         if (parent) parent.replies.push(node);
//         else roots.push(node); // fallback if parent missing
//       } else {
//         roots.push(node);
//       }
//     });

//     // sorting function
//     const sortFn = (a, b) => {
//       if (sort === "oldest")
//         return new Date(a.created_at) - new Date(b.created_at);
//       if (sort === "relevant") return (b.like_count || 0) - (a.like_count || 0);
//       // default recent
//       return new Date(b.created_at) - new Date(a.created_at);
//     };

//     // sort roots and replies recursively
//     function sortRec(list) {
//       list.sort(sortFn);
//       list.forEach((it) => {
//         if (it.replies && it.replies.length) sortRec(it.replies);
//       });
//     }
//     sortRec(roots);

//     // add reply_count to each root (and each reply)
//     function addCounts(list) {
//       list.forEach((it) => {
//         it.reply_count = it.replies ? it.replies.length : 0;
//         if (it.replies && it.replies.length) addCounts(it.replies);
//       });
//     }
//     addCounts(roots);

//     res.json(roots);
//   } catch (err) {
//     console.error("get comments err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Toggle like on comment (works for both top-level and replies)
// app.post("/api/comments/:id/like", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const userId = req.session.userId;
//   const commentId = parseInt(req.params.id, 10);

//   try {
//     const insert = await pool.query(
//       `INSERT INTO comment_likes (comment_id, user_id) VALUES ($1, $2)
//        ON CONFLICT (comment_id, user_id) DO NOTHING RETURNING id`,
//       [commentId, userId]
//     );

//     let liked;
//     if (insert.rowCount > 0) {
//       liked = true;
//     } else {
//       await pool.query(
//         `DELETE FROM comment_likes WHERE comment_id=$1 AND user_id=$2`,
//         [commentId, userId]
//       );
//       liked = false;
//     }

//     const countRes = await pool.query(
//       `SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id=$1`,
//       [commentId]
//     );
//     res.json({ liked, count: countRes.rows[0].count });
//   } catch (err) {
//     console.error("comment like toggle err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // REPORT a comment (any user can report)
// app.post("/api/comments/:id/report", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const commentId = parseInt(req.params.id, 10);
//   const { reason = "Inappropriate content" } = req.body;

//   try {
//     await pool.query(
//       "INSERT INTO reports (comment_id, reporter_id, reason) VALUES ($1, $2, $3)",
//       [commentId, req.session.userId, reason]
//     );

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("report comment err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // FOLLOW / UNFOLLOW toggle endpoint (POST toggles)
// app.post("/api/users/:id/follow", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const followerId = req.session.userId;
//   const followeeId = parseInt(req.params.id, 10);

//   if (followerId === followeeId)
//     return res.status(400).json({ error: "Cannot follow yourself." });

//   try {
//     // check if already following
//     const exists = await pool.query(
//       "SELECT id FROM follows WHERE follower_id=$1 AND followee_id=$2",
//       [followerId, followeeId]
//     );

//     if (exists.rows.length > 0) {
//       // unfollow
//       await pool.query(
//         "DELETE FROM follows WHERE follower_id=$1 AND followee_id=$2",
//         [followerId, followeeId]
//       );
//       return res.json({ following: false });
//     } else {
//       // follow
//       await pool.query(
//         "INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
//         [followerId, followeeId]
//       );
//       return res.json({ following: true });
//     }
//   } catch (err) {
//     console.error("follow toggle err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // EDIT comment
// app.put("/api/comments/:id", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const commentId = parseInt(req.params.id, 10);
//   const { content } = req.body;

//   if (!content || !content.trim())
//     return res.status(400).json({ error: "Content required." });

//   try {
//     // Verify ownership
//     const r = await pool.query("SELECT user_id FROM comments WHERE id=$1", [
//       commentId,
//     ]);
//     if (!r.rows.length)
//       return res.status(404).json({ error: "Comment not found" });

//     if (r.rows[0].user_id !== req.session.userId) {
//       return res.status(403).json({ error: "Forbidden" });
//     }

//     await pool.query("UPDATE comments SET content=$1 WHERE id=$2", [
//       content,
//       commentId,
//     ]);

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("edit comment err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // DELETE comment
// app.delete("/api/comments/:id", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const commentId = parseInt(req.params.id, 10);

//   try {
//     const r = await pool.query("SELECT user_id FROM comments WHERE id=$1", [
//       commentId,
//     ]);
//     if (!r.rows.length)
//       return res.status(404).json({ error: "Comment not found" });

//     if (r.rows[0].user_id !== req.session.userId)
//       return res.status(403).json({ error: "Forbidden" });

//     await pool.query("DELETE FROM comments WHERE id=$1", [commentId]);

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("delete comment err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // -----------------------------
// // GET /api/following  (returns people current user follows)
// // -----------------------------
// app.get("/api/following", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   try {
//     const r = await pool.query(
//       `SELECT u.id, u.name, u.avatar_url, u.title
//        FROM follows f
//        JOIN users u ON u.id = f.followee_id
//        WHERE f.follower_id = $1
//        ORDER BY u.name`,
//       [req.session.userId]
//     );
//     res.json(r.rows);
//   } catch (err) {
//     console.error("/api/following err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // -----------------------------
// // Share endpoint (Option B) - accepts recipients array (user ids)
// // Saves recipients array in shares and creates share_notifications for each recipient
// // -----------------------------
// app.post("/api/posts/:id/share", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const userId = req.session.userId;
//   const postId = parseInt(req.params.id, 10);

//   // expect { recipients: [1,2,3] } or empty array
//   const recipients = Array.isArray(req.body.recipients)
//     ? req.body.recipients.map((v) => parseInt(v, 10)).filter(Boolean)
//     : [];

//   try {
//     // insert shares row storing recipients array (may be empty)
//     await pool.query(
//       "INSERT INTO shares (post_id, user_id, recipients) VALUES ($1, $2, $3)",
//       [postId, userId, recipients.length ? recipients : null]
//     );

//     // create share_notifications entries (one per recipient)
//     if (recipients.length) {
//       const insertPromises = recipients.map((rid) =>
//         pool.query(
//           "INSERT INTO share_notifications (post_id, sender_id, recipient_id) VALUES ($1, $2, $3)",
//           [postId, userId, rid]
//         )
//       );
//       await Promise.all(insertPromises);
//     }

//     const countRes = await pool.query(
//       "SELECT COUNT(*)::int AS count FROM shares WHERE post_id=$1",
//       [postId]
//     );
//     res.json({ ok: true, count: countRes.rows[0].count });
//   } catch (err) {
//     console.error("share err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // -----------------------------
// // PUT edit post (unchanged) and DELETE post (unchanged)
// // -----------------------------
// app.put("/api/posts/:id", upload.single("media"), async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const postId = parseInt(req.params.id, 10);
//   const { content, visibility = "Anyone", remove_media } = req.body;

//   try {
//     const r = await pool.query(
//       "SELECT user_id, media_url, media_type FROM posts WHERE id=$1",
//       [postId]
//     );
//     if (!r.rows.length)
//       return res.status(404).json({ error: "Post not found" });

//     const post = r.rows[0];
//     if (post.user_id !== req.session.userId)
//       return res.status(403).json({ error: "Forbidden" });

//     let media_url = post.media_url;
//     let media_type = post.media_type;

//     if (req.file) {
//       if (post.media_url) safeUnlink(post.media_url);
//       media_url = `/uploads/${req.file.filename}`;
//       const mimetype =
//         req.file.mimetype || mime.lookup(req.file.filename) || "";
//       if (mimetype.startsWith("image/")) media_type = "image";
//       else if (mimetype.startsWith("video/")) media_type = "video";
//       else media_type = "file";
//     } else if (remove_media === "true") {
//       if (post.media_url) safeUnlink(post.media_url);
//       media_url = null;
//       media_type = null;
//     }

//     await pool.query(
//       `UPDATE posts
//        SET content=$1,
//            visibility=$2,
//            media_url=$3,
//            media_type=$4
//        WHERE id=$5`,
//       [content, visibility, media_url, media_type, postId]
//     );

//     res.json({ ok: true });
//   } catch (err) {
//     console.error("post edit err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.delete("/api/posts/:id", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });

//   const postId = parseInt(req.params.id, 10);

//   try {
//     const r = await pool.query(
//       "SELECT user_id, media_url FROM posts WHERE id=$1",
//       [postId]
//     );
//     if (!r.rows.length)
//       return res.status(404).json({ error: "Post not found" });
//     if (r.rows[0].user_id !== req.session.userId)
//       return res.status(403).json({ error: "Forbidden" });

//     await pool.query("DELETE FROM posts WHERE id=$1", [postId]);
//     if (r.rows[0].media_url) safeUnlink(r.rows[0].media_url);
//     res.json({ ok: true });
//   } catch (err) {
//     console.error("delete post err", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Suggestions + public profile
// app.get("/api/suggestions", (req, res) => {
//   res.json([
//     { id: 1, name: "Alice Kapoor", title: "Frontend Engineer" },
//     { id: 2, name: "Rajesh Menon", title: "Product Manager" },
//     { id: 3, name: "Tech Group", title: "Community" },
//   ]);
// });

// app.get("/api/users/:id", async (req, res) => {
//   try {
//     const r = await pool.query(
//       "SELECT id, name, avatar_url, title FROM users WHERE id=$1",
//       [parseInt(req.params.id, 10)]
//     );
//     if (!r.rows.length)
//       return res.status(404).json({ error: "User not found" });
//     res.json(r.rows[0]);
//   } catch (err) {
//     console.error("GET /api/users/:id error", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // -----------------------------
// // Start server
// // -----------------------------
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`✅ Server running on port ${PORT} (LAN accessible)`);
// });

// server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pg = require("pg");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");

// -----------------------------
// Environment / config
// -----------------------------
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL,
  DB_SSL,
  PORT = 4000,
  SESSION_SECRET = "change-me",
  NODE_ENV,
  CORS_ORIGINS,
} = process.env;

// -----------------------------
// DB pool config
// -----------------------------
let poolConfig;
if (DATABASE_URL) {
  poolConfig = { connectionString: DATABASE_URL };
} else {
  poolConfig = {
    host: DB_HOST || "localhost",
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };
}
if ((DB_SSL === "true" || DB_SSL === "1") && NODE_ENV === "production") {
  poolConfig.ssl = { rejectUnauthorized: false };
}
const pool = new pg.Pool(poolConfig);

// -----------------------------
// Ensure/upgrade tables & migrations
// -----------------------------
(async () => {
  try {
    // create core helper tables if missing + run safe rename for about -> title
    await pool.query(`
      -- likes, comments, shares, comment_likes, reports, follows (existing)
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (post_id, user_id)
      );
      
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS shares (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE (comment_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT now(),
        UNIQUE(follower_id, followee_id)
      );

      -- notifications table
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- recipient
        actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- who caused it
        post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        type TEXT NOT NULL, -- e.g. 'share', 'like', 'comment'
        message TEXT,
        data JSONB,
        created_at TIMESTAMPTZ DEFAULT now(),
        is_read BOOLEAN DEFAULT false
      );

      -- share recipients table to store which recipients a share was sent to
      CREATE TABLE IF NOT EXISTS shares_recipients (
        id SERIAL PRIMARY KEY,
        share_id INTEGER NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // safely rename users.about -> users.title if needed
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='users' AND column_name='about'
        ) THEN
          BEGIN
            -- if title already exists do nothing
            IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_name='users' AND column_name='title'
            ) THEN
              ALTER TABLE users RENAME COLUMN about TO title;
            END IF;
          EXCEPTION WHEN OTHERS THEN
            -- swallow any rename error
            RAISE NOTICE 'rename about->title failed or already applied';
          END;
        END IF;
      END
      $$;
    `);
    // console.log("✅ Tables ensured and migrations applied (if needed)");
  } catch (err) {
    console.error("Table creation / migration failed:", err);
  }
})();

// -----------------------------
// App setup
// -----------------------------
const app = express();
app.use(express.json());
app.use(cookieParser());

// -----------------------------
// CORS
// -----------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://172.16.2.164:3000",
  "http://192.168.2.89:3000",
];
if (CORS_ORIGINS) {
  CORS_ORIGINS.split(",").forEach((o) => {
    const t = o.trim();
    if (t) allowedOrigins.push(t);
  });
}
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// -----------------------------
// Session (store in PostgreSQL)
// -----------------------------
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// -----------------------------
// File upload setup
// -----------------------------
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(
  "/uploads",
  express.static(UPLOAD_DIR, { extensions: ["jpg", "png", "webp", "mp4"] })
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// -----------------------------
// Helper functions
// -----------------------------
function isValidEmail(v) {
  return /^\S+@\S+\.\S+$/.test(v);
}
function safeUnlink(relPath) {
  if (!relPath) return;
  const maybe = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  const full = path.resolve(__dirname, maybe);
  if (full.startsWith(UPLOAD_DIR) && fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch (err) {
      console.warn("Failed to delete file", full, err);
    }
  }
}

// -----------------------------
// Auth Routes (unchanged)
// -----------------------------
app.post("/api/Register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ error: "Name, email, and password required." });
  if (!isValidEmail(email))
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
});

app.post("/api/Login", async (req, res) => {
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
});

app.get("/api/me", async (req, res) => {
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
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid", { path: "/", sameSite: "lax" });
    res.json({ ok: true });
  });
});

// -----------------------------
// Profile update (title + avatar)
// -----------------------------
app.post("/api/profile", upload.single("avatar"), async (req, res) => {
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
});

// -----------------------------
// Posts + Likes + Comments + Shares
// -----------------------------

// Create post
app.post("/api/createPost", upload.single("media"), async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const { content, visibility = "Anyone" } = req.body;
  if (!content || content.trim() === "")
    return res.status(400).json({ error: "Post content required" });

  let media_url = null;
  let media_type = null;

  if (req.file) {
    media_url = `/uploads/${req.file.filename}`;
    const mimetype = req.file.mimetype || mime.lookup(req.file.filename) || "";
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
});

// Enhanced GET posts (with likes/comments/shares) - now respects Connections and Private visibility
app.get("/api/posts", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const me = req.session.userId;

  try {
    // Logic:
    // - Show posts when:
    //   * p.visibility = 'Anyone'
    //   * OR p.user_id = me (owner always)
    //   * OR p.visibility = 'Connections' AND (post owner follows me)
    // - Do NOT show Private unless owner = me (handled by OR p.user_id = me)
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
});

// Toggle like on a post
app.post("/api/posts/:id/like", async (req, res) => {
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
});

// -----------------------------
// COMMENTS (unchanged)
// -----------------------------
app.post("/api/posts/:id/comments", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const postId = parseInt(req.params.id, 10);
  const { content, parent_id = null } = req.body;

  if (!content || !content.trim())
    return res.status(400).json({ error: "Content required" });

  try {
    if (parent_id) {
      const parent = await pool.query(
        "SELECT id, post_id FROM comments WHERE id=$1",
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
      "INSERT INTO comments (post_id, user_id, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING id, content, parent_id, created_at",
      [postId, req.session.userId, content, parent_id]
    );

    const user = await pool.query(
      "SELECT name, avatar_url FROM users WHERE id=$1",
      [req.session.userId]
    );

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
});

app.get("/api/posts/:id/comments", async (req, res) => {
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
});

// Toggle like on comment
app.post("/api/comments/:id/like", async (req, res) => {
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
    } else {
      await pool.query(
        `DELETE FROM comment_likes WHERE comment_id=$1 AND user_id=$2`,
        [commentId, userId]
      );
      liked = false;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM comment_likes WHERE comment_id=$1`,
      [commentId]
    );
    res.json({ liked, count: countRes.rows[0].count });
  } catch (err) {
    console.error("comment like toggle err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// REPORT a comment
app.post("/api/comments/:id/report", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const commentId = parseInt(req.params.id, 10);
  const { reason = "Inappropriate content" } = req.body;

  try {
    await pool.query(
      "INSERT INTO reports (comment_id, reporter_id, reason) VALUES ($1, $2, $3)",
      [commentId, req.session.userId, reason]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("report comment err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// FOLLOW / UNFOLLOW toggle endpoint (unchanged)
app.post("/api/users/:id/follow", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const followerId = req.session.userId;
  const followeeId = parseInt(req.params.id, 10);

  if (followerId === followeeId)
    return res.status(400).json({ error: "Cannot follow yourself." });

  try {
    // check if already following
    const exists = await pool.query(
      "SELECT id FROM follows WHERE follower_id=$1 AND followee_id=$2",
      [followerId, followeeId]
    );

    if (exists.rows.length > 0) {
      // unfollow
      await pool.query(
        "DELETE FROM follows WHERE follower_id=$1 AND followee_id=$2",
        [followerId, followeeId]
      );
      return res.json({ following: false });
    } else {
      // follow
      await pool.query(
        "INSERT INTO follows (follower_id, followee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [followerId, followeeId]
      );
      return res.json({ following: true });
    }
  } catch (err) {
    console.error("follow toggle err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// EDIT comment
app.put("/api/comments/:id", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const commentId = parseInt(req.params.id, 10);
  const { content } = req.body;

  if (!content || !content.trim())
    return res.status(400).json({ error: "Content required." });

  try {
    // Verify ownership
    const r = await pool.query("SELECT user_id FROM comments WHERE id=$1", [
      commentId,
    ]);
    if (!r.rows.length)
      return res.status(404).json({ error: "Comment not found" });

    if (r.rows[0].user_id !== req.session.userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await pool.query("UPDATE comments SET content=$1 WHERE id=$2", [
      content,
      commentId,
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error("edit comment err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE comment
app.delete("/api/comments/:id", async (req, res) => {
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
});

// -----------------------------
// SHARE endpoint (extended)
// accepts { recipients: [ids], share_to_feed: boolean }
// -----------------------------
app.post("/api/posts/:id/share", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const userId = req.session.userId;
  const postId = parseInt(req.params.id, 10);
  const { recipients = [], share_to_feed = false } = req.body || {};

  try {
    // Insert shares record (one row per sender/post)
    const insert = await pool.query(
      "INSERT INTO shares (post_id, user_id) VALUES ($1, $2) RETURNING id",
      [postId, userId]
    );
    const shareId = insert.rows[0].id;

    // Insert recipients mapping
    if (Array.isArray(recipients) && recipients.length) {
      const insertPromises = recipients.map((rid) =>
        pool.query(
          "INSERT INTO shares_recipients (share_id, recipient_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [shareId, parseInt(rid, 10)]
        )
      );
      await Promise.all(insertPromises);

      // create notifications for recipients
      const notificationPromises = recipients.map((rid) =>
        pool.query(
          `INSERT INTO notifications (user_id, actor_id, post_id, type, message, data)
           VALUES ($1, $2, $3, 'share', $4, $5)`,
          [
            parseInt(rid, 10),
            userId,
            postId,
            `Sent a post from ${userId}`,
            JSON.stringify({ share_id: shareId }),
          ]
        )
      );
      await Promise.all(notificationPromises);
    }

    // notify post owner that someone shared their post
    const postOwnerRes = await pool.query(
      "SELECT user_id FROM posts WHERE id=$1",
      [postId]
    );
    if (postOwnerRes.rows.length) {
      const ownerId = postOwnerRes.rows[0].user_id;
      if (ownerId !== userId) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, post_id, type, message, data)
           VALUES ($1, $2, $3, 'share', $4, $5)`,
          [
            ownerId,
            userId,
            postId,
            `Your post was shared`,
            JSON.stringify({ share_id: shareId }),
          ]
        );
      }
    }

    // optionally create a new post (share to feed)
    if (share_to_feed) {
      // copy original post content/media into a new post with a small "Shared:" prefix
      const original = await pool.query(
        "SELECT content, media_url, media_type, visibility FROM posts WHERE id=$1",
        [postId]
      );
      if (original.rows.length) {
        const orig = original.rows[0];
        // when sharing to feed, default visibility to 'Anyone' (you may change)
        await pool.query(
          "INSERT INTO posts (user_id, content, media_url, media_type, visibility) VALUES ($1, $2, $3, $4, $5)",
          [
            userId,
            `Shared: ${orig.content || ""}`,
            orig.media_url,
            orig.media_type,
            orig.visibility || "Anyone",
          ]
        );
      }
    }

    // recalc share count
    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS count FROM shares WHERE post_id=$1",
      [postId]
    );

    res.json({ ok: true, count: countRes.rows[0].count });
  } catch (err) {
    console.error("share err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// PUT edit post (unchanged) ...
// (copied from your existing server but kept intact)
// -----------------------------
app.put("/api/posts/:id", upload.single("media"), async (req, res) => {
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
      const mimetype =
        req.file.mimetype || mime.lookup(req.file.filename) || "";
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
       SET content=$1,
           visibility=$2,
           media_url=$3,
           media_type=$4
       WHERE id=$5`,
      [content, visibility, media_url, media_type, postId]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("post edit err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE post (unchanged)
app.delete("/api/posts/:id", async (req, res) => {
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
});

// Suggestions + public profile (adjusted to return title)
app.get("/api/suggestions", (req, res) => {
  res.json([
    { id: 1, name: "Alice Kapoor", title: "Frontend Engineer" },
    { id: 2, name: "Rajesh Menon", title: "Product Manager" },
    { id: 3, name: "Tech Group", title: "Community" },
  ]);
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, name, avatar_url, title FROM users WHERE id=$1",
      [parseInt(req.params.id, 10)]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "User not found" });
    res.json(r.rows[0]);
  } catch (err) {
    console.error("GET /api/users/:id error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// GET following: users the current user follows (followees)
// used by Share modal to show "people you follow"
// -----------------------------
app.get("/api/following", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

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
});

// -----------------------------
// GET notifications for logged-in user
// -----------------------------
app.get("/api/notifications", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  try {
    const r = await pool.query(
      `SELECT id, actor_id, post_id, type, message, data, created_at, is_read
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 100`,
      [req.session.userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error("GET /api/notifications error", err);
    res.status(500).json({ error: "Server error" });
  }
});

// mark notification read
app.post("/api/notifications/:id/read", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const nid = parseInt(req.params.id, 10);
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [nid, req.session.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("mark notification read err", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT} (LAN accessible)`);
});
