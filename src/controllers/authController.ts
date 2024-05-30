import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

import CustomError from '../utils/customError';
import User from '../models/userModel';
import { sendMail } from '../config/mail';
import jwt from 'jsonwebtoken';
import env from '../config/environment';
import validator from 'validator';
import { JwtPayload } from '../types';

export default class AuthController {
  // POST /auth/signup - Sign up new user
  static async signup(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email, password, firstName, lastName, phone, city, state, userType, desc, img } = req.body;

      // Validate input
      if (!email) return next(new CustomError(400, 'Email is missing'));
      if (!password) return next(new CustomError(400, 'Password is missing'));
      if (!firstName) return next(new CustomError(400, 'First name is missing'));
      if (!lastName) return next(new CustomError(400, 'Last name is missing'));
      if (!phone) return next(new CustomError(400, 'Phone number is missing'));
      if (!city) return next(new CustomError(400, 'City is missing'));
      if (!state) return next(new CustomError(400, 'State is missing'));

      // if (!email || !password || !firstName || !lastName || !phone || !city || !state || !userType) {
      //   return next(new CustomError(400, 'All fields are required'));
      // }

      if (!validator.isEmail(email)) {
        return next(new CustomError(400, 'Invalid email format'));
      }

      if (!validator.isStrongPassword(password)) {
        return next(new CustomError(400, 'Password is not strong enough'));
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return next(new CustomError(400, 'User already exists'));
      }

      let token: string;
      // Create user
      try {
        const user = await User.create({
          email, password, firstName, lastName, phone, city, state, userType, desc, img
        });
        // Generate user's sign-in token
        token = user.getSignedJwtToken();
      } catch (err) {
        return next(new CustomError(500, (err as Error).message));
      }

      // Send verification email
      // const verificationLink = `http://localhost:${env.PORT}/api/auth/verify/${token}`;
      const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify/${token}`;
      const mail = `<div style="margin: 45px 25px"><b>Welcome ${firstName} ${lastName}!</b><p>Thank you for signing up for Kajola</p><p>Click the link below to verify your email:</p><br><a href=${verificationLink}><button style="background-color: #4CAF50; border: none; border-radius: 5px; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 18px; cursor: pointer;">Confirm my account</button></a><br><p>You can only enjoy our service better by verifying your account</p><br><p>Thank you</p><p>Kajola Team</p></div>`;
      await sendMail(email, 'Kajola account confirmation', mail);

      return res.status(201).send('User registered. Please check your email to verify your account.');
  }

  // POST /auth/login - Login user
  public static async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email, password } = req.body;

      if (!email || !password) {
        return next(new CustomError(400, 'Please provide email and password'));
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return next(new CustomError(401, 'Invalid credentials'));
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return next(new CustomError(401, 'Invalid credentials'));
      }

      // Check if user is verified
      if (!user.isVerified) {
        return next(new CustomError(403, 'Please verify your email to login'));
      }

      const token = user.getSignedJwtToken();
      res.cookie('token', token, { httpOnly: true });

      return res.status(200).json({ token });
  }
  
  // POST /auth/logout - Logout user
  public static async logout(req: Request, res: Response): Promise<Response> {
    // res.cookie('token', 'none', {
    //   // expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    //   expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    //   httpOnly: true,
    // });
    res.clearCookie('token');

    return res.status(200).json({ success: true, message: 'User logged out successfully' });
  }

  // GET /auth/verify/:token - Verify a new user email
  public static async verifyEmail(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

      if (!token) {
        return res.status(400).send('Invalid token');
      }

      const decoded = jwt.verify(token, env.JWT_SECRET as string) as JwtPayload;

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).send('User not found');
      }

      if (user.isVerified) {
        return res.status(400).send('Email already verified');
      }

      user.isVerified = true;
      user.buyerId = user._id;
      await user.save();

      return res.status(200).send('Email verified successfully');
  }

  // POST /auth/forget-password - Get reset token for password reset
  static async resetToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/password-reset/${token}`;
    const message = `You just requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't initiate this process, please ignore this email.`;

    // Send email with nodemailer
    try {
      sendMail(user.email, 'Password Reset Token', message );
      res.status(200).json({ message: 'Reset token sent to email' });
    } catch (err) {
      await User.findByIdAndUpdate(user._id, { resetToken: undefined, resetTokenExpiry: undefined });
      return next(new CustomError(500, (err as Error).message));
    }
  }

  // PUT /auth/password-reset/:resetToken - Reset user password
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
