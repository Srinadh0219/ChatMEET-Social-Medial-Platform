import { Request, Response } from 'express';
import { query } from '../../config/db';

// -----------------------------------------------------------------
// Insert a comment on a post. The user ID is taken from the JWT via the
// protect middleware (req.authenticatedUser). This prevents spoofing and
// ensures the comment is always recorded under the logged‑in user.
// The response returns the newly created comment together with the full
// refreshed comments list for the post, so the front‑end can update its UI
// without extra fetches.
export const commentPost = async (req: Request, res: Response) => {
  const { postId, comment } = req.body;
  const authReq = req as any;
  const userId = authReq.authenticatedUser?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  try {
    // Insert comment
    const insertRes = await query(
      `INSERT INTO comments (post_id, commented_by_id, text, commented_at) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [postId, userId, comment]
    );
    const newComment = insertRes.rows[0];

    // Fetch updated comments for the post (including the new one)
    const commentsRes = await query(
      `SELECT c.id, c.text, json_build_object('_id', u.id, 'name', u.name, 'image', u.image) AS commenter
       FROM comments c
       JOIN users u ON c.commented_by_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.commented_at ASC`,
      [postId]
    );
    const comments = commentsRes.rows.map((row) => ({
      _id: row.id,
      text: row.text,
      commentedBy: row.commenter,
    }));

    res.json({ comment: newComment, comments });
  } catch (err) {
    console.error('commentPost error:', err);
    res.status(400).json({ error: 'Could not add comment' });
  }
};

export default commentPost;
