import { Response } from 'express';
import { query } from '../../config/db';
import { PostRequest } from './postById';

const remove = async (req: PostRequest, res: Response) => {
  let post = req.post;
  if (!post) {
    return res.status(400).json({ error: "Post not found" });
  }

  const authReq = req as any;
  if (!authReq.authenticatedUser || authReq.authenticatedUser.id !== post.author_id) {
    return res.status(403).json({ error: "Not authorized to delete this post" });
  }

  try {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING *', [post._id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Delete post error:", err);
    return res.status(400).json({
      error: "Could not delete post"
    });
  }
};

export default remove;
