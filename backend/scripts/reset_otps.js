const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media'
});
(async () => {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query('DROP TABLE IF EXISTS otps');
    console.log('Dropped otps');
    const createSQL = `CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      last_sent_at TIMESTAMP
    );`;
    await client.query(createSQL);
    console.log('Created otps with correct FK');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected');
  }
})();
