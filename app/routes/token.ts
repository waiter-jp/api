/**
 * tokenルーター
 *
 * @ignore
 */

import { Router } from 'express';

import * as tokenController from '../controllers/token';
import validator from '../middlewares/validator';

const tokenRouter = Router();

tokenRouter.post(
    '',
    (__1, __2, next) => {
        next();
    },
    validator,
    async (req, res, next) => {
        try {
            switch (req.query.db) {
                case 'mongodb':
                    await tokenController.publishWithMongo(req, res, next);
                    break;

                case 'redis':
                    await tokenController.publishWithRedis(req, res, next);
                    break;

                case 'sqlserver':
                    await tokenController.publishWithSQLServer(req, res, next);
                    break;

                default:
                    throw new Error('db not implemented');
            }
        } catch (error) {
            next(error);
        }
    }
);

export default tokenRouter;
