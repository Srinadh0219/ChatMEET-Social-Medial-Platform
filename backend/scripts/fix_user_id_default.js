// fix_user_id_default.js
// Run with: node backend/scripts/fix_user_id_default.js
// This script adds a default UUID generator to the "User" table's id column (type TEXT).
// The existing foreign‑key relationships stay intact because we do NOT drop the primary key.

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media',
});

(async () => {
  try {
    await client.connect();
    console.log('🔧 Connected to DB');

    // Ensure pgcrypto extension for gen_random_uuid()
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    console.log('✅ pgcrypto extension ensured');

    // Set default for id column (text) to a UUID string
    await client.query(`
      ALTER TABLE "User"
        ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
    `);
    console.log('💡 Default UUID added to User.id');

    // Verify the change
    const res = await client.query(`
      SELECT column_name, column_default
      FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'id';
    `);
    console.log('✅ Verification result:', res.rows[0]);
  } catch (e) {
    console.error('❌ Script failed:', e);
  } finally {
    await client.end();
    console.log('🔚 DB connection closed');
  }
})();
