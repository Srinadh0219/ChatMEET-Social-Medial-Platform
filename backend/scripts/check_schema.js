const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT column_name, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
});
