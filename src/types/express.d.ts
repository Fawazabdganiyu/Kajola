import { IUser } from './user';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      verified?: boolean;
      user?: IUser;
    }
  }
}
