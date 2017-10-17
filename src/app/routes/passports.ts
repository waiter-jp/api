/**
 * 許可証ルーター
 * @ignore
 */

import * as waiter from '@motionpicture/waiter-domain';
import * as createDebug from 'debug';
import { Router } from 'express';
import { CREATED } from 'http-status';

import * as redis from '../../redis';

import validator from '../middlewares/validator';

const debug = createDebug('waiter-prototype:router:passports');
const passportsRouter = Router();

/**
 * 許可証発行
 */
passportsRouter.post(
    '',
    (req, __, next) => {
        // クライアントが何の許可証かを制御するためのスコープ
        req.checkBody('clientId', 'invalid clientId').notEmpty().withMessage('clientId is required');
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const clientRepo = new waiter.repository.Client();
            const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redis.getClient());
            const token = await waiter.service.passport.issue(req.body.clientId, req.body.scope)(clientRepo, passportIssueUnitRepo);
            debug('token:', token);

            res.status(CREATED).json({
                token: token
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * クライアントIDとスコープから、現在の許可証数を取得する
 */
passportsRouter.get(
    '/:clientId/:scope/currentIssueUnit',
    (req, __, next) => {
        // クライアントが何の許可証かを制御するためのスコープ
        req.checkParams('clientId', 'invalid clientId').notEmpty().withMessage('clientId is required');
        req.checkParams('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const clientRepo = new waiter.repository.Client();
            const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redis.getClient());
            const issueUnit = await waiter.service.passport.currentIssueUnit(
                req.params.clientId,
                req.params.scope
            )(clientRepo, passportIssueUnitRepo);
            debug('issueUnit:', issueUnit);

            res.json(issueUnit);
        } catch (error) {
            next(error);
        }
    }
);

export default passportsRouter;
