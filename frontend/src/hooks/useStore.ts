import { useCallback, useEffect, useState } from "react"
import * as api from "@/lib/api"
import type { BaseImage, Store } from "@/types"

export function useStore(storeIdParam: string) {
  const storeId = Number(storeIdParam)
  const [store, setStore] = useState<Store | null>(null)
  const [baseImages, setBaseImages] = useState<BaseImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    Promise.all([api.getStore(storeId), api.listBaseImages(storeId)])
      .then(([storeData, images]) => {
        if (cancelled) return
        setStore(storeData)
        setBaseImages(images)
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

  const updateStore = useCallback(
    async (updates: Partial<Store> & { photoFile?: File }) => {
      const { photoFile, ...fields } = updates
      const updated = await api.updateStore(storeId, {
        name: fields.name,
        genre: fields.genre,
        menu_description: fields.menu_description,
        description: fields.description,
        photo: photoFile,
      })
      setStore(updated)
    },
    [storeId],
  )

  const toggleImageActive = useCallback(
    async (imageId: string) => {
      const current = baseImages.find((img) => img.id === imageId)
      if (!current) return
      const updated = await api.toggleBaseImageActive(
        storeId,
        imageId,
        !current.is_active,
      )
      setBaseImages((prev) =>
        prev.map((img) => (img.id === imageId ? updated : img)),
      )
    },
    [storeId, baseImages],
  )

  const generateImage = useCallback(async () => {
    const newImage = await api.generateBaseImage(storeId)
    setBaseImages((prev) => [...prev, newImage])
    return newImage.id
  }, [storeId])

  return { store, baseImages, loading, updateStore, toggleImageActive, generateImage }
}
