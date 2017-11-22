"use strict";
/**
 * redis cacheクライアント
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const waiter = require("@motionpicture/waiter-domain");
// import * as createDebug from 'debug';
// const debug = createDebug('waiter:redis');
let client;
function createClient() {
    const c = new waiter.redis({
        // tslint:disable-next-line:no-magic-numbers
        port: parseInt(process.env.REDIS_PORT, 10),
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_KEY
        // tls: <any>{ servername: <string>process.env.REDIS_HOST }
    });
    c.on('error', (err) => {
        console.error(err);
    });
    // c.on('end', () => {
    //     debug('end');
    // });
    return c;
}
/**
 * 接続クライアントをリセットする
 * 接続リトライをギブアップした場合に呼び出される
 *
 * @see retry_strategy
 */
// function resetClient() {
//     client = undefined;
// }
function getClient() {
    if (client === undefined) {
        client = createClient();
    }
    return client;
}
exports.getClient = getClient;
