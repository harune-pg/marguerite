import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Store } from "@/types"

type GenerateConfirmModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  store: Store
  onConfirm: () => void
}

export default function GenerateConfirmModal({
  open,
  onOpenChange,
  store,
  onConfirm,
}: GenerateConfirmModalProps) {
  const infoRows = [
    { label: "ジャンル", value: store.genre ?? "未設定" },
    { label: "店名", value: store.name },
    { label: "紹介文", value: store.description ?? "未設定" },
    { label: "看板メニュー", value: store.menu_description ?? "未設定" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>画像を生成しますか？</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 py-4">
          {/* 左: サンプル写真 */}
          <div className="size-[180px] shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {store.photo_url ? (
              <img
                src={store.photo_url}
                alt="店舗写真"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                写真なし
              </div>
            )}
          </div>

          {/* 右: 情報カード */}
          <div className="flex-1 rounded-lg border">
            {infoRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex px-4 py-3 text-sm ${i < infoRows.length - 1 ? "border-b" : ""}`}
              >
                <span className="w-24 shrink-0 font-medium text-gray-500">
                  {row.label}
                </span>
                <span className="text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 text-white hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700"
            onClick={onConfirm}
          >
            <Sparkles className="mr-2 size-4" />
            生成する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
