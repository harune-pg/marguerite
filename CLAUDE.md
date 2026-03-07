# まちあいさがし

飲食店の待ち時間に遊べる間違い探しアプリ。ハッカソン（2026/3/7-8）で開発中。

## 仕様・タスク
- SPEC.md: 仕様書（プロダクト概要、画面構成、API、DB、画像パイプライン）
- TODO.md: 全体タスク管理

## プロジェクト構成
```
marguerite/
  SPEC.md          ← 仕様書
  TODO.md          ← 全体タスク管理
  backend/         ← FastAPI（Kanamiさん担当）
    CLAUDE.md      ← BE固有のガイド
    TODO.md        ← BE用タスクリスト
  frontend/        ← React + TypeScript（AI agentで開発）
    CLAUDE.md      ← FE固有のガイド
  design/          ← Pencil デザインファイル + 画像
```

## 役割分担
- Harune: FE（AI agentに任せる）+ 画像生成パイプライン
- Kanami: BE（FastAPI）。Web開発初めてなのでガイド付き。

## 技術スタック
- FE: React + TypeScript（use-gesture でタッチ操作）
- BE: FastAPI + SQLModel + SQLite
- QRコード: qrcode.react（FEで生成、BE不要）
- 画像生成: Groq API + セグメンテーション + インペイント（要検証）

## 重要な設計判断
- ゲームセッション管理はFE完結（BEはデータ配信のみ）
- 画像パイプラインは2段階: 事前にベース画像+セグメント保存、客プレイ時にランダムインペイント
- 認証なし（store_idがUUIDなので推測不可能）
- 画像サイズ: 4:3（1024x768）、スマホ縦型で上下2枚配置
- 画像生成パイプラインのフォールバック: デモ用画像を事前準備

## 言語
日本語で応答すること。
