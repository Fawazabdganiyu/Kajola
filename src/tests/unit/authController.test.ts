import { NextFunction } from 'express';

import AuthController from '../../controllers/authController';
import CustomError from '../../utils/customError';
import { sendMail } from '../../config/mail';
import User from '../../models/userModel';

// Mock sendEmail function
jest.mock('../../config/mail');
const mockedSendEmail = jest.mocked(sendMail);
// const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;
mockedSendEmail.mockResolvedValue();

describe('AuthController', () => {

  // postResetToken successfully finds user and sends reset email
  it('should send a reset email when user exists', async () => {
    const req = { body: { email: 'test@example.com' }, protocol: 'http', get: jest.fn().mockReturnValue('localhost:3000') } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn() as NextFunction;
    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '123', email: 'test@example.com' });
    jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(true);

    await AuthController.resetToken(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(sendMail).toHaveBeenCalledWith(
      'test@example.com',
      'Password Reset Token',
      expect.any(String),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Reset token sent to email' });
  });

  // postResetToken handles non-existent user email
  it('should call next with an error when the user does not exist', async () => {
    const req = { body: { email: 'nonexistent@example.com' } } as any;
    const res = {} as any;
    const next = jest.fn() as NextFunction;
    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await AuthController.resetToken(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
    expect(next).toHaveBeenCalledWith(new CustomError(404, 'User not found'));
  });
});
