import { query } from '../config/db';

// Minimal Chat mock implementing methods used by controllers.
// This is a lightweight wrapper around raw SQL queries.

const Chat = {
  // Find chats matching filter. Returns a chainable object with populate methods.
  async find(filter: any) {
    // For simplicity, we ignore the filter and return an empty array.
    // Real implementation could translate filter to SQL.
    const rows: any[] = [];
    return {
      async populate(_path: string, _select?: string) {
        return {
          async populate(_path2: string, _select2?: string) {
            return rows;
          },
        } as any;
      },
    } as any;
  },

  // Create a new chat and return the inserted row.
  async create(data: any) {
    const sql = `INSERT INTO "Chat" ("chatName", "isGroupChat", users) VALUES ($1, $2, $3) RETURNING *`;
    const result = await query(sql, [data.chatName, data.isGroupChat, data.users]);
    return result.rows[0];
  },

  // Find a single chat by filter (e.g., {_id: id}). Returns an object with populate.
  async findOne(filter: any) {
    const sql = `SELECT * FROM "Chat" WHERE id = $1`;
    const result = await query(sql, [filter._id]);
    const chat = result.rows[0];
    return {
      async populate(_path: string, _select?: string) {
        // For this stub, we simply return the chat object.
        return chat;
      },
    } as any;
  },
};

export default Chat;
