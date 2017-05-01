"use strict";
/**
 * tokenコントローラー
 *
 * @namespace controller/token
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
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const redis = require("redis");
const sequence_1 = require("../model/mongoose/sequence");
const debug = createDebug('waiter-prototype:controller:token');
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST },
    return_buffers: false
});
const WAITER_SCOPE = 'waiter';
const WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS = 60;
const WAITER_NUMBER_OF_TOKENS_PER_UNIT = 30;
function publishWithMongo(__, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
                const token = yield createToken(WAITER_SCOPE, sequence.get('counted_from'), sequence.get('place'));
                res.json({
                    token: token,
                    expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                });
            }
        }
        catch (error) {
            next(error);
        }
    });
}
exports.publishWithMongo = publishWithMongo;
function publishWithRedis(__, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
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
                .exec((execErr, replies) => __awaiter(this, void 0, void 0, function* () {
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
                    try {
                        const token = yield createToken(WAITER_SCOPE, countedFrom.toDate(), place);
                        res.json({
                            token: token,
                            expires_in: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
                        });
                    }
                    catch (error) {
                        next(error);
                    }
                }
            }));
        }
        catch (error) {
            next(error);
        }
    });
}
exports.publishWithRedis = publishWithRedis;
function createToken(scope, countedFrom, place) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.sign({
                scope: scope,
                counted_from: countedFrom,
                place: place
            }, process.env.WAITER_SECRET, {
                expiresIn: WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS
            }, (err, encoded) => {
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve(encoded);
                }
            });
        });
    });
}
