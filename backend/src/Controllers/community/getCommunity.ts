import { Request, Response } from 'express';
import { query } from '../../config/db';

const getCommunity = async (req: Request, res: Response) => {
  const communityId = Array.isArray(req.params.communityId) ? req.params.communityId[0] : req.params.communityId;
  if (!communityId) {
    return res.status(400).json({ error: 'Community ID is required' });
  }

  try {
    const communityRes = await query(
      `SELECT c.id as _id, c.name, c.description, c.avatar, c.banner, c.category, c.created_at as "createdAt",
              u.id as "creator_id", u.name as "creator_name", u.image as "creator_image"
       FROM communities c
       LEFT JOIN users u ON c.creator = u.id
       WHERE c.id = $1`,
      [communityId]
    );

    const community = communityRes.rows[0];
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

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

    res.json(community);
  } catch (error) {
    console.error('Get community error:', error);
    res.status(400).json({ error: 'Could not fetch community' });
  }
};

export default getCommunity;
