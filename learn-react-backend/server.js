// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const session = require("express-session");
// const pg = require("pg");
// const PgSession = require("connect-pg-simple")(session);
// const bcrypt = require("bcryptjs");

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

// let poolConfig;
// if (DATABASE_URL) poolConfig = { connectionString: DATABASE_URL };
// else {
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

// app.use(
//   cors({
//     origin: "http://localhost:3000", // frontend origin
//     credentials: true,
//   })
// );
// app.use(express.json());

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
//       maxAge: 1000 * 60 * 60 * 24, // 1 day
//     },
//   })
// );

// function isValidEmail(v) {
//   return /^\S+@\S+\.\S+$/.test(v);
// }

// // Register (creates user in DB; returns 201 on success)
// app.post("/api/register", async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password)
//     return res
//       .status(400)
//       .json({ error: "Name, email and password are required." });
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
//     const insert = await pool.query(
//       "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, name",
//       [email, password_hash, name]
//     );

//     return res.status(201).json({ ok: true, name: insert.rows[0].name });
//   } catch (err) {
//     console.error("Register error", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });
// // Login (creates session)
// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ error: "Email + password required" });

//   try {
//     const u = await pool.query(
//       "SELECT id, email, password_hash, name FROM users WHERE email = $1",
//       [email]
//     );
//     if (u.rows.length === 0)
//       return res.status(401).json({ error: "Invalid credentials" });
//     const user = u.rows[0];
//     const ok = await bcrypt.compare(password, user.password_hash);
//     if (!ok) return res.status(401).json({ error: "Invalid credentials" });

//     // create session
//     req.session.userId = user.id;
//     req.session.userName = user.name;
//     return res.json({ ok: true });
//   } catch (err) {
//     console.error("Login error", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// app.get("/api/me", async (req, res) => {
//   if (!req.session.userId)
//     return res.status(401).json({ error: "Not authenticated" });
//   try {
//     const r = await pool.query(
//       "SELECT id, name, email FROM users WHERE id = $1",
//       [req.session.userId]
//     );
//     if (r.rows.length === 0)
//       return res.status(401).json({ error: "Not authenticated" });
//     return res.json({
//       id: r.rows[0].id,
//       name: r.rows[0].name,
//       email: r.rows[0].email,
//     });
//   } catch (err) {
//     console.error("/api/me error", err);
//     return res.status(500).json({ error: "Server error" });
//   }
// });

// // Logout (destroy session)
// app.post("/api/logout", (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Session destroy error", err);
//       return res.status(500).json({ error: "Failed to logout" });
//     }
//     res.clearCookie("connect.sid");
//     return res.json({ ok: true });
//   });
// });

// app.listen(PORT, () =>
//   console.log(`Server running on http://localhost:${PORT}`)
// );



require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const pg = require("pg");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcryptjs");

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

// =============================
// ✅ CORS CONFIG — allow cookies
// =============================
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    credentials: true, // 👈 MUST be true to send cookies
  })
); 

app.use(express.json());

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
      secure: false, // 👈 set to false in local (true only in production w/ HTTPS)
      sameSite: "lax", // 👈 allows localhost:3000 -> localhost:4000 cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// =============================
// ✅ HELPERS
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
    return res
      .status(400)
      .json({ error: "Name, email and password are required." });
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
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, name",
      [email, password_hash, name]
    );

    return res.status(201).json({ ok: true, name: insert.rows[0].name });
  } catch (err) {
    console.error("Register error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// =============================
// ✅ LOGIN (creates session)
// =============================
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email + password required" });

  try {
    const u = await pool.query(
      "SELECT id, email, password_hash, name FROM users WHERE email = $1",
      [email]
    );
    if (u.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = u.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Create session
    req.session.userId = user.id;
    req.session.userName = user.name;

    // ✅ Force session save before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error", err);
        return res.status(500).json({ error: "Session error" });
      }
      res.json({ ok: true, message: "Login successful" });
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// =============================
// ✅ AUTH CHECK (/api/me)
// =============================
app.get("/api/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({
    id: req.session.userId,
    name: req.session.userName,
  });
});

// =============================
// ✅ LOGOUT
// =============================
app.post("/api/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error", err);
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

// =============================
// ✅ DEBUG SESSION (optional)
// =============================
app.get("/api/debug/session", (req, res) => {
  res.json(req.session);
});

// =============================
// ✅ START SERVER
// =============================
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
