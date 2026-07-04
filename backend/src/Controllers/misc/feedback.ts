import { Request, Response } from 'express';
import { sendFeedbackEmail } from '../../utils/otpHelper';

export const submitFeedback = async (req: Request, res: Response) => {
  const { email, type, message } = req.body;

  if (!email || !type || !message) {
    return res.status(400).json({ error: 'Please provide email, type, and message' });
  }

  if (type !== 'feedback' && type !== 'bug') {
    return res.status(400).json({ error: 'Invalid feedback type' });
  }

  try {
    await sendFeedbackEmail(email, type, message);
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again later.' });
  }
};
