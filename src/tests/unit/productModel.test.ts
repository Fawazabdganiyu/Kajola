import { model, Types } from 'mongoose';

import { dbConnect, dbDisconnect } from '../../utils/mongoMemoryServer';
import Product from '../../models/productModel';

beforeAll(async () => await dbConnect());
afterAll(async () => await dbDisconnect());

const testUserId = new Types.ObjectId();

test('all model attributes', async () => {
  const product = new Product({
    userId: testUserId,
    category: 'Category 1',
    name: 'Product 1',
    description: 'Description 1',
    price: 100,
    desc: 'Desc 1',
    images: ['image1.jpg'],
  });

  await product.save();

  const dbProduct = await Product.findOne({ name: 'Product 1' });

  expect(dbProduct).toMatchObject({
    name: 'Product 1',
    userId: testUserId,
    category: 'Category 1',
    description: 'Description 1',
    price: 100,
    negotiable: true,
    ratings: [],
    averageRating: 0,
    reviewCount: 0,
    desc: 'Desc 1',
    images: ['image1.jpg'],
  });
});

test('addReview updates averageRating and reviewCount correctly', async () => {
  const product = await model('Product').findOne({ name: 'Product 1' });

  await product.addReview(5);

  expect(product).toMatchObject({
    name: 'Product 1',
    userId: testUserId,
    category: 'Category 1',
    description: 'Description 1',
    price: 100,
    ratings: [5],
    negotiable: true,
    averageRating: 5,
    reviewCount: 1,
    desc: 'Desc 1',
    images: ['image1.jpg'],
  });
});

test('addReview updates averageRating and reviewCount correctly for multiple reviews', async () => {
  const product = await model('Product').findOne({ name: 'Product 1' });

  await product.addReview(3);
  await product.addReview(4);

  expect(product).toMatchObject({
    name: 'Product 1',
    userId: testUserId,
    category: 'Category 1',
    description: 'Description 1',
    price: 100,
    ratings: [5, 3, 4],
    negotiable: true,
    averageRating: 4,
    reviewCount: 3,
    desc: 'Desc 1',
    images: ['image1.jpg'],
  });
});

test('addReview can not add a review with invalid rating', async () => {
  const product = await model('Product').findOne({ name: 'Product 1' });

  await expect(product.addReview(6)).rejects.toThrow();
  await expect(product.addReview(-1)).rejects.toThrow();
});

