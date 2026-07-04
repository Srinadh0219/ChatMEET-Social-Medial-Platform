import { Request, Response } from 'express';
import { query } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';

export const renameGroup = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.authenticatedUser) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    return res.status(400).json({ error: "Chat ID and new name are required" });
  }

  try {
    // Verify if requester is in the group
    const requesterMember = await query(
      'SELECT 1 FROM chat_users WHERE chat_id = $1 AND user_id = $2',
      [chatId, authReq.authenticatedUser.id || authReq.authenticatedUser._id]
    );
    if (requesterMember.rows.length === 0) {
      return res.status(403).json({ error: "Only members can rename this group" });
    }

    const result = await query(
      `UPDATE chats 
       SET chat_name = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id as _id, chat_name as "chatName", is_group_chat as "isGroupChat", 
                 group_admin_id as "groupAdmin", created_at as "createdAt", updated_at as "updatedAt"`,
      [chatName, chatId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const chat = result.rows[0];

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

export default renameGroup;
