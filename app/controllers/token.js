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
const tedious = require("tedious");
const counter_1 = require("../models/mongoose/counter");
const debug = createDebug('waiter-prototype:controller:token');
const redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, {
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST },
    return_buffers: false
});
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
function publishWithMongo(__, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const key = createKey(WAITER_SCOPE);
            const counter = yield counter_1.default.findOneAndUpdate({ key: key }, { $inc: { count: +1 } }, {
                new: true,
                upsert: true
            }).lean().exec();
            debug('counter:', counter);
            if (counter.count > numberOfTokensPerUnit) {
                res.status(httpStatus.NOT_FOUND).json({
                    data: null
                });
            }
            else {
                const token = yield createToken(WAITER_SCOPE, counter.key, counter.count);
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
            const multi = redisClient.multi();
            multi
                .incr(key, debug)
                .expire(key, ttl, debug)
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
function publishWithSQLServer(__1, __2, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            connection.on('connect', (connectErr) => {
                if (connectErr instanceof Error) {
                    next(connectErr);
                    return;
                }
                const request = new tedious.Request('select 42, \'hello world\'', (err, rowCount) => {
                    if (err instanceof Error) {
                        next(err);
                    }
                    else {
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
        }
        catch (error) {
            next(error);
        }
    });
}
exports.publishWithSQLServer = publishWithSQLServer;
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
