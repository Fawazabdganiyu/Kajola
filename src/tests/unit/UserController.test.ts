import { NextFunction } from 'express';

import CustomError from '../../utils/customError';
import User from '../../models/userModel';
import UsersController from '../../controllers/UserController';

describe('getUser', () => {
  // User is found and returned without the password field
  it('should return user data without password when user is found', async () => {
    const req = { params: { id: '123' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn() as NextFunction;
    User.findById = jest.fn().mockResolvedValue({ _id: '123', username: 'testUser', password: 'secret' });

    await UsersController.getUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: '123', username: 'testUser' });
    expect(next).not.toHaveBeenCalled();
  });

  // User with the specified ID does not exist
  it('should call next with a 404 error when no user is found', async () => {
    const req = { params: { id: 'unknown' } } as any;
    const res = {} as any;
    const next = jest.fn() as NextFunction;
    User.findById = jest.fn().mockResolvedValue(null);

    await UsersController.getUser(req, res, next);

    expect(next).toHaveBeenCalledWith(new CustomError(404, 'User not found'));
  });

  // Request parameters are missing or null
  it('should return a 404 error when user is not found', async () => {
    const req = { params: { id: '23' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn() as NextFunction;
    User.findById = jest.fn().mockResolvedValue(null);

    await UsersController.getUser(req, res, next);

    expect(next).toHaveBeenCalledWith(new CustomError(404, 'User not found'));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  // Check for proper JSON structure in the response
  it('should return user data without password when user is found', async () => {
    const req = { params: { id: '123' } } as any;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
    const next = jest.fn() as NextFunction;
    User.findById = jest.fn().mockResolvedValue({ _id: '123', username: 'testUser', password: 'secret' });

    await UsersController.getUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: '123', username: 'testUser' });
    expect(next).not.toHaveBeenCalled();
  });
});
