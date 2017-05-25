"use strict";
/**
 * 許可証を発行するサンプル
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise-native");
// tslint:disable-next-line:no-http-string
const endpoint = 'http://localhost:8081';
let count = 0;
const MAX_NUBMER_OF_PARALLEL_TASKS = 100;
const INTERVAL_MILLISECONDS = 500;
let accessToken;
// アクセストークン発行
request.post(`${endpoint}/oauth/token`, {
    body: {
        grant_type: 'client_credentials',
        client_id: 'motionpicture',
        scope: ['admin']
    },
    json: true
}).promise().then((response) => {
    accessToken = response.access_token;
    // 許可証を発行し続ける
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        if (count > MAX_NUBMER_OF_PARALLEL_TASKS) {
            return;
        }
        count += 1;
        try {
            yield issue();
        }
        catch (error) {
            console.error(error.message);
        }
        count -= 1;
    }), INTERVAL_MILLISECONDS);
});
function issue() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield request.post(`${endpoint}/passports?db=mongodb`, {
            auth: {
                bearer: accessToken
            },
            body: {
                scope: 'testscope'
            },
            json: true
        }).promise();
        // tslint:disable-next-line:no-console
        console.log(response);
    });
}
