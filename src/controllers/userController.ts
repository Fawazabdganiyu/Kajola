import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import User from '../models/userModel';
import { IUser } from '../types';

export default class UsersController {
  // GET /api/users/me - Get current user
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return next(new CustomError(401, 'Unauthorized, user not found'));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, resetToken, resetTokenExpiry, ...userData } = user.toObject();
      res.status(200).json(userData);
    } catch (error: any) {
      next(new CustomError(500, 'server error'));
    }
  }

  // GET /api/users/:id - Get user by id
  static async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid user id'));
    }
    const user = await User.findById(id);
    if (!user) {
      return next(new CustomError(404, 'User not found'));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, resetToken, resetTokenExpiry, ...userData } = user.toObject();
    res.status(200).json(userData);
  }

  // PUT /api/users/:id - Update user by id
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { city, state, phone, desc } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid user id'));
    }

    if (!city && !state && !phone && !desc) {
      return next(new CustomError(400, 'Only city, state, phone and desc fields are allowed to be updated'));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new CustomError(404, 'User not found'));
    }
    if (req.userId?.toString() !== user._id.toString()) {
      return next(new CustomError(403, 'You are not authorized to update this user'));
    }

    const updatedUser: IUser | null = await User.findByIdAndUpdate(id, { city, state, phone, desc }, { new: true });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = updatedUser?.toObject();
    res.status(200).json(userData);
  }

  // DELETE /api/users/:id - Delete user by id
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid user id'));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new CustomError(404, 'User not found'));
    }
    if (req.userId?.toString() !== user._id.toString()) {
      return next(new CustomError(403, 'You are not authorized to delete this user'));
    }

    await user.deleteOne();
    res.status(200).json({ success: true, data: 'User deleted successfully' });
  }
}
