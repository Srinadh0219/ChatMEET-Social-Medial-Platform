import { Request, Response } from 'express';
import { query } from '../../config/db';

export const likePost = async (req: Request, res: Response) => {
  const { postId } = req.body;
  const authReq = req as any;
  const userId = authReq.authenticatedUser?.id;

  if (!userId || !postId) {
    return res.status(400).json({ error: 'Missing postId or unauthenticated' });
  }

  try {
    await query(
      'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [postId, userId]
    );
    // Return updated like count AND the full likes array so frontend can check if user liked
    const countRes = await query(
      'SELECT ARRAY_AGG(user_id::text) AS likes FROM post_likes WHERE post_id = $1',
      [postId]
    );
    const likes: string[] = countRes.rows[0]?.likes || [];
    res.json({ postId, likes });
  } catch (err) {
    console.error('likePost error:', err);
    res.status(400).json({ error: 'Could not like post' });
  }
};

export const unlike = async (req: Request, res: Response) => {
  const { postId } = req.body;
  const authReq = req as any;
  const userId = authReq.authenticatedUser?.id;

  if (!userId || !postId) {
    return res.status(400).json({ error: 'Missing postId or unauthenticated' });
  }

  try {
    await query(
      'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );
    const countRes = await query(
      'SELECT ARRAY_AGG(user_id::text) AS likes FROM post_likes WHERE post_id = $1',
      [postId]
    );
    const likes: string[] = countRes.rows[0]?.likes || [];
    res.json({ postId, likes });
  } catch (err) {
    console.error('unlike error:', err);
    res.status(400).json({ error: 'Could not unlike post' });
  }
};

export default { likePost, unlike };
