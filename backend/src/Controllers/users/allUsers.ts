import { Request, Response } from 'express';
import { query } from '../../config/db';

const allUsers = async (req: Request, res: Response) => {
  const search = req.query.search;
  try {
    let result;
    if (search) {
      result = await query(
        `SELECT id, name, email, image, about, date FROM users 
         WHERE name ILIKE $1 OR email ILIKE $1 
         ORDER BY date DESC`,
        [`%${search}%`]
      );
    } else {
      result = await query('SELECT id, name, email, image, about, date FROM users ORDER BY date DESC');
    }
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export default allUsers;
