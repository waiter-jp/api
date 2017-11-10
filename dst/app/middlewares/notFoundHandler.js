"use strict";
/**
 * 404ハンドラーミドルウェア
 * @module middlewares.notFoundHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const waiter_domain_1 = require("@motionpicture/waiter-domain");
exports.default = (req, __, next) => {
    next(new waiter_domain_1.factory.errors.NotFound(`router for [${req.originalUrl}]`));
};
