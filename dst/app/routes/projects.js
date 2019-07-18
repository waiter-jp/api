"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * プロジェクトルーター
 */
const waiter = require("@waiter/domain");
const express_1 = require("express");
const http_status_1 = require("http-status");
const redis = require("../../redis");
const validator_1 = require("../middlewares/validator");
const TOKEN_EXPIRES_IN = (process.env.TOKEN_EXPIRES_IN !== undefined) ? Number(process.env.TOKEN_EXPIRES_IN) : 0;
const projectsRouter = express_1.Router();
/**
 * 許可証発行
 */
projectsRouter.post('/:projectId/passports', (req, __, next) => {
    // クライアントが何の許可証かを制御するためのスコープ
    req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const token = yield waiter.service.passport.issue({
            project: { id: req.params.projectId },
            scope: req.body.scope,
            expiresIn: TOKEN_EXPIRES_IN
        })({
            passportIssueUnit: new waiter.repository.PassportIssueUnit(redis.getClient()),
            project: new waiter.repository.ProjectInMemory(),
            rule: new waiter.repository.RuleInMemory()
        });
        res.status(http_status_1.CREATED).json({
            token: token
        });
    }
    catch (error) {
        next(error);
    }
}));
/**
 * クライアントIDとスコープから、現在の許可証数を取得する
 */
projectsRouter.get('/:projectId/passports/:scope/currentIssueUnit', (req, __, next) => {
    req.checkParams('scope', 'invalid scope').notEmpty().withMessage('scope is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const issueUnit = yield waiter.service.passport.currentIssueUnit({
            project: { id: req.params.projectId },
            scope: req.params.scope
        })({
            passportIssueUnit: new waiter.repository.PassportIssueUnit(redis.getClient()),
            project: new waiter.repository.ProjectInMemory(),
            rule: new waiter.repository.RuleInMemory()
        });
        res.json(issueUnit);
    }
    catch (error) {
        next(error);
    }
}));
projectsRouter.get('/:projectId/rules', validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ruleRepo = new waiter.repository.RuleInMemory();
        const rules = ruleRepo.search({
            project: { ids: [req.params.projectId] }
        });
        res.json(rules);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = projectsRouter;
