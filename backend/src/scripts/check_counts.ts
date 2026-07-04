import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function checkCounts() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  const pairs = [
    { capital: 'User',      lower: 'users' },
    { capital: 'Post',      lower: 'posts' },
    { capital: 'Community', lower: 'communities' },
    { capital: 'Chat',      lower: 'chats' },
    { capital: 'Message',   lower: 'messages' },
  ];

  for (const p of pairs) {
    try {
      const r1 = await client.query(`SELECT COUNT(*) FROM "${p.capital}"`);
      console.log(`"${p.capital}" rows: ${r1.rows[0].count}`);
    } catch { console.log(`"${p.capital}": does not exist`); }

    try {
      const r2 = await client.query(`SELECT COUNT(*) FROM ${p.lower}`);
      console.log(`${p.lower} rows: ${r2.rows[0].count}`);
    } catch { console.log(`${p.lower}: does not exist`); }

    console.log('---');
  }

  await client.end();
}

checkCounts().catch(console.error);
