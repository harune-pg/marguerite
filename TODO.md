# TODO - Backend

上から順にやっていく。各タスクが終わったらチェックを入れる。
Swagger UI (http://localhost:8000/docs) で動作確認できる。

## 環境確認
- [ ] `uv run uvicorn app.main:app --reload` で起動確認
- [ ] ブラウザで http://localhost:8000/docs にアクセスしてSwagger UIが表示されることを確認
- [ ] `GET /` を叩いて `{"status": "ok"}` が返ることを確認

## Phase 1: 店舗CRUD

### POST /api/stores（店舗登録）
- [ ] リクエスト: `{"name": "テスト店舗"}`
- [ ] uuid4 で id を生成し、DBにstoreレコードを作成
- [ ] レスポンス: `{"store_id": "...", "name": "テスト店舗"}`

### GET /api/stores/{store_id}（店舗情報取得）
- [ ] store_id でDBを検索して返す
- [ ] 見つからなければ 404 を返す

### PUT /api/stores/{store_id}（店舗情報更新）
- [ ] genre, menu_description, description を更新できるようにする
- [ ] 見つからなければ 404 を返す
- [ ] 写真アップロードは後回しでOK（別途ライブラリが必要）

## Phase 2: ベース画像管理

### GET /api/stores/{store_id}/base-images（一覧取得）
- [ ] store_id に紐づく base_images を全件返す

### PATCH /api/stores/{store_id}/base-images/{base_image_id}（active切替）
- [ ] リクエスト: `{"is_active": true}`
- [ ] is_active を更新して返す
- [ ] 見つからなければ 404

### POST /api/stores/{store_id}/base-images/generate（mock）
- [ ] ダミーの base_image レコードをDBに作成
  - image_url: "/images/mock/sample.png"
  - segments: mockのJSON（CLAUDE.md参照）
  - generation_input: その時点の店舗情報をJSONで保存
- [ ] 作成したレコードを返す

## Phase 3: ゲームAPI

### POST /api/stores/{store_id}/play（mock）
- [ ] active な base_image からランダムに1つ選ぶ
- [ ] active な画像がなければ 404
- [ ] ダミーの differences と一緒にレスポンスを返す（CLAUDE.mdのmock例を参照）

## Phase 4: 余裕があれば
- [ ] PUT /api/stores/{store_id} で写真アップロード対応（python-multipart が必要: `uv add python-multipart`）
- [ ] 静的ファイル配信の設定（アップロードされた画像を返す）
- [ ] CORS設定（フロントエンドとの結合時に必要）
