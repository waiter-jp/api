/**
 * 発行ルールルーター
 * @ignore
 */

import * as waiter from '@motionpicture/waiter-domain';
import { Router } from 'express';

import validator from '../middlewares/validator';

const rulesRouter = Router();

rulesRouter.get(
    '',
    validator,
    async (__, res, next) => {
        try {
            const ruleRepo = new waiter.repository.Rule();
            const rules = ruleRepo.findAll();
            res.json(rules);
        } catch (error) {
            next(error);
        }
    }
);

export default rulesRouter;
