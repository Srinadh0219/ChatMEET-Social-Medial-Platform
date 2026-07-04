const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:root@localhost:5432/social_media?schema=public' });
(async () => {
  try {
    await client.connect();
    const res = await client.query(`SELECT column_default FROM information_schema.columns WHERE table_name='User' AND column_name='id'`);
    console.log('DEFAULT:', res.rows[0]);
  } catch (e) { console.error(e); }
  finally { await client.end(); }
})();
