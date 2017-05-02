/**
 * tokenコントローラー
 *
 * @namespace controller/token
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as redis from 'redis';
import * as tedious from 'tedious';

import Counter from '../model/mongoose/counter';

const debug = createDebug('waiter-prototype:controller:token');
const redisClient = redis.createClient(
    process.env.REDIS_PORT,
    process.env.REDIS_HOST,
    {
        password: process.env.REDIS_KEY,
        tls: { servername: process.env.REDIS_HOST },
        return_buffers: false
    }
);

const connection = new tedious.Connection({
    userName: process.env.SQL_DATABASE_USERNAME,
    password: process.env.SQL_DATABASE_PASSWORD,
    server: process.env.SQL_DATABASE_SERVER,

    // If you're on Windows Azure, you will need this:
    options: { encrypt: true }
});

const WAITER_SCOPE = 'waiter';
const sequenceCountUnitPerSeconds = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);
const numberOfTokensPerUnit = Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT);

export async function publishWithMongo(__: Request, res: Response, next: NextFunction) {
    try {
        const key = createKey(WAITER_SCOPE);
        const counter = await Counter.findOneAndUpdate(
            {
                key: key
            },
            { $inc: { count: +1 } },
            {
                new: true,
                upsert: true
            }
        ).exec();
        debug('counter:', counter);

        if (counter.get('count') > numberOfTokensPerUnit) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        } else {
            const token = await createToken(WAITER_SCOPE, counter.get('key'), counter.get('count'));
            res.json({
                token: token,
                expires_in: sequenceCountUnitPerSeconds
            });
        }
    } catch (error) {
        next(error);
    }
}

export async function publishWithRedis(__: Request, res: Response, next: NextFunction) {
    try {
        const key = createKey(WAITER_SCOPE);
        const ttl = sequenceCountUnitPerSeconds;

        // start a separate multi command queue
        const multi = redisClient.multi();
        multi
            .incr(key)
            .expire(key, ttl)
            .exec(async (execErr, replies) => {
                if (execErr instanceof Error) {
                    next(execErr);
                    return;
                }
                debug('replies:', replies);

                const count = replies[0];
                if (count > numberOfTokensPerUnit) {
                    res.status(httpStatus.NOT_FOUND).json({
                        data: null
                    });
                } else {
                    try {
                        const token = await createToken(WAITER_SCOPE, key, count);
                        res.json({
                            token: token,
                            expires_in: sequenceCountUnitPerSeconds
                        });
                    } catch (error) {
                        next(error);
                    }
                }
            });
    } catch (error) {
        next(error);
    }
}

export async function publishWithSQLServer(__1: Request, __2: Response, next: NextFunction) {
    try {
        connection.on('connect', (connectErr: any) => {
            if (connectErr instanceof Error) {
                next(connectErr);
                return;
            }

            const request = new tedious.Request('select 42, \'hello world\'', (err, rowCount) => {
                if (err instanceof Error) {
                    next(err);
                } else {
                    debug('rowCount:', rowCount);
                    next(new Error('not implemented'));
                }
            });

            // request.on('row', (columns) => {
            //     columns.forEach((column) => {
            //         console.log(column.value);
            //     });
            // });

            connection.execSql(request);
        });
    } catch (error) {
        next(error);
    }
}

/**
 * カウント単位キーを作成する
 *
 * @param {string} scope カウント単位スコープ
 * @returns {string}
 */
function createKey(scope: string) {
    const dateNow = moment();
    return scope + (dateNow.unix() - dateNow.unix() % sequenceCountUnitPerSeconds).toString();
}

/**
 * トークンを生成する
 *
 * @param {string} scope スコープ
 * @param {string} key キー
 * @param {string} count カウント
 * @returns {Promise<string>}
 */
async function createToken(scope: string, key: string, count: string) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            {
                scope: scope,
                key: key,
                count: count
            },
            process.env.WAITER_SECRET,
            {
                expiresIn: sequenceCountUnitPerSeconds
            },
            (err, encoded) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve(encoded);
                }
            }
        );
    });
}
