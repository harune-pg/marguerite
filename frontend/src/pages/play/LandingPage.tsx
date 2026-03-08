import { Coffee, Play } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

const MOCK_STORE = {
  store_name: "カフェまるまる",
}

const RULES = [
  "2つの絵のちがいを見つけてタップ!",
  "ピンチで拡大、スワイプで移動OK",
  "全部見つけたらクリア!",
]

export default function LandingPage() {
  const { storeId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-white px-6 py-8 gap-8">
      {/* Store Icon */}
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
        <Coffee className="w-10 h-10 text-amber-500" />
      </div>

      {/* Store Name */}
      <h1 className="text-[28px] font-bold text-gray-900 text-center">
        {MOCK_STORE.store_name}
      </h1>

      {/* Rules */}
      <div className="w-full bg-gray-100 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-900">遊び方</h2>
        {RULES.map((rule) => (
          <div key={rule} className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-sm bg-amber-500 shrink-0" />
            <span className="text-sm text-gray-500">{rule}</span>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <button
        type="button"
        onClick={() => navigate(`/play/${storeId}/game`)}
        className="w-full h-14 rounded-[28px] bg-amber-500 flex items-center justify-center gap-2 active:bg-amber-600 transition-colors"
      >
        <Play className="w-5 h-5 text-white fill-white" />
        <span className="text-lg font-bold text-white">スタート</span>
      </button>
    </div>
  )
}
