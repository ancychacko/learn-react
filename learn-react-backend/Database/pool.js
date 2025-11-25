// db/pool.js
const pg = require("pg");

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DATABASE_URL,
  DB_SSL,
  NODE_ENV,
} = process.env;

let poolConfig;

if (DATABASE_URL) {
  poolConfig = {
    connectionString: DATABASE_URL,
    ssl:
      (DB_SSL === "true" || DB_SSL === "1") && NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  };
} else {
  poolConfig = {
    host: DB_HOST || "localhost",
    port: DB_PORT ? parseInt(DB_PORT, 10) : 5432,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  };
}

const pool = new pg.Pool(poolConfig);

module.exports = pool;
