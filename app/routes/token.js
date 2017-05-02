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
const router = express_1.Router();
router.all('/mongodb', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithMongo);
router.all('/redis', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithRedis);
router.all('/sqlserver', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithSQLServer);
exports.default = router;
