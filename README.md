# WAITER[サイト流入量コントロールシステム]

## プロジェクト背景
- チケット購入サイトへのアクセスがある量感を超えると、システムで受け止め切ることは簡単でない。
ムで受け止め切ることは簡単でないことを知る。
- インフラにコストをかけることで解決するのは簡単だが、コストに限度のないケースは少ない。
- GMO、SendGrid等、外部サービスと連携するシステムをつくる以上、外部サービス側の限度を考慮する必要がある。
- アプリケーション(ソフトウェア)のレベルでできる限りのことはしたい。

## 要件
- 本システムにかかる負荷と、フロントエンドアプリケーション側のインフラ(ウェブサーバー、DBサーバー)への負荷が分離していること。
- 厳密にコントロールできる、というよりは、2017/07あたりに間に合わせる、かつ、**それなりに有効**であることが大事。
- フロントウェブサーバーに負荷をかけられないため、クライアントサイドから呼び出せることが必須。

## Getting Started

### インフラ
#### web server
node.js application  
- iis on [Azure WebApps](https://azure.microsoft.com/ja-jp/services/app-service/web/)
- nginx on [GCP AppEngine](https://cloud.google.com/appengine/?hl=ja)
- nginx on [AWS elastic beanstalk](https://aws.amazon.com/jp/elasticbeanstalk/)

#### DB
- SQL Server
- MongoDB
- Redis Cache

### 言語
[TypeScript](https://www.typescriptlang.org/)

### 開発方法
npmでパッケージをインストール。

```shell
npm install
```
[npm](https://www.npmjs.com/)

typescriptをjavascriptにコンパイル。

```shell
npm run build -- -w
```

npmでローカルサーバーを起動。

```shell
npm start
```

[localhost](http://localhost:8080)にアクセス。


### Required environment variables
```shell
set NODE_ENV=**********環境名**********
set MONGOLAB_URI=**********MongoDB接続文字列**********
set REDIS_HOST=**********Redis Cache接続ホスト**********
set REDIS_PORT=**********Redis Cache接続ポート**********
set REDIS_KEY=**********Redis Cache接続キー**********
set SQL_SERVER_USERNAME=**********SQL Serverユーザーネーム**********
set SQL_SERVER_PASSWORD=**********SQL Serverパスワード**********
set SQL_SERVER_SERVER=**********SQL Serverサーバー**********
set SQL_SERVER_DATABASE=**********SQL Serverデータベース**********
set WAITER_SECRET=**********JWTシークレット**********
set WAITER_SEQUENCE_COUNT_UNIT_IN_SECONDS=**********カウンターリセット単位(秒)**********
set WAITER_NUMBER_OF_TOKENS_PER_UNIT=**********カウンター単位あたりの発行トークン数**********
set WAITER_DEVELOPER_EMAIL=**********環境名**********
```

only on Aure WebApps

```shell
set WEBSITE_NODE_DEFAULT_VERSION=**********node.jsバージョン**********
set WEBSITE_TIME_ZONE=Tokyo Standard Time
```

DEBUG

```shell
set DEBUG=waiter-prototype:*
```



## tslint

コード品質チェックをtslintで行う。
* [tslint](https://github.com/palantir/tslint)
* [tslint-microsoft-contrib](https://github.com/Microsoft/tslint-microsoft-contrib)

`npm run check`でチェック実行。改修の際には、必ずチェックすること。


## clean
`npm run clean`で不要なソース削除。


## test
`npm test`でチェック実行。


## versioning
`npm version patch -f -m "enter your commit comment..."`でチェック実行。
