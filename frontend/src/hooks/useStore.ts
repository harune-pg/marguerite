import { useCallback, useEffect, useRef, useState } from "react"
import {
  updateStore as apiUpdateStore,
  type BaseImageResponse,
  generateBaseImage,
  getStore,
  listBaseImages,
  type StoreResponse,
  updateBaseImage,
} from "@/api/client"
import type { BaseImage, Store } from "@/types"

/** BE の StoreResponse → FE の Store 型に変換 */
function toStore(s: StoreResponse): Store {
  return {
    id: s.id,
    name: s.name,
    genre: (s.genre as Store["genre"]) ?? undefined,
    photo_url: s.photo_url ?? undefined,
    menu_description: s.menu_description ?? undefined,
    description: s.description ?? undefined,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }
}

/** BE の BaseImageResponse → FE の BaseImage 型に変換 */
function toBaseImage(b: BaseImageResponse): BaseImage {
  return {
    id: b.base_image_id,
    store_id: b.store_id,
    image_url: b.image_url,
    segments: [], // FE側では使わない（ゲームデータはplay APIから取得）
    generation_input: {
      store_name: "",
      ...((b.generation_input as Record<string, string>) ?? {}),
    },
    is_active: b.is_active,
    created_at: b.created_at,
    status: b.image_url ? "completed" : "generating",
  }
}

export function useStore(storeIdParam: string) {
  const storeId = Number(storeIdParam)
  const [store, setStore] = useState<Store | null>(null)
  const [baseImages, setBaseImages] = useState<BaseImage[]>([])
  const [loading, setLoading] = useState(true)

  // データ取得
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([getStore(storeId), listBaseImages(storeId)])
      .then(([storeData, imagesData]) => {
        if (cancelled) return
        setStore(toStore(storeData))
        setBaseImages(imagesData.map(toBaseImage))
      })
      .catch(() => {
        if (cancelled) return
        setStore(null)
        setBaseImages([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [storeId])

  // 生成中の画像があれば5秒ごとにポーリング
  const baseImagesRef = useRef(baseImages)
  baseImagesRef.current = baseImages

  // biome-ignore lint/correctness/useExhaustiveDependencies: baseImages.length triggers polling start after addGeneratingImage
  useEffect(() => {
    if (!storeIdParam) return
    const hasGenerating = baseImagesRef.current.some(
      (img) => img.status === "generating",
    )
    if (!hasGenerating) return

    const id = setInterval(() => {
      listBaseImages(storeId)
        .then((data) => {
          const updated = data.map(toBaseImage)
          setBaseImages(updated)
          // 生成中がなくなったらポーリング停止
          if (!updated.some((img) => img.status === "generating")) {
            clearInterval(id)
          }
        })
        .catch(() => {})
    }, 5000)

    return () => clearInterval(id)
  }, [storeId, storeIdParam, baseImages.length])

  const updateStoreFn = useCallback(
    async (updates: Partial<Store> & { photoFile?: File }) => {
      const { photoFile, ...rest } = updates
      const res = await apiUpdateStore(storeId, {
        name: rest.name,
        genre: rest.genre,
        menu_description: rest.menu_description,
        description: rest.description,
        photo: photoFile,
      })
      setStore(toStore(res))
    },
    [storeId],
  )

  const toggleImageActive = useCallback(
    async (imageId: string) => {
      const current = baseImages.find((img) => img.id === imageId)
      if (!current) return
      const res = await updateBaseImage(storeId, imageId, !current.is_active)
      setBaseImages((prev) =>
        prev.map((img) => (img.id === imageId ? toBaseImage(res) : img)),
      )
    },
    [storeId, baseImages],
  )

  const addGeneratingImage = useCallback(async () => {
    const res = await generateBaseImage(storeId)
    const newImage = toBaseImage(res)
    setBaseImages((prev) => [...prev, newImage])
    return newImage.id
  }, [storeId])

  return {
    store,
    baseImages,
    loading,
    updateStore: updateStoreFn,
    toggleImageActive,
    addGeneratingImage,
  }
}
