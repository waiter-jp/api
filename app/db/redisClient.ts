/**
 * redis cacheクライアント
 *
 * @module
 */

import * as redis from 'redis';
import * as url from 'url';

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
const options: redis.ClientOpts = {
    url: process.env.REDIS_URL,
    return_buffers: false
};
// SSL対応の場合
if (parsedUrl.port === '6380') {
    options.tls = { servername: parsedUrl.hostname };
}

export default redis.createClient(options);
