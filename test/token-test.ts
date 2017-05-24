/**
 * tokenルーターテスト
 *
 * @ignore
 */

import * as assert from 'assert';
import * as httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import * as supertest from 'supertest';

import * as app from '../app/app';

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
                assert(typeof decoded.key === 'string');
                assert(typeof decoded.count === 'number');
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
                assert(typeof decoded.key === 'string');
                assert(typeof decoded.count === 'number');
            });
    });
});

// describe('POST /token/sqlserver', () => {
//     it('ok', async () => {
//         await supertest(app)
//             .post('/token/sqlserver')
//             .set('Accept', 'application/json')
//             .expect('Content-Type', /json/)
//             .expect(httpStatus.OK)
//             .then((response) => {
//                 assert(typeof response.body.token === 'string');
//                 assert(typeof response.body.expires_in === 'number');

//                 const decoded = jwt.verify(<string>response.body.token, <string>process.env.WAITER_SECRET);
//                 assert(typeof decoded.scope === 'string');
//                 assert(typeof decoded.key === 'string');
//                 assert(typeof decoded.count === 'number');
//             });
//     });
// });
