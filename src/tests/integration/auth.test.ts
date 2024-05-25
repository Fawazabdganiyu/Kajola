import request from 'supertest';
import app from '../../app';
import User from '../../models/userModel';
import { sendMail } from '../../config/mail';
import crypto from 'crypto';

// Mock sendMail function
jest.mock('../../config/mail', () => ({
  sendMail: jest.fn(),
}));

describe('Auth Controller Integration Tests', () => {
  const userData = {
    email: 'test@example.com',
    password: 'StrongPassword123!',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    city: 'Test City',
    state: 'Test State',
    userType: 'Buyer',
    desc: 'Test user description',
    img: 'test-image-url',
  };

  describe('POST /auth/signup', () => {
    it('should sign up a new user', async () => {
      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.text).toBe('User registered. Please check your email to verify your account.');

      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user?.email).toBe(userData.email);
    });

    it('should not sign up user with existing email', async () => {
      await new User(userData).save();

      const response = await request(app)
        .post('/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await new User(userData).save();
    });

    it('should log in a user', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should not log in a user with wrong credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: userData.email, password: 'WrongPassword' })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/logout', () => {
    it('should log out a user', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.data).toBe('User logged out successfully');
    });
  });

  describe('GET /auth/verify/:token', () => {
    it('should verify user email', async () => {
      const user = await new User(userData).save();
      const token = user.getSignedJwtToken();
      const response = await request(app)
        .get(`/auth/verify/${token}`)
        .expect(200);

      expect(response.text).toBe('Email verified successfully');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.isVerified).toBe(true);
    });
  });

  describe('POST /auth/forget-password', () => {
    it('should send reset token', async () => {
      await new User(userData).save();
      const response = await request(app)
        .post('/auth/forget-password')
        .send({ email: userData.email })
        .expect(200);

      expect(response.body.message).toBe('Reset token sent to email');
      expect(sendMail).toHaveBeenCalled();
    });

    it('should return user not found', async () => {
      const response = await request(app)
        .post('/auth/forget-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /auth/password-reset/:resetToken', () => {
    it('should reset password', async () => {
      const user = await new User(userData).save();
      const token = crypto.randomBytes(32).toString('hex');
      const resetToken = crypto.createHash('sha256').update(token).digest('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      const response = await request(app)
        .put(`/auth/password-reset/${token}`)
        .send({ password: 'NewStrongPassword123!' })
        .expect(200);

      expect(response.body.message).toBe('Password successfully updated');
    });

    it('should return invalid or expired reset token', async () => {
      const response = await request(app)
        .put('/auth/password-reset/invalidtoken')
        .send({ password: 'NewStrongPassword123!' })
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired reset token');
    });
  });
});
