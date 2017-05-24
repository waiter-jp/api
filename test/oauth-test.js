"use strict";
/**
 * oauthルーターテスト
 *
 * @ignore
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
const assert = require("assert");
const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const app = require("../app/app");
describe('oauthルーターテスト アクセストークン発行', () => {
    // it('存在しないクライアント', async () => {
    //     await supertest(app)
    //         .post('/oauth/token')
    //         .send({
    //             grant_type: 'password',
    //             username: 'xxx',
    //             password: 'xxx',
    //             client_id: 'xxx',
    //             scope: ['admin']
    //         })
    //         .expect(httpStatus.BAD_REQUEST)
    //         .then((response) => {
    //             assert(Array.isArray(response.body.errors));
    //         });
    // });
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        // テストデータ
        const clientId = 'motionpicture';
        const scope = ['admin'];
        yield supertest(app)
            .post('/oauth/token')
            .send({
            grant_type: 'client_credentials',
            client_id: clientId,
            scope: scope
        })
            .expect(httpStatus.OK)
            .then((response) => {
            assert.equal(typeof response.body.access_token, 'string');
            assert.equal(typeof response.body.expires_in, 'number');
            // トークンを検証したら、中身が想定通りのはず
            const decoded = jwt.verify(response.body.access_token, process.env.WAITER_SECRET);
            assert.deepEqual(decoded.scope, scope);
            assert.equal(decoded.client_id, clientId);
        });
    }));
});
