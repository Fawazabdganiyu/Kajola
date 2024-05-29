import e, { NextFunction } from 'express';
import { dbConnect, dbDisconnect } from '../mongoMemoryServer';
import CustomError from '../../utils/customError';
import Product from '../../models/productModel';
import Review from '../../models/reviewModel';
import User from '../../models/userModel';
import UsersController from '../../controllers/UserController';
import { IUser } from '../../types';
import { Schema, Types } from 'mongoose';
import exp from 'constants';

describe('UsersController', () => {
  let res: any;
  let next: any;

  beforeAll(async () => await dbConnect());
  afterAll(async () => await dbDisconnect());

  beforeEach(() => {
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('getMe', () => {
    test('found current user', async () => {
      const user = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'tested@gmail.com',
        password: 'password',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      });
      const req: any = { userId: user._id };

      await UsersController.getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: user._id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'tested@gmail.com',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      }));
      expect(next).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ password: expect.any(String) }));
    });

    test('not found current user', async () => {
      const req: any = { userId: new Types.ObjectId() };

      await UsersController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(401, 'Unauthorized, user not found'));
    });

    test('invalid user', async () => {
      const req: any = { userId: "invalid" };

      await UsersController.getMe(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(500);
    });
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

  describe('updateUser', () => {
    let user: IUser;
    let req: any;

    beforeEach(async () => {
      await User.deleteMany({});
      user = await User.create({
        firstName: 'testUser',
        lastName: 'testUser',
        email: 'aaaa@gmail.com',
        password: 'secret',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      });
      req = { params: { id: user._id }, userId: user._id, body: {} };
    });

    it('should return updated user data without password when user is updated', async () => {
      req.body = { city: 'Ibadan' };

      await UsersController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: user._id,
        firstName: 'testUser',
        lastName: 'testUser',
        email: 'aaaa@gmail.com',
        phone: '1234567890',
        city: 'Ibadan',
        state: 'Oyo',
      }));
      expect(res.json).not.toHaveBeenCalledWith(expect.objectContaining({ password: expect.any(String) }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next with a 404 error when no user is found', async () => {
      req.params.id = new Types.ObjectId();

      await UsersController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(404, 'User not found'));
    });

    it('should call next with a 403 error when user is not authorized to update user', async () => {
      req.userId = new Types.ObjectId();

      await UsersController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(403, 'You are not authorized to update this user'));
    });

    it('should call next with a 400 error when an invalid user id is provided', async () => {
      req.params.id = 'invalidId';

      await UsersController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(new CustomError(400, 'Invalid user id'));
    });

    it('should not update user data when no update fields are provided', async () => {
      await UsersController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: user._id,
        firstName: 'testUser',
        lastName: 'testUser',
        email: 'aaaa@gmail.com',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should not update user data when an invalid update field is provided', async () => {
      req.body = { invalidField: 'invalidValue' };

      await UsersController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: user._id,
        firstName: 'testUser',
        lastName: 'testUser',
        email: 'aaaa@gmail.com',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      }));
    });

    it('should not update user data when firstName is provided', async () => {
      req.body = { firstName: 'newName' };

      await UsersController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        _id: user._id,
        firstName: 'testUser',
        lastName: 'testUser',
        email: 'aaaa@gmail.com',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      }));
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

    test('cascade delete user products and reviews when user is deleted', async () => {
      user.userType = 'Seller';
      await user.save();

      const product = await Product.create({
        name: 'product1',
        price: 100,
        category: 'electronics',
        description: 'product description',
        userId: user._id,
      });
      await Review.create({
        productId: product._id,
        userId: user._id,
        rating: 5,
        comment: 'Good product',
      });

      await UsersController.deleteUser(req, res, next);

      const deletedUser = await User.findById(user._id);
      const deletedProduct = await Product.findById(product._id);
      const deletedReview = await Review.findOne({ productId: product._id });

      expect(deletedUser).toBeNull();
      expect(deletedProduct).toBeNull();
      expect(deletedReview).toBeNull();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'User deleted successfully' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
