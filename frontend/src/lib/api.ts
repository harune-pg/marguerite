import type {
  BaseImage,
  CreateStoreResponse,
  Store,
} from "@/types"

const API_BASE = "/api"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init)
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`API error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

// ---- Store ----

export async function createStore(name: string): Promise<CreateStoreResponse> {
  return request<CreateStoreResponse>("/stores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
}

export async function getStore(storeId: number): Promise<Store> {
  return request<Store>(`/stores/${storeId}`)
}

export async function updateStore(
  storeId: number,
  data: {
    name?: string
    genre?: string
    menu_description?: string
    description?: string
    photo?: File
  },
): Promise<Store> {
  const formData = new FormData()
  if (data.name != null) formData.append("name", data.name)
  if (data.genre != null) formData.append("genre", data.genre)
  if (data.menu_description != null)
    formData.append("menu_description", data.menu_description)
  if (data.description != null) formData.append("description", data.description)
  if (data.photo) formData.append("photo", data.photo)

  return request<Store>(`/stores/${storeId}`, {
    method: "PUT",
    body: formData,
  })
}

// ---- BaseImage ----

type BaseImageApiResponse = {
  base_image_id: string
  store_id: number
  image_url: string
  segments: BaseImage["segments"]
  generation_input: BaseImage["generation_input"]
  is_active: boolean
  created_at: string
}

function toBaseImage(raw: BaseImageApiResponse): BaseImage {
  return {
    id: raw.base_image_id,
    store_id: raw.store_id,
    image_url: raw.image_url,
    segments: raw.segments ?? [],
    generation_input: raw.generation_input ?? {
      store_name: "",
    },
    is_active: raw.is_active,
    created_at: raw.created_at,
  }
}

export async function listBaseImages(storeId: number): Promise<BaseImage[]> {
  const data = await request<BaseImageApiResponse[]>(
    `/stores/${storeId}/base-images`,
  )
  return data.map(toBaseImage)
}

export async function toggleBaseImageActive(
  storeId: number,
  imageId: string,
  isActive: boolean,
): Promise<BaseImage> {
  const data = await request<BaseImageApiResponse>(
    `/stores/${storeId}/base-images/${imageId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: isActive }),
    },
  )
  return toBaseImage(data)
}

export async function generateBaseImage(
  storeId: number,
): Promise<BaseImage> {
  const data = await request<BaseImageApiResponse>(
    `/stores/${storeId}/base-images/generate`,
    { method: "POST" },
  )
  return toBaseImage(data)
}
