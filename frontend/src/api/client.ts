const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// --- Store ---

export type StoreResponse = {
  id: number
  name: string
  genre: string | null
  photo_url: string | null
  menu_description: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type CreateStoreResponse = {
  store_id: number
  name: string
}

export function createStore(name: string) {
  return request<CreateStoreResponse>("/api/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export function getStore(storeId: number) {
  return request<StoreResponse>(`/api/stores/${storeId}`)
}

export function updateStore(
  storeId: number,
  data: {
    name?: string
    genre?: string
    menu_description?: string
    description?: string
    photo?: File
  },
) {
  const formData = new FormData()
  if (data.name != null) formData.append("name", data.name)
  if (data.genre != null) formData.append("genre", data.genre)
  if (data.menu_description != null)
    formData.append("menu_description", data.menu_description)
  if (data.description != null) formData.append("description", data.description)
  if (data.photo) formData.append("photo", data.photo)

  return request<StoreResponse>(`/api/stores/${storeId}`, {
    method: "PUT",
    body: formData,
  })
}

// --- BaseImage ---

export type BaseImageResponse = {
  base_image_id: string
  store_id: number
  image_url: string
  segments: Record<string, unknown> | null
  generation_input: Record<string, unknown> | null
  is_active: boolean
  created_at: string
}

export function listBaseImages(storeId: number) {
  return request<BaseImageResponse[]>(`/api/stores/${storeId}/base-images`)
}

export function updateBaseImage(
  storeId: number,
  baseImageId: string,
  isActive: boolean,
) {
  return request<BaseImageResponse>(
    `/api/stores/${storeId}/base-images/${baseImageId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    },
  )
}

export function generateBaseImage(storeId: number) {
  return request<BaseImageResponse>(
    `/api/stores/${storeId}/base-images/generate`,
    { method: "POST" },
  )
}

// --- Play ---

export type PlayResponse = {
  store_name: string
  original_image_url: string
  modified_image_url: string
  differences: { cx: number; cy: number; radius: number }[]
  store_info: {
    genre: string | null
    recommendation: string
    description: string | null
  }
}

export function play(storeId: number) {
  return request<PlayResponse>(`/api/stores/${storeId}/play`, {
    method: "POST",
  })
}

/** 画像URLにAPIベースURLを付与（相対パスの場合） */
export function resolveImageUrl(url: string): string {
  if (!url) return ""
  if (url.startsWith("http")) return url
  return `${API_BASE}${url}`
}
