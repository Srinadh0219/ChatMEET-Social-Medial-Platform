import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/db';

export const addFollower = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as any;
  if (!authReq.authenticatedUser || authReq.authenticatedUser.id !== req.body.userId) {
    return res.status(403).json({ error: "Not authorized" });
  }

  try {
    // Insert the follow relationship: userId follows followId
    await query(
      'INSERT INTO user_follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.body.userId, req.body.followId]
    );
    // Fetch the updated user being followed to return
    const result = await query('SELECT id, name, email, image, about FROM users WHERE id = $1', [req.body.followId]);
    res.json(result.rows[0]);
    // Continue to addFollowing if needed (though the DB relation is now bidirectional via the join table)
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Could not add follower" });
  }
};

export default addFollower;
