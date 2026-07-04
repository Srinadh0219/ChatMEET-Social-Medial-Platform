import { Request, Response, NextFunction } from 'express';

export const removeFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Relationship deletion is already handled by removeFollower
    if (!res.headersSent) {
      res.json({ success: true });
    }
  } catch (error) {
    if (!res.headersSent) {
      return res.status(400).json({ error: "Could not remove following" });
    }
  }
};

export default removeFollowing;
