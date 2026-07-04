// migrate_user_id.js
// Run with: node backend/scripts/migrate_user_id.js
// This script fixes the primary‑key definition for the "User" table and updates the
// foreign‑key in the otps table so that registration works (the controller expects the DB
// to generate an id automatically).

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:root@localhost:5432/social_media',
});

(async () => {
  try {
    await client.connect();
    console.log('🔧 Connected to DB');

    // Ensure the pgcrypto extension for gen_random_uuid()
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    console.log('✅ pgcrypto extension ensured');

    // 1️⃣ Add a temporary UUID column with default generation
    await client.query(`
      ALTER TABLE "User"
        ADD COLUMN tmp_id UUID DEFAULT gen_random_uuid() NOT NULL;
    `);
    console.log('🆕 Temporary UUID column added');

    // 2️⃣ Populate existing rows – default already filled, no extra step needed

    // 3️⃣ Drop old primary‑key constraint (if any) and old id column
    await client.query(`
      ALTER TABLE "User"
        DROP CONSTRAINT IF EXISTS "User_pkey",
        DROP COLUMN IF EXISTS id;
    `);
    console.log('🗑️ Old id column removed');

    // 4️⃣ Rename temporary column to id and set it as primary key
    await client.query(`
      ALTER TABLE "User"
        RENAME COLUMN tmp_id TO id,
        ADD PRIMARY KEY (id);
    `);
    console.log('🔑 New UUID primary key established');

    // 5️⃣ Fix otps.user_id to reference UUID
    await client.query(`
      ALTER TABLE otps
        ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
        DROP CONSTRAINT IF EXISTS otps_user_id_fkey,
        ADD CONSTRAINT otps_user_id_fkey
          FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE;
    `);
    console.log('🔗 otps.user_id foreign‑key updated to UUID');

    console.log('✅ Migration completed successfully');
  } catch (e) {
    console.error('❌ Migration failed:', e);
  } finally {
    await client.end();
    console.log('🔚 DB connection closed');
  }
})();
