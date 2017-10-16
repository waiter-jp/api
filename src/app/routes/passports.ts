/**
 * 許可証ルーター
 * @ignore
 */

import * as waiter from '@motionpicture/waiter-domain';
import * as createDebug from 'debug';
import { Router } from 'express';

import * as redis from '../../redis';

import validator from '../middlewares/validator';

const debug = createDebug('waiter-prototype:router:passports');
const passportsRouter = Router();

passportsRouter.post(
    '',
    (req, __, next) => {
        // クライアントが何の許可証かを制御するためのスコープ
        req.checkBody('clientId', 'invalid clientId').notEmpty().withMessage('clientId is required');
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const clientRepo = new waiter.repository.Client();
            const passportCounterRepo = new waiter.repository.PassportCounter(redis.getClient());
            const token = await waiter.service.passport.issue(req.body.clientId, req.body.scope)(clientRepo, passportCounterRepo);
            debug('token:', token);

            res.json({
                token: token
            });
        } catch (error) {
            next(error);
        }
    }
);

export default passportsRouter;
