/**
 * oauthルーター
 *
 * @ignore
 */

import * as express from 'express';
const oauthRouter = express.Router();

import * as createDebug from 'debug';
import * as jwt from 'jsonwebtoken';

import validator from '../middlewares/validator';

const debug = createDebug('waiter-prototype:router:oauth');
// todo どこで定義するか
const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 1800;

oauthRouter.post(
    '/token',
    (req, _, next) => {
        req.checkBody('grant_type', 'invalid grant_type').notEmpty().withMessage('grant_type is required')
            .equals('client_credentials');
        req.checkBody('client_id', 'invalid client_id').notEmpty().withMessage('client_id is required');
        req.checkBody('scope', 'invalid scope').notEmpty().withMessage('scope is required');

        next();
    },
    validator,
    async (req, res, next) => {
        try {
            // client_idの存在確認
            // const numberOfClient = await chevre.Models.Client.count({ _id: req.body.client_id }).exec();
            // debug('numberOfClient:', numberOfClient);
            // if (numberOfClient === 0) {
            //     throw new Error('client not found');
            // }

            // jsonwebtoken生成
            // client情報をトークンに含める必要あり
            jwt.sign(
                {
                    client_id: req.body.client_id,
                    scope: req.body.scope
                },
                process.env.WAITER_SECRET,
                {
                    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                },
                (err, encoded) => {
                    debug(err, encoded);
                    if (err instanceof Error) {
                        throw err;
                    } else {
                        debug('encoded is', encoded);

                        res.json({
                            access_token: encoded,
                            token_type: 'Bearer',
                            expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS
                        });
                    }
                }
            );
        } catch (error) {
            next(error);
        }
    });

export default oauthRouter;
