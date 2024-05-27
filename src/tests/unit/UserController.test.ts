import { NextFunction } from 'express';
import { dbConnect, dbDisconnect } from '../../utils/mongoMemoryServer';
import CustomError from '../../utils/customError';
import User from '../../models/userModel';
import UsersController from '../../controllers/UserController';
import { IUser } from '../../types';
import { Schema, Types } from 'mongoose';

describe('UsersController', () => {
  let res: any;
  let next: NextFunction;

  beforeAll(async () => await dbConnect());
  afterAll(async () => await dbDisconnect());

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('getUser', () => {
    it('should return user data without password when user is found', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test182@gmail.com',
        password: 'password',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      });
      const req: any = { params: { id: user._id } };

      await UsersController.getUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: user._id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'test182@gmail.com',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo', 
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with a 404 error when no user is found', async () => {
      const req: any = { params: { id: new Types.ObjectId() } };

      await UsersController.getUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(404, 'User not found'));
    });
  });

  describe('deleteUser', () => {
    let user: IUser;
    let req: any;

    beforeEach(async () => {
      await User.deleteMany({});
      user = await User.create({
        firstName: 'testUser',
        lastName: 'testUser',
        email: 'test567@gmail.com',
        password: 'secret',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      });
      req = { params: { id: user._id }, userId: user._id };
    });

    it('should return a 200 status and success message when user is deleted', async () => {
      await UsersController.deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'User deleted successfully' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with a 404 error when no user is found', async () => {
      req.params.id = new Types.ObjectId();

      await UsersController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(404, 'User not found'));
    });

    it('should call next with a 403 error when user is not authorized to delete user', async () => {
      req.userId = new Types.ObjectId();

      await UsersController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(403, 'You are not authorized to delete this user'));
    });
  });
});
