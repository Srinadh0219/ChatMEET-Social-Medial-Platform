const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres:root@localhost:5432/social_media?schema=public' }); 

client.connect().then(async () => {
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log('TABLES:', tables.rows.map(r => r.table_name)); 
  
  for (const table of tables.rows) { 
    const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table.table_name]); 
    console.log('\nTABLE:', table.table_name); 
    console.log(cols.rows); 
  } 
  client.end(); 
}).catch(console.error);
