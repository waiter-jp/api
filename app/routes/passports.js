"use strict";
/**
 * 許可証ルーター
 *
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
const createDebug = require("debug");
const express_1 = require("express");
const httpStatus = require("http-status");
const passportsController = require("../controllers/passports");
const validator_1 = require("../middlewares/validator");
const debug = createDebug('waiter-prototype:router:passports');
const passportsRouter = express_1.Router();
passportsRouter.post('', (req, __, next) => {
    // クライアントが何の許可証かを制御するためのスコープ
    req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        let passport;
        switch (req.query.db) {
            case 'mongodb':
                passport = yield passportsController.publishWithMongo(req);
                break;
            case 'redis':
                passport = yield passportsController.publishWithRedis(req);
                break;
            case 'sqlserver':
                passport = yield passportsController.publishWithSQLServer(req);
                break;
            default:
                throw new Error('db not implemented');
        }
        debug('passport:', passport);
        if (passport === null) {
            res.status(httpStatus.NOT_FOUND).json({
                data: null
            });
        }
        else {
            const token = yield passportsController.createToken(passport);
            res.json({
                token: token,
                expires_in: Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS)
            });
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = passportsRouter;
