import { Response, NextFunction } from 'express';
import { ProfileRequest } from '../users/userById';
import { query } from '../../config/db';

const check = async (req: ProfileRequest, res: Response, next: NextFunction) => {
  let user = req.profile;
  if (!user) {
    return res.status(400).json({ error: "User profile not found" });
  }

  if (req.body.email && req.body.email !== user.email) {
    try {
      const existing = await query('SELECT id FROM users WHERE email = $1', [req.body.email]);
      if ((existing.rowCount ?? 0) > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    next();
  }
};

export default check;
