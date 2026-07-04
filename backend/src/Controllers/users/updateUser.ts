import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../config/db';
import { ProfileRequest } from './userById';

const update = async (req: ProfileRequest, res: Response) => {
  const user = req.profile;
  if (!user) {
    return res.status(400).json({ error: "User profile not found" });
  }

  const authReq = req as any;
  if (!authReq.authenticatedUser || authReq.authenticatedUser.id !== user.id) {
    return res.status(403).json({ error: "Not authorized to update this profile" });
  }

  const allowedKeys = ['name', 'about', 'email', 'image'];
  const fields: any = {};

  for (const key of allowedKeys) {
    if (req.body[key] !== undefined) {
      fields[key] = req.body[key];
    }
  }

  // Handle password change
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    fields.password = hash;
  }

  try {
    const entries = Object.entries(fields);
    if (entries.length === 0) {
      return res.json(user);
    }

    const setClauses = entries
      .map(([key, _], idx) => `${key} = $${idx + 1}`)
      .join(', ');
    const values = entries.map(([_, val]) => val);
    
    const sql = `UPDATE users SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`;
    const result = await query(sql, [...values, user.id]);
    const updatedUser = result.rows[0];
    
    // Remove password before sending
    if (updatedUser) delete updatedUser.password;
    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(400).json({ error: "Update failed" });
  }
};

export default update;
