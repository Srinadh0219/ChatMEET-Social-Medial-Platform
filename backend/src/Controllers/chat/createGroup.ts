import { Request, Response } from 'express';
import { query } from '../../config/db';
import { AuthRequest } from '../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const createGroup = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  if (!authReq.authenticatedUser) {
    return res.status(401).json({ error: "Not authorized" });
  }

  const { name, users } = req.body;
  if (!name || !users || !Array.isArray(users)) {
    return res.status(400).json({ error: "Please fill all the fields" });
  }

  // Parse users (could be array of objects or strings, handle both)
  let parsedUsers = users.map((u: any) => typeof u === 'object' ? (u.id || u._id) : u);

  if (parsedUsers.length < 1) {
    return res.status(400).json({ error: "More than 2 users are required to form a group chat" });
  }

  // Add the current user to the group members list
  const currentUserId = authReq.authenticatedUser.id || authReq.authenticatedUser._id;
  if (!parsedUsers.includes(currentUserId)) {
    parsedUsers.push(currentUserId);
  }

  try {
    const chatId = uuidv4();
    // 1. Create chat
    await query(
      `INSERT INTO chats (id, chat_name, is_group_chat, group_admin_id, created_at, updated_at) 
       VALUES ($1, $2, true, $3, NOW(), NOW())`,
      [chatId, name, currentUserId]
    );

    // 2. Add all users to chat_users
    for (const userId of parsedUsers) {
      await query(
        `INSERT INTO chat_users (chat_id, user_id) VALUES ($1, $2)`,
        [chatId, userId]
      );
    }

    // 3. Fetch the newly created chat
    const chatResult = await query(
      `SELECT id as _id, chat_name as "chatName", is_group_chat as "isGroupChat", 
              group_admin_id as "groupAdmin", created_at as "createdAt", updated_at as "updatedAt" 
       FROM chats WHERE id = $1`, 
      [chatId]
    );
    const chat = chatResult.rows[0];

    // 4. Populate users
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

export default createGroup;
