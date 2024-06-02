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

  //AWS CONFIG
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_BUCKET_URL: process.env.AWS_BUCKET_URL,
  USE_AWS: process.env.USE_AWS
};
