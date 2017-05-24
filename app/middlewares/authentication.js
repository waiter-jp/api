"use strict";
/**
 * oauthミドルウェア
 *
 * todo 認証失敗時の親切なメッセージ
 */
Object.defineProperty(exports, "__esModule", { value: true });
const createDebug = require("debug");
const jwt = require("express-jwt");
const debug = createDebug('waiter-prototype:middleware:authentication');
exports.default = [
    jwt({
        secret: process.env.WAITER_SECRET
        // todo チェック項目を増強する
        // audience: 'http://myapi/protected',
        // issuer: 'http://issuer'
    }),
    (req, __, next) => {
        debug('req.user:', req.user);
        next();
    }
];
