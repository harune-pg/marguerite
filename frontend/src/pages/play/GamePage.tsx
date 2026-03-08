import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useGesture } from "@use-gesture/react"
import { ArrowLeft, Timer, Check, X, ZoomIn } from "lucide-react"
import type { Difference } from "@/types"

// デモ用のゲームデータ
const MOCK_GAME = {
  store_name: "カフェまるまる",
  original_image_url: "/demo/game-original.png",
  modified_image_url: "/demo/game-modified.png",
  differences: [
    { cx: 32.6, cy: 14.6, radius: 3.9 },
    { cx: 89.8, cy: 39.1, radius: 4.3 },
    { cx: 42.3, cy: 43.9, radius: 3.6 },
    { cx: 31.3, cy: 73.2, radius: 4.3 },
    { cx: 71.6, cy: 73.2, radius: 4.7 },
  ] satisfies Difference[],
}

const GAME_DURATION = 70 // 1分10秒

type Mark = {
  id: number
  cx: number
  cy: number
  correct: boolean
  visible: boolean
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

// --- 正解マーク ---
function CorrectMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <div
      className="absolute pointer-events-none animate-[mark-pop_0.3s_ease-out_both]"
      style={{
        left: `${cx}%`,
        top: `${cy}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 rounded-full border-[2px] border-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
        <div className="absolute inset-[2px] rounded-full border-[3px] border-green-500" />
        <div className="absolute inset-[5px] rounded-full border-[2px] border-white" />
      </div>
    </div>
  )
}

// --- 不正解マーク ---
function WrongMark({
  cx,
  cy,
  visible,
}: { cx: number; cy: number; visible: boolean }) {
  return (
    <div
      className={
        visible
          ? "absolute pointer-events-none animate-[mark-pop_0.2s_ease-out_both]"
          : "absolute pointer-events-none animate-[mark-fade_0.3s_ease-in_both]"
      }
      style={{
        left: `${cx}%`,
        top: `${cy}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500 shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
        <X size={22} className="text-white" strokeWidth={2.5} />
      </div>
    </div>
  )
}

// --- マークの描画 ---
function MarkOverlay({ mark }: { mark: Mark }) {
  if (mark.correct) {
    return <CorrectMark cx={mark.cx} cy={mark.cy} />
  }
  return <WrongMark cx={mark.cx} cy={mark.cy} visible={mark.visible} />
}

// --- 画像コンテナ（ズーム・パン対応） ---
function GameImage({
  src,
  alt,
  marks,
  onTap,
  scale,
  position,
  bindGesture,
}: {
  src: string
  alt: string
  marks: Mark[]
  onTap: (e: React.PointerEvent<HTMLDivElement>) => void
  scale: number
  position: { x: number; y: number }
  bindGesture: () => Record<string, unknown>
}) {
  const tapStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  )

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    tapStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = tapStartRef.current
    if (!start) return
    const dx = Math.abs(e.clientX - start.x)
    const dy = Math.abs(e.clientY - start.y)
    const dt = Date.now() - start.time
    if (dx < 10 && dy < 10 && dt < 300) {
      onTap(e)
    }
    tapStartRef.current = null
  }

  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl overflow-hidden bg-gray-100 touch-none min-h-0"
      style={{ aspectRatio: "3/2" }}
      {...bindGesture()}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <div
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: "center center",
        }}
        className="w-full h-full relative"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
        {/* マークオーバーレイ */}
        <div className="absolute inset-0 pointer-events-none">
          {marks.map((mark) => (
            <MarkOverlay key={mark.id} mark={mark} />
          ))}
        </div>
      </div>
    </div>
  )
}

// =========================
// メインコンポーネント
// =========================
export default function GamePage() {
  const navigate = useNavigate()
  const { storeId } = useParams<{ storeId: string }>()

  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [found, setFound] = useState<number[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const markIdRef = useRef(0)
  const gameOverRef = useRef(false)

  // ズーム・パン状態（両画像で共有）
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const differences = MOCK_GAME.differences
  const totalDiffs = differences.length

  // --- タイマー ---
  useEffect(() => {
    if (gameOverRef.current) return
    if (timeLeft <= 0) {
      gameOverRef.current = true
      navigate(`/play/${storeId}/result`, {
        state: { found: found.length, total: totalDiffs, time: GAME_DURATION },
      })
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, navigate, storeId, found.length, totalDiffs])

  // --- 全問正解 ---
  useEffect(() => {
    if (found.length === totalDiffs && !gameOverRef.current) {
      gameOverRef.current = true
      const elapsed = GAME_DURATION - timeLeft
      const id = setTimeout(() => {
        navigate(`/play/${storeId}/result`, {
          state: { found: found.length, total: totalDiffs, time: elapsed },
        })
      }, 800)
      return () => clearTimeout(id)
    }
  }, [found.length, totalDiffs, navigate, storeId, timeLeft])

  // --- タップ処理 ---
  const handleTap = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (gameOverRef.current) return
      const rect = e.currentTarget.getBoundingClientRect()

      // ズーム・パンを考慮してタップ座標を画像座標に変換
      const viewX = e.clientX - rect.left
      const viewY = e.clientY - rect.top
      const imgX =
        ((viewX - rect.width / 2) / scale + rect.width / 2 - position.x) /
        rect.width
      const imgY =
        ((viewY - rect.height / 2) / scale + rect.height / 2 - position.y) /
        rect.height

      // 画像外のタップは無視
      if (imgX < 0 || imgX > 1 || imgY < 0 || imgY > 1) return

      const tapCx = imgX * 100
      const tapCy = imgY * 100

      // 間違い箇所との距離判定
      let foundIdx = -1
      for (let i = 0; i < differences.length; i++) {
        if (found.includes(i)) continue
        const diff = differences[i]
        const dist = Math.sqrt((tapCx - diff.cx) ** 2 + (tapCy - diff.cy) ** 2)
        if (dist <= diff.radius) {
          foundIdx = i
          break
        }
      }

      const id = ++markIdRef.current

      if (foundIdx >= 0) {
        const diff = differences[foundIdx]
        setFound((prev) => [...prev, foundIdx])
        setMarks((prev) => [
          ...prev,
          { id, cx: diff.cx, cy: diff.cy, correct: true, visible: true },
        ])
      } else {
        setMarks((prev) => [
          ...prev,
          { id, cx: tapCx, cy: tapCy, correct: false, visible: true },
        ])
        // フェードアウト開始
        setTimeout(() => {
          setMarks((prev) =>
            prev.map((m) => (m.id === id ? { ...m, visible: false } : m)),
          )
        }, 600)
        // 完全削除
        setTimeout(() => {
          setMarks((prev) => prev.filter((m) => m.id !== id))
        }, 900)
      }
    },
    [differences, found, scale, position],
  )

  // --- ピンチズーム＆パン（両画像で共有） ---
  const bindGesture = useGesture(
    {
      onPinch: ({ offset: [s] }) => {
        setScale(s)
      },
      onDrag: ({ offset: [x, y] }) => {
        if (scale > 1) {
          setPosition({ x, y })
        }
      },
    },
    {
      pinch: { scaleBounds: { min: 1, max: 4 }, rubberband: true },
      drag: { enabled: scale > 1 },
    },
  )

  const progressPercent =
    totalDiffs > 0 ? (found.length / totalDiffs) * 100 : 0

  return (
    <div className="h-dvh bg-white flex flex-col overflow-hidden px-2.5">
      {/* 上部エリア: ヘッダー + プログレスバー */}
      <div className="flex-1 flex flex-col justify-end gap-1 pb-1.5">
        <div className="flex items-center justify-between px-1.5 py-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-900"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-[15px] font-semibold text-gray-900">
              {MOCK_GAME.store_name}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-orange-50 rounded-xl px-2.5 py-1">
            <Timer size={14} className="text-orange-500" />
            <span className="text-[13px] font-bold text-orange-500 tabular-nums">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-1.5">
          <div className="flex items-center gap-1 bg-green-50 rounded-xl px-2.5 py-1">
            <Check size={12} className="text-green-500" />
            <span className="text-xs font-semibold text-green-500">
              {found.length}/{totalDiffs} 発見
            </span>
          </div>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 画像エリア */}
      <div className="flex flex-col gap-1.5">
        <GameImage
          src={MOCK_GAME.original_image_url}
          alt="元画像"
          marks={marks}
          onTap={handleTap}
          scale={scale}
          position={position}
          bindGesture={bindGesture}
        />
        <GameImage
          src={MOCK_GAME.modified_image_url}
          alt="変更画像"
          marks={marks}
          onTap={handleTap}
          scale={scale}
          position={position}
          bindGesture={bindGesture}
        />
      </div>

      {/* 下部エリア: ヒント */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <ZoomIn size={16} className="text-gray-400" />
        <span className="text-xs text-gray-400">
          ピンチで拡大・スワイプで移動できます
        </span>
      </div>
    </div>
  )
}
