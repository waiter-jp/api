"use strict";
/**
 * tokenルーター
 *
 * @ignore
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tokenController = require("../controller/token");
const validator_1 = require("../middlewares/validator");
const router = express_1.Router();
router.post('/mongodb', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithMongo);
router.post('/redis', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithRedis);
router.post('/sqlserver', (__1, __2, next) => {
    next();
}, validator_1.default, tokenController.publishWithRedis);
exports.default = router;
