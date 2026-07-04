import { Request, Response } from 'express';
import { query } from '../../config/db';

const listUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  try {
    const result = await query(
      `SELECT p.*, 
        json_build_object('_id', u.id, 'name', u.name, 'image', u.image) AS author,
        COALESCE(json_agg(DISTINCT pl.user_id) FILTER (WHERE pl.user_id IS NOT NULL)::jsonb, '[]'::jsonb) AS likes,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('_id', c.id, 'text', c.text, 'commentedBy', jsonb_build_object('_id', u2.id, 'name', u2.name, 'image', u2.image))) FILTER (WHERE c.id IS NOT NULL)::jsonb,
          '[]'::jsonb
        ) AS comments
      FROM posts p
        JOIN users u ON p.author_id::uuid = u.id
        LEFT JOIN post_likes pl ON pl.post_id = p.id
        LEFT JOIN comments c ON c.post_id = p.id
        LEFT JOIN users u2 ON c.commented_by_id = u2.id
      WHERE p.author_id = $1
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`,
      [userId]
    );

    // Format to match Mongoose ObjectID structure expected by FrontEnd
    const posts = result.rows.map((row: any) => {
      row._id = row.id;
      return row;
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(400).json({
      error: "Could not fetch user posts"
    });
  }
};

export default listUser;
