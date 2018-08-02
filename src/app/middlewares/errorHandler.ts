/**
 * error handler
 * エラーハンドラーミドルウェア
 * @module middlewares.errorHandler
 */

import * as waiter from '@waiter/domain';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, TOO_MANY_REQUESTS } from 'http-status';

import { APIError } from '../error/api';

export default (err: any, __: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        next(err);

        return;
    }

    let apiError: APIError;
    if (err instanceof APIError) {
        apiError = err;
    } else {
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
                    apiError = new APIError(NOT_FOUND, [err]);
                    break;

                // 409
                // case (err instanceof waiter.factory.errors.AlreadyInUse):
                //     apiError = new APIError(CONFLICT, [err]);
                //     break;

                // 409
                case (err instanceof waiter.factory.errors.RateLimitExceeded):
                    apiError = new APIError(TOO_MANY_REQUESTS, [err]);
                    break;

                // 503
                // case (err instanceof waiter.factory.errors.ServiceUnavailable):
                //     apiError = new APIError(SERVICE_UNAVAILABLE, [err]);
                //     break;

                // 400
                default:
                    apiError = new APIError(BAD_REQUEST, [err]);
            }
        } else {
            // 500
            apiError = new APIError(INTERNAL_SERVER_ERROR, [new waiter.factory.errors.Waiter(<any>'InternalServerError', err.message)]);
        }
    }

    res.status(apiError.code).json({
        error: apiError.toObject()
    });
};
