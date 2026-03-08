import { Upload } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Store } from "@/types"

type SettingsContext = {
  store: Store
  updateStore: (updates: Partial<Store>) => void
}

const GENRES = ["カフェ", "居酒屋", "ファミレス", "ラーメン", "その他"] as const

export default function StoreSettingsPage() {
  const { store, updateStore } = useOutletContext<SettingsContext>()

  const [name, setName] = useState("")
  const [genre, setGenre] = useState<Store["genre"] | "">("")
  const [description, setDescription] = useState("")
  const [menuDescription, setMenuDescription] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (store) {
      setName(store.name)
      setGenre(store.genre ?? "")
      setDescription(store.description ?? "")
      setMenuDescription(store.menu_description ?? "")
    }
  }, [store])

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    updateStore({
      name: name.trim(),
      genre: genre || undefined,
      description: description.trim() || undefined,
      menu_description: menuDescription.trim() || undefined,
    })
    setSaved(true)
    const timer = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(timer)
  }

  return (
    <div className="flex flex-col">
      {/* トップバー */}
      <div className="flex h-16 items-center border-b bg-white px-8">
        <h1 className="text-lg font-semibold text-gray-900">店舗設定</h1>
      </div>

      {/* コンテンツ */}
      <div className="p-8">
        <form onSubmit={handleSave}>
          <div className="mx-auto max-w-[720px] rounded-xl border bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900">基本情報</h2>
            <p className="mt-1 text-sm text-gray-500">
              店舗の基本情報を入力してください。この情報をもとに間違い探し画像を生成します。
            </p>

            <div className="mt-6 space-y-5">
              {/* ジャンル */}
              <div className="space-y-2">
                <Label htmlFor="genre">ジャンル</Label>
                <Select value={genre} onValueChange={(v) => setGenre((v as Store["genre"]) ?? "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="選択してください" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 店名 */}
              <div className="space-y-2">
                <Label htmlFor="store-name">店名</Label>
                <Input
                  id="store-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: カフェまるまる"
                  required
                />
              </div>

              {/* 紹介文 */}
              <div className="space-y-2">
                <Label htmlFor="description">紹介文</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="お店の紹介文を入力してください（200文字以内）"
                  maxLength={200}
                  rows={3}
                />
              </div>

              {/* 看板メニュー説明 */}
              <div className="space-y-2">
                <Label htmlFor="menu-description">看板メニュー説明</Label>
                <Textarea
                  id="menu-description"
                  value={menuDescription}
                  onChange={(e) => setMenuDescription(e.target.value)}
                  placeholder="看板メニューの説明を入力してください（100文字以内）"
                  maxLength={100}
                  rows={2}
                />
              </div>

              {/* 写真アップロード */}
              <div className="space-y-2">
                <Label htmlFor="photo">写真</Label>
                <label
                  htmlFor="photo"
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 transition-colors hover:border-gray-400"
                >
                  <div className="text-center">
                    <Upload className="mx-auto size-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      クリックまたはドラッグ&ドロップ
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      JPG, PNG（最大1MB）
                    </p>
                  </div>
                  <input
                    id="photo"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 1024 * 1024) {
                        alert("ファイルサイズは1MB以下にしてください")
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          updateStore({ photo_url: reader.result })
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="mt-6 flex items-center gap-3">
              <Button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                {saved ? "保存しました" : "保存する"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
