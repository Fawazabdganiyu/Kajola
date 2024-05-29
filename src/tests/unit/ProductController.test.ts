import { Schema, Types } from 'mongoose';
import { dbConnect, dbDisconnect } from '../mongoMemoryServer';
import CustomError from '../../utils/customError';
import Product from '../../models/productModel';
import ProductController from '../../controllers/ProductController';
import User from '../../models/userModel';
import { IProduct, IUser } from '../../types';
import exp from 'constants';

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

  describe('updateProduct', () => {
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
    });

    it('should update a product', async () => {
      req.body = { name: 'Screw', category: 'Building materials', description: 'High quality', price: 200 };

      await ProductController.updateProduct(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Screw',
        category: 'Building materials',
        description: 'High quality',
        price: 200,
      }));
    });

    it('should return a 404 error if the product does not exist', async () => {
      req.params.id = new Types.ObjectId();

      await ProductController.updateProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Product not found');
    });

    it('should return a 403 error if the user is not authorized to update the product', async () => {
      req.userId = new Types.ObjectId();

      await ProductController.updateProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('You are not authorized to update this product');
    });
  
  });

  describe('getProducts', () => {
    let products: Array<Object>;
    beforeEach(async () => {
      await Product.deleteMany({});
      await User.findOneAndDelete({ email: 'tttt@yahoo.com' });
      const newUser = await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'tttt@yahoo.com',
        password: 'password',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      });
      products = [
        {
          name: 'Drill',
          category: 'Electronics',
          description: 'High quality',
          price: 100,
          userId,
        },
        {
          name: 'Screw',
          category: 'Building materials',
          description: 'High quality',
          price: 200,
          userId: newUser._id,
        },
      ];
      await Product.insertMany(products);
      req.query = {};
    });

    it('should return all products when no query and no authentication', async () => {
      req.query = {};
      req.userId = null;

      await ProductController.getProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ matchedCount: 2, data: expect.any(Array) }),
      );
    });

    it('should return products based on authenticated user in the same location with no query', async () => {
      req.query = { userLocation: 'true' };

      await ProductController.getProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ matchedCount: 1, data: expect.arrayContaining([expect.any(Object)]) }),
      );
    });

    it('should return products based on authenticated user in different location with query', async () => {
      req.query = { userLocation: 'true', category: 'Building materials' };

      await ProductController.getProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ matchedCount: 0, data: [] }),
      );
    });

    it('should return products based on name query', async () => {
      req.query = { name: 'Screw' };

      await ProductController.getProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ matchedCount: 1, data: expect.any(Array) }),
      );
    });

    it('should return products based on price range query', async () => {
      req.query = { minPrice: 100, maxPrice: 200 };

      await ProductController.getProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ matchedCount: 2, data: expect.any(Array) }),
      );
    });

    it('should return products based on user location query but unauthenticated', async () => {
      req.query = { userLocation: 'true' };
      req.userId = null;

      await ProductController.getProducts(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ matchedCount: 2, data: expect.any(Array) }),
      );
    });

  });

  describe('getProductById', () => {
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
    });

    it('should return a product by id', async () => {
      await ProductController.getProductById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Nail',
        category: 'Building materials',
        description: 'High quality',
        price: 100,
      }));
    });

    it('should return a 400 error if the id is invalid', async () => {
      req.params.id = 'invalidId';

      await ProductController.getProductById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Invalid product id');
    });

    it('should return a 404 error if the product does not exist', async () => {
      req.params.id = new Types.ObjectId();

      await ProductController.getProductById(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Product not found');
    });
  });

  describe('getProductsByUser', () => {
    let products: Array<Object>;
    beforeEach(async () => {
      await Product.deleteMany({});
      await User.findOneAndDelete({ email: 'www@gmail.com' });
    });

    it('should return products by a user', async () => {
      const newUser = await User.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'www@gmail.com',
        password: 'password',
        phone: '1234567890',
        city: 'Saki',
        state: 'Oyo',
      });
      products = [
        {
          name: 'Drill',
          category: 'Electronics',
          description: 'High quality',
          price: 100,
          userId: newUser._id,
        },
        {
          name: 'Screw',
          category: 'Building materials',
          description: 'High quality',
          price: 200,
          userId: newUser._id,
        },
      ];
      await Product.insertMany(products);

      req.params = { id: newUser._id };
      await ProductController.getProductsByUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 2, data: expect.any(Array) }));
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

    it('should return a 400 error if the id is invalid', async () => {
      req.params.id = 'invalidId';

      await ProductController.deleteProduct(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Invalid product id');
    });
  });

  describe('addToWishlist', () => {
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

    it('should add a product to the user wishlist', async () => {
      await ProductController.addToWishlist(req, res, next);

      const updatedUser = await User.findById(userId);
      expect(updatedUser?.wishlist).toContainEqual(product._id);
    });

    it('should return a 404 error if the product does not exist', async () => {
      req.params.id = new Types.ObjectId();

      await ProductController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Product not found');
    });

    it('should return a 400 error if the id is invalid', async () => {
      req.params.id = 'invalidId';

      await ProductController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Invalid product id');
    });

    it('should return a 403 error if the user is not authenticated', async () => {
      req.userId = null;

      await ProductController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Please login to add product to wishlist');
    });

    it('should return a 403 error if the product is already in the wishlist', async () => {
      await User.findByIdAndUpdate(userId, { $push: { wishlist: product._id.toString() } });

      await ProductController.addToWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Product already in wishlist');
    });
  });

  describe('removeFromWishlist', () => {
    let productId: IProduct;
    beforeEach(async () => {
      await Product.deleteMany({});
      productId = await Product.create({
        name: 'Nail',
        category: 'Building materials',
        description: 'High quality',
        price: 100,
        userId,
      });
      req.params = { id: productId._id };
      req.userId = userId;
    });

    it('should remove a product from the user wishlist', async () => {
      await User.findByIdAndUpdate(userId, { $push: { wishlist: productId._id.toString() } });

      await ProductController.removeFromWishlist(req, res, next);

      const updatedUser = await User.findById(userId);
      expect(updatedUser?.wishlist).not.toContainEqual(productId._id.toString());
    });

    it('should return a 404 error if the product does not exist', async () => {
      req.params.id = new Types.ObjectId();

      await ProductController.removeFromWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('Product not found');
    });

    it('should return a 400 error if the id is invalid', async () => {
      req.params.id = 'invalidId';

      await ProductController.removeFromWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(400);
      expect(next.mock.calls[0][0].message).toBe('Invalid product id');
    });

    it('should return a 403 error if the user is not authenticated', async () => {
      req.userId = null;

      await ProductController.removeFromWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Please login to remove product from wishlist');
    });
  });

  describe('getWishlist', () => {
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
      req.userId = userId;
      await User.findByIdAndUpdate(userId, { wishlist: [] } );
    });

    it('should return the user wishlist', async () => {
      await User.findByIdAndUpdate(userId, { $push: { wishlist: product._id } });

      await ProductController.getWishlist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        count: 1,
      }));
      
    });

    it('should return a 403 error if the user is not authenticated', async () => {
      req.userId = null;

      await ProductController.getWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(403);
      expect(next.mock.calls[0][0].message).toBe('Please login to view wishlist');
    });

    it('should return 404 if the user does not exists', async () => {
      req.userId = new Types.ObjectId()

      await ProductController.getWishlist(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(CustomError));
      expect(next.mock.calls[0][0].status).toBe(404);
      expect(next.mock.calls[0][0].message).toBe('User not found');
    });

    it('should return empty data list when the user has no wishlist', async () => {
      await ProductController.getWishlist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 0, wishlists: [] }));
    });

    it ('should return empty data list when the product in user wishlist does not exist', async () => {
      await User.findByIdAndUpdate(userId, { $push: { wishlist: new Types.ObjectId().toString() } });
      // console.log('wishlist', await User.findById(userId).select('wishlist'));

      await ProductController.getWishlist(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 0, wishlists: [] }));
    });
  });
});
