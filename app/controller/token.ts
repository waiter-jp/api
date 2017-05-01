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

import Sequence from '../model/mongoose/sequence';

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

const WAITER_SCOPE = 'waiter';
const WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS = 60;
const WAITER_NUMBER_OF_TOKENS_PER_UNIT = 30;

export async function publishWithMongo(__: Request, res: Response, next: NextFunction) {
    try {
        const dateNow = moment();
        // tslint:disable-next-line:no-magic-numbers
        const countedFrom = moment((dateNow.unix() - dateNow.unix() % WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS) * 1000).toDate();
        const sequence = await Sequence.findOneAndUpdate(
            {
                counted_from: countedFrom
            },
            { $inc: { place: +1 } },
            {
                new: true,
                upsert: true
            }
        ).exec();

        if (sequence.get('place') > WAITER_NUMBER_OF_TOKENS_PER_UNIT) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        } else {
            const token = await createToken(WAITER_SCOPE, sequence.get('counted_from'), sequence.get('place'));
            res.json({
                token: token,
                expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
            });
        }
    } catch (error) {
        next(error);
    }
}

export async function publishWithRedis(__: Request, res: Response, next: NextFunction) {
    try {
        const dateNow = moment();
        // tslint:disable-next-line:no-magic-numbers
        const countedFrom = moment((dateNow.unix() - dateNow.unix() % WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS) * 1000);
        const key = countedFrom.unix();
        const ttl = WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS;

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

                const place = replies[0];
                if (place > WAITER_NUMBER_OF_TOKENS_PER_UNIT) {
                    res.status(httpStatus.NOT_FOUND).json({
                        data: null
                    });
                } else {
                    try {
                        const token = await createToken(WAITER_SCOPE, countedFrom.toDate(), place);
                        res.json({
                            token: token,
                            expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
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

async function createToken(scope: string, countedFrom: Date, place: string) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            {
                scope: scope,
                counted_from: countedFrom,
                place: place
            },
            process.env.WAITER_SECRET,
            {
                expiresIn: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
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
