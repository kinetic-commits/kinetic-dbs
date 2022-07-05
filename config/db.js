const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_WORD,
  host: process.env.DB_URI,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

module.exports = pool;

// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/kinetic-commits/kinetic-dbs.git
// // git push -u origin main
