const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres:root@localhost:5432/social_media?schema=public' }); 
client.connect().then(async () => {
  const users = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
  const posts = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'posts'");
  console.log("Users:", users.rows);
  console.log("Posts:", posts.rows);
}).catch(console.error).finally(() => client.end());
