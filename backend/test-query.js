const { pool } = require('./src/config/db');
pool.query("SELECT * FROM posts")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
