"use strict";
/**
 * redis cacheクライアント
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const url = require("url");
// export default redis.createClient(
//     process.env.REDIS_PORT,
//     process.env.REDIS_HOST,
//     {
//         password: process.env.REDIS_KEY,
//         tls: { servername: process.env.REDIS_HOST },
//         return_buffers: false
//     }
// );
const parsedUrl = url.parse(process.env.REDIS_URL);
const options = {
    url: process.env.REDIS_URL,
    return_buffers: false
};
// SSL対応の場合
if (parsedUrl.port === '6380') {
    options.tls = { servername: parsedUrl.hostname };
}
exports.default = redis.createClient(options);
