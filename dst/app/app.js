"use strict";
/**
 * Expressアプリケーション
 * @module
 */
const bodyParser = require("body-parser");
const cors = require("cors");
const createDebug = require("debug");
const express = require("express");
const expressValidator = require("express-validator");
const helmet = require("helmet");
const errorHandler_1 = require("./middlewares/errorHandler");
const notFoundHandler_1 = require("./middlewares/notFoundHandler");
const passports_1 = require("./routes/passports");
const rules_1 = require("./routes/rules");
const debug = createDebug('waiter:*');
const app = express();
app.use(cors()); // enable All CORS Requests
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ['\'self\'']
        // styleSrc: ['\'unsafe-inline\'']
    }
}));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
const SIXTY_DAYS_IN_SECONDS = 5184000;
app.use(helmet.hsts({
    maxAge: SIXTY_DAYS_IN_SECONDS,
    includeSubdomains: false
}));
if (process.env.NODE_ENV !== 'production') {
    // サーバーエラーテスト
    app.get('/dev/uncaughtexception', (req) => {
        req.on('data', (chunk) => {
            debug(chunk);
        });
        req.on('end', () => {
            throw new Error('uncaughtexception manually');
        });
    });
}
app.use(bodyParser.json());
// The extended option allows to choose between parsing the URL-encoded data
// with the querystring library (when false) or the qs library (when true).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator({})); // this line must be immediately after any of the bodyParser middlewares!
// 静的ファイル
// app.use(express.static(__dirname + '/../../public'));
// routers
app.use('/rules', rules_1.default);
app.use('/passports', passports_1.default);
// 404
app.use(notFoundHandler_1.default);
// error handlers
app.use(errorHandler_1.default);
module.exports = app;
