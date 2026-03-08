import { Download, Link } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type QrCodeModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: number
}

export default function QrCodeModal({
  open,
  onOpenChange,
  storeId,
}: QrCodeModalProps) {
  const playUrl = `${window.location.origin}/play/${storeId}`

  const handleDownload = useCallback(() => {
    const svg = document.querySelector<SVGSVGElement>("#qr-code-svg svg")
    if (!svg) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, 400, 400)
      ctx.drawImage(img, 0, 0, 400, 400)

      const a = document.createElement("a")
      a.download = "qrcode.png"
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>QRコード</DialogTitle>
          <DialogDescription>
            このQRコードをお客様に見せて、間違い探しを楽しんでもらいましょう
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* QRコード */}
          <div
            id="qr-code-svg"
            className="rounded-xl bg-gray-50 p-4"
          >
            <QRCodeSVG value={playUrl} size={200} />
          </div>

          {/* URL表示 */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            <Link className="size-4 shrink-0" />
            <span className="truncate">{playUrl}</span>
          </div>

          {/* ダウンロードボタン */}
          <Button
            className="w-full bg-indigo-500 hover:bg-indigo-600"
            onClick={handleDownload}
          >
            <Download className="mr-2 size-4" />
            画像を保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
