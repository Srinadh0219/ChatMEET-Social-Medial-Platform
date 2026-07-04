import { Request, Response } from 'express';
import { query } from '../../config/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using env vars (dotenv already called in server.ts)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
});

export const createPost = async (req: Request, res: Response) => {
  const { Text, pic, community } = req.body;
  const authReq = req as any;
  if (!authReq.authenticatedUser) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const user = authReq.authenticatedUser;

  try {
    // Determine if it belongs to a community or not
    const communityId = community ? community : null;
    const userDetails = { name: user.name, id: user.id || user._id };

    // ------------------------------------------------------------
    // 1️⃣ If `pic` is a raw file (base64 or local path) we need to
    //    upload it to Cloudinary so we store only the secure URL.
    //    If `pic` already looks like a URL (starts with http/https)
    //    we assume it is an already‑uploaded image and keep it as‑is.
    // ------------------------------------------------------------
    let photoUrl = pic;
    if (pic && typeof pic === 'string' && !/^https?:\/\//i.test(pic)) {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        // Upload the raw image data to Cloudinary
        const uploadRes = await cloudinary.uploader.upload(pic, {
          folder: 'social_media_posts',
          resource_type: 'image'
        });
        photoUrl = uploadRes.secure_url;
      } else {
        console.log("⚠️ Cloudinary not configured. Storing image as base64 directly in database.");
      }
    }

    const result = await query(
      `INSERT INTO posts (caption, photo, author_id, community_id, user_details) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [Text, photoUrl, user.id, communityId, userDetails]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      error: "Could not create post"
    });
  }
};

// Placeholder functions as in original
export const getPosts = async (req: Request, res: Response) => { };
export const likePost = async (req: Request, res: Response) => { };
export const deletePost = async (req: Request, res: Response) => { };
export const updatePost = async (req: Request, res: Response) => { };
