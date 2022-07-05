const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_WORD,
  host: process.env.DB_URI,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;
