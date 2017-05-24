"use strict";
/**
 * tokenコントローラー
 *
 * @namespace controller/passports
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
const jwt = require("jsonwebtoken");
const moment = require("moment");
const getSqlServerConnection_1 = require("../db/getSqlServerConnection");
const redisClient_1 = require("../db/redisClient");
const counter_1 = require("../models/mongoose/counter");
const debug = createDebug('waiter-prototype:controller:passports');
const WAITER_SCOPE = 'waiter';
const sequenceCountUnitPerSeconds = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);
const numberOfTokensPerUnit = Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT);
function publishWithMongo(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = createKey(WAITER_SCOPE);
        const counter = yield counter_1.default.findOneAndUpdate({ key: key }, { $inc: { count: +1 } }, {
            new: true,
            upsert: true
        }).lean().exec();
        debug('counter:', counter);
        if (counter.count > numberOfTokensPerUnit) {
            return null;
        }
        else {
            return {
                client_id: req.user.client_id,
                scope: req.body.scope
            };
        }
    });
}
exports.publishWithMongo = publishWithMongo;
function publishWithRedis(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = createKey(WAITER_SCOPE);
        const ttl = sequenceCountUnitPerSeconds;
        return new Promise((resolve, reject) => {
            const multi = redisClient_1.default.multi();
            multi.incr(key, debug)
                .expire(key, ttl, debug)
                .exec((execErr, replies) => __awaiter(this, void 0, void 0, function* () {
                if (execErr instanceof Error) {
                    reject(execErr);
                    return;
                }
                debug('replies:', replies);
                const count = replies[0];
                if (count > numberOfTokensPerUnit) {
                    resolve(null);
                }
                else {
                    resolve({
                        client_id: req.user.client_id,
                        scope: req.body.scope
                    });
                }
            }));
        });
    });
}
exports.publishWithRedis = publishWithRedis;
function publishWithSQLServer(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = yield getSqlServerConnection_1.default();
        const key = createKey(WAITER_SCOPE);
        const result = yield pool.query `
MERGE INTO counters AS A
    USING (SELECT ${key} AS unit) AS B
    ON (A.unit = B.unit)
    WHEN MATCHED THEN
        UPDATE SET count = count + 1
    WHEN NOT MATCHED THEN
        INSERT (unit, count) VALUES (${key}, '0');
SELECT count FROM counters WHERE unit = ${key};
`;
        debug('result', result);
        // tslint:disable-next-line:no-magic-numbers
        const nextCount = parseInt(result.recordset[0].count, 10);
        debug('nextCount', nextCount);
        if (nextCount > numberOfTokensPerUnit) {
            return null;
        }
        else {
            return {
                client_id: req.user.client_id,
                scope: req.body.scope
            };
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
    return `${scope}:${(dateNow.unix() - dateNow.unix() % sequenceCountUnitPerSeconds).toString()}`;
}
/**
 * トークンを生成する
 *
 * @param {IPassport} passport スコープ
 * @returns {Promise<string>}
 */
function createToken(passport) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            jwt.sign(passport, process.env.WAITER_SECRET, {
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
exports.createToken = createToken;
