/**
 * oauthルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as supertest from 'supertest';

import * as app from '../app/app';

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

    it('ok', async () => {
        // テストデータ
        const clientId = 'motionpicture';
        const scope = ['admin'];

        await supertest(app)
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
                const decoded = jwt.verify(<string>response.body.access_token, <string>process.env.WAITER_SECRET);
                assert.deepEqual(decoded.scope, scope);
                assert.equal(decoded.client_id, clientId);
            });
    });
});
