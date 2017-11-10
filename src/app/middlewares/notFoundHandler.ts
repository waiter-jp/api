/**
 * 404ハンドラーミドルウェア
 * @module middlewares.notFoundHandler
 */

import { factory } from '@motionpicture/waiter-domain';
import { NextFunction, Request, Response } from 'express';

export default (req: Request, __: Response, next: NextFunction) => {
    next(new factory.errors.NotFound(`router for [${req.originalUrl}]`));
};
