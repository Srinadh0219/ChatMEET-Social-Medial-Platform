import { Response } from 'express';
import { query } from '../../config/db';
import { ProfileRequest } from '../users/userById';

export const list = async (req: ProfileRequest, res: Response) => {
  if (!req.profile) {
    return res.status(400).json({ error: "Profile not found" });
  }

  const authReq = req as any;
  if (!authReq.authenticatedUser || authReq.authenticatedUser.id !== req.profile.id) {
    return res.status(403).json({ error: "Not authorized" });
  }

  const userId = req.profile.id;
  console.log('🔎 listNewsFeed: fetching feed for userId', userId);
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.caption,
        p.photo,
        p.author_id,
        p.community_id,
        p.user_details,
        p.created_at AS created,
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
      WHERE p.author_id::uuid = $1::uuid OR p.author_id::uuid IN (
        SELECT following_id FROM user_follows WHERE follower_id = $1::uuid
      )
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC`,
      [userId]
    );
    console.log('✅ listNewsFeed: query succeeded, rows =', result.rowCount);
    const posts = result.rows;
    res.json(posts);
  } catch (error) {
    console.error('❌ listNewsFeed error →', error);
    return res.status(400).json({ error: "Could not fetch news feed" });
  }
};

export default list;
