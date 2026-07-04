import { Request, Response } from 'express';
import { query } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';

export const addToGroup = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.authenticatedUser) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { chatId, userId } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ error: "Chat ID and User ID are required" });
  }

  try {
    // Verify if requester is in the group
    const requesterMember = await query(
      'SELECT 1 FROM chat_users WHERE chat_id = $1 AND user_id = $2',
      [chatId, authReq.authenticatedUser.id || authReq.authenticatedUser._id]
    );
    if (requesterMember.rows.length === 0) {
      return res.status(403).json({ error: "Only members can add users to this group" });
    }

    // Check if user is already in group
    const existing = await query(
      'SELECT 1 FROM chat_users WHERE chat_id = $1 AND user_id = $2',
      [chatId, userId]
    );

    if (existing.rows.length === 0) {
      await query(
        'INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)',
        [chatId, userId]
      );
    }

    // Update updated_at for group
    await query(
      'UPDATE chats SET updated_at = NOW() WHERE id = $1',
      [chatId]
    );

    // Fetch updated chat
    const chatResult = await query(
      `SELECT id as _id, chat_name as "chatName", is_group_chat as "isGroupChat", 
              group_admin_id as "groupAdmin", created_at as "createdAt", updated_at as "updatedAt" 
       FROM chats WHERE id = $1`, 
      [chatId]
    );
    const chat = chatResult.rows[0];

    // Populate users
    const usersResult = await query(
      `SELECT u.id as _id, u.name, u.email, u.image 
       FROM users u
       JOIN chat_users cu ON u.id = cu.user_id
       WHERE cu.chat_id = $1`,
      [chatId]
    );
    chat.users = usersResult.rows;

    res.status(200).json(chat);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export default addToGroup;
