/**
 * tokenコントローラー
 *
 * @namespace controller/passports
 */

import * as createDebug from 'debug';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';

import getSqlServerConnection from '../db/getSqlServerConnection';
import redisClient from '../db/redisClient';

import Counter from '../models/mongoose/counter';

const debug = createDebug('waiter-prototype:controller:passports');

const WAITER_SCOPE = 'waiter';
const sequenceCountUnitPerSeconds = Number(process.env.WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS);
const numberOfTokensPerUnit = Number(process.env.WAITER_NUMBER_OF_TOKENS_PER_UNIT);

/**
 * 許可証インターフェース
 * どのクライアントの、どういうスコープに対する許可なのか、という情報を持つ。
 * 実際にはパスポートがjsonwebtokenに変換されて発行されるので、パスポートの有効期間に関してはtokenが責任を持つことになる。
 *
 * @interface IPassport
 * @memberof controller/passports
 */
export interface IPassport {
    /**
     * 許可証を発行したクライアントID
     *
     * @type {string}
     * @memberof IPassport
     */
    client_id: string;
    /**
     * 許可証のスコープ
     * クライアントが設定&管理する想定
     *
     * @type {string}
     * @memberof IPassport
     */
    scope: string;
}

export async function publishWithMongo(req: Request): Promise<IPassport | null> {
    const key = createKey(WAITER_SCOPE);
    const counter = <any>await Counter.findOneAndUpdate(
        { key: key },
        { $inc: { count: +1 } },
        {
            new: true,
            upsert: true
        }
    ).lean().exec();
    debug('counter:', counter);

    if (counter.count > numberOfTokensPerUnit) {
        return null;
    } else {
        return {
            client_id: req.user.client_id,
            scope: req.body.scope
        };
    }
}

export async function publishWithRedis(req: Request): Promise<IPassport | null> {
    const key = createKey(WAITER_SCOPE);
    const ttl = sequenceCountUnitPerSeconds;

    return new Promise<IPassport | null>((resolve, reject) => {
        const multi = redisClient.multi();
        multi.incr(key, debug)
            .expire(key, ttl, debug)
            .exec(async (execErr, replies) => {
                if (execErr instanceof Error) {
                    reject(execErr);

                    return;
                }

                debug('replies:', replies);

                const count = replies[0];
                if (count > numberOfTokensPerUnit) {
                    resolve(null);
                } else {
                    resolve({
                        client_id: req.user.client_id,
                        scope: req.body.scope
                    });
                }
            });
    });
}

export async function publishWithSQLServer(req: Request): Promise<IPassport | null> {
    const pool = await getSqlServerConnection();
    const key = createKey(WAITER_SCOPE);
    const result = await pool.query`
MERGE INTO counters AS A
    USING (SELECT ${key} AS unit) AS B
    ON (A.unit = B.unit)
    WHEN MATCHED THEN
        UPDATE SET count = count + 1
    WHEN NOT MATCHED THEN
        INSERT (unit, count) VALUES (${key}, '0');
SELECT count FROM counters WHERE unit = ${key};
`;

    debug('result', result);
    // tslint:disable-next-line:no-magic-numbers
    const nextCount = parseInt(result.recordset[0].count, 10);
    debug('nextCount', nextCount);
    if (nextCount > numberOfTokensPerUnit) {
        return null;
    } else {
        return {
            client_id: req.user.client_id,
            scope: req.body.scope
        };
    }
}

/**
 * カウント単位キーを作成する
 *
 * @param {string} scope カウント単位スコープ
 * @returns {string}
 */
function createKey(scope: string) {
    const dateNow = moment();

    return `${scope}:${(dateNow.unix() - dateNow.unix() % sequenceCountUnitPerSeconds).toString()}`;
}

/**
 * トークンを生成する
 *
 * @param {IPassport} passport スコープ
 * @returns {Promise<string>}
 */
export async function createToken(passport: IPassport) {
    return new Promise<string>((resolve, reject) => {
        jwt.sign(
            passport,
            process.env.WAITER_SECRET,
            {
                expiresIn: sequenceCountUnitPerSeconds
            },
            (err, encoded) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    resolve(encoded);
                }
            }
        );
    });
}
