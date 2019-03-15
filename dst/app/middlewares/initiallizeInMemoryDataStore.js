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
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore file */
/**
 * インメモリデーターストアを初期化する
 */
const waiter = require("@waiter/domain");
const createDebug = require("debug");
const mongoose = require("mongoose");
const debug = createDebug('waiter-api:middlewares');
let initialized = false;
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
const INITIALIZE_IN_MEMORY_DATA_INTERVAL = 
// tslint:disable-next-line:no-magic-numbers
(process.env.INITIALIZE_IN_MEMORY_DATA_INTERVAL !== undefined) ? Number(process.env.INITIALIZE_IN_MEMORY_DATA_INTERVAL) : 60000;
// 定期的に同期する
setInterval(() => __awaiter(this, void 0, void 0, function* () {
    try {
        debug('initializing in-memory data...');
        yield sync();
    }
    catch (error) {
        // tslint:disable-next-line:no-console
        console.error(error);
    }
}), INITIALIZE_IN_MEMORY_DATA_INTERVAL);
exports.default = (_, __, next) => __awaiter(this, void 0, void 0, function* () {
    // プロセスで初期化済でなければ、マスタデータをMongoDBからローカルリポジトリへ同期する
    if (!initialized) {
        yield sync();
        initialized = true;
    }
    next();
});
function sync() {
    return __awaiter(this, void 0, void 0, function* () {
        yield waiter.service.cache.initializeInMemoryDataStore()({
            project: new waiter.repository.Project(mongoose.connection),
            rule: new waiter.repository.Rule(mongoose.connection)
        });
    });
}
