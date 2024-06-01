import { Request, Response, NextFunction } from 'express';
import { upload, uploadFile } from '../services/fileService';
import CustomError from '../utils/customError';


export class FileMiddleware {
  static singleUpload(fieldName: string, folder: string) {
    return [
      upload.single(fieldName),
      async (req: Request, res: Response, next: NextFunction) => {
        const { file } = req;

        if (!file) return next(new CustomError(400, 'No file uploaded'));

        try {
          const result = await uploadFile(file, folder);
          req.uploadedFile = result.Location;
          next();
        } catch (error) {
          next(new CustomError(500, 'Error uploading file'));
        }
      },
    ];
  }

  static multipleUpload(fieldName: string, maxCount: number, folder: string) {
    return [
      upload.array(fieldName, maxCount),
      async (req: Request, res: Response, next: NextFunction) => {
        const { files } = req;

        if (!files || !(files instanceof Array)) return next(new CustomError(400, 'No files uploaded'));

        try {
          const uploadPromises = files.map((file: Express.Multer.File) => uploadFile(file, folder));
          const results = await Promise.all(uploadPromises);
          req.uploadedFiles = results.map((result) => result.Location);
          next();
        } catch (error) {
          next(new CustomError(500, 'Error uploading files'));
        }
      },
    ];
  }
}
