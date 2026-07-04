const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media'
});
client.connect().then(async () => {
  try {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'chats'");
    console.log(res.rows.map(r => r.column_name));
    
    const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'messages'");
    console.log(res2.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    client.end();
  }
});
