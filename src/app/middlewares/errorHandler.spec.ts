/**
 * エラーハンドラーミドルウェアテスト
 * @ignore
 */

import * as waiter from '@waiter/domain';
import * as assert from 'assert';
import { INTERNAL_SERVER_ERROR } from 'http-status';
import * as nock from 'nock';
import * as sinon from 'sinon';

import { APIError } from '../error/api';
import * as errorHandler from './errorHandler';

// let scope: nock.Scope;
let sandbox: sinon.SinonSandbox;

describe('errorHandler.default()', () => {
    beforeEach(() => {
        nock.cleanAll();
        nock.disableNetConnect();
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
        sandbox.restore();
    });

    it('ヘッダー送信済であればエラーと共にnextが呼ばれるはず', async () => {
        const params = {
            err: new Error('test'),
            req: {},
            res: { headersSent: true },
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(Error));

        const result = await errorHandler.default(params.err, <any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    it('APIErrorと共に呼ばれればそのままjson出力されるはず', async () => {
        const params = {
            err: new APIError(INTERNAL_SERVER_ERROR, []),
            req: {},
            res: {
                headersSent: false,
                status: () => undefined,
                json: () => undefined
            },
            next: () => undefined
        };

        sandbox.mock(params).expects('next').never();
        sandbox.mock(params.res).expects('status').once().returns(params.res);
        sandbox.mock(params.res).expects('json').once().withExactArgs({ error: params.err.toObject() }).returns(params.res);

        const result = await errorHandler.default(params.err, <any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });

    // tslint:disable-next-line:mocha-no-side-effect-code
    [
        new waiter.factory.errors.Argument(''),
        new waiter.factory.errors.ArgumentNull(''),
        new waiter.factory.errors.NotFound(''),
        new waiter.factory.errors.RateLimitExceeded()
    ].forEach((err) => {
        it(`WaiterErrorと共に呼ばれればAPIErrorが生成されてjson出力されるはず ${err.reason}`, async () => {
            const params = {
                err: err,
                req: {},
                res: {
                    headersSent: false,
                    status: () => undefined,
                    json: () => undefined
                },
                next: () => undefined
            };
            const body = {};

            sandbox.mock(params).expects('next').never();
            sandbox.mock(APIError.prototype).expects('toObject').once().returns(body);
            sandbox.mock(params.res).expects('status').once().returns(params.res);
            sandbox.mock(params.res).expects('json').once().withExactArgs({ error: body }).returns(params.res);

            const result = await errorHandler.default(params.err, <any>params.req, <any>params.res, params.next);
            assert.equal(result, undefined);
            sandbox.verify();
        });
    });
});
