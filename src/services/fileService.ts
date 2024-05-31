import multer from 'multer';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import env from '../config/environment';
import { IFileService } from '../types';


export default class FileService implements IFileService {
  private s3: S3;
  private storage: multer.StorageEngine;
  private upload: multer.Multer;

  constructor() {
    this.s3 = new S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION
    });

    this.storage = multer.memoryStorage();

    this.upload = multer({
      storage: this.storage,
      limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB
    });
  }

  uploadToS3(file: Express.Multer.File, folder: string) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: `${folder}/${uuidv4()}${path.extname(file.originalname)}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    return this.s3.upload(params).promise();
  }

  uploadToLocal(file: Express.Multer.File, folder: string) {
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadPath, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return Promise.resolve({ Location: `/uploads/${folder}/${fileName}` });
  }

  uploadFile(file: Express.Multer.File, folder: string) {
    if (process.env.USE_AWS === 'true') {
      return this.uploadToS3(file, folder);
    } else {
      return this.uploadToLocal(file, folder);
    }
  }

  getUploader() {
    return this.upload;
  }
}
