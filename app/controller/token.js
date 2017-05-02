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
const counter_1 = require("../model/mongoose/counter");
const debug = createDebug('waiter-prototype:controller:token');
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST },
    return_buffers: false
});
const WAITER_SCOPE = 'waiter';
const sequenceCountUnitPerSeconds = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);
const numberOfTokensPerUnit = Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT);
function publishWithMongo(__, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = createKey(WAITER_SCOPE);
            const counter = yield counter_1.default.findOneAndUpdate({
                key: key
            }, { $inc: { count: +1 } }, {
                new: true,
                upsert: true
            }).exec();
            debug('counter:', counter);
            if (counter.get('count') > numberOfTokensPerUnit) {
                res.status(httpStatus.NOT_FOUND).json({
                    data: null
                });
            }
            else {
                const token = yield createToken(WAITER_SCOPE, counter.get('key'), counter.get('count'));
                res.json({
                    token: token,
                    expires_in: sequenceCountUnitPerSeconds
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
            const key = createKey(WAITER_SCOPE);
            const ttl = sequenceCountUnitPerSeconds;
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
                const count = replies[0];
                if (count > numberOfTokensPerUnit) {
                    res.status(httpStatus.NOT_FOUND).json({
                        data: null
                    });
                }
                else {
                    try {
                        const token = yield createToken(WAITER_SCOPE, key, count);
                        res.json({
                            token: token,
                            expires_in: sequenceCountUnitPerSeconds
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
/**
 * カウント単位キーを作成する
 *
 * @param {string} scope カウント単位スコープ
 * @returns {string}
 */
function createKey(scope) {
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
function createToken(scope, key, count) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.sign({
                scope: scope,
                key: key,
                count: count
            }, process.env.WAITER_SECRET, {
                expiresIn: sequenceCountUnitPerSeconds
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
