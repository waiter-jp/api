"use strict";
/**
 * tokenルーターテスト
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
const supertest = require("supertest");
const app = require("../app/app");
describe('mongodbでトークン発行', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const scope = 'payment';
        yield supertest(app)
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
    }));
});
describe('redis cacheでトークン発行', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const scope = 'payment';
        yield supertest(app)
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
    }));
});
describe('sqlserverでトークン発行', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        const scope = 'payment';
        yield supertest(app)
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
    }));
});
