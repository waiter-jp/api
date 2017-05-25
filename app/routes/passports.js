"use strict";
/**
 * 許可証ルーター
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
const WAITER = require("@motionpicture/waiter-domain");
const createDebug = require("debug");
const express_1 = require("express");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const getSqlServerConnection_1 = require("../db/getSqlServerConnection");
const redisClient_1 = require("../db/redisClient");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('waiter-prototype:router:passports');
const passportsRouter = express_1.Router();
passportsRouter.post('', (req, __, next) => {
    // クライアントが何の許可証かを制御するためのスコープ
    req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let token;
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
                token = yield WAITER.service.passport.issueWithMongo(client, req.body.scope)(mongodbAdapter);
                break;
            case 'redis':
                const redisAdapter = WAITER.adapter.redis.counter(redisClient_1.default);
                token = yield WAITER.service.passport.issueWithRedis(client, req.body.scope)(redisAdapter);
                break;
            case 'sqlserver':
                const sqlServerAdapter = WAITER.adapter.sqlServer.counter(yield getSqlServerConnection_1.default());
                token = yield WAITER.service.passport.issueWithSqlServer(client, req.body.scope)(sqlServerAdapter);
                break;
            default:
                throw new Error('db not implemented');
        }
        debug('token:', token);
        if (token === null) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        }
        else {
            res.json({
                token: token
                // todo ここでこの環境変数を使うのか？
                // expires_in: Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = passportsRouter;
