const { query } = require('./src/config/db');
query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
  .then(r => console.log(r.rows))
  .catch(console.error)
  .finally(() => process.exit(0));
