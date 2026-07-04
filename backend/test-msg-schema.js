const { pool } = require('./src/config/db');
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='Message'")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
