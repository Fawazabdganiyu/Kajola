import { Router } from 'express';
import LocationService from '../controllers/locationController';
import authMiddleware from '../middlewares/authMiddleware';

const locationRouter = Router();

locationRouter.post('/find-sellers', authMiddleware, LocationService.findNearbySellers);
locationRouter.put('/update-location', authMiddleware, LocationService.updateSellerLocation);

export default locationRouter;
