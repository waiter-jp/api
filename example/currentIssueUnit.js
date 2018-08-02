/**
 * 現在の許可証数を取得するサンプル
 */

const request = require('request-promise-native');

const endpoint = process.env.TEST_WAITER_ENDPOINT;

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 100;
const INTERVAL_MILLISECONDS = 100;

// 許可証を発行し続ける
const timer = setInterval(
    async () => {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }

        count += 1;

        try {
            await issue();
        } catch (error) {
            console.error(error.message);
        }

        count -= 1;
    },
    INTERVAL_MILLISECONDS
);

async function issue() {
    const response = await request.get(
        `${endpoint}/passports/mcdonalds/currentIssueUnit`,
        {
            json: true
        }
    ).promise();
    console.log(response);
}
