/**
 * グローバルヘルパー
 *
 * @ignore
 */

import * as httpStatus from 'http-status';
import * as supertest from 'supertest';
import * as app from '../app/app';

before(async () => {
    // todo テスト用のオーナーとクライアントを生成

    await supertest(app)
        .post('/oauth/token')
        .send({
            grant_type: 'client_credentials',
            client_id: 'motionpicture',
            scope: ['admin']
        })
        .expect(httpStatus.OK)
        .then((response) => {
            // 全てのテストで必要なテスト用アクセストークン環境変数に入れる
            process.env.TEST_ACCESS_TOKEN = response.body.access_token;
        });
});
