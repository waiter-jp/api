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

const debug = createDebug('waiter:router:passports');
const passportsRouter = Router();

/**
 * 許可証発行
 */
passportsRouter.post(
    '',
    (req, __, next) => {
        // クライアントが何の許可証かを制御するためのスコープ
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ruleRepo = new waiter.repository.Rule();
            const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redis.getClient());
            const token = await waiter.service.passport.issue(req.body.scope)(ruleRepo, passportIssueUnitRepo);
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
    '/:scope/currentIssueUnit',
    (req, __, next) => {
        req.checkParams('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const ruleRepo = new waiter.repository.Rule();
            const passportIssueUnitRepo = new waiter.repository.PassportIssueUnit(redis.getClient());
            const issueUnit = await waiter.service.passport.currentIssueUnit(req.params.scope)(ruleRepo, passportIssueUnitRepo);
            debug('issueUnit:', issueUnit);

            res.json(issueUnit);
        } catch (error) {
            next(error);
        }
    }
);

export default passportsRouter;
