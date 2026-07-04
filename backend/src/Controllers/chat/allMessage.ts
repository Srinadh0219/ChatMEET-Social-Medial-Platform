import { Request, Response } from 'express';
import { query } from '../../config/db';

const allMessage = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    
    const msgResult = await query(
      `SELECT m.id as _id, m.content, m.chat_id as "chat", m.created_at as "createdAt",
              u.id as "sender_id", u.name as "sender_name", u.email as "sender_email", u.image as "sender_image"
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
      [chatId]
    );

    const messages = msgResult.rows.map(row => ({
      _id: row._id,
      content: row.content,
      chat: { _id: row.chat },
      createdAt: row.createdAt,
      sender: {
        _id: row.sender_id,
        name: row.sender_name,
        email: row.sender_email,
        image: row.sender_image
      }
    }));

    res.json(messages);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export default allMessage;
