# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## Unreleased

### Added

### Changed

- package.jsonの対応Node.jsバージョンを調整

### Deprecated

### Removed

### Fixed

### Security

## v3.4.0 - 2020-03-27

### Added

- ヘルスチェックエンドポイントを追加

### Changed

- MongoDBコネクション監視調整

## v3.3.0 - 2019-07-18

### Added

- JsonWebToken自体の期限調整機能を追加

## v3.2.0 - 2019-03-15

### Added

- 許可証発行規則にて利用可能期間をポジティブリストとして指定することができるように機能追加

## v3.1.0 - 2019-02-09

### Changed

- プロジェクトと規則のマスタデータをMongoDBに保管するように変更

## v3.0.0 - 2018-11-30

### Added

- 発行規則をプロジェクト単位で管理できるように対応
- 発行規則にクライアント設定を追加

## v2.0.0 - 2017-08-02

### Added

- 発行規則取得エンドポイントを追加。
- 現在の発行単位取得エンドポイントを追加。

### Changed

- マルチ発行規則を設定できるように対応。
- [@waiter/domain](https://www.npmjs.com/package/@waiter/domain)をインストール。

### Removed

- クライアント認証を削除。

## v1.0.0 - 2017-07-10

### Added

- ファーストリリース
