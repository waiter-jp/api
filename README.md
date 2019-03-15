# Waiter 許可証発行サービス

[![CircleCI](https://circleci.com/gh/waiter-jp/api.svg?style=svg)](https://circleci.com/gh/waiter-jp/api)
[![Known Vulnerabilities](https://snyk.io/test/github/waiter-jp/api/badge.svg)](https://snyk.io/test/github/waiter-jp/api)
[![Coverage Status](https://coveralls.io/repos/github/waiter-jp/api/badge.svg)](https://coveralls.io/github/waiter-jp/api)

## Table of contents

* [Background](#background)
* [Requirement](#requirement)
* [Usage](#usage)
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

#### Web Server

Node.js Application  
- Nginx on [Azure WebApps](https://azure.microsoft.com/ja-jp/services/app-service/web/)
- Nginx on [GCP AppEngine](https://cloud.google.com/appengine/?hl=ja)
- Nginx on [AWS elastic beanstalk](https://aws.amazon.com/jp/elasticbeanstalk/)

#### DB

- MongoDB
- Redis Cache

### Environment variables

| Name                                 | Required | Purpose                                         | Value    |
| ------------------------------------ | -------- | ----------------------------------------------- | -------- |
| `DEBUG`                              | false    | Debug                                           | waiter:* |
| `NODE_ENV`                           | true     | 環境名                                          |          |
| `WAITER_PASSPORT_ISSUER`             | true     | 許可証発行者識別子(通常発行APIのドメインを指定) |          |
| `INITIALIZE_IN_MEMORY_DATA_INTERVAL` | true     | インメモリデータ初期化インターバル              |          |
| `MONGOLAB_URI`                       | true     | MongoDB接続URI                                  |          |
| `WAITER_SECRET`                      | true     | 許可証暗号化の秘密鍵                            |          |
| `REDIS_HOST`                         | true     | Redis Cache接続ホスト                           |          |
| `REDIS_PORT`                         | true     | Redis Cache接続ポート                           |          |
| `REDIS_KEY`                          | true     | Redis Cache接続キー                             |          |

## License

ISC
