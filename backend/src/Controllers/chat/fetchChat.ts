import { Request, Response } from 'express';
import { query } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';

const fetchChats = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.authenticatedUser) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    const userId = authReq.authenticatedUser.id || authReq.authenticatedUser._id;

    const chatsResult = await query(
      `SELECT c.id as _id, c.chat_name as "chatName", c.is_group_chat as "isGroupChat", 
              c.group_admin_id as "groupAdmin", c.latest_message_id, c.created_at as "createdAt", c.updated_at as "updatedAt"
       FROM chats c
       JOIN chat_users cu ON c.id = cu.chat_id
       WHERE cu.user_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    const chats = chatsResult.rows;

    for (let chat of chats) {
      const usersResult = await query(
        `SELECT u.id as _id, u.name, u.email, u.image 
         FROM users u
         JOIN chat_users cu ON u.id = cu.user_id
         WHERE cu.chat_id = $1`,
        [chat._id]
      );
      chat.users = usersResult.rows;

      if (chat.latest_message_id) {
        const msgResult = await query(
          `SELECT m.id as _id, m.content, m.chat_id, m.created_at as "createdAt",
                  u.id as "sender_id", u.name as "sender_name", u.email as "sender_email", u.image as "sender_image"
           FROM messages m
           LEFT JOIN users u ON m.sender_id = u.id
           WHERE m.id = $1`,
          [chat.latest_message_id]
        );
        if (msgResult.rows.length > 0) {
          const row = msgResult.rows[0];
          chat.latestMessage = {
            _id: row._id,
            content: row.content,
            chat: row.chat_id,
            createdAt: row.createdAt,
            sender: {
              _id: row.sender_id,
              name: row.sender_name,
              email: row.sender_email,
              image: row.sender_image
            }
          };
        }
      }
    }

    res.status(200).json(chats);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export default fetchChats;
