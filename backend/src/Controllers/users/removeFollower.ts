import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/db';

export const removeFollower = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as any;
  if (!authReq.authenticatedUser || authReq.authenticatedUser.id !== req.body.userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    await query('DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2', [req.body.userId, req.body.unfollowId]);
    const result = await query('SELECT id, name, email, image, about FROM users WHERE id = $1', [req.body.unfollowId]);
    res.json(result.rows[0] || { success: true });
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Could not remove follower" });
  }
};

export default removeFollower;
