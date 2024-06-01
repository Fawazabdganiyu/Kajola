import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import Chat from '../models/chatModel';
import Product from '../models/productModel';
import CustomError from '../utils/customError';

export default class FileController {
  // PUT /api/files/profile-pic uploadProfilePic
  static async uploadProfilePic(req: Request, res: Response, next: NextFunction) {
    if (!req.uploadedFile) return next(new CustomError(400, 'No file uploaded'));

    const user = await User.findById(req.userId);
    if (!user) return next(new CustomError(404, 'User not found'));

    user.profilePic = req.uploadedFile;
    await user.save();

     res.status(200).json({ url: req.uploadedFile });
  }

  // PUT /api/files/product-pic uploadProductPic
  static async uploadProductPic(req: Request, res: Response, next: NextFunction) {
    if (!req.uploadedFiles || !(req.uploadedFiles instanceof Array)) return next(new CustomError(400, 'No files uploaded'));

    const product = await Product.findById(req.userId);
    if (!product) return next(new CustomError(404, 'Product not found'));

    product.images = req.uploadedFiles;
    await product.save();

    res.status(200).json({ urls: req.uploadedFiles });
  }

  static async uploadChatFile(req: Request, res: Response, next: NextFunction) {
    if (!req.uploadedFile) return next(new CustomError(400, 'No file uploaded'));

      const chat = await Chat.findById(req.body.chatId);
      if (!chat) return next(new CustomError(404, 'Chat not found'));

      chat.messages.push({
        user: req.userId,
        message: req.uploadedFile,
        messageType: 'file'
      });

      await chat.save();

      res.status(200).json({ url: req.uploadedFile });
  }
}
