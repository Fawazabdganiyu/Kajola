import jwt from 'jsonwebtoken';

import CustomError from './customError';

export default function auth(req, res, next) {
  const token = req.headers['x-token'];
  if (!token) {
    return next(new CustomError(401, 'Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return next(new CustomError(400, 'Invalid token.'));
  }
}
