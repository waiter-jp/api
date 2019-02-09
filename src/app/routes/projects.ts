/**
 * プロジェクトルーター
 */
import * as waiter from '@waiter/domain';
import { Router } from 'express';
import { CREATED } from 'http-status';

import * as redis from '../../redis';

import validator from '../middlewares/validator';

const projectsRouter = Router();

/**
 * 許可証発行
 */
projectsRouter.post(
    '/:projectId/passports',
    (req, __, next) => {
        // クライアントが何の許可証かを制御するためのスコープ
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const token = await waiter.service.passport.issue({
                project: { id: <string>req.params.projectId },
                scope: <string>req.body.scope
            })({
                passportIssueUnit: new waiter.repository.PassportIssueUnit(redis.getClient()),
                project: new waiter.repository.ProjectInMemory(),
                rule: new waiter.repository.RuleInMemory()
            });

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
projectsRouter.get(
    '/:projectId/passports/:scope/currentIssueUnit',
    (req, __, next) => {
        req.checkParams('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            const issueUnit = await waiter.service.passport.currentIssueUnit({
                project: { id: <string>req.params.projectId },
                scope: <string>req.params.scope
            })({
                passportIssueUnit: new waiter.repository.PassportIssueUnit(redis.getClient()),
                project: new waiter.repository.ProjectInMemory(),
                rule: new waiter.repository.RuleInMemory()
            });

            res.json(issueUnit);
        } catch (error) {
            next(error);
        }
    }
);

projectsRouter.get(
    '/:projectId/rules',
    validator,
    async (req, res, next) => {
        try {
            const ruleRepo = new waiter.repository.RuleInMemory();
            const rules = ruleRepo.search({
                project: { ids: [<string>req.params.projectId] }
            });
            res.json(rules);
        } catch (error) {
            next(error);
        }
    }
);

export default projectsRouter;
