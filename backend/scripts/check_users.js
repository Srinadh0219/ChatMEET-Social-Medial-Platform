const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media'
});
client.connect().then(async () => {
  try {
    const res = await client.query(`
      SELECT id, name, email, date 
      FROM users 
      ORDER BY date DESC 
      LIMIT 5
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
});
