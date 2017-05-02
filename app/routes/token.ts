/**
 * tokenルーター
 *
 * @ignore
 */

import { Router } from 'express';

import * as tokenController from '../controller/token';
import validator from '../middlewares/validator';

const router = Router();

router.post(
    '/mongodb',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithMongo
);

router.post(
    '/redis',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithRedis
);

router.post(
    '/sqlserver',
    (__1, __2, next) => {
        next();
    },
    validator,
    tokenController.publishWithSQLServer
);

export default router;
