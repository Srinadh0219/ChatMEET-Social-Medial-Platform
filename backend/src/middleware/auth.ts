import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse';
import { query } from '../config/db';
import keys from '../config/key';

export interface AuthRequest extends Request {
  authenticatedUser?: any;
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, keys.key) as { id: string };

    const result = await query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];
    if (!user) {
      return next(new ErrorResponse("No user found with this id", 404));
    }
    authReq.authenticatedUser = user;
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
};

export default protect;
