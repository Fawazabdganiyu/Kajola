// services/locationService.ts
import User from '../models/userModel';
import { IUser, Location } from '../types';

// LocationService class
export default class LocationService {
  static async findNearestSellers({ product, latitude, longitude, maxDistance = 5000 }: Location): Promise<IUser[]> {
    const buyers = await User.find({
      userType: 'Buyer',
      products: product,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    });

    return buyers;
  }
}
