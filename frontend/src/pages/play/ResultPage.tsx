import { PartyPopper, RotateCcw } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function ResultPage() {
  const { storeId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as {
    found: number
    total: number
    time: number
  }) ?? {
    found: 0,
    total: 5,
    time: 70,
  }

  const isComplete = state.found === state.total

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 py-8 gap-8">
      {/* アイコン */}
      <div className="w-16 h-16 flex items-center justify-center">
        <PartyPopper className="w-12 h-12 text-gray-700" />
      </div>

      {/* タイトル */}
      <div className="text-center">
        <h1 className="text-[28px] font-bold text-gray-900">
          {isComplete ? "すごい！全問正解！" : "タイムアップ！"}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {isComplete
            ? `${state.total}つの間違いを全て見つけました`
            : `${state.found}つの間違いを見つけました`}
        </p>
      </div>

      {/* スコアカード */}
      <div className="w-full bg-gray-100 rounded-2xl p-5 flex gap-4">
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-500">発見数</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {state.found}/{state.total}
          </p>
        </div>
        <div className="w-px bg-gray-200" />
        <div className="flex-1 text-center">
          <span className="text-sm text-gray-500">クリアタイム</span>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">
            {formatTime(state.time)}
          </p>
        </div>
      </div>

      {/* もう一度遊ぶ */}
      <button
        type="button"
        onClick={() => navigate(`/play/${storeId}/game`)}
        className="w-full h-14 rounded-[28px] bg-amber-500 flex items-center justify-center gap-2 active:bg-amber-600 transition-colors"
      >
        <RotateCcw className="w-5 h-5 text-white" />
        <span className="text-lg font-bold text-white">もう一度遊ぶ</span>
      </button>
    </div>
  )
}
