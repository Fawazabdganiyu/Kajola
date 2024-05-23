import { Router } from 'express';
import appController from '../controllers/appController';


const indexRouter = Router();

indexRouter.get('/status', appController.getStatus);

export default indexRouter;
