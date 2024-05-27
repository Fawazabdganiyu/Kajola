import { Schema, Types } from 'mongoose';
import { dbConnect, dbDisconnect } from '../../utils/mongoMemoryServer';
import CustomError from '../../utils/customError';
import Product from '../../models/productModel';
import ProductController from '../../controllers/ProductController';
import User from '../../models/userModel';
import { IProduct, IUser } from '../../types';

describe('productController', () => {
  let req: any;
  let res: any;
  let next: any;
  let user: IUser;
  let userId: Schema.Types.ObjectId;

  beforeAll(async () => {
    await dbConnect();
    user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@gmail.com',
      password: 'password',
      phone: '1234567890',
      city: 'Lagos',
      state: 'Lagos',
    });
    userId = user._id;
  });

  afterAll(async () => await dbDisconnect());

  beforeEach(() => {
    req = { userId, verified: true, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe('createProduct', () => {
    describe('input validation', () => {
      // Missing product name results in a 400 error
      it('should return a 400 error when the product name is missing', async () => {
        req.body = { category: 'Electronics', description: 'High performance', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Product name is missing');
      });

      // Missing category results in a 400 error
      it('should return a 400 error when the category is missing', async () => {
        req.body = { name: 'Laptop', description: 'High performance', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Category is missing');
      });

      // Missing description results in a 400 error
      it('should return a 400 error when the description is missing', async () => {
        req.body = { name: 'Laptop', category: 'Electronics', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Description is missing');
      });

      // Missing price results in a 400 error
      it('should return a 400 error when the price is missing', async () => {
        req.body = { name: 'Laptop', category: 'Electronics', description: 'High performance', negotiable: true };

        await ProductController.createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Price is missing');
      });

      // Missing negotiable should default to true
      it('should default negotiable to true when not provided', async () => {
        req.body = { name: 'Laptop', category: 'Electronics', description: 'High performance', price: 1500 };

        await ProductController.createProduct(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ negotiable: true }));
      });

      // Setting negotiable to false
      it('should set negotiable to false when provided', async () => {
        req.body = { name: 'Centre bulb', category: 'Electronics', description: 'High performance', price: 1500, negotiable: false };

        await ProductController.createProduct(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ negotiable: false }));
      });
    });

    describe('successful product creation', () => {
      it('should create a new product and return it', async () => {
        req.body = { name: 'iPhone', category: 'Electronics', description: 'High performance', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
          name: 'iPhone',
          category: 'Electronics',
          description: 'High performance',
          price: 1500,
          negotiable: true,
          userId,
        }));
      });
    });

    describe('existing product', () => {
      it('should return a 400 error if the product already exists', async () => {
        req.body = { name: 'Laptop', category: 'Electronics', description: 'High performance', price: 1500, negotiable: true };

        await Product.create({
          name: 'Laptop',
          category: 'Electronics',
          description: 'High performance',
          price: 1500,
          userId
        });
        await ProductController.createProduct(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(400);
        expect(next.mock.calls[0][0].message).toBe('Product already exists');
      });
    });

    describe('user verification', () => {
      it('should return a 403 error if the user is not verified', async () => {
        req.verified = false;
        req.body = { name: 'Laptop', category: 'Electronics', description: 'High performance', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);

        // Restore default verified status
        req.verified = true;

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(403);
        expect(next.mock.calls[0][0].message).toBe('Please verify your email to display your product/services');
      });

      it('should not create a new product for inactive user', async () => {
        req.userId = null;
        req.body = { name: 'Bulb', category: 'Electronics', description: 'High performance', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);
        
        // Restore default test userId
        req.userId = userId;

        expect(next).toHaveBeenCalledWith(expect.any(CustomError));
        expect(next.mock.calls[0][0].status).toBe(401);
        expect(next.mock.calls[0][0].message).toBe('Not authorized, user not found');
      });
    });

    describe('user type update', () => {
      it('should update the user type to Seller', async () => {
        req.body = { name: 'Lightening wire', category: 'Electronics', description: 'High performance', price: 1500, negotiable: true };

        await ProductController.createProduct(req, res, next);

        const updatedUser = await User.findById(userId);
        expect(updatedUser?.userType).toBe('Seller');
      });
    });
  });

  describe('deleteProduct', () => {
    let product: IProduct;
    beforeEach(async () => {
      await Product.deleteMany({});
      product = await Product.create({
        name: 'Nail',
        category: 'Building materials',
        description: 'High quality',
        price: 100,
        userId,
      });
      req.params = { id: product._id };
      req.userId = userId;
    });

    it('should delete a product', async () => {
      await ProductController.deleteProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: 'Product deleted successfully' });
    });

    it('should return a 404 error if the product does not exist', async () => {
      req.params.id = new Types.ObjectId();

      await ProductController.deleteProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Product not found');
    });

    it('should return a 403 error if the user is not authorized to delete the product', async () => {
      req.userId = new Types.ObjectId();

      await ProductController.deleteProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('You are not authorized to delete this product');
    });
  });
});
