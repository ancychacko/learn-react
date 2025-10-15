// test_connection.js
require('dotenv').config();
const { Pool } = require('pg');

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DATABASE_URL, DB_SSL, NODE_ENV
} = process.env;

let config;
if (DATABASE_URL) config = { connectionString: DATABASE_URL };
else {
  config = {
    host: DB_HOST || 'localhost',
    port: DB_PORT ? parseInt(DB_PORT,10) : 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
  };
}

if ((DB_SSL === 'true' || DB_SSL === '1') && NODE_ENV === 'production') {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

async function test() {
  try {
    const r = await pool.query('SELECT 1 as ok, NOW() as now');
    console.log('Connection OK:', r.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();
