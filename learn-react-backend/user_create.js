// create_user.js (improved)
// Usage examples:
//   node create_user.js                     # uses defaults
//   node create_user.js alice@ex.com p@ss Alice
//   node create_user.js --email=a@b.com --password=12345 --name=Alice

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

// parse CLI args (simple)
const argv = require('minimist')(process.argv.slice(2));
const email = argv.email || argv._[0] || 'alice@example.com';
const password = argv.password || argv._[1] || 'password123';
const name = argv.name || argv._[2] || 'Alice';

async function createOrSkipUser(email, password, name) {
  try {
    // check existing
    const existing = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log(`User already exists (email=${email}, id=${existing.rows[0].id}). Skipping creation.`);
      return existing.rows[0].id;
    }

    const pwHash = await bcrypt.hash(password, 10);
    const res = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
      [email, pwHash, name]
    );
    console.log('Created user id', res.rows[0].id);
    return res.rows[0].id;
  } catch (err) {
    console.error('createOrSkipUser error:', err.message || err);
    throw err;
  }
}

(async () => {
  try {
    const id = await createOrSkipUser(email, password, name);
    console.log('Finished. user id =', id);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create user:', err.message || err);
    process.exit(1);
  } finally {
    // ensure pool is closed
    await pool.end();
  }
})();
