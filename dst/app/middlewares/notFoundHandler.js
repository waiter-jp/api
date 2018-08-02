"use strict";
/**
 * 404ハンドラーミドルウェア
 * @module middlewares.notFoundHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const domain_1 = require("@waiter/domain");
exports.default = (req, __, next) => {
    next(new domain_1.factory.errors.NotFound(`router for [${req.originalUrl}]`));
};
