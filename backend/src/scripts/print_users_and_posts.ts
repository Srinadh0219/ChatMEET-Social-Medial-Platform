import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function main() {
  await client.connect();
  
  const users = await client.query('SELECT * FROM "User"');
  console.log('--- USER TABLE ROWS ---');
  console.log(users.rows);

  const posts = await client.query('SELECT * FROM "Post"');
  console.log('--- POST TABLE ROWS ---');
  console.log(posts.rows);

  await client.end();
}

main();
