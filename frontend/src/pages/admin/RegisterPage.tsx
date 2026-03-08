import { type FormEvent, useState } from "react"
import { useNavigate } from "react-router-dom"
import { createStore } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [storeName, setStoreName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!storeName.trim()) return

    setIsSubmitting(true)
    setError("")

    try {
      const res = await createStore(storeName.trim())
      navigate(`/admin/stores/${res.store_id}?registered=true`)
    } catch {
      setError("登録に失敗しました。サーバーが起動しているか確認してください。")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* ロゴ */}
        <span className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-indigo-500">
          まちあいさがし
        </span>

        {/* カード */}
        <Card className="w-[440px]">
          <CardHeader className="gap-1 px-8 pt-8 pb-4">
            {/* CardHeaderの中にカスタムコンテンツ */}
          </CardHeader>
          <CardContent className="px-8 pb-4">
            <form id="register-form" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store-name">店名</Label>
                  <Input
                    id="store-name"
                    type="text"
                    placeholder="例: カフェまるまる"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </form>
          </CardContent>
          <CardFooter className="px-8 pb-8">
            <Button
              type="submit"
              form="register-form"
              className="w-full bg-indigo-500 hover:bg-indigo-600"
              disabled={!storeName.trim() || isSubmitting}
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
