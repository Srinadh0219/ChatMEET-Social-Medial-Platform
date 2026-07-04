// recreate_otps.js
// Run with: node backend/scripts/recreate_otps.js
// This script drops the existing otps table (if any) and recreates it
// with a UNIQUE constraint on user_id so the INSERT … ON CONFLICT works.

const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media',
});

(async () => {
  try {
    await client.connect();
    console.log('🔧 Connected to DB');

    // Ensure pgcrypto is available (needed for UUID defaults elsewhere)
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Drop otps if it exists
    await client.query('DROP TABLE IF EXISTS otps CASCADE');
    console.log('🗑️ otps table dropped');

    // Recreate with proper schema and UNIQUE constraint on user_id
    const createSQL = `CREATE TABLE otps (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      CONSTRAINT otps_user_id_key UNIQUE (user_id),
      code VARCHAR(6) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      last_sent_at TIMESTAMP
    );`;
    await client.query(createSQL);
    console.log('✅ otps table created with UNIQUE(user_id)');
  } catch (e) {
    console.error('❌ Migration failed:', e);
  } finally {
    await client.end();
    console.log('🔚 DB connection closed');
  }
})();
