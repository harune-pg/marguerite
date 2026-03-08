import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

export default function RegisterPage() {
  const [storeName, setStoreName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName.trim()) return

    setIsSubmitting(true)

    const existingStores = JSON.parse(
      localStorage.getItem("stores") || "[]",
    )
    const maxId = existingStores.reduce(
      (max: number, s: { id: number | string }) => {
        const numericId = Number(s.id)
        return Number.isFinite(numericId) ? Math.max(max, numericId) : max
      },
      0,
    )
    const storeId = maxId + 1

    const newStore = {
      id: storeId,
      name: storeName.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    existingStores.push(newStore)
    localStorage.setItem("stores", JSON.stringify(existingStores))

    navigate(`/admin/stores/${storeId}?registered=true`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* ロゴ */}
        <span className="font-['Bricolage_Grotesque'] text-[22px] font-bold text-indigo-500">
          🔍 まちがいさがし
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

