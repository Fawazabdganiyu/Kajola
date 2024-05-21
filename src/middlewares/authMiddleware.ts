import * as jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

import CustomError from '../../utils/customError';
import { CustomRequest } from '../controllers/UserController';

export default function auth(req: CustomRequest, res: Response, next: NextFunction) {
  const token = req.header('X-token');
  if (!token) {
    return next(new CustomError(401, 'Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return next(new CustomError(400, 'Invalid token.'));
  }
}
