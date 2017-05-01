/**
 * tokenルーター
 *
 * @ignore
 */

import * as createDebug from 'debug';
import { Router } from 'express';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import * as redis from 'redis';

import validator from '../middlewares/validator';
import Sequence from '../model/mongoose/sequence';

const debug = createDebug('waiter-prototype:route:token');
const router = Router();
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
const WAITER_SECRET_KEY = 'secret-key';
const WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS = 60;
const WAITER_NUMBER_OF_TOKENS_PER_UNIT = 30;

router.get(
    '/publish/mongodb',
    (__1, __2, next) => {
        next();
    },
    validator,
    async (__, res, next) => {
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
                jwt.sign(
                    {
                        scope: WAITER_SCOPE,
                        counted_from: sequence.get('counted_from'),
                        place: sequence.get('place')
                    },
                    WAITER_SECRET_KEY,
                    {
                        expiresIn: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                    },
                    (err, encoded) => {
                        if (err instanceof Error) {
                            next(err);
                        } else {
                            jwt.verify(encoded, <string>WAITER_SECRET_KEY, (verifyErr, decoded) => {
                                if (verifyErr instanceof Error) {
                                    next(verifyErr);
                                } else {
                                    debug('decoded:', decoded);

                                    res.json({
                                        token: encoded,
                                        expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                                    });
                                }
                            });
                        }
                    }
                );
            }
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/publish/redis',
    (__1, __2, next) => {
        next();
    },
    validator,
    async (__, res, next) => {
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
                .exec((execErr, replies) => {
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
                        jwt.sign(
                            {
                                scope: WAITER_SCOPE,
                                counted_from: countedFrom.toDate(),
                                place: place
                            },
                            WAITER_SECRET_KEY,
                            {
                                expiresIn: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                            },
                            (err, encoded) => {
                                if (err instanceof Error) {
                                    next(err);
                                } else {
                                    res.json({
                                        token: encoded,
                                        expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                                    });
                                }
                            }
                        );
                    }
                });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    '/publish/sqlserver',
    (__1, __2, next) => {
        next();
    },
    validator,
    async (__1, __2, next) => {
        try {
            throw new Error('not implemented');
        } catch (error) {
            next(error);
        }
    }
);

export default router;
