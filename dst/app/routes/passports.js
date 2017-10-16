"use strict";
/**
 * 許可証ルーター
 * @ignore
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const waiter = require("@motionpicture/waiter-domain");
const createDebug = require("debug");
const express_1 = require("express");
const redis = require("../../redis");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('waiter-prototype:router:passports');
const passportsRouter = express_1.Router();
passportsRouter.post('', (req, __, next) => {
    // クライアントが何の許可証かを制御するためのスコープ
    req.checkBody('clientId', 'invalid clientId').notEmpty().withMessage('clientId is required');
    req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const clientRepo = new waiter.repository.Client();
        const passportCounterRepo = new waiter.repository.PassportCounter(redis.getClient());
        const token = yield waiter.service.passport.issue(req.body.clientId, req.body.scope)(clientRepo, passportCounterRepo);
        debug('token:', token);
        res.json({
            token: token
        });
    }
    catch (error) {
        next(error);
    }
}));
exports.default = passportsRouter;
