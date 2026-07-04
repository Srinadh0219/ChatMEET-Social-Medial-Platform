import { query } from '../config/db';

export type IUser = any;

const User = {
  async findById(id: string) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  find(filter: any) {
    // Supports only filter of form { _id: { $nin: [...] } }
    const ids = filter?._id?.$nin;
    let sql = 'SELECT id, name, image FROM users';
    const params: any[] = [];
    if (ids && ids.length) {
      const placeholders = ids.map((_: any, i: number) => `$${i + 1}`).join(',');
      sql += ` WHERE id NOT IN (${placeholders})`;
      params.push(...ids);
    }
    return {
      async select(_fields: string) {
        const res = await query(sql, params);
        return res.rows;
      },
    } as any;
  },

  async findByIdAndUpdate(id: string, update: any, _options: any) {
    // Handle $pull of followers (stored as array of ids)
    if (update?.$pull?.followers) {
      const followerId = update.$pull.followers;
      await query('UPDATE users SET followers = array_remove(followers, $1) WHERE id = $2', [followerId, id]);
    }
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    return {
      populate(_path: string, _fields: string) {
        return {
          populate(_path2: string, _fields2: string) {
            return {
              exec: async () => user,
            };
          },
        } as any;
      },
    } as any;
  },
};

export default User;
