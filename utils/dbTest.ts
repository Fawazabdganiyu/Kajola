import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer;
export const dbConnect = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = await mongo.getUri();

  await mongoose.connect(uri);
}

export const dbDisconnect = async () => {
  await mongoose.disconnect();
  await mongo.stop();
}