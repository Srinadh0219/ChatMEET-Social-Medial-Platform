import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../config/db';
import validateLoginInput from '../../validation/login';
import keys from '../../config/key';

const LoginControllers = async (req: Request, res: Response) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const name = req.body.name;
  const password = req.body.password;

  // Find user by name (case-insensitive query)
  const result = await query('SELECT * FROM users WHERE LOWER(name) = LOWER($1)', [name]);
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({ errors: 'Name not found' });
  }

  // Check if user is verified
  if (!user.is_verified) {
    return res.status(401).json({ errors: 'Please verify your email to login' });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ errors: 'Password incorrect' });
  }

  // Return JWT Payload with nested user object
  const payload = {
    id: user.id,
    name: user.name,
  };

  // Sign token
  jwt.sign(
    payload,
    keys.key,
    { expiresIn: 31556926 }, // 1 year in seconds
    (err, token) => {
      if (err) return res.status(500).json({ error: 'Token signing failed' });
      res.json({
        success: true,
        token: 'Bearer ' + token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });
    }
  );
};

export default LoginControllers;
