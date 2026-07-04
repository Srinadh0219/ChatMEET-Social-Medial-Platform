import { Request, Response } from 'express';
import { query } from '../../config/db';

const getCommunities = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;

    let sql = `
      SELECT c.id as _id, c.name, c.description, c.avatar, c.banner, c.category, c.created_at as "createdAt",
             u.id as "creator_id", u.name as "creator_name", u.image as "creator_image"
      FROM communities c
      LEFT JOIN users u ON c.creator = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && typeof search === 'string') {
      params.push(`%${search}%`);
      sql += ` AND c.name ILIKE $${params.length}`;
    }

    if (category && typeof category === 'string' && category !== 'All') {
      params.push(category);
      sql += ` AND c.category = $${params.length}`;
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);
    const communities = result.rows;

    for (let c of communities) {
      c.creator = {
        _id: c.creator_id,
        name: c.creator_name,
        image: c.creator_image
      };

      // Fetch members
      const membersRes = await query(
        `SELECT u.id as _id, u.name, u.image 
         FROM users u
         JOIN community_members cm ON u.id = cm.user_id
         WHERE cm.community_id = $1`,
        [c._id]
      );
      c.members = membersRes.rows;
    }

    res.json(communities);
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(400).json({ error: 'Could not fetch communities' });
  }
};

export default getCommunities;
