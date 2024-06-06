import { Request, Response } from 'express';
import dbClient from '../config/database';

// GET /api/status
export default class AppController {
  static getStatus(req: Request, res: Response) {
    res.status(200).send({ "Server": "ON", db: dbClient.isAlive() });
  }
}
