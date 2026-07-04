import { query } from '../config/db';

// Minimal Message mock implementing methods used by controllers.
// Provides find method returning empty array and populate chain for compatibility.

const Message = {
  async find(filter: any) {
    // Simplified: ignore filter and return empty array.
    const rows: any[] = [];
    return {
      async populate(_path: string, _select?: string) {
        return {
          async populate(_path2: string, _select2?: string) {
            return rows;
          }
        } as any;
      }
    } as any;
  },

  // Optional create method for completeness.
  async create(data: any) {
    const sql = `INSERT INTO "Message" ("sender", "chat", "content", "createdAt") VALUES ($1, $2, $3, $4) RETURNING *`;
    const result = await query(sql, [data.sender, data.chat, data.content, data.createdAt]);
    return result.rows[0];
  }
};

export default Message;
