import { Request, Response } from 'express';
import { query } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const accessChat = async (req: Request, res: Response) => {
  const targetUserId = req.body.userId; // The user to chat with
  const loggedInUserId = req.body.id;   // The current user

  if (!targetUserId || !loggedInUserId) {
    return res.status(400).json({ error: "Missing user identification" });
  }

  try {
    // Check if chat exists between these two users
    const chatResult = await query(
      `SELECT c.id as _id, c.chat_name as "chatName", c.is_group_chat as "isGroupChat", 
              c.group_admin_id as "groupAdmin", c.latest_message_id, c.created_at as "createdAt", c.updated_at as "updatedAt"
       FROM chats c
       JOIN chat_users cu1 ON c.id = cu1.chat_id
       JOIN chat_users cu2 ON c.id = cu2.chat_id
       WHERE c.is_group_chat = false 
         AND cu1.user_id = $1 
         AND cu2.user_id = $2`,
      [loggedInUserId, targetUserId]
    );

    let chat: any = null;

    if (chatResult.rows.length > 0) {
      chat = chatResult.rows[0];
    } else {
      // Create new chat
      const chatId = uuidv4();
      await query(
        `INSERT INTO chats (id, chat_name, is_group_chat, created_at, updated_at) 
         VALUES ($1, 'sender', false, NOW(), NOW())`,
        [chatId]
      );
      
      // Add both users
      await query(`INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)`, [chatId, loggedInUserId]);
      await query(`INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)`, [chatId, targetUserId]);

      const newChatRes = await query(
        `SELECT c.id as _id, c.chat_name as "chatName", c.is_group_chat as "isGroupChat", 
                c.group_admin_id as "groupAdmin", c.latest_message_id, c.created_at as "createdAt", c.updated_at as "updatedAt"
         FROM chats c 
         WHERE c.id = $1`,
        [chatId]
      );
      chat = newChatRes.rows[0];
    }

    // Fetch users for the chat to populate
    const usersResult = await query(
      `SELECT u.id as _id, u.name, u.email, u.image 
       FROM users u
       JOIN chat_users cu ON u.id = cu.user_id
       WHERE cu.chat_id = $1`,
      [chat._id]
    );
    chat.users = usersResult.rows;

    res.status(200).json(chat);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export default accessChat;
