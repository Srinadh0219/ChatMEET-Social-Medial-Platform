import { Request, Response } from 'express';
import { query } from '../../config/db';

const uncomment = async (req: Request, res: Response) => {
  const { postId, comment } = req.body;
  const commentId = comment?._id || comment?.id;

  if (!postId || !commentId) {
    return res.status(400).json({ error: "Post ID and Comment ID are required" });
  }

  const authReq = req as any;
  if (!authReq.authenticatedUser) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    // 1. Delete the comment ensuring it belongs to the authenticated user
    const deleteRes = await query(
      'DELETE FROM comments WHERE id = $1 AND post_id = $2 AND commented_by_id = $3 RETURNING *',
      [commentId, postId, authReq.authenticatedUser.id]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(403).json({ error: "Not authorized to delete this comment or comment not found" });
    }

    // 2. Fetch remaining comments for this post
    const commentsResult = await query(
      `SELECT c.id as _id, c.text, 
              json_build_object('_id', u.id, 'name', u.name, 'image', u.image) as "commentedBy"
       FROM comments c
       JOIN users u ON c.commented_by_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.commented_at ASC`,
      [postId]
    );

    res.json({ comments: commentsResult.rows });
  } catch (err) {
    console.error("Uncomment error:", err);
    res.status(400).json({ error: "Could not remove comment" });
  }
};

export default uncomment;
