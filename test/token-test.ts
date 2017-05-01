/**
 * tokenルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as mongoose from 'mongoose';
import * as supertest from 'supertest';

import * as app from '../app/app';

let connection: mongoose.Connection;
before(async () => {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
});

describe('POST /token/mongodb', () => {
    it('ok', async () => {
        await supertest(app)
            .post('/token/mongodb')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.token === 'string');
                assert(typeof response.body.expires_in === 'number');

                const decoded = jwt.verify(<string>response.body.token, <string>process.env.WAITER_SECRET);
                assert(typeof decoded.scope === 'string');
                assert(typeof decoded.place === 'number');
            });
    });
});

describe('POST /token/redis', () => {
    it('ok', async () => {
        await supertest(app)
            .post('/token/redis')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.token === 'string');
                assert(typeof response.body.expires_in === 'number');

                const decoded = jwt.verify(<string>response.body.token, <string>process.env.WAITER_SECRET);
                assert(typeof decoded.scope === 'string');
                assert(typeof decoded.place === 'number');
            });
    });
});
