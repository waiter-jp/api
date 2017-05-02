/**
 * tokenルーターテスト
 *
 * @ignore
 */

// import * as httpStatus from 'http-status';
import * as supertest from 'supertest';

import * as app from '../app/app';

before(async () => {
});

describe('POST /token/sqlserver', () => {
    it('ok', async () => {
        await supertest(app)
            .post('/token/sqlserver')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/);
        // .expect(httpStatus.OK)
        // .then((response) => {
        // });
    });
});
