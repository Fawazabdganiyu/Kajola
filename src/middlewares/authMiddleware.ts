import jwt from 'jsonwebtoken';
import env from '../config/environment';
import { Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import { IRequest } from '../types/request';

export default function auth(req: IRequest, res: Response , next: NextFunction) {
  const token = req.header('X-token');
  if (!token) {
    return next(new CustomError(401, 'Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as jwt.JwtPayload;
    if (!decoded.userId) {
      throw new Error('Invalid token.');
    }
    req.userId = decoded.userId;
    next();
  } catch (error: any) {
    return next(new CustomError(400, error.message));
  }
}
