"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ヘルスチェックルーター
 */
const express = require("express");
const mongoose = require("mongoose");
const healthRouter = express.Router();
const createDebug = require("debug");
const http_status_1 = require("http-status");
const redis = require("../../redis");
const debug = createDebug('waiter-api:router');
// 接続確認をあきらめる時間(ミリ秒)
const TIMEOUT_GIVE_UP_CHECKING_IN_MILLISECONDS = 3000;
healthRouter.get('', (_, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield mongoose.connection.db.admin()
            .ping();
        yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let givenUpChecking = false;
            // redisサーバー接続が生きているかどうか確認
            redis.getClient()
                .ping('wake up!', (err, reply) => {
                debug('redis ping:', err, reply);
                // すでにあきらめていたら何もしない
                if (givenUpChecking) {
                    return;
                }
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
            setTimeout(() => {
                givenUpChecking = true;
                reject(new Error('unable to check db connection'));
            }, TIMEOUT_GIVE_UP_CHECKING_IN_MILLISECONDS);
        }));
        res.status(http_status_1.OK)
            .send('healthy!');
    }
    catch (error) {
        next(error);
    }
}));
healthRouter.get('/closeMongo', (_, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield mongoose.connection.close();
        res.status(http_status_1.OK)
            .send('healthy!');
    }
    catch (error) {
        next(error);
    }
}));
exports.default = healthRouter;
