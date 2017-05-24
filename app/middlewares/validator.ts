/**
 * バリデータミドルウェア
 *
 * リクエストのパラメータ(query strings or body parameters)に対するバリデーション
 */

import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import { BAD_REQUEST } from 'http-status';

const debug = createDebug('waiter-prototype:middleware:validator');

export default async (req: Request, res: Response, next: NextFunction) => {
    const validatorResult = await req.getValidationResult();
    if (!validatorResult.isEmpty()) {
        debug('validatorResult:', validatorResult.array());
        res.status(BAD_REQUEST);
        res.json({
            errors: validatorResult.array().map((mappedRrror) => {
                return {
                    source: { parameter: mappedRrror.param },
                    title: 'invalid parameter',
                    detail: mappedRrror.msg
                };
            })
        });

        return;
    }

    next();
};
