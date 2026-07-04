import { Request, Response } from 'express';
import { query } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const sendMessage = async (req: Request, res: Response) => {
  const { content, chatId, id: senderId } = req.body;

  if (!content || !chatId || !senderId) {
    return res.status(400).json({ error: "Missing content, chatId or sender id" });
  }

  try {
    const messageId = uuidv4();
    const result = await query(
      `INSERT INTO messages (id, sender_id, chat_id, content, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [messageId, senderId, chatId, content]
    );

    const message = result.rows[0];

    await query(
      `UPDATE chats SET latest_message_id = $1, updated_at = NOW() WHERE id = $2`,
      [messageId, chatId]
    );

    const senderRes = await query(
      `SELECT id as _id, name, email, image FROM users WHERE id = $1`,
      [senderId]
    );
    
    const fullMessage = {
      _id: message.id,
      content: message.content,
      chat: { _id: message.chat_id, users: [] },
      sender: senderRes.rows[0],
      createdAt: message.created_at
    };

    res.json(fullMessage);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export default sendMessage;
