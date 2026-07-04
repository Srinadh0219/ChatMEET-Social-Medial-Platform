import { Request, Response, NextFunction } from 'express';

export const addFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Relationship is already handled by addFollower (user_follows table is bidirectional representation)
    if (!res.headersSent) {
      res.json({ success: true });
    }
  } catch (error) {
    if (!res.headersSent) {
      return res.status(400).json({ error: "Could not add following" });
    }
  }
};

export default addFollowing;
