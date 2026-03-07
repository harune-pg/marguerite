# Frontend - まちあいさがし

React + TypeScript のフロントエンド。

## 技術スタック

- Runtime: [bun](https://bun.sh/)
- Build: [Vite](https://vite.dev/) 7
- UI: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS v4
- Linter/Formatter: [Biome](https://biomejs.dev/)

## セットアップ

```bash
cd frontend
bun install
```

## 開発

```bash
bun dev          # 開発サーバー起動
bun run build    # ビルド
bun run lint     # Biome lint（コード品質チェック）
bun run check    # Biome check（lint + format 自動修正）
bun run format   # Biome format（コード自動整形）
```

## import エイリアス

`@/` で `src/` 配下を参照できます。

```ts
import { Button } from "@/components/ui/button"
```

## shadcn/ui コンポーネント追加

```bash
bunx shadcn@latest add <component>
```

詳細な規約は `CLAUDE.md` を参照。
