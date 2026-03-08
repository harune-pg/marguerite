# SPEC.md - 間違い探しアプリ仕様書

## 1. プロダクト概要

**プロダクト名**: まちあいさがし
**コンセプト**: 飲食店でQRコードを読み取ると、その店オリジナルの間違い探しが遊べる。料理の待ち時間を楽しい体験に変える。

**ターゲット**: 飲食店（カフェ、居酒屋、ファミレス等）の来店客
**デバイス**: 客=スマホ縦型、店=PC/タブレット

---

## 2. ユーザーフロー

### 2-1. 店側フロー（事前準備）

```
アカウント登録（店名のみでOK）→ QRコード即時発行（固定URL: /play/{store_id}）
  |
QRコードを店内に設置（印刷 or デジタル掲示）
  |
店舗情報を追加入力（ジャンル、写真、紹介文など）
  |
間違い探し画像を生成（手動トリガー）
  |
生成結果を確認 → active に切り替えて公開
```

- 登録と同時にQRコードが発行されるので、店舗詳細の入力とQRの物理設置を並行できる
- QRコードのURLは店舗IDに紐づく固定URLなので、一度設置したら変更不要
- デプロイすると、客に配信される間違い探しが切り替わる

### 2-2. 客側フロー（本番）

```
QRコード読み取り
  |
ランディング画面（店名 + 「間違い探しを始める」ボタン）
  |
間違い探し画面（上下2枚の画像、タップで回答）
  |
全問正解 or 時間切れ
  |
結果画面（スコア + 店のおすすめ情報）
```

---

## 3. 画面構成

### 3-0. プロダクトLP `/` (SHOULD)

- ヒーローセクション: キャッチコピー + サービスイメージ画像
- サービス説明: 3ステップで導入（登録 → QR設置 → お客様が遊ぶ）
- CTAボタン: 「無料で始める」→ `/admin/register` へ遷移

### 3-1. 客側画面（スマホ縦型）

#### ランディング画面 `/play/{store_id}`
- 店名表示
- 間違い探しの簡単なルール説明
- 「スタート」ボタン
- (SHOULD) 難易度選択（やさしい / むずかしい）

#### ゲーム画面
- 上下に2枚の画像を配置（元画像 / 改変画像）
- 片方を拡大・移動するともう片方も連動
- 残り間違い数の表示
- (SHOULD) 制限時間タイマー
- タップ → 正解なら間違い箇所にマーク / 不正解ならフィードバック
- タップ判定: 間違い箇所の中心から一定範囲内ならOK

#### 結果画面
- 発見数 / 全間違い数
- クリアタイム
- (SHOULD) 店のおすすめメニュー・一言メッセージ

### 3-2. 店側画面（PC/タブレット）

#### 店舗登録画面 `/admin/register`
- 店名（必須） ※ これだけでアカウント登録+QRコード発行が完了する
- 登録後、店舗管理画面にリダイレクト

#### 店舗管理画面 `/admin/stores/{store_id}`
- 初回アクセス時: 上部に「このページをブックマークしてください」バナー表示
- QRコード表示・ダウンロード（登録直後から利用可能）
- 店舗情報の入力・編集:
  - ジャンル（セレクトボックス: カフェ/居酒屋/ファミレス/ラーメン/その他）
  - 看板メニュー写真（1枚）
  - 看板メニューの説明（任意、100文字以内）
  - 店の紹介文（200文字以内）
  - (SHOULD) 店の内装写真（雰囲気を画像生成に反映）
- 間違い探し管理:
  - [画像生成] ボタン → 現在の店舗情報でベース画像+間違い画像+差分座標を一括生成（バックグラウンド実行）
  - 生成中は管理画面がポーリングで状態を監視し、完了時に自動更新
  - 生成済みベース画像のプレビュー一覧（複数保持可能、各画像の生成時の入力情報も表示）
  - 各画像ごとに active/inactive を切り替え可能
  - active な画像が客にランダムで配信される
  - (SHOULD) 1回の生成でベース画像を2〜3枚生成して選べるようにする

---

## 4. API仕様（暫定）

> 以下は暫定の目安。画像生成パイプラインの検証結果や開発中の判断で変更する前提。

### 4-1. 客向けAPI（公開）

#### `POST /api/stores/{store_id}/play`
客がゲーム開始時に呼ぶ。activeなベース画像からランダムに1つ選び、事前生成済みの間違い画像と差分座標を返す。

**Request:** ボディなし

**Response 200:**
```json
{
  "store_name": "カフェまるまる",
  "original_image_url": "/static/images/{base_image_id}/original.png",
  "modified_image_url": "/static/images/{base_image_id}/modified.png",
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

- `cx`, `cy`: 間違い箇所の中心（画像幅・高さに対する%、0-100）
- `radius`: 判定半径（画像長辺に対する%）
- activeな画像が複数あればランダムに選ばれるため、プレイごとに異なる問題が出る

**Response 404:** 店舗が存在しない or アクティブなベース画像がない

### 4-2. 店舗管理API

#### `POST /api/stores`
店舗登録（店名のみで可）。

**Request:**
```json
{
  "name": "カフェまるまる"
}
```

**Response 200:**
```json
{
  "store_id": 1,
  "name": "カフェまるまる"
}
```

#### `GET /api/stores/{store_id}`
店舗情報取得。

#### `PUT /api/stores/{store_id}`
店舗情報更新（ジャンル、写真、紹介文などを後から追加）。

**Request (multipart/form-data):**
- `genre`: string（任意）
- `photo`: file（任意、看板メニュー写真）
- `description`: string（任意）

#### `POST /api/stores/{store_id}/base-images/generate`
画像生成をトリガー。現在の店舗情報でベース画像+セグメント分割+間違い画像+差分座標を一括生成する（バックグラウンド実行）。

**Response 200:** 生成開始。BaseImageレコードが作成される（image_urlは空、生成完了後に更新される）。
```json
{
  "base_image_id": "abc123",
  "store_id": 1,
  "image_url": "",
  "segments": null,
  "generation_input": {...},
  "is_active": false,
  "created_at": "2026-03-08T12:00:00Z"
}
```
FE側は5秒間隔でベース画像一覧をポーリングし、`image_url`が空でなくなったら生成完了と判断する。

#### `GET /api/stores/{store_id}/base-images`
生成済みベース画像一覧。

**Response 200:**
```json
{
  "base_images": [
    {
      "base_image_id": "abc123",
      "image_url": "...",
      "generation_input": {"store_name": "...", "genre": "...", ...},
      "is_active": true,
      "created_at": "2026-03-07T12:00:00Z"
    }
  ]
}
```

#### `PATCH /api/stores/{store_id}/base-images/{base_image_id}`
ベース画像のactive/inactiveを切り替える。

**Request:**
```json
{
  "is_active": true
}
```

---

## 5. DB設計（暫定）

> API仕様と同様、暫定の目安。

### stores テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | int (autoincrement) | PK |
| name | string | 店名 |
| genre | string nullable | ジャンル |
| photo_url | string nullable | 看板メニュー写真パス |
| menu_description | string nullable | 看板メニューの説明 |
| description | string nullable | 紹介文 |
| created_at | datetime | |
| updated_at | datetime | |

### base_images テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | string (UUID) | PK |
| store_id | int | FK → stores.id |
| image_url | string | ベース画像パス |
| segments | JSON | セグメント分割データ |
| generation_input | JSON | 生成時の店舗情報スナップショット |
| is_active | boolean | 客に配信中か（default: false） |
| created_at | datetime | |

### segments JSON構造
画像生成パイプライン完了後にBaseImageのsegmentsカラムに格納される。
```json
{
  "modified_image_url": "/static/images/{base_image_id}/modified.png",
  "image_size": {"w": 1024, "h": 768},
  "differences": [
    {"cx": 25.5, "cy": 30.2, "radius": 5.0},
    {"cx": 70.1, "cy": 65.8, "radius": 4.5},
    {"cx": 50.0, "cy": 80.0, "radius": 6.0}
  ],
  "diffs_detail": [...]
}
```
- `modified_image_url`: 間違いが仕込まれた画像のパス
- `differences`: 間違い箇所の座標（play APIでそのまま返される）

---

## 6. 画像生成パイプライン

### 方針
- **メイン**: セグメント + インペイント方式（方針A）
- **フォールバック**: デモ用画像を事前準備（方針C）

### パイプラインの流れ（1段階・一括生成）

店側が「生成する」ボタンを押すと、バックグラウンドで以下が一括実行される。

```
Input: 店舗情報（名前、ジャンル、写真、紹介文）
  |
[Step 1] プロンプト生成
  店舗情報からイラスト用プロンプトを生成
  |
[Step 2] ベース画像生成
  OpenAI API (gpt-image-1) でイラストを生成
  |
[Step 3] セグメント分割
  Flood fill で領域分割 → GPT-4o Vision でラベル付け
  |
[Step 4] 間違い箇所の選択 + インペイント
  3箇所を選択し、OpenAI API でインペイント → 差分画像を生成
  |
[Step 5] 差分座標の算出
  変更した箇所の中心座標・サイズを記録
  |
Output: 元画像 (original.png)、間違い画像 (modified.png)、差分座標
  → static/images/{base_image_id}/ に保存
  → DBのBaseImageレコードを更新（image_url, segments）
```

- 生成完了後、管理画面で active に切り替えると客に配信される
- 気に入らなければ再度「生成する」で新しい画像セットを生成可能

---

## 7. 技術スタック

| レイヤー | 技術 | 備考 |
|----------|------|------|
| FE | React (+ TypeScript) | AI agentで開発。ゲーム画面のタッチ操作に use-gesture 等を活用 |
| BE | FastAPI (Python) | Kさん担当 |
| DB | SQLite | MVPにはこれで十分 |
| 画像生成 | OpenAI API (gpt-image-1) + Flood fill + GPT-4o Vision | |
| QRコード | qrcode.react（FEで生成） | BE不要 |
| デプロイ | 未定（ローカル実行でも可） | |

---

## 8. MVPスコープ（再掲）

### MUST
- 客側: QR読み取り → ゲーム画面 → プレイ → 結果画面
- 店側: 店舗登録 → QRコード発行 → 間違い探し管理 → デプロイ
- 間違い探し: 一括生成方式（ベース画像+間違い画像+差分座標を一括生成）
- スマホ縦型対応UI

### SHOULD
- 難易度選択（やさしい / むずかしい）
- 制限時間タイマー
- 結果画面に店舗プロモーション
- 間違い発見時のエフェクト
- QRコードにテーブル番号を含める（`/play/{store_id}?table=5`）→ 利用データ収集の土台
- プロダクトLP（`/`）

### WON'T
- 待ち時間連動の難易度自動調整
- QR読み取り角度による難易度変化
- ランキング / リーダーボード
- 認証機能