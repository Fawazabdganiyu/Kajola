import { Request, Response, NextFunction } from 'express';
import User from '../models/userModel';
import LocationService from '../services/location';
import CustomError from '../utils/customError';


export default class LocationController {
  static async findNearbySellers(req: Request, res: Response, next: NextFunction) {
    const { product, latitude, longitude, maxDistance } = req.body;

    if (!product || !latitude || !longitude) {
      return next(new CustomError(400, 'Please provide product, latitude and longitude'));
    }

    try {
      const sellers = await LocationService.findNearestSellers({
        product: String(product),
        latitude: Number(latitude),
        longitude: Number(longitude),
        maxDistance: maxDistance ? Number(maxDistance) : undefined
      });
      res.status(200).json(sellers);
    } catch (error: any) {
      next(new CustomError(500, 'Nearest sellers not found'));
    }
  }

  static async updateSellerLocation(req: Request, res: Response, next: NextFunction) {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return next(new CustomError(400, 'Please provide latitude and longitude'));
    }

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return next(new CustomError(404, 'User not found'));
      }

      user.location.coordinates = [Number(longitude), Number(latitude)];
      await user.save();
      res.status(200).json(user);
    } catch (error: any) {
      next(new CustomError(500, 'Location not updated'));
    }
  }
}
