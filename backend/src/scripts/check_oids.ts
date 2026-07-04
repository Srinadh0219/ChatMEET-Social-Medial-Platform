import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanup() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });
  await client.connect();

  console.log('🔍 Checking if tables are truly separate or the same object...\n');

  // Check OIDs (object IDs) - same OID = same physical table
  const oidCheck = await client.query(`
    SELECT table_name, (SELECT oid FROM pg_class WHERE relname = table_name) as oid
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('User', 'users', 'Post', 'posts', 'Community', 'communities', 'Chat', 'chats', 'Message', 'messages')
    ORDER BY table_name
  `);
  
  console.log('Table OIDs (same OID = same physical table):');
  oidCheck.rows.forEach(r => console.log(`  "${r.table_name}": OID ${r.oid}`));
  
  // More reliable: check pg_class directly
  const pgClassCheck = await client.query(`
    SELECT relname, oid, relkind 
    FROM pg_class 
    WHERE relname IN ('User', 'users', 'Post', 'posts', 'Community', 'communities', 'Chat', 'chats', 'Message', 'messages')
    AND relkind = 'r'
    ORDER BY relname
  `);
  
  console.log('\npg_class entries (relkind=r means real table):');
  pgClassCheck.rows.forEach(r => console.log(`  "${r.relname}": OID ${r.oid}`));

  await client.end();
}

cleanup().catch(console.error);
