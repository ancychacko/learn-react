// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const session = require("express-session");
// const pg = require("pg");
// const PgSession = require("connect-pg-simple")(session);
// const bcrypt = require("bcryptjs");
// const cookieParser = require("cookie-parser");

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
//       secure: false, // Only true if using HTTPS
//       sameSite: "lax", // Allows cookies across localhost ports
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );

// // =============================
// // ✅ CORS CONFIG
// // =============================
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://192.168.2.77:3000"],
//     credentials: true,
//     methods: ["GET", "POST", "OPTIONS"],
//   })
// );

// // =============================
// // ✅ EMAIL VALIDATION
// // =============================
// function isValidEmail(v) {
//   return /^\S+@\S+\.\S+$/.test(v);
// }

// // =============================
// // ✅ REGISTER
// // =============================
// app.post("/api/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password)
//     return res
//       .status(400)
//       .json({ error: "Name, email, and password are required." });
//   if (!isValidEmail(email))
//     return res.status(400).json({ error: "Invalid email format." });
//   if (password.length < 6)
//     return res
//       .status(400)
//       .json({ error: "Password must be at least 6 characters." });

//   try {
//     const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
//       email,
//     ]);
//     if (existing.rows.length > 0)
//       return res.status(409).json({ error: "Email already registered." });

//     const password_hash = await bcrypt.hash(password, 10);
//     const insert = await pool.query(
//       "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, name",
//       [email, password_hash, name]
//     );

//     res.status(201).json({ ok: true, name: insert.rows[0].name });
//   } catch (err) {
//     console.error("Register error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // =============================
// // ✅ LOGIN
// // =============================
// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ error: "Email and password are required." });

//   try {
//     const u = await pool.query(
//       "SELECT id, email, password_hash, name FROM users WHERE email = $1",
//       [email]
//     );
//     if (u.rows.length === 0)
//       return res.status(401).json({ error: "Invalid credentials." });

//     const user = u.rows[0];
//     const valid = await bcrypt.compare(password, user.password_hash);
//     if (!valid) return res.status(401).json({ error: "Invalid credentials." });

//     req.session.userId = user.id;
//     req.session.userName = user.name;

//     req.session.save((err) => {
//       if (err) {
//         console.error("Session save error:", err);
//         return res.status(500).json({ error: "Session error" });
//       }
//       res.json({ ok: true, message: "Login successful", name: user.name });
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // =============================
// // ✅ AUTH CHECK
// // =============================
// app.get("/api/me", (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ error: "Not authenticated" });
//   }
//   res.json({
//     id: req.session.userId,
//     name: req.session.userName,
//   });
// });

// // =============================
// // ✅ LOGOUT
// // =============================
// app.post("/api/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Session destroy error:", err);
//       return res.status(500).json({ error: "Failed to logout" });
//     }
//     res.clearCookie("connect.sid", {
//       path: "/",
//       sameSite: "lax",
//     });
//     res.json({ ok: true });
//   });
// });

// // =============================
// // ✅ START SERVER
// // =============================
// // app.listen(PORT, () =>
// //   console.log(`✅ Server running on http://localhost:${PORT}`)
// // );

// app.listen(PORT, "0.0.0.0", () =>
//   console.log(
//     `✅ Server running on port ${PORT} and accessible on your local network`
//   )
// );

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pg = require("pg");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

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
} = process.env;

// =============================
// ✅ DATABASE CONFIG
// =============================
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
const app = express();

app.use(express.json());
app.use(cookieParser());

// =============================
// ✅ SESSION CONFIG
// =============================
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
      secure: false, // Use true if HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// =============================
// ✅ CORS CONFIG
// =============================
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.2.77:3000"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
  })
);

// =============================
// ✅ HELPER FUNCTIONS
// =============================
function isValidEmail(v) {
  return /^\S+@\S+\.\S+$/.test(v);
}

// =============================
// ✅ REGISTER
// =============================
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields required" });
  if (!isValidEmail(email))
    return res.status(400).json({ error: "Invalid email" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password too short" });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name",
      [name, email, hash]
    );
    res.status(201).json({ ok: true, name: result.rows[0].name });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// ✅ LOGIN
// =============================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const result = await pool.query(
      "SELECT id, name, password_hash FROM users WHERE email=$1",
      [email]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    req.session.userId = user.id;
    req.session.userName = user.name;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Session error" });
      }
      res.json({ ok: true, name: user.name });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// ✅ AUTH CHECK
// =============================
app.get("/api/me", (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });
  res.json({ id: req.session.userId, name: req.session.userName });
});

// =============================
// ✅ LOGOUT
// =============================
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// =============================
// ✅ CREATE POST
// =============================
app.post("/api/createPost", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  const { content } = req.body;
  if (!content || content.trim() === "")
    return res.status(400).json({ error: "Post content required" });

  try {
    await pool.query("INSERT INTO posts (user_id, content) VALUES ($1, $2)", [
      req.session.userId,
      content,
    ]);
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// ✅ FETCH POSTS
// =============================
app.get("/api/posts", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ error: "Not authenticated" });

  try {
    const posts = await pool.query(
      `SELECT p.id, p.content, p.created_at, u.name 
       FROM posts p 
       JOIN users u ON u.id = p.user_id 
       ORDER BY p.created_at DESC`
    );
    res.json(posts.rows);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// ✅ START SERVER
// =============================
app.listen(PORT, "0.0.0.0", () =>
  console.log(`✅ Server running on port ${PORT}`)
);
