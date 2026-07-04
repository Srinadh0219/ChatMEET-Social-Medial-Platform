import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../config/db';
import validateRegisterInput from '../../validation/registration';
import { generateOtp, sendOtpEmail } from '../../utils/otpHelper';

const RegisterControllers = async (req: Request, res: Response) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  try {
    const email = req.body.email.toLowerCase();
    const name = req.body.name;
    
    // Check if name already exists (case-insensitive)
    const nameCheck = await query('SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND email != $2', [name, email]);
    if ((nameCheck.rowCount ?? 0) > 0) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Check if email already exists
    const existing = await query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    let userId;

    if ((existing.rowCount ?? 0) > 0) {
      if (existing.rows[0].is_verified) {
        return res.status(400).json({ error: 'Email already exists' });
      } else {
        // User exists but is unverified (failed/abandoned OTP previously).
        // Update their details and generate a new OTP.
        userId = existing.rows[0].id;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(req.body.password, salt);
        await query(
          `UPDATE users SET name = $1, password = $2 WHERE id = $3`,
          [req.body.name, hash, userId]
        );
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);

      // Insert new user
      const result = await query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id`,
        [req.body.name, email, hash]
      );
      userId = result.rows[0].id;
    }

    // Generate OTP and store it
    const { otp, expiresAt } = generateOtp();
    await query(`
      INSERT INTO otps (user_id, code, expires_at, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id) DO UPDATE SET code = $2, expires_at = $3, created_at = NOW()`,
      [userId, otp, expiresAt]
    );

    // Send OTP email
    await sendOtpEmail(email, otp);

    // Return userId and otp for the frontend to redirect
    res.json({ userId, otp, message: 'Registration successful, OTP sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default RegisterControllers;
