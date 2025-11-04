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

// // =============================
// // ✅ ENVIRONMENT VARIABLES
// // =============================

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
// } = process.env;

// // =============================
// // ✅ DATABASE CONFIG
// // =============================
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
// const app = express();

// app.use(express.json());
// app.use(cookieParser());

// // =============================
// // ✅ SESSION CONFIG
// // =============================
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
//       secure: false, // Use true if HTTPS
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );

// // =============================
// // ✅ CORS CONFIG
// // =============================
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://192.168.2.68:3000"],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   })
// );

// //Serve uploaded files
// const UPLOAD_DIR = path.join(__dirname, "uploads");
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// app.use("/uploads", express.static(UPLOAD_DIR));

// // Multer config: store files with timestamped names
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, UPLOAD_DIR),
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || "";
//     const base = path
//       .basename(file.originalname, ext)
//       .replace(/\s+/g, "-")
//       .toLowerCase();
//     cb(null, `${Date.now()}-${base}${ext}`);
//   },
// });
// const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// // =============================
// // ✅ HELPER FUNCTIONS
// // =============================
// function isValidEmail(v) {
//   return /^\S+@\S+\.\S+$/.test(v);
// }

// // -- existing register/login/me/logout (kept as you have)
// app.post("/api/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password)
//     return res.status(400).json({ error: "All fields required" });
//   if (!isValidEmail(email))
//     return res.status(400).json({ error: "Invalid email" });
//   if (password.length < 6)
//     return res.status(400).json({ error: "Password too short" });
//   try {
//     const existing = await pool.query("SELECT id FROM users WHERE email=$1", [
//       email,
//     ]);
//     if (existing.rows.length)
//       return res.status(409).json({ error: "Email exists" });
//     const hash = await bcrypt.hash(password, 10);
//     const r = await pool.query(
//       "INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name",
//       [name, email, hash]
//     );
//     return res.status(201).json({ ok: true, name: r.rows[0].name });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ error: "Email & password required" });
//   try {
//     const r = await pool.query(
//       "SELECT id, name, password_hash FROM users WHERE email=$1",
//       [email]
//     );
//     if (!r.rows.length)
//       return res.status(401).json({ error: "Invalid credentials" });
//     const user = r.rows[0];
//     const ok = await bcrypt.compare(password, user.password_hash);
//     if (!ok) return res.status(401).json({ error: "Invalid credentials" });
//     req.session.userId = user.id;
//     req.session.userName = user.name;
//     req.session.save((err) => {
//       if (err) {
//         console.error("session save err", err);
//         return res.status(500).json({ error: "Session error" });
//       }
//       return res.json({ ok: true, name: user.name });
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// app.get("/api/me", (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   res.json({ id: req.session.userId, name: req.session.userName });
// });

// app.post("/api/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: "Failed to logout" });
//     }
//     res.clearCookie("connect.sid");
//     return res.json({ ok: true });
//   });
// });

// // ---------- Profile update: accepts about and optional avatar file ----------
// app.post("/api/profile", upload.single("avatar"), async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const userId = req.session.userId;
//   const { about } = req.body;
//   let avatar_url = null;
//   if (req.file) {
//     avatar_url = `/uploads/${req.file.filename}`;
//   }
//   try {
//     // Update columns conditionally
//     if (avatar_url && about !== undefined) {
//       await pool.query("UPDATE users SET avatar_url=$1, about=$2 WHERE id=$3", [
//         avatar_url,
//         about || null,
//         userId,
//       ]);
//     } else if (avatar_url) {
//       await pool.query("UPDATE users SET avatar_url=$1 WHERE id=$2", [
//         avatar_url,
//         userId,
//       ]);
//     } else if (about !== undefined) {
//       await pool.query("UPDATE users SET about=$1 WHERE id=$2", [
//         about || null,
//         userId,
//       ]);
//     }
//     return res.json({ ok: true, avatar_url, about });
//   } catch (err) {
//     console.error("profile update err", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------- Create a post (text + optional media file - image or video) ----------
// app.post("/api/createPost", upload.single("media"), async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const { content } = req.body;
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
//       "INSERT INTO posts (user_id, content, media_url, media_type) VALUES ($1,$2,$3,$4)",
//       [req.session.userId, content, media_url, media_type]
//     );
//     return res.status(201).json({ ok: true });
//   } catch (err) {
//     console.error("createPost err", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------- Get posts (everyone) ----------
// app.get("/api/posts", async (req, res) => {
//   // it's okay to be public; but you wanted session-based; keep session check
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   try {
//     const r = await pool.query(`
//       SELECT p.id, p.content, p.media_url, p.media_type, p.created_at, u.id as user_id, u.name as user_name, u.avatar_url
//       FROM posts p
//       JOIN users u ON u.id = p.user_id
//       ORDER BY p.created_at DESC
//     `);
//     res.json(r.rows);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------- Edit post (only owner) ----------
// app.put("/api/posts/:id", upload.single("media"), async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const postId = req.params.id;
//   const { content } = req.body;
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

//     // if new media uploaded, delete old file
//     if (req.file) {
//       if (post.media_url) {
//         const filePath = path.join(__dirname, post.media_url);
//         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//       }
//       const media_url = `/uploads/${req.file.filename}`;
//       const mimetype =
//         req.file.mimetype || mime.lookup(req.file.filename) || "";
//       const media_type = mimetype.startsWith("image/")
//         ? "image"
//         : mimetype.startsWith("video/")
//         ? "video"
//         : "file";
//       await pool.query(
//         "UPDATE posts SET content=$1, media_url=$2, media_type=$3 WHERE id=$4",
//         [content, media_url, media_type, postId]
//       );
//     } else {
//       // update only content
//       await pool.query("UPDATE posts SET content=$1 WHERE id=$2", [
//         content,
//         postId,
//       ]);
//     }
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error("edit post err", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // ---------- Delete post (only owner) ----------
// app.delete("/api/posts/:id", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   const postId = req.params.id;
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

//     // delete DB row
//     await pool.query("DELETE FROM posts WHERE id=$1", [postId]);

//     // delete file if any
//     if (post.media_url) {
//       const filePath = path.join(__dirname, post.media_url);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error("delete post err", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // Simple suggestions endpoint (right sidebar)
// app.get("/api/suggestions", (req, res) => {
//   // for demo, return static suggestions
//   res.json([
//     { id: 1, name: "Alice Kapoor", title: "Frontend Engineer" },
//     { id: 2, name: "Rajesh Menon", title: "Product Manager" },
//     { id: 3, name: "Tech Group", title: "Community" },
//   ]);
// });

// app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));

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
  CORS_ORIGINS, // optional comma separated additional origins
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
// App and middleware
// -----------------------------
const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS: allow frontend origins and include credentials (cookies)
const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.2.68:3000",
  "http://192.168.2.77:3000",
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
      // allow requests with no origin (mobile tools, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
      return callback(new Error("CORS policy: origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// -----------------------------
// Session (store sessions in Postgres)
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
      secure: NODE_ENV === "production", // true in prod when HTTPS
      sameSite: "lax", // allows frontend on different port to send cookie
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// -----------------------------
// Uploads static directory + Multer
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
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB

// -----------------------------
// Helpers
// -----------------------------
function isValidEmail(v) {
  return /^\S+@\S+\.\S+$/.test(v);
}
function safeUnlink(relPath) {
  if (!relPath) return;
  // remove leading slash if present
  const maybe = relPath.startsWith("/") ? relPath.slice(1) : relPath;
  const full = path.resolve(__dirname, maybe);
  // ensure file is inside uploads directory for safety
  if (full.startsWith(UPLOAD_DIR) && fs.existsSync(full)) {
    try {
      fs.unlinkSync(full);
    } catch (err) {
      console.warn("Failed to delete file", full, err);
    }
  }
}

// -----------------------------
// Routes: auth (register/login/me/logout)
// -----------------------------
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ error: "Name, email and password required." });
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
    return res.status(201).json({ ok: true, name: insert.rows[0].name });
  } catch (err) {
    console.error("Register error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email + password required" });
  try {
    const r = await pool.query(
      "SELECT id, name, email, password_hash, avatar_url, about FROM users WHERE email = $1",
      [email]
    );
    if (r.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // create session
    req.session.userId = user.id;
    req.session.userName = user.name;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error", err);
        return res.status(500).json({ error: "Session error" });
      }
      // return some basic profile info immediately
      return res.json({
        ok: true,
        name: user.name,
        avatar_url: user.avatar_url || null,
      });
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// return currently authenticated user details
app.get("/api/me", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  try {
    const r = await pool.query(
      "SELECT id, name, email, avatar_url, about FROM users WHERE id = $1",
      [req.session.userId]
    );
    if (r.rows.length === 0)
      return res.status(401).json({ error: "Not authenticated" });
    const u = r.rows[0];
    return res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar_url: u.avatar_url || null,
      about: u.about || null,
    });
  } catch (err) {
    console.error("/api/me error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    // clear cookie: name is connect.sid by default
    res.clearCookie("connect.sid", { path: "/", sameSite: "lax" });
    return res.json({ ok: true });
  });
});

// -----------------------------
// Profile update (about + avatar file)
// -----------------------------
app.post("/api/profile", upload.single("avatar"), async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const userId = req.session.userId;
  const { about } = req.body;
  let avatar_url = null;

  try {
    if (req.file) {
      avatar_url = `/uploads/${req.file.filename}`;
      // optional: remove previous avatar file from disk (if exists)
      const prev = await pool.query(
        "SELECT avatar_url FROM users WHERE id = $1",
        [userId]
      );
      if (prev.rows.length && prev.rows[0].avatar_url) {
        safeUnlink(prev.rows[0].avatar_url);
      }
    }

    // conditional updates
    if (avatar_url && about !== undefined) {
      await pool.query("UPDATE users SET avatar_url=$1, about=$2 WHERE id=$3", [
        avatar_url,
        about || null,
        userId,
      ]);
    } else if (avatar_url) {
      await pool.query("UPDATE users SET avatar_url=$1 WHERE id=$2", [
        avatar_url,
        userId,
      ]);
    } else if (about !== undefined) {
      await pool.query("UPDATE users SET about=$1 WHERE id=$2", [
        about || null,
        userId,
      ]);
    }

    return res.json({
      ok: true,
      avatar_url,
      about: about !== undefined ? about : undefined,
    });
  } catch (err) {
    console.error("profile update err", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// Posts: create, list, edit, delete
// -----------------------------
app.post("/api/createPost", upload.single("media"), async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const { content } = req.body;
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
      "INSERT INTO posts (user_id, content, media_url, media_type) VALUES ($1,$2,$3,$4)",
      [req.session.userId, content, media_url, media_type]
    );
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("createPost err", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/posts", async (req, res) => {
  // listing posts requires an authenticated session (so the feed shows current user's posts and actions)
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  try {
    const r = await pool.query(
      `SELECT p.id, p.content, p.media_url, p.media_type, p.created_at,
              u.id as user_id, u.name as user_name, u.avatar_url
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`
    );
    return res.json(r.rows);
  } catch (err) {
    console.error("get posts err", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/posts/:id", upload.single("media"), async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const postId = req.params.id;
  const { content } = req.body;

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

    if (req.file) {
      // remove previous file if exists
      if (post.media_url) safeUnlink(post.media_url);

      const media_url = `/uploads/${req.file.filename}`;
      const mimetype =
        req.file.mimetype || mime.lookup(req.file.filename) || "";
      const media_type = mimetype.startsWith("image/")
        ? "image"
        : mimetype.startsWith("video/")
        ? "video"
        : "file";

      await pool.query(
        "UPDATE posts SET content=$1, media_url=$2, media_type=$3 WHERE id=$4",
        [content, media_url, media_type, postId]
      );
    } else {
      await pool.query("UPDATE posts SET content=$1 WHERE id=$2", [
        content,
        postId,
      ]);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("edit post err", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  const postId = req.params.id;

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

    await pool.query("DELETE FROM posts WHERE id=$1", [postId]);

    if (post.media_url) safeUnlink(post.media_url);

    return res.json({ ok: true });
  } catch (err) {
    console.error("delete post err", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// Suggestions / simple demo routes
// -----------------------------
app.get("/api/suggestions", (req, res) => {
  // demo static suggestions; replace with real logic if needed
  res.json([
    { id: 1, name: "Alice Kapoor", title: "Frontend Engineer" },
    { id: 2, name: "Rajesh Menon", title: "Product Manager" },
    { id: 3, name: "Tech Group", title: "Community" },
  ]);
});

// optional public user profile route
app.get("/api/users/:id", async (req, res) => {
  try {
    const r = await pool.query(
      "SELECT id, name, avatar_url, about FROM users WHERE id=$1",
      [parseInt(req.params.id, 10)]
    );
    if (!r.rows.length)
      return res.status(404).json({ error: "User not found" });
    return res.json(r.rows[0]);
  } catch (err) {
    console.error("GET /api/users/:id error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// -----------------------------
// Start server
// -----------------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} and accessible on local network`);
});
