import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../../utils/customError';
import sendEmail from '../../utils/sendEmail';
import User from '../../src/models/userModel';

export default class AuthController {
  // POST /auth/password-reset - Get reset token for password reset
  static async postResetToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new CustomError(404, 'User not found'));
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const resetToken = crypto.createHash('sha256').update(token).digest('hex');
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await User.findByIdAndUpdate(user._id, { resetToken, resetTokenExpiry });

    // Send password reset url to user's email
    const resetUrl = `${req.protocol}://${req.get('host')}/password-reset/${token}`;
    const message = `You just requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't initiate this process, please ignore this email.`;

    // Send email with nodemailer
    try {
      sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });
      res.status(200).json({ message: 'Reset token sent to email' });
    } catch (err) {
      await User.findByIdAndUpdate(user._id, { resetToken: undefined, resetTokenExpiry: undefined });
      return next(new CustomError(500, err.message));
    }
  }

  // PUT /auth/password-update/:resetToken - Update user password
  static async putUpdatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const resetToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
    const user = await User.findOne({ resetToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) {
      return next(new CustomError(400, 'Invalid or expired reset token'));
    }

    // Update user password
    await User.findByIdAndUpdate(
      user._id,
      {
        password: req.body.password,
        resetToken: undefined,
        resetTokenExpiry: undefined,
        passwordUpdatedAt: Date.now()
      }
    );

    res.status(200).json({ message: 'Password successfully updated' });
  }
}
