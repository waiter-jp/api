/**
 * インメモリデーターストアを初期化する
 */
import * as waiter from '@waiter/domain';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import * as mongoose from 'mongoose';

const debug = createDebug('waiter-api:middlewares');

let initialized = false;
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
const INITIALIZE_IN_MEMORY_DATA_INTERVAL =
    // tslint:disable-next-line:no-magic-numbers
    (process.env.INITIALIZE_IN_MEMORY_DATA_INTERVAL !== undefined) ? Number(process.env.INITIALIZE_IN_MEMORY_DATA_INTERVAL) : 60000;

// 定期的に同期する
// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
setInterval(
    async () => {
        try {
            debug('initializing in-memory data...');
            await sync();
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    },
    INITIALIZE_IN_MEMORY_DATA_INTERVAL
);

export default /* istanbul ignore next */ async (_: Request, __: Response, next: NextFunction) => {
    // プロセスで初期化済でなければ、マスタデータをMongoDBからローカルリポジトリへ同期する
    if (!initialized) {
        await sync();
        initialized = true;
    }

    next();
};

// tslint:disable-next-line:no-single-line-block-comment
/* istanbul ignore next */
async function sync() {
    await waiter.service.cache.initializeInMemoryDataStore()({
        project: new waiter.repository.Project(mongoose.connection),
        rule: new waiter.repository.Rule(mongoose.connection)
    });
}
