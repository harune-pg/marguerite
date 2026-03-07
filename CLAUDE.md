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

## mockの方針
画像生成パイプラインは別途開発中。以下のAPIはmockレスポンスを返す:

### POST /api/stores/{store_id}/base-images/generate
- ダミーの base_image レコードをDBに作成して返す
- image_url は仮の文字列（例: "/images/mock/sample.png"）
- segments は仮のJSON
- generation_input にその時点の店舗情報を保存

### POST /api/stores/{store_id}/play
- active な base_image からランダムに1つ選ぶ
- ダミーの differences を返す
- レスポンス例:
```json
{
  "store_name": "テスト店舗",
  "original_image_url": "/images/mock/original.png",
  "modified_image_url": "/images/mock/modified.png",
  "differences": [
    {"cx": 25.5, "cy": 30.2, "radius": 5.0},
    {"cx": 70.1, "cy": 65.8, "radius": 4.5},
    {"cx": 50.0, "cy": 80.0, "radius": 6.0}
  ],
  "store_info": {
    "genre": "カフェ",
    "recommendation": "自家焙煎コーヒー",
    "description": "駅前の隠れ家カフェ"
  }
}
```
