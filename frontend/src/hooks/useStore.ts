import { useCallback, useEffect, useState } from "react"
import mockData from "@/data/mock.json"
import type { BaseImage, Store } from "@/types"

function loadStores(): Store[] {
  const stored = localStorage.getItem("stores")
  if (stored) {
    return JSON.parse(stored) as Store[]
  }
  return mockData.stores as Store[]
}

function loadBaseImages(storeId: number): BaseImage[] {
  const stored = localStorage.getItem(`baseImages_${storeId}`)
  if (stored) {
    return JSON.parse(stored) as BaseImage[]
  }
  return (mockData.baseImages as BaseImage[]).filter(
    (img) => img.store_id === storeId,
  )
}

export function useStore(storeIdParam: string) {
  const storeId = Number(storeIdParam)
  const [store, setStore] = useState<Store | null>(null)
  const [baseImages, setBaseImages] = useState<BaseImage[]>([])

  useEffect(() => {
    const stores = loadStores()
    const found = stores.find((s) => s.id === storeId)
    setStore(found ?? null)
    setBaseImages(loadBaseImages(storeId))
  }, [storeId])

  const updateStore = useCallback(
    (updates: Partial<Store>) => {
      const stores = loadStores()
      const idx = stores.findIndex((s) => Number(s.id) === storeId)
      if (idx >= 0) {
        stores[idx] = {
          ...stores[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        localStorage.setItem("stores", JSON.stringify(stores))
        setStore(stores[idx])
      }
    },
    [storeId],
  )

  const toggleImageActive = useCallback(
    (imageId: string) => {
      setBaseImages((prev) => {
        const updated = prev.map((img) =>
          img.id === imageId ? { ...img, is_active: !img.is_active } : img,
        )
        localStorage.setItem(
          `baseImages_${storeId}`,
          JSON.stringify(updated),
        )
        return updated
      })
    },
    [storeId],
  )

  const addGeneratingImage = useCallback(() => {
    const newImage: BaseImage = {
      id: `base_img_${Date.now()}`,
      store_id: storeId,
      image_url: "",
      segments: [],
      generation_input: {
        store_name: store?.name ?? "",
        genre: store?.genre,
        photo_url: store?.photo_url,
        description: store?.description,
        menu_description: store?.menu_description,
      },
      is_active: false,
      created_at: new Date().toISOString(),
    }
    setBaseImages((prev) => {
      const updated = [...prev, newImage]
      localStorage.setItem(`baseImages_${storeId}`, JSON.stringify(updated))
      return updated
    })
    return newImage.id
  }, [storeId, store])

  return { store, baseImages, updateStore, toggleImageActive, addGeneratingImage }
}
