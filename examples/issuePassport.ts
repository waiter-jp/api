/**
 * 許可証を発行するサンプル
 */

import * as request from 'request-promise-native';

// tslint:disable-next-line:no-http-string
const endpoint = 'http://localhost:8081';

let count = 0;

const MAX_NUBMER_OF_PARALLEL_TASKS = 100;
const INTERVAL_MILLISECONDS = 500;

let accessToken: string;

// アクセストークン発行
request.post(
    `${endpoint}/oauth/token`,
    {
        body: {
            grant_type: 'client_credentials',
            client_id: 'motionpicture',
            scope: ['admin']
        },
        json: true
    }
).promise().then((response) => {
    accessToken = response.access_token;

    // 許可証を発行し続ける
    setInterval(
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
});

async function issue() {
    const response = await request.post(
        `${endpoint}/passports?db=mongodb`,
        {
            auth: {
                bearer: accessToken
            },
            body: {
                scope: 'testscope'
            },
            json: true
        }
    ).promise();
    // tslint:disable-next-line:no-console
    console.log(response);
}
