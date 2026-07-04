import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function renameTablesAndDropViews() {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
  });

  await client.connect();
  console.log('✅ Connected to database\n');

  try {
    await client.query('BEGIN');

    // Step 1: Drop the lowercase VIEWS (they are views, not real tables)
    console.log('🗑️  Dropping views (users, posts, chats, communities, messages)...');
    await client.query(`DROP VIEW IF EXISTS users CASCADE`);
    await client.query(`DROP VIEW IF EXISTS posts CASCADE`);
    await client.query(`DROP VIEW IF EXISTS chats CASCADE`);
    await client.query(`DROP VIEW IF EXISTS communities CASCADE`);
    await client.query(`DROP VIEW IF EXISTS messages CASCADE`);
    console.log('   ✅ Views dropped\n');

    // Step 2: Rename real physical tables from "Capital" to lowercase
    console.log('✏️  Renaming real tables...');
    await client.query(`ALTER TABLE "User" RENAME TO users`);
    console.log('   ✅ "User" → users');

    await client.query(`ALTER TABLE "Post" RENAME TO posts`);
    console.log('   ✅ "Post" → posts');

    await client.query(`ALTER TABLE "Chat" RENAME TO chats`);
    console.log('   ✅ "Chat" → chats');

    await client.query(`ALTER TABLE "Community" RENAME TO communities`);
    console.log('   ✅ "Community" → communities');

    await client.query(`ALTER TABLE "Message" RENAME TO messages`);
    console.log('   ✅ "Message" → messages');

    await client.query('COMMIT');
    console.log('\n🎉 All tables successfully renamed!');

    // Step 3: Verify final table list
    const result = await client.query(
      `SELECT table_name, table_type FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log('\n📋 Final table list:');
    result.rows.forEach(r => console.log(`   ${r.table_type === 'VIEW' ? '👁️  VIEW' : '📦 TABLE'}: ${r.table_name}`));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed, rolled back:', err);
  } finally {
    await client.end();
  }
}

renameTablesAndDropViews();
