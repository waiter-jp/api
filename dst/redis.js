"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
/**
 * redis cacheクライアント
 */
const waiter = require("@waiter/domain");
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
        // tslint:disable-next-line:no-console
        console.error(err);
    });
    // c.on('end', () => {
    //     debug('end');
    // });
    return c;
}
function getClient() {
    if (client === undefined) {
        client = createClient();
    }
    return client;
}
exports.getClient = getClient;
