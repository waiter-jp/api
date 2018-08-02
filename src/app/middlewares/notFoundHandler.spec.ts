/**
 * not foundハンドラーミドルウェアテスト
 * @ignore
 */

import * as waiter from '@waiter/domain';
import * as assert from 'assert';
import * as nock from 'nock';
import * as sinon from 'sinon';

import * as notFoundHandler from './notFoundHandler';

let sandbox: sinon.SinonSandbox;

describe('notFoundHandler.default()', () => {
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

    it('NotFoundエラーと共にnextが呼ばれるはず', async () => {
        const params = {
            req: {},
            res: {},
            next: () => undefined
        };

        sandbox.mock(params).expects('next').once().withExactArgs(sinon.match.instanceOf(waiter.factory.errors.NotFound));

        const result = await notFoundHandler.default(<any>params.req, <any>params.res, params.next);
        assert.equal(result, undefined);
        sandbox.verify();
    });
});
