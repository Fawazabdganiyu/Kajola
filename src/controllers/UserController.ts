import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import User from '../models/userModel';

export default class UsersController {
  // GET /user/:id - Get user by id
  static async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new CustomError(404, 'User not found'));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = user.toObject();
    res.status(200).json(userData);
  }

  // DELETE /user/:id - Delete user by id
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const user = await User.findById(req.params.id);
      if (!user) {
        return next(new CustomError(404, 'User not found'));
      }
      if (req.userId?.toString() !== user._id.toString()) {
        return next(new CustomError(403, 'You are not authorized to delete this user'));
      }
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, data: 'User deleted successfully' });
  }
}
