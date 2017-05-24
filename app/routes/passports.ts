/**
 * 許可証ルーター
 *
 * @ignore
 */

import * as createDebug from 'debug';
import { Router } from 'express';
import * as httpStatus from 'http-status';

import * as passportsController from '../controllers/passports';
import validator from '../middlewares/validator';

const debug = createDebug('waiter-prototype:router:passports');
const passportsRouter = Router();

passportsRouter.post(
    '',
    (req, __, next) => {
        // クライアントが何の許可証かを制御するためのスコープ
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            let passport: passportsController.IPassport | null;
            switch (req.query.db) {
                case 'mongodb':
                    passport = await passportsController.publishWithMongo(req);
                    break;

                case 'redis':
                    passport = await passportsController.publishWithRedis(req);
                    break;

                case 'sqlserver':
                    passport = await passportsController.publishWithSQLServer(req);
                    break;

                default:
                    throw new Error('db not implemented');
            }

            debug('passport:', passport);
            if (passport === null) {
                res.status(httpStatus.NOT_FOUND).json({
                    data: null
                });
            } else {
                const token = await passportsController.createToken(passport);
                res.json({
                    token: token,
                    expires_in: Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)
                });
            }

        } catch (error) {
            next(error);
        }
    }
);

export default passportsRouter;
