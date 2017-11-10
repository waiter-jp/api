"use strict";
/**
 * error handler
 * エラーハンドラーミドルウェア
 * @module middlewares.errorHandler
 */
Object.defineProperty(exports, "__esModule", { value: true });
const waiter = require("@motionpicture/waiter-domain");
const http_status_1 = require("http-status");
const api_1 = require("../error/api");
exports.default = (err, __, res, next) => {
    if (res.headersSent) {
        next(err);
        return;
    }
    let apiError;
    if (err instanceof api_1.APIError) {
        apiError = err;
    }
    else {
        if (err instanceof waiter.factory.errors.Waiter) {
            switch (true) {
                // 401
                // case (err instanceof waiter.factory.errors.Unauthorized):
                //     apiError = new APIError(UNAUTHORIZED, [err]);
                //     break;
                // 403
                // case (err instanceof waiter.factory.errors.Forbidden):
                //     apiError = new APIError(FORBIDDEN, [err]);
                //     break;
                // 404
                case (err instanceof waiter.factory.errors.NotFound):
                    apiError = new api_1.APIError(http_status_1.NOT_FOUND, [err]);
                    break;
                // 409
                // case (err instanceof waiter.factory.errors.AlreadyInUse):
                //     apiError = new APIError(CONFLICT, [err]);
                //     break;
                // 409
                case (err instanceof waiter.factory.errors.RateLimitExceeded):
                    apiError = new api_1.APIError(http_status_1.TOO_MANY_REQUESTS, [err]);
                    break;
                // 503
                // case (err instanceof waiter.factory.errors.ServiceUnavailable):
                //     apiError = new APIError(SERVICE_UNAVAILABLE, [err]);
                //     break;
                // 400
                default:
                    apiError = new api_1.APIError(http_status_1.BAD_REQUEST, [err]);
                    break;
            }
        }
        else {
            // 500
            apiError = new api_1.APIError(http_status_1.INTERNAL_SERVER_ERROR, [new waiter.factory.errors.Waiter('InternalServerError', err.message)]);
        }
    }
    res.status(apiError.code).json({
        error: apiError.toObject()
    });
};
