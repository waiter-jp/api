/**
 * 許可証ルーター
 *
 * @ignore
 */

import * as WAITER from '@motionpicture/waiter-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import * as httpStatus from 'http-status';
import * as mongoose from 'mongoose';

import getSqlServerConnection from '../db/getSqlServerConnection';
import redisClient from '../db/redisClient';

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
                secret: 'motionpicture',
                passport_issuer_work_shift_in_sesonds: 30,
                total_number_of_passports_per_issuer: 30
            };

            switch (req.query.db) {
                case 'mongodb':
                    const mongodbAdapter = WAITER.adapter.mongoDB.requestCounter(mongoose.connection);
                    token = await WAITER.service.passport.issueWithMongo(client, req.body.scope)(mongodbAdapter);
                    break;

                case 'redis':
                    const redisAdapter = WAITER.adapter.redis.counter(redisClient);
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
