import { Request, Response } from 'express';
import { query } from '../../config/db';

export const allPosts = async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT p.id, p.caption, p.photo, p.author_id, 
        p.created_at as "created", p.created_at as "createdAt",
        json_build_object('_id', u.id, 'name', u.name, 'image', u.image) AS author,
        COALESCE(json_agg(DISTINCT pl.user_id) FILTER (WHERE pl.user_id IS NOT NULL)::jsonb, '[]'::jsonb) AS likes,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            '_id', c.id,
            'text', c.text,
            'commentedBy', jsonb_build_object('_id', u2.id, 'name', u2.name, 'image', u2.image)
          )) FILTER (WHERE c.id IS NOT NULL)::jsonb, '[]'::jsonb
        ) AS comments
      FROM posts p
      LEFT JOIN users u ON p.author_id::uuid = u.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id
      LEFT JOIN comments c ON c.post_id = p.id
      LEFT JOIN users u2 ON c.commented_by_id = u2.id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`
    );
    
    // Map id to _id for posts rows to match expected frontend format
    const posts = result.rows.map(row => {
      row._id = row.id;
      return row;
    });
    
    res.json(posts);
  } catch (error) {
    console.error("All posts error:", error);
    return res.status(400).json({ error: "Could not fetch posts" });
  }
};

export default allPosts;
