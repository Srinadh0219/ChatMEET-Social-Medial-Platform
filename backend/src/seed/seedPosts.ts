import { query } from '../config/db';

export const seedPosts = async () => {
  try {
    // Insert a sample post if none exist for user 'mani'
    const userResult = await query(`SELECT id FROM users WHERE name = $1 LIMIT 1`, ['mani']);
    if (userResult.rows.length === 0) {
      console.log('User "mani" not found, skipping seed');
      return;
    }
    const userId = userResult.rows[0].id;
    const postCheck = await query(`SELECT * FROM posts WHERE author_id = $1 LIMIT 1`, [userId]);
    if (postCheck.rows.length > 0) {
      console.log('Sample post already exists for mani');
      return;
    }
    await query(`INSERT INTO posts (author_id, caption, created_at) VALUES ($1, $2, NOW())`, [userId, 'Welcome to the platform, mani! This is a sample post.']);
    console.log('Inserted sample post for mani');
  } catch (err) {
    console.error('Error seeding posts', err);
  }
};

if (require.main === module) {
  // Run seeding when executed directly
  seedPosts().then(() => process.exit());
}
