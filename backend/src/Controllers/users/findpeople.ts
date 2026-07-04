import { Response } from 'express';
import { query } from '../../config/db';
import { ProfileRequest } from './userById';

const findpeople = async (req: ProfileRequest, res: Response) => {
  if (!req.profile) {
    return res.status(400).json({ error: "Profile not found" });
  }

  const authReq = req as any;
  if (!authReq.authenticatedUser || authReq.authenticatedUser.id !== req.profile.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    // Find users excluding the current user and users they already follow
    const result = await query(
      `SELECT id, name, image FROM users 
       WHERE id != $1 
       AND id NOT IN (SELECT following_id FROM user_follows WHERE follower_id = $1)`,
      [req.profile.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      error: "Could not find people"
    });
  }
};

export default findpeople;
