import jwt from 'jsonwebtoken';
import env from '../config/environment';
import User from '../models/userModel';

User.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE
  });
};
