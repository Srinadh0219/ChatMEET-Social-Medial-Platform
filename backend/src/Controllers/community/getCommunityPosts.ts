import { Request, Response } from 'express';
import { query } from '../../config/db';

const getCommunityPosts = async (req: Request, res: Response) => {
  const communityId = req.params.communityId;
  if (!communityId) {
    return res.status(400).json({ error: 'Community ID is required' });
  }

  try {
    const result = await query(
      `SELECT p.id as _id, p.caption, p.photo, p.author_id, p.created_at as "createdAt",
              u.id as "author_id_temp", u.name as "author_name", u.image as "author_image",
              COALESCE(json_agg(DISTINCT pl.user_id) FILTER (WHERE pl.user_id IS NOT NULL)::jsonb, '[]'::jsonb) AS likes,
              COALESCE(
                json_agg(DISTINCT jsonb_build_object('_id', c.id, 'text', c.text, 'commentedBy', jsonb_build_object('_id', u2.id, 'name', u2.name, 'image', u2.image))) FILTER (WHERE c.id IS NOT NULL)::jsonb,
                '[]'::jsonb
              ) AS comments
       FROM posts p
       JOIN users u ON p.author_id = u.id
       LEFT JOIN post_likes pl ON pl.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       LEFT JOIN users u2 ON c.commented_by_id = u2.id
       WHERE p.community_id = $1
       GROUP BY p.id, u.id
       ORDER BY p.created_at DESC`,
      [communityId]
    );

    const posts = result.rows.map(post => {
      post.author = {
        _id: post.author_id,
        name: post.author_name,
        image: post.author_image
      };
      return post;
    });

    res.json(posts);
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(400).json({ error: 'Could not fetch community posts' });
  }
};

export default getCommunityPosts;
