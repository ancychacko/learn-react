// create_user.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DATABASE_URL, DB_SSL, NODE_ENV
} = process.env;

let config;
if (DATABASE_URL) config = { connectionString: DATABASE_URL };
else config = {
  host: DB_HOST || 'localhost',
  port: DB_PORT ? parseInt(DB_PORT,10) : 5432,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
};

if ((DB_SSL === 'true' || DB_SSL === '1') && NODE_ENV === 'production') {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

async function createUser(email, password, name) {
  const pwHash = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
    [email, pwHash, name]
  );
  console.log('Created user id', res.rows[0].id);
  await pool.end();
}

createUser('alice@example.com', 'password123', 'Alice')
  .catch(err => { console.error(err); process.exit(1); });
