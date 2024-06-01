import multer from 'multer';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import env from '../config/environment';
import path from 'path';
import fs from 'fs';


const s3 = new S3({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION
});

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // limit file size to 5MB
});

// Upload file to S3
const uploadToS3 = (file: Express.Multer.File, folder: string) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: `${folder}/${uuidv4()}${path.extname(file.originalname)}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  return s3.upload(params).promise();
};

// Upload file to local storage
const uploadToLocal = (file: Express.Multer.File, folder: string) => {
  const uploadPath = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
  const filePath = path.join(uploadPath, fileName);

  fs.writeFileSync(filePath, file.buffer);

  return Promise.resolve({ Location: `/uploads/${folder}/${fileName}` });
};

// Upload file to S3 or local storage based on the configuration
const uploadFile = (file: Express.Multer.File, folder: string) => {
  if (process.env.USE_AWS === 'true') {
    return uploadToS3(file, folder);
  } else {
    return uploadToLocal(file, folder);
  }
};

export { upload, uploadFile };
