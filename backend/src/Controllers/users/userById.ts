import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/db';

export interface ProfileRequest extends Request {
  profile?: any;
}

const userById = async (req: ProfileRequest, res: Response, next: NextFunction, id: string) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({
        error: "User not found"
      });
    }
    req.profile = user;
    next();
  } catch (err) {
    console.error("userById error:", err);
    return res.status(400).json({
      error: "Could not retrieve user"
    });
  }
};

export default userById;
