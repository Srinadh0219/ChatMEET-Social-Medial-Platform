import { query } from '../config/db';

// Minimal Post mock to satisfy controller usage.
// Provides a constructor that stores data and a save method that inserts
// the record into the "Post" table using the pg query wrapper.

export default class Post {
  private data: any;
  constructor(data: any) {
    this.data = data;
  }

  async save() {
    const keys = Object.keys(this.data);
    const columns = keys.map((k) => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO "Post" (${columns}) VALUES (${placeholders}) RETURNING *`;
    const result = await query(sql, Object.values(this.data));
    return result.rows[0];
  }
}
