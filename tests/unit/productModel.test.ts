import { model, Types } from 'mongoose';

import { dbConnect, dbDisconnect } from '../../utils/dbTest';
import Product from '../../src/models/productModel';

beforeAll(async () => await dbConnect());
afterAll(async () => await dbDisconnect());

const testUserId = new Types.ObjectId();

test('all model attributes', async () => {
  let product: any;
  product = new Product({
    userId: testUserId,
    category: 'Category 1',
    name: 'Product 1',
    description: 'Description 1',
    price: 100,
    desc: 'Desc 1',
    image: ['image1.jpg'],
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
    image: ['image1.jpg'],
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
    image: ['image1.jpg'],
  });
});