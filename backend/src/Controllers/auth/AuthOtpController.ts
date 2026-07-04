import { Request, Response } from 'express';
import { query } from '../../config/db';
import bcrypt from 'bcryptjs';
import { generateOtp, sendOtpEmail } from '../../utils/otpHelper';

// -------------------------------------------------
// Verify OTP (used after registration)
export const verifyOtp = async (req: Request, res: Response) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ message: 'Missing userId or otp' });
  }

  try {
    const result = await query(
      `SELECT * FROM otps WHERE user_id = $1 AND code = $2 AND expires_at > NOW()`,
      [userId, otp]
    );

    if (!result.rowCount) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    await query(`UPDATE users SET is_verified = true WHERE id = $1`, [userId]);
    // Clean up OTP record
    await query(`DELETE FROM otps WHERE user_id = $1`, [userId]);

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

// -------------------------------------------------
// Resend OTP
export const resendOtp = async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    const userRes = await query(`SELECT email FROM users WHERE id = $1`, [userId]);
    if (!userRes.rowCount) return res.status(404).json({ message: 'User not found' });

    const email = userRes.rows[0].email;
    const { otp, expiresAt } = generateOtp();

    // Upsert OTP (replace if one already exists)
    await query(
      `INSERT INTO otps (user_id, code, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
      [userId, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);
    // Do NOT send the otp back in the response (security)
    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error('resendOtp error:', err);
    res.status(500).json({ message: 'Server error during OTP resend' });
  }
};

// -------------------------------------------------
// Forgot password – send OTP to email
export const initiateForgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (!userRes.rowCount) return res.status(404).json({ message: 'User not found' });

    const userId = userRes.rows[0].id;
    const { otp, expiresAt } = generateOtp();

    await query(
      `INSERT INTO otps (user_id, code, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
      [userId, otp, expiresAt]
    );

    await sendOtpEmail(email, otp);
    // Do NOT leak the otp in the response
    res.json({ message: 'OTP sent for password reset' });
  } catch (err) {
    console.error('initiateForgotPassword error:', err);
    res.status(500).json({ message: 'Server error during password reset initiation' });
  }
};

// -------------------------------------------------
// Reset password (with OTP verification)
export const resetPassword = async (req: Request, res: Response) => {
  const { email, password, otp } = req.body;
  if (!email || !password || !otp) {
    return res.status(400).json({ message: 'Missing email, password, or otp' });
  }

  try {
    // Validate password length early
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user by email
    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
    if (!userRes.rowCount) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId = userRes.rows[0].id;

    // Verify OTP matches and is not expired
    const otpRes = await query(
      `SELECT * FROM otps WHERE user_id = $1 AND code = $2 AND expires_at > NOW()`,
      [userId, otp]
    );
    if (!otpRes.rowCount) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash and update password
    const hashed = await bcrypt.hash(password, 10);
    await query(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, userId]);

    // Remove used OTP record
    await query(`DELETE FROM otps WHERE user_id = $1`, [userId]);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};
