import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function run() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();
  const sql = `
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;
  `;
  try {
    await client.query(sql);
    console.log('✅ is_verified column added (or already existed).');
  } catch (err) {
    console.error('❌ Migration error:', err);
  } finally {
    await client.end();
  }
}

run();
