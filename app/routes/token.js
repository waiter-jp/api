"use strict";
/**
 * tokenルーター
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tokenController = require("../controllers/token");
const validator_1 = require("../middlewares/validator");
const tokenRouter = express_1.Router();
tokenRouter.all('/mongodb', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithMongo);
tokenRouter.all('/redis', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithRedis);
tokenRouter.all('/sqlserver', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithSQLServer);
exports.default = tokenRouter;
