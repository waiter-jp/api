/**
 * 許可証ルーター
 *
 * @ignore
 */

import * as WAITER from '@motionpicture/waiter-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import * as httpStatus from 'http-status';

import getSqlServerConnection from '../../getSqlServerConnection';
import * as redis from '../../redis';

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
            let token: string | null;

            // todo クライアント情報をDBに問い合わせる
            const client = {
                id: req.user.client_id,
                secret: process.env.WAITER_SECRET,
                passport_issuer_work_shift_in_sesonds: process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS,
                total_number_of_passports_per_issuer: process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT
            };

            switch (req.query.db) {
                case 'mongodb':
                    const mongodbAdapter = WAITER.adapter.mongoDB.requestCounter(WAITER.mongoose.connection);
                    token = await WAITER.service.passport.issueWithMongo(client, req.body.scope)(mongodbAdapter);
                    break;

                case 'redis':
                    const redisAdapter = WAITER.adapter.redis.counter(redis.getClient());
                    token = await WAITER.service.passport.issueWithRedis(client, req.body.scope)(redisAdapter);
                    break;

                case 'sqlserver':
                    const sqlServerAdapter = WAITER.adapter.sqlServer.counter(await getSqlServerConnection());
                    token = await WAITER.service.passport.issueWithSqlServer(client, req.body.scope)(sqlServerAdapter);
                    break;

                default:
                    throw new Error('db not implemented');
            }

            debug('token:', token);
            if (token === null) {
                res.status(httpStatus.NOT_FOUND).json({
                    data: null
                });
            } else {
                res.json({
                    token: token
                    // todo ここでこの環境変数を使うのか？
                    // expires_in: Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)
                });
            }

        } catch (error) {
            next(error);
        }
    }
);

export default passportsRouter;
