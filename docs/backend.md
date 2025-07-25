# API 仕様書（エンドポイント一覧）

| エンドポイント                   | メソッド | 概要・備考                                                                                                      |
| -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| /api/campaigns                   | GET      | 案件一覧取得。クエリパラメータでソート（sort）、ページネーション（page, per_page）、レコメンド（recommend）対応 |
| /api/campaigns/:id               | GET      | 案件詳細取得                                                                                                    |
| /api/campaigns/:id/entry         | POST     | 案件応募                                                                                                        |
| /api/campaigns/:id/review        | POST     | レビュー投稿                                                                                                    |
| /api/campaigns/:id/review        | GET      | レビュー一覧取得（案件ごと）                                                                                    |
| /api/users/me                    | GET      | ログインユーザー情報取得                                                                                        |
| /api/users/me/entries            | GET      | 自分の応募履歴取得                                                                                              |
| /api/users/me/reviews            | GET      | 自分のレビュー履歴取得                                                                                          |
| /api/auth/register               | POST     | 会員登録                                                                                                        |
| /api/auth/login                  | POST     | ログイン                                                                                                        |
| /api/auth/logout                 | POST     | ログアウト                                                                                                      |
| /api/admin/campaigns             | GET      | 案件管理一覧                                                                                                    |
| /api/admin/campaigns             | POST     | 案件新規作成                                                                                                    |
| /api/admin/campaigns/:id         | PATCH    | 案件編集                                                                                                        |
| /api/admin/campaigns/:id         | DELETE   | 案件削除                                                                                                        |
| /api/admin/campaigns/:id/entries | GET      | 応募者・当選者管理                                                                                              |
| /api/admin/shipments             | GET      | 配送状況一覧                                                                                                    |
| /api/admin/shipments/:id         | PATCH    | 配送状況更新                                                                                                    |
| /api/admin/reviews               | GET      | レビュー管理一覧                                                                                                |

---

## /api/campaigns GET の詳細

- クエリパラメータ例:
  - `sort` : 並び順指定（例: `new`, `popular`, `recommend` など）
  - `page` : ページ番号（例: `1`）
  - `per_page` : 1 ページあたりの件数（例: `20`）
  - `recommend` : レコメンド案件のみ取得（例: `true`）
- 例: `/api/campaigns?sort=new&page=2&per_page=20&recommend=true`
- レスポンス例:

```json
{
  "campaigns": [ ... ],
  "total": 100,
  "page": 2,
  "per_page": 20
}
```

---

※他の API も必要に応じて詳細化・拡張可能です。
