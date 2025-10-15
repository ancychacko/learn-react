// server.js (Node + Express backend with Postgres sessions)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pg = require('pg');
const PgSession = require('connect-pg-simple')(session);
const bcrypt = require('bcryptjs');

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
  DATABASE_URL, DB_SSL, PORT = 4000, SESSION_SECRET = 'change-me', NODE_ENV
} = process.env;

// Build Postgres connection config from individual env vars (no DATABASE_URL required)
let poolConfig;
if (DATABASE_URL) {
  poolConfig = { connectionString: DATABASE_URL };
} else {
  poolConfig = {
    host: DB_HOST || 'localhost',
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  };
}

// Enable SSL for cloud DBs if needed (set DB_SSL=true and NODE_ENV=production)
if ((DB_SSL === 'true' || DB_SSL === '1') && NODE_ENV === 'production') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new pg.Pool(poolConfig);
const app = express();

// CORS config: allow frontend (http://localhost:3000) to call this backend and send cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Session middleware: store sessions in Postgres so they survive server restarts
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true
  }),
  secret: SESSION_SECRET,    // IMPORTANT: set a strong secret in .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === 'production', // set true in prod when using HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Helper: basic email check
function isValidEmail(value) {
  return /^\S+@\S+\.\S+$/.test(value);
}

// ------------------ Register ------------------
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // check existing
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, name',
      [email, passwordHash, name]
    );

    const createdUser = insert.rows[0];

    // NOTE: we do NOT auto-login here (by your request), we just return success.
    // If you wanted auto-login, set req.session.userId = createdUser.id etc.

    return res.status(201).json({ ok: true, name: createdUser.name });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// ------------------ Login ------------------
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email + password required' });

  try {
    const userRes = await pool.query('SELECT id, email, password_hash, name FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = userRes.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Authentication successful: create server-side session
    req.session.userId = user.id;
    req.session.userName = user.name;

    return res.json({ ok: true });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Me (who am I) ------------------
app.get('/api/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.session.userId]);
    if (userRes.rows.length === 0) return res.status(401).json({ error: 'Not authenticated' });

    const user = userRes.rows[0];
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error('/api/me error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Logout ------------------
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Session destroy error', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    return res.json({ ok: true });
  });
});

// Optional health
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
