"use strict";
/**
 * tokenルーター
 *
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const express_1 = require("express");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const redis = require("redis");
const validator_1 = require("../middlewares/validator");
const sequence_1 = require("../model/mongoose/sequence");
const debug = createDebug('waiter-prototype:route:token');
const router = express_1.Router();
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST },
    return_buffers: false
});
const WAITER_SCOPE = 'waiter';
const WAITER_SECRET_KEY = 'secret-key';
const WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS = 60;
const WAITER_NUMBER_OF_TOKENS_PER_UNIT = 30;
router.get('/publish/mongodb', (__1, __2, next) => {
    next();
}, validator_1.default, (__, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const dateNow = moment();
        // tslint:disable-next-line:no-magic-numbers
        const countedFrom = moment((dateNow.unix() - dateNow.unix() % WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS) * 1000).toDate();
        const sequence = yield sequence_1.default.findOneAndUpdate({
            counted_from: countedFrom
        }, { $inc: { place: +1 } }, {
            new: true,
            upsert: true
        }).exec();
        if (sequence.get('place') > WAITER_NUMBER_OF_TOKENS_PER_UNIT) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        }
        else {
            jwt.sign({
                scope: WAITER_SCOPE,
                counted_from: sequence.get('counted_from'),
                place: sequence.get('place')
            }, WAITER_SECRET_KEY, {
                expiresIn: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
            }, (err, encoded) => {
                if (err instanceof Error) {
                    next(err);
                }
                else {
                    jwt.verify(encoded, WAITER_SECRET_KEY, (verifyErr, decoded) => {
                        if (verifyErr instanceof Error) {
                            next(verifyErr);
                        }
                        else {
                            debug('decoded:', decoded);
                            res.json({
                                token: encoded,
                                expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                            });
                        }
                    });
                }
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
router.get('/publish/redis', (__1, __2, next) => {
    next();
}, validator_1.default, (__, res, next) => __awaiter(this, void 0, void 0, function* () {
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
            }
            else {
                jwt.sign({
                    scope: WAITER_SCOPE,
                    counted_from: countedFrom.toDate(),
                    place: place
                }, WAITER_SECRET_KEY, {
                    expiresIn: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                }, (err, encoded) => {
                    if (err instanceof Error) {
                        next(err);
                    }
                    else {
                        res.json({
                            token: encoded,
                            expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                        });
                    }
                });
            }
        });
    }
    catch (error) {
        next(error);
    }
}));
router.get('/publish/sqlserver', (__1, __2, next) => {
    next();
}, validator_1.default, (__1, __2, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        throw new Error('not implemented');
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
