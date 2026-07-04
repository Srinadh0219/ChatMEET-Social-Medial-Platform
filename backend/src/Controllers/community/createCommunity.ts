import { Request, Response } from 'express';
import { query } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const createCommunity = async (req: Request, res: Response) => {
  const { name, description, avatar, banner, category, userId } = req.body;

  if (!name || !userId) {
    return res.status(400).json({ error: 'Community name and userId are required' });
  }

  try {
    // Check if community name already exists
    const existing = await query('SELECT 1 FROM communities WHERE LOWER(name) = LOWER($1)', [name]);
    if ((existing.rowCount ?? 0) > 0) {
      return res.status(400).json({ error: 'A community with this name already exists' });
    }

    const communityId = uuidv4();
    // Insert new community
    await query(
      `INSERT INTO communities (id, name, description, avatar, banner, category, creator, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [communityId, name, description || '', avatar || '', banner || '', category || 'Other', userId]
    );

    // Creator is automatically the first member
    await query(
      `INSERT INTO community_members (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [communityId, userId]
    );

    // Fetch the populated community
    const communityRes = await query(
      `SELECT c.id as _id, c.name, c.description, c.avatar, c.banner, c.category, c.created_at as "createdAt",
              u.id as "creator_id", u.name as "creator_name", u.image as "creator_image"
       FROM communities c
       LEFT JOIN users u ON c.creator = u.id
       WHERE c.id = $1`,
      [communityId]
    );

    const community = communityRes.rows[0];
    if (community) {
      community.creator = {
        _id: community.creator_id,
        name: community.creator_name,
        image: community.creator_image
      };
      
      // Fetch members
      const membersRes = await query(
        `SELECT u.id as _id, u.name, u.image 
         FROM users u
         JOIN community_members cm ON u.id = cm.user_id
         WHERE cm.community_id = $1`,
        [communityId]
      );
      community.members = membersRes.rows;
    }

    res.json(community);
  } catch (error) {
    console.error('Create community error:', error);
    res.status(400).json({ error: 'Could not create community' });
  }
};

export default createCommunity;
