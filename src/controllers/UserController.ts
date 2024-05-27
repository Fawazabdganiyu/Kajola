import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import User from '../models/userModel';
import { IUser } from '../types';

export default class UsersController {
  // GET /user/:id - Get user by id
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
    const { password, ...userData } = user.toObject();
    res.status(200).json(userData);
  }

  // PUT /user/:id - Update user by id
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { city, state, phone, desc } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new CustomError(400, 'Invalid user id'));
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

  // DELETE /user/:id - Delete user by id
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
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true, data: 'User deleted successfully' });
  }
}
