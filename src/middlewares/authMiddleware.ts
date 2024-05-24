import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import CustomError from '../utils/customError';
import User from '../models/userModel';
import env from '../config/environment';
import { JwtPayload } from '../types';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return next(new CustomError(401, 'Not authorized, no token'));
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as string) as JwtPayload;
    req.userId = decoded._id;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return next(new CustomError(401, 'Not authorized, user not found'));
    }

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return next(new CustomError(401, 'Not authorized, token expired'));
    }
    next(new CustomError(400, 'Invalid token'));
  }
};

export default authMiddleware;
