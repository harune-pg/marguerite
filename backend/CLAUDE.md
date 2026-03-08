# Backend - まちあいさがし

## プロジェクト概要
飲食店の待ち時間に遊べる間違い探しアプリ「まちあいさがし」のバックエンドAPI。

## 技術スタック
- Python 3.11+
- FastAPI
- SQLModel (ORM + バリデーション)
- SQLite
- uv (パッケージ管理)

## 起動方法
```bash
uv run uvicorn app.main:app --reload
```
起動後 http://localhost:8000/docs でSwagger UIを確認できる。

## 開発方針
- ORM/バリデーション: SQLModel を使う（FastAPI公式推奨、SQLAlchemy + Pydantic の統合）
- エラーハンドリング: FastAPI の HTTPException を使う
- ID生成: uuid4 で文字列として生成
- 画像生成パイプライン: 未完成のため mock で実装する（TODO.md参照）

## API仕様（暫定）
詳細は ~/marguerite_spec/SPEC.md を参照。

### 店舗管理API
- `POST /api/stores` — 店舗登録（店名のみ）
- `GET /api/stores/{store_id}` — 店舗情報取得
- `PUT /api/stores/{store_id}` — 店舗情報更新

### ベース画像管理API
- `POST /api/stores/{store_id}/base-images/generate` — ベース画像生成（mock）
- `GET /api/stores/{store_id}/base-images` — ベース画像一覧
- `PATCH /api/stores/{store_id}/base-images/{base_image_id}` — active/inactive切替

### 客向けAPI
- `POST /api/stores/{store_id}/play` — 間違い探し開始（mock）

## DB設計（暫定）

### stores
| カラム | 型 | 説明 |
|--------|-----|------|
| id | str (UUID) | PK |  <!-- 普通にインクリメントでもいいと思う -->
| name | str | 店名 |
| genre | str / None | ジャンル |
| photo_url | str / None | 看板メニュー写真パス |
| menu_description | str / None | 看板メニューの説明 |
| description | str / None | 店の紹介文 |
| created_at | datetime | |
| updated_at | datetime | |

### base_images
| カラム | 型 | 説明 |
|--------|-----|------|
| id | str (UUID) | PK |
| store_id | str | FK → stores.id |
| image_url | str | ベース画像パス |
| segments | JSON / None | セグメント分割データ |
| generation_input | JSON / None | 生成時の店舗情報スナップショット |
| is_active | bool | 客に配信中か（default: False） |
| created_at | datetime | |

## 画像パイプラインとの繋ぎ込み

画像生成パイプライン (`~/marguerite_spec/image-pipeline/`) の出力をシードデータとして投入する。

### セットアップ手順
```bash
# DBリセット & シード投入
rm -f database.db
uv run python seed.py
```

### seed.py の動作
1. `image-pipeline/seeds/stores.json` から店舗情報を読み込み
2. `image-pipeline/output/store_N/` から画像・diffs.jsonを読み込み
3. 画像を `static/images/store_N/` にコピー
4. bbox座標 (px) → cx/cy/radius (%) に変換
5. Store + BaseImage (is_active=True) をDBに登録

### POST /api/stores/{store_id}/play
- active な base_image からランダムに1つ選ぶ
- `base_image.segments` に格納された実データを返す
- レスポンス例:
```json
{
  "store_name": "酒肴処 赤提灯 よりみち",
  "original_image_url": "/static/images/store_1/original.png",
  "modified_image_url": "/static/images/store_1/modified.png",
  "differences": [
    {"cx": 84.4, "cy": 79.6, "radius": 7.6},
    {"cx": 96.9, "cy": 21.7, "radius": 14.5},
    {"cx": 17.6, "cy": 58.7, "radius": 4.5}
  ],
  "store_info": {
    "genre": "居酒屋",
    "recommendation": "炙りしめ鯖",
    "description": "路地裏の昭和レトロな居酒屋..."
  }
}
```

### POST /api/stores/{store_id}/base-images/generate
- 現時点ではmock（ダミーレコード作成のみ）
- パイプラインはローカル実行(Apple Silicon + MLX)が必要なため、将来的に非同期ジョブとして統合予定

### 座標系
- `cx`, `cy`: 画像左上原点、%座標 (0-100)
- `radius`: 画像長辺に対する%
- タップ判定: タップ位置が (cx, cy) から radius% 以内なら正解
