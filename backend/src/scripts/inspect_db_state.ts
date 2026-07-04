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
  const tablesRes = await client.query(`
    SELECT table_name, table_type 
    FROM information_schema.tables 
    WHERE table_schema='public'
  `);
  console.log('Tables found:');
  const tables = tablesRes.rows.map(r => r.table_name);
  
  for (const row of tablesRes.rows) {
    console.log(`- ${row.table_name}: ${row.table_type}`);
    if (row.table_type === 'VIEW') {
      const viewDef = await client.query(`
        SELECT view_definition 
        FROM information_schema.views 
        WHERE table_schema='public' AND table_name = $1
      `, [row.table_name]);
      console.log(`  Definition: ${viewDef.rows[0]?.view_definition.trim().replace(/\s+/g, ' ')}`);
    }
  }


  
  for (const table of tables) {
    try {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${table}"`);
      console.log(`Table "${table}": ${countRes.rows[0].count} rows`);
    } catch (e: any) {
      console.error(`Error querying "${table}":`, e.message);
    }
  }
  await client.end();
}

main();
