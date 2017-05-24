/**
 * tokenルーター
 *
 * @ignore
 */

import { Router } from 'express';

import * as tokenController from '../controllers/token';
import validator from '../middlewares/validator';

const tokenRouter = Router();

tokenRouter.all(
    '/mongodb',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithMongo
);

tokenRouter.all(
    '/redis',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithRedis
);

tokenRouter.all(
    '/sqlserver',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithSQLServer
);

export default tokenRouter;
