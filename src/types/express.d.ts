import { IUser } from './user';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      verified?: boolean;
      file: Express.Multer.File;
      uploadedFile?: string;
      uploadedFiles?: string[];
    }
  }
}
