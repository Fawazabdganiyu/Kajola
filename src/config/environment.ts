import dotenv from 'dotenv';

dotenv.config();

export default {
  // SERVER CONFIG
  PORT: process.env.PORT || 3000,

  // MONGO CONFIG
  MONGO_URI: process.env.MONGO_URI,

  // JWT CONFIG
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION as string || '24h',
};
