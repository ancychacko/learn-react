// server.js
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const pool = require("./Database/pool");
const runMigrations = require("./Database/migrations");

// Run DB migrations on server start
runMigrations();
const routes = require("./routes");

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
  "http://192.168.2.99:3000",
  "http://172.16.2.121:3000",
];
if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(",").forEach((o) =>
    allowedOrigins.push(o.trim())
  );
}

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// -----------------------------
// Session
// -----------------------------
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// -----------------------------
// Static uploads folder
// -----------------------------
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

// -----------------------------
// API ROUTES
// -----------------------------
app.use("/api", routes);

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
