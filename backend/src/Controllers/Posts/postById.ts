import { Request, Response, NextFunction } from 'express';
import { query } from '../../config/db';

export interface PostRequest extends Request {
  post?: any;
}

const postByID = async (req: PostRequest, res: Response, next: NextFunction, id: string) => {
  try {
    const result = await query(
      `SELECT p.id as _id, p.caption, p.photo, p.author_id, p.created_at as "createdAt",
              u.id as "author_id_temp", u.name as "author_name", u.image as "author_image"
       FROM posts p
       LEFT JOIN users u ON p.author_id::uuid = u.id
       WHERE p.id = $1`,
      [id]
    );
    const post = result.rows[0];
    if (!post) {
      return res.status(400).json({
        error: "Post not found"
      });
    }
    // Format to match expected populate structure
    post.author = {
      _id: post.author_id,
      name: post.author_name,
      image: post.author_image
    };
    req.post = post;
    next();
  } catch (err) {
    console.error("postById error:", err);
    return res.status(400).json({
      error: "Could not retrieve post"
    });
  }
};

export default postByID;
