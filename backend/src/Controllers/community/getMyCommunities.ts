import { Response } from 'express';
import { query } from '../../config/db';
import { ProfileRequest } from '../users/userById';

const getMyCommunities = async (req: ProfileRequest, res: Response) => {
  if (!req.profile) {
    return res.status(400).json({ error: 'Profile not found' });
  }

  try {
    const result = await query(
      `SELECT c.* FROM communities c 
       JOIN community_members cm ON c.id = cm.community_id 
       WHERE cm.user_id = $1 ORDER BY c.created_at DESC`,
      [req.profile.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get my communities error:', error);
    res.status(400).json({ error: 'Could not fetch your communities' });
  }
};

export default getMyCommunities;
