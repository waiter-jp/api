# WAITER[サイト流入量コントロールシステム]

[![CircleCI](https://circleci.com/gh/motionpicture/waiter.svg?style=svg)](https://circleci.com/gh/motionpicture/waiter)
[![Known Vulnerabilities](https://snyk.io/test/github/motionpicture/waiter/badge.svg)](https://snyk.io/test/github/motionpicture/waiter)
[![Coverage Status](https://coveralls.io/repos/github/motionpicture/waiter/badge.svg)](https://coveralls.io/github/motionpicture/waiter)

## Table of contents

* [Background](#background)
* [Requirement](#requirement)
* [Usage](#usage)
* [Jsdoc](#jsdoc)
* [License](#license)

## Background
- チケット購入サイトへのアクセスがある量感を超えると、システムで受け止め切ることは簡単でない。
- インフラにコストをかけることで解決するのは簡単だが、コストに限度のないケースは少ない。
- GMO、SendGrid等、外部サービスと連携するシステムをつくる以上、外部サービス側の限度を考慮する必要がある。
- アプリケーション(ソフトウェア)のレベルでできる限りのことはしたい。

## Requirement
- 本システムにかかる負荷と、フロントエンドアプリケーション側のインフラ(ウェブサーバー、DBサーバー)への負荷が分離していること。
- 厳密にコントロールできる、というよりは、2017/07あたりに間に合わせる、かつ、**それなりに有効**であることが大事。
- フロントウェブサーバーに負荷をかけられないため、クライアントサイドから呼び出せることが必須。

## Usage

### インフラ
#### web server
node.js application  
- iis on [Azure WebApps](https://azure.microsoft.com/ja-jp/services/app-service/web/)
- nginx on [GCP AppEngine](https://cloud.google.com/appengine/?hl=ja)
- nginx on [AWS elastic beanstalk](https://aws.amazon.com/jp/elasticbeanstalk/)

#### DB
- Redis Cache

### Environment variables

| Name                     | Required | Purpose                                   | Value    |
| ------------------------ | -------- | ----------------------------------------- | -------- |
| `DEBUG`                  | false    | Debug                                     | waiter:* |
| `NODE_ENV`               | true     | 許可証暗号化の秘密鍵                       |          |
| `WAITER_PASSPORT_ISSUER` | true     | 許可証発行者識別子(通常発行APIのドメインを指定) |          |
| `WAITER_RULES`           | true     | 発行規則リスト                               |          |
| `WAITER_SECRET`          | true     | 許可証暗号化の秘密鍵                       |          |
| `REDIS_HOST`             | true     | Redis Cache接続ホスト                        |          |
| `REDIS_PORT`             | true     | Redis Cache接続ポート                        |          |
| `REDIS_KEY`              | true     | Redis Cache接続キー                         |          |

## Jsdoc

`npm run doc`でjsdocを作成できます。./docに出力されます。

## License

ISC
