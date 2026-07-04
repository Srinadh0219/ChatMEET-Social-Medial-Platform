import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function check() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();
  const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='User' AND column_name='is_verified';`);
  console.log('Columns found:', res.rows);
  await client.end();
}

check();
