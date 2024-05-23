import { IDBClient } from '../types';
import mongoose, { ConnectOptions } from 'mongoose';
import env from './environment';
class DBClient implements IDBClient {
  private connectionString: string;

  constructor() {
    this.connectionString = env.MONGO_URI as string;
    this.connect();
  }

  private async connect(): Promise<void> {
    const options: ConnectOptions = {
      // Mongoose 6 has these options as defaults and some are no longer needed
    };

    try {
      await mongoose.connect(this.connectionString, options);
      console.log('Successfully connected to the database');
    } catch (error) {
      console.error('Error connecting to the database', error);
      process.exit(1); // Exit the process with failure
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      console.log('Successfully disconnected from the database');
    } catch (error) {
      console.error('Error disconnecting from the database', error);
    }
  }

  // public async isAlive(): Promise<boolean> {
    // try {
      // Perform a simple query to ensure the database is responsive
      // await mongoose.connection.db.admin().ping();
      // return true;
    // } catch (error) {
      // return false;
    // }
  // }
  public isAlive(): boolean {
    return mongoose.connection.readyState === 1;
  }
}

const dbClient = new DBClient();
export default dbClient;
