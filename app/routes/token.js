"use strict";
/**
 * tokenルーター
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
const express_1 = require("express");
const tokenController = require("../controllers/token");
const validator_1 = require("../middlewares/validator");
const tokenRouter = express_1.Router();
tokenRouter.post('', (__1, __2, next) => {
    next();
}, validator_1.default, (req, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        switch (req.query.db) {
            case 'mongodb':
                yield tokenController.publishWithMongo(req, res, next);
                break;
            case 'redis':
                yield tokenController.publishWithRedis(req, res, next);
                break;
            case 'sqlserver':
                yield tokenController.publishWithSQLServer(req, res, next);
                break;
            default:
                throw new Error('db not implemented');
        }
    }
    catch (error) {
        next(error);
    }
}));
exports.default = tokenRouter;
