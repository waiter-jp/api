"use strict";
/**
 * 発行ルールルーター
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
const express_1 = require("express");
const validator_1 = require("../middlewares/validator");
const rulesRouter = express_1.Router();
rulesRouter.get('', validator_1.default, (__, res, next) => __awaiter(this, void 0, void 0, function* () {
    try {
        const ruleRepo = new waiter.repository.Rule();
        const rules = ruleRepo.findAll();
        res.json(rules);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = rulesRouter;
