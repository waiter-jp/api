/**
 * tokenルーター
 *
 * @ignore
 */

import { Router } from 'express';

import * as tokenController from '../controllers/token';
import validator from '../middlewares/validator';

const router = Router();

router.all(
    '/mongodb',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithMongo
);

router.all(
    '/redis',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithRedis
);

router.all(
    '/sqlserver',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithSQLServer
);

export default router;
