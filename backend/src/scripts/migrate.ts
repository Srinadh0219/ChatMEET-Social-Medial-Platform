// src/scripts/migrate.ts
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runMigration() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  await client.connect();

  const otpsSqlPath = path.resolve(__dirname, '../../src/Schema/create_otps_table.sql');
  const otpsSql = fs.readFileSync(otpsSqlPath, 'utf-8');
  // ALTER User table to add is_verified if missing
  const addVerifiedSql = `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;`;
  const combinedSql = `${otpsSql}\n${addVerifiedSql}`;

  try {
    await client.query(combinedSql);
    console.log('✅ Migration applied – otps table created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await client.end();
  }
}

runMigration();
