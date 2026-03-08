import { Calendar, EyeOff, X } from "lucide-react"
import { resolveImageUrl } from "@/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { BaseImage } from "@/types"

type ImageDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  image: BaseImage
  index: number
  onToggleActive: () => void
}

export default function ImageDetailModal({
  open,
  onOpenChange,
  image,
  index,
  onToggleActive,
}: ImageDetailModalProps) {
  const infoRows = [
    {
      label: "ジャンル",
      value: image.generation_input.genre ?? "未設定",
    },
    { label: "店名", value: image.generation_input.store_name },
    {
      label: "紹介文",
      value: image.generation_input.description ?? "未設定",
    },
    {
      label: "看板メニュー",
      value: image.generation_input.menu_description ?? "未設定",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[780px] max-h-[90vh] w-[1160px] max-w-[95vw] overflow-hidden p-0 sm:max-w-[1160px]"
      >
        {/* 左：画像パネル */}
        <div className="relative flex flex-1 items-center justify-center bg-neutral-900">
          {image.image_url ? (
            <img
              src={resolveImageUrl(image.image_url)}
              alt={`ベース画像 #${index}`}
              className="max-h-[420px] max-w-[560px] object-contain"
            />
          ) : (
            <div className="text-gray-500">画像なし</div>
          )}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="閉じる"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 右：情報パネル */}
        <div className="flex w-[410px] flex-col border-l bg-white p-6">
          {/* タイトル & バッジ */}
          <h2 className="text-lg font-semibold text-gray-900">
            ベース画像 #{index}
          </h2>
          <div className="mt-2">
            {image.status === "failed" ? (
              <Badge className="bg-red-100 text-red-700">失敗</Badge>
            ) : image.is_active ? (
              <Badge className="bg-green-100 text-green-700">公開中</Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600">下書き</Badge>
            )}
          </div>

          {/* 日付 */}
          <div className="mt-3 flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="size-4" />
            {new Date(image.created_at).toLocaleString("ja-JP", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* 生成時の情報 */}
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-medium text-gray-500">
              生成時の情報
            </h3>
            <div className="rounded-lg border">
              {infoRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex px-4 py-3 text-sm ${i < infoRows.length - 1 ? "border-b" : image.generation_input.photo_url ? "border-b" : ""}`}
                >
                  <span className="w-24 shrink-0 font-medium text-gray-500">
                    {row.label}
                  </span>
                  <span className="text-gray-900">{row.value}</span>
                </div>
              ))}
              {image.generation_input.photo_url && (
                <div className="flex px-4 py-3 text-sm">
                  <span className="w-24 shrink-0 font-medium text-gray-500">
                    写真
                  </span>
                  <img
                    src={image.generation_input.photo_url}
                    alt="店舗写真"
                    className="h-16 w-16 rounded object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-auto pt-6">
            {image.status === "failed" ? (
              <Button variant="outline" className="w-full" disabled>
                生成に失敗しました
              </Button>
            ) : image.is_active ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={onToggleActive}
              >
                <EyeOff className="mr-2 size-4" />
                非公開にする
              </Button>
            ) : (
              <Button
                className="w-full bg-indigo-500 hover:bg-indigo-600"
                onClick={onToggleActive}
              >
                公開する
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
