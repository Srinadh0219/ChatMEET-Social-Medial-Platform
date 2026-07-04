import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';

/**
 * Generate a numeric OTP of the specified length.
 * Returns the OTP string and an expiration Date (5 minutes from now).
 */
export const generateOtp = (length: number = 6): { otp: string; expiresAt: Date } => {
  const max = Math.pow(10, length);
  const otp = randomInt(0, max).toString().padStart(length, '0');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
  return { otp, expiresAt };
};

/**
 * Sends OTP email using Nodemailer via Gmail SMTP.
 */
export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  console.log(`\n==========================================`);
  console.log(`🔑 OTP GENERATED FOR ${email}: ${otp}`);
  console.log(`==========================================\n`);

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('EMAIL_USER or EMAIL_PASS not set in environment - skipping email delivery');
    return;
  }

  // Create transporter for Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  const mailOptions = {
    from: `"ChatMEET" <${user}>`,
    to: email,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Please use the following OTP to verify your account. It is valid for 5 minutes:</p>
        <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; letter-spacing: 5px; text-align: center; border-radius: 8px;">
          <strong>${otp}</strong>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}. Message ID: ${info.messageId}`);
  } catch (err) {
    console.error('Exception occurred while sending OTP email:', err);
  }
};

/**
 * Sends a Feedback or Bug Report email using Nodemailer via Gmail SMTP.
 */
export const sendFeedbackEmail = async (userEmail: string, type: 'feedback' | 'bug', message: string): Promise<void> => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('EMAIL_USER or EMAIL_PASS not set in environment - skipping feedback email delivery');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass,
    },
  });

  const subject = type === 'bug' ? '🐛 New Bug Report - ChatMEET' : '💡 New Feedback - ChatMEET';
  const headerColor = type === 'bug' ? '#ef4444' : '#0ea5e9';

  const mailOptions = {
    from: `"ChatMEET Feedback System" <${user}>`,
    to: user, // Send TO the platform owner's own email
    replyTo: userEmail,
    subject: subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px;">
        <h2 style="color: ${headerColor}; margin-top: 0;">${subject}</h2>
        <p><strong>From:</strong> ${userEmail}</p>
        <p><strong>Type:</strong> ${type === 'bug' ? 'Bug Report' : 'General Feedback'}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;" />
        <h4 style="color: #333; margin-bottom: 10px;">Message:</h4>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; color: #4b5563; white-space: pre-wrap;">
          ${message}
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Feedback email sent successfully from ${userEmail}`);
  } catch (err) {
    console.error('Exception occurred while sending feedback email:', err);
    throw err; // Re-throw to handle it in the controller
  }
};
