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
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app/app");
let connection;
before(() => __awaiter(this, void 0, void 0, function* () {
    // 全て削除してからテスト開始
    connection = mongoose.createConnection(process.env.MONGOLAB_URI);
}));
describe('POST /token/mongodb', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/token/mongodb')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert(typeof response.body.token === 'string');
            assert(typeof response.body.expires_in === 'number');
            const decoded = jwt.verify(response.body.token, process.env.WAITER_SECRET);
            assert(typeof decoded.scope === 'string');
            assert(typeof decoded.key === 'string');
            assert(typeof decoded.count === 'number');
        });
    }));
});
describe('POST /token/redis', () => {
    it('ok', () => __awaiter(this, void 0, void 0, function* () {
        yield supertest(app)
            .post('/token/redis')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(httpStatus.OK)
            .then((response) => {
            assert(typeof response.body.token === 'string');
            assert(typeof response.body.expires_in === 'number');
            const decoded = jwt.verify(response.body.token, process.env.WAITER_SECRET);
            assert(typeof decoded.scope === 'string');
            assert(typeof decoded.key === 'string');
            assert(typeof decoded.count === 'number');
        });
    }));
});
