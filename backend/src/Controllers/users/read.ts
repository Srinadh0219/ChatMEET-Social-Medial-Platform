import { Response, NextFunction } from 'express';
import { query } from '../../config/db';
import { ProfileRequest } from './userById';

const read = async (req: ProfileRequest, res: Response, next: NextFunction) => {
  if (!req.profile) {
    return res.status(400).json({ error: "User profile not found" });
  }
  // Remove sensitive data before sending
  const profile = { ...req.profile };
  delete profile.password;

  // Fetch followers (users who follow this profile)
  try {
    const followersResult = await query(
      `SELECT u.id, u.name, u.image FROM users u JOIN user_follows uf ON u.id = uf.follower_id WHERE uf.following_id = $1`,
      [req.profile.id]
    );
    const followingResult = await query(
      `SELECT u.id, u.name, u.image FROM users u JOIN user_follows uf ON u.id = uf.following_id WHERE uf.follower_id = $1`,
      [req.profile.id]
    );
    profile.followers = followersResult.rows;
    profile.following = followingResult.rows;
  } catch (err) {
    console.error('Error fetching followers/following:', err);
    profile.followers = [];
    profile.following = [];
  }

  res.json(profile);
};

export default read;
