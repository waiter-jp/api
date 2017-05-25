/**
 * tokenルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

describe('mongodbでトークン発行', () => {
    it('ok', async () => {
        const scope = 'payment';
        await supertest(app)
            .post('/passports?db=mongodb')
            .set('authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send({
                scope: scope
            })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.token === 'string');
                // assert(typeof response.body.expires_in === 'number');
            });
    });
});

describe('redis cacheでトークン発行', () => {
    it('ok', async () => {
        const scope = 'payment';
        await supertest(app)
            .post('/passports?db=redis')
            .set('authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send({
                scope: scope
            })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.token === 'string');
                // assert(typeof response.body.expires_in === 'number');
            });
    });
});

describe('sqlserverでトークン発行', () => {
    it('ok', async () => {
        const scope = 'payment';
        await supertest(app)
            .post('/passports?db=sqlserver')
            .set('authorization', `Bearer ${process.env.TEST_ACCESS_TOKEN}`)
            .set('Accept', 'application/json')
            .send({
                scope: scope
            })
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
                assert(typeof response.body.token === 'string');
                // assert(typeof response.body.expires_in === 'number');
            });
    });
});
