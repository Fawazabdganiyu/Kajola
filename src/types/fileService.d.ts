export interface IFileService {
  uploadToS3(file: Express.Multer.File, folder: string): Promise<S3.ManagedUpload.SendData>;
  uploadToLocal(file: Express.Multer.File, folder: string): Promise<{ Location: string }>;
  uploadFile(file: Express.Multer.File, folder: string): Promise<S3.ManagedUpload.SendData | { Location: string }>;
  getUploader(): multer.Multer;
}
