/**
 * クライアントリストを取得するサンプル
 */

const request = require('request-promise-native');

const endpoint = process.env.TEST_WAITER_ENDPOINT;

request.get(
    `${endpoint}/rules`,
    {
        json: true
    }
).promise().then((response) => {
    console.log(response);
}).catch((err) => {
    console.error(err);
});
