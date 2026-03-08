import { Bookmark, Calendar, QrCode, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { useOutletContext, useSearchParams } from "react-router-dom"
import { resolveImageUrl } from "@/api/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BaseImage, Store } from "@/types"
import GenerateConfirmModal from "./GenerateConfirmModal"
import ImageDetailModal from "./ImageDetailModal"
import QrCodeModal from "./QrCodeModal"

type DashboardContext = {
  store: Store
  baseImages: BaseImage[]
  toggleImageActive: (imageId: string) => Promise<void>
  addGeneratingImage: () => Promise<string>
}

export default function StoreDashboardPage() {
  const { store, baseImages, toggleImageActive, addGeneratingImage } =
    useOutletContext<DashboardContext>()

  const [searchParams, setSearchParams] = useSearchParams()
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const showBanner = searchParams.has("registered") && !bannerDismissed

  const [qrOpen, setQrOpen] = useState(false)
  const [generateOpen, setGenerateOpen] = useState(false)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

  const activeCount = baseImages.filter((img) => img.is_active).length
  const generatingCount = baseImages.filter(
    (img) => !img.image_url && !img.is_active && img.status !== "failed",
  ).length
  const totalCount = baseImages.length

  const selectedImage = baseImages.find((img) => img.id === selectedImageId)

  const handleGenerate = () => {
    addGeneratingImage()
    setGenerateOpen(false)
  }

  return (
    <div className="flex flex-col">
      {/* トップバー */}
      <div className="flex h-16 items-center justify-between border-b bg-white px-8">
        <h1 className="text-lg font-semibold text-gray-900">ベース画像</h1>
        <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
          <QrCode className="mr-2 size-4" />
          QRコード
        </Button>
      </div>

      {/* コンテンツ */}
      <div className="p-8">
        {/* ブックマークバナー */}
        {showBanner && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg bg-indigo-50 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Bookmark className="size-[18px] shrink-0 text-indigo-500" />
              <span className="text-[13px] font-medium leading-snug text-indigo-800">
                このページをブックマークしてください —
                管理画面のURLは固定です。いつでもここからアクセスできます。
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setBannerDismissed(true)
                setSearchParams(
                  (prevParams) => {
                    const newParams = new URLSearchParams(prevParams)
                    newParams.delete("registered")
                    return newParams
                  },
                  { replace: true },
                )
              }}
              className="shrink-0 text-indigo-500 hover:text-indigo-700"
              aria-label="バナーを閉じる"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        {/* 統計行 */}
        <div className="mb-6 flex items-center gap-6">
          <div className="text-sm text-gray-600">
            全画像{" "}
            <span className="font-semibold text-gray-900">{totalCount}枚</span>
          </div>
          <div className="text-sm text-gray-600">
            公開中{" "}
            <span className="font-semibold text-green-600">
              {activeCount}枚
            </span>
          </div>
          {generatingCount > 0 && (
            <div className="text-sm text-gray-600">
              生成中{" "}
              <span className="font-semibold text-indigo-600">
                {generatingCount}枚
              </span>
            </div>
          )}

          {/* 生成ボタン */}
          <Button
            className="ml-auto h-11 px-6 text-base bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 text-white shadow-md hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700"
            onClick={() => setGenerateOpen(true)}
          >
            <Sparkles className="mr-2 size-5" />
            生成する
          </Button>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {baseImages.map((image, index) => (
            <ImageCard
              key={image.id}
              image={image}
              index={index + 1}
              onClick={() => setSelectedImageId(image.id)}
            />
          ))}
        </div>

        {baseImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-lg font-medium">画像がありません</p>
            <p className="mt-1 text-sm">
              「生成する」ボタンから画像を生成してください
            </p>
          </div>
        )}
      </div>

      {/* モーダル群 */}
      <QrCodeModal open={qrOpen} onOpenChange={setQrOpen} storeId={store.id} />
      <GenerateConfirmModal
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        store={store}
        onConfirm={handleGenerate}
      />
      {selectedImage && (
        <ImageDetailModal
          open={!!selectedImageId}
          onOpenChange={(open) => !open && setSelectedImageId(null)}
          image={selectedImage}
          index={baseImages.findIndex((img) => img.id === selectedImageId) + 1}
          onToggleActive={() => toggleImageActive(selectedImage.id)}
        />
      )}
    </div>
  )
}

function ImageCard({
  image,
  index,
  onClick,
}: {
  image: BaseImage
  index: number
  onClick: () => void
}) {
  const status =
    image.status === "failed"
      ? "failed"
      : image.status === "generating" || (!image.image_url && !image.is_active)
        ? "generating"
        : image.is_active
          ? "active"
          : "draft"

  const badgeConfig = {
    active: {
      label: "公開中",
      className: "bg-green-100 text-green-700",
    },
    draft: {
      label: "下書き",
      className: "bg-gray-100 text-gray-600",
    },
    generating: {
      label: "生成中",
      className: "bg-indigo-100 text-indigo-700",
    },
    failed: {
      label: "失敗",
      className: "bg-red-100 text-red-700",
    },
  }

  const badge = badgeConfig[status]

  return (
    <button
      type="button"
      className="group cursor-pointer overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      {/* 画像エリア */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {status === "generating" ? (
          <div className="flex h-full items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : status === "failed" ? (
          <div className="flex h-full items-center justify-center text-red-400">
            生成に失敗しました
          </div>
        ) : image.image_url ? (
          <img
            src={resolveImageUrl(image.image_url)}
            alt={`ベース画像 #${index}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            画像なし
          </div>
        )}
      </div>

      {/* 情報エリア */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            ベース画像 #{index}
          </span>
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="size-3" />
          {new Date(image.created_at).toLocaleDateString("ja-JP")}
        </div>
      </div>
    </button>
  )
}
