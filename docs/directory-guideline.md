# ディレクトリ構成ガイドライン（Rails 単一構成）

## 基本方針

- Rails のみでバックエンド・フロントエンド（画面）を一貫して構築する。
- "見た目（UI/テンプレート/スタイル）"と"データ（モデル/ロジック/API）"は明確に分離する。
- 保守性・拡張性・役割分担を意識したディレクトリ設計とする。

---

## 推奨ディレクトリ構成

```
app/
  controllers/      # データ制御（API/画面ロジック）
  models/           # 業務ロジック・DBアクセス
  views/            # 見た目（ERBテンプレート/UI部品）
  components/       # UIコンポーネント（Viewの部品化、lookbook連携）
  services/         # 複雑な業務ロジック・外部連携
  helpers/          # View/Controller補助関数
  mailers/          # メール送信ロジック
  jobs/             # 非同期ジョブ（Sidekiq等）

config/             # 設定ファイル（DB, 環境変数, ルーティング等）
db/                 # マイグレーション・schema
public/             # 静的ファイル（画像・JS・CSS等）
lib/                # 拡張モジュール・独自ライブラリ
spec/               # RSpecテスト
lookbook/           # UIカタログ・ドキュメント

.env                # 環境変数
.gitignore          # Git管理除外
```

---

## 分離のポイント

- **controllers/**: データ制御（API/画面遷移/入力処理）を担う。UI ロジックは持たず、View や Component に委譲。
- **views/**: 見た目（ERB テンプレート）を担う。データ取得・ロジックは Controller/Helper/Component に委譲。
- **components/**: UI 部品（ボタン・カード・フォーム等）を View から独立して管理。lookbook でカタログ化。
- **models/**: 業務ロジック・DB アクセスのみ。画面や UI の責務は持たない。
- **services/**: 複雑な処理や外部 API 連携はここに集約。
- **helpers/**: View/Controller の補助関数。UI/データの責務分離を意識。

---

## 運用例

- 新規画面追加時は、Controller・View・Component をそれぞれ分離して作成。
- UI 部品は components/配下で管理し、lookbook でドキュメント化。
- データ取得・業務ロジックは Controller/Model/Service で管理。
- スタイル（daisyUI 等）は public/や View/Component で利用。

---

## 管理者画面とユーザ用画面の分離方針

- 管理者向け画面（管理ダッシュボード等）は `app/controllers/admin/`, `app/views/admin/`, `app/components/admin/` など `admin/` サブディレクトリで分離管理。
- ユーザ向け画面は通常の `app/controllers/`, `app/views/`, `app/components/` 配下で管理。
- ルーティングも `/admin/` プレフィックスで分離し、ActiveAdmin 等の管理系は `config/routes.rb` で明示的に分離。
- 管理者用の認証（Devise 等）はユーザ用と分離し、権限管理を徹底。
- 管理者用 UI 部品も `components/admin/` で独立管理し、lookbook でカタログ化可能。
- テスト（spec/）も `spec/controllers/admin/` などで分離。

### ディレクトリ例

```
app/
  controllers/
    admin/         # 管理者用コントローラ
    ...            # ユーザ用コントローラ
  views/
    admin/         # 管理者用画面テンプレート
    ...            # ユーザ用画面テンプレート
  components/
    admin/         # 管理者用UI部品
    ...            # ユーザ用UI部品
```

---

## ポイント

- 管理者・ユーザの責務・UI・認証を明確に分離し、保守性・セキュリティを高める。
- サブディレクトリ分離により、役割ごとのコード管理・レビューが容易。
