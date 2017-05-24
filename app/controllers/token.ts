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
import * as tedious from 'tedious';

import redisClient from '../db/redisClient';
import sqlServerConnection from '../db/sqlServerConnection';

import Counter from '../models/mongoose/counter';

const debug = createDebug('waiter-prototype:controller:token');

const WAITER_SCOPE = 'waiter';
const sequenceCountUnitPerSeconds = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);
const numberOfTokensPerUnit = Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT);

export async function publishWithMongo(__: Request, res: Response, next: NextFunction) {
    try {
        const key = createKey(WAITER_SCOPE);
        const counter = <any>await Counter.findOneAndUpdate(
            { key: key },
            { $inc: { count: +1 } },
            {
                new: true,
                upsert: true
            }
        ).lean().exec();
        debug('counter:', counter);

        if (counter.count > numberOfTokensPerUnit) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        } else {
            const token = await createToken(WAITER_SCOPE, counter.key, counter.count);
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

        const multi = redisClient.multi();
        multi
            .incr(key, debug)
            .expire(key, ttl, debug)
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

export async function publishWithSQLServer(__1: Request, res: Response, next: NextFunction) {
    try {
        const key = createKey(WAITER_SCOPE);
        let nextCount: number;

        // tslint:disable-next-line:no-multiline-string
        const sql = `
MERGE INTO counters AS A
    USING (SELECT '${key}' AS unit) AS B
    ON (A.unit = B.unit)
    WHEN MATCHED THEN
        UPDATE SET count = count + 1
    WHEN NOT MATCHED THEN
        INSERT (unit, count) VALUES ('${key}', '0');
SELECT count FROM counters WHERE unit = '${key}';
`;
        debug('sql:', sql);
        const request = new tedious.Request(sql, async (err) => {
            if (err instanceof Error) {
                next(err);
            } else {
                if (nextCount > numberOfTokensPerUnit) {
                    res.status(httpStatus.NOT_FOUND).json({
                        data: null
                    });
                } else {
                    try {
                        const token = await createToken(WAITER_SCOPE, key, nextCount);
                        res.json({
                            token: token,
                            expires_in: sequenceCountUnitPerSeconds
                        });
                    } catch (error) {
                        next(error);
                    }
                }
            }
        });

        request.on('row', (columns: any[]) => {
            debug('count:', columns[0].value);
            nextCount = columns[0].value;
        });

        sqlServerConnection.execSql(request);
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
async function createToken(scope: string, key: string, count: number) {
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
