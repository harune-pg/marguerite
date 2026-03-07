# Frontend - CLAUDE.md

## 技術スタック
- Runtime: bun
- Framework: React 19 + TypeScript
- Build: Vite 7
- UI: shadcn/ui + Tailwind CSS v4
- Linter/Formatter: Biome

## コマンド
```bash
bun dev          # 開発サーバー起動
bun run build    # ビルド（tsc + vite build）
bun run lint     # Biome lint + format チェック
bun run check    # Biome lint + format 自動修正
bun run format   # Biome フォーマット適用
```

## コード規約

### TypeScript スタイル
- Google TypeScript Style Guide に準拠: https://google.github.io/styleguide/tsguide.html
- `interface` よりも `type` を優先（Google TS Style Guide に従う）
- Enum は使わず、`as const` オブジェクトまたはユニオン型を使う

### import
- **絶対パスを使う**: `@/` プレフィックスで src/ 配下を参照（例: `import { Button } from "@/components/ui/button"`）
- 相対パスは同一ディレクトリ内のみ許容
- import 順序は Biome (`organizeImports`) で自動整理

### フォーマット
- Biome で統一（`biome.json` 参照）
- セミコロンなし
- ダブルクォート
- trailing comma あり

### ディレクトリ構成（予定）
```
src/
  components/
    ui/          # shadcn/ui コンポーネント（自動生成）
  lib/           # ユーティリティ
  pages/         # ページコンポーネント
  hooks/         # カスタムフック
  types/         # 型定義
  api/           # API クライアント
```

### その他
- CSS は Tailwind ユーティリティクラスを使う（カスタム CSS は最小限に）
- コンポーネントは関数コンポーネント + hooks パターン
- shadcn/ui コンポーネントの追加: `bunx shadcn@latest add <component>`
