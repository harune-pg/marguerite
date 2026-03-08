// SPEC.mdのAPI仕様に基づく型定義

/**
 * 店舗情報
 */
export type Store = {
  id: number
  name: string
  genre?: "カフェ" | "居酒屋" | "ファミレス" | "ラーメン" | "その他"
  photo_url?: string
  menu_description?: string // 看板メニュー説明（100文字以内）
  description?: string // 店の紹介文（200文字以内）
  created_at: string
  updated_at: string
}

/**
 * ベース画像（間違い探し用の元画像）
 */
export type BaseImage = {
  id: string
  store_id: number
  image_url: string
  segments: Segment[]
  generation_input: GenerationInput
  status?: "generating" | "completed" | "failed"
  is_active: boolean
  created_at: string
}

/**
 * セグメント情報（画像の領域分割データ）
 */
export type Segment = {
  id: number
  mask_url: string
  cx: number // 中心X座標（%、0-100）
  cy: number // 中心Y座標（%、0-100）
  radius: number // 判定半径（%）
  selectable: boolean // 間違い生成に使用可能か
}

/**
 * 画像生成時の入力情報（スナップショット）
 */
export type GenerationInput = {
  store_name: string
  genre?: string
  photo_url?: string
  menu_description?: string
  description?: string
}

/**
 * 間違い箇所の座標情報
 */
export type Difference = {
  cx: number // 中心X座標（%、0-100）
  cy: number // 中心Y座標（%、0-100）
  radius: number // 判定半径（%）
}

/**
 * ゲーム開始時のレスポンス
 */
export type PlayResponse = {
  store_name: string
  original_image_url: string
  modified_image_url: string
  differences: Difference[]
  store_info: {
    genre?: string
    recommendation?: string
    description?: string
  }
}

/**
 * 店舗登録リクエスト
 */
export type CreateStoreRequest = {
  name: string
}

/**
 * 店舗登録レスポンス
 */
export type CreateStoreResponse = {
  store_id: number
  name: string
}

/**
 * 店舗更新リクエスト
 */
export type UpdateStoreRequest = {
  genre?: string
  menu_description?: string
  description?: string
  // photo は multipart/form-data で別途送信
}

/**
 * ベース画像のactive/inactive切替リクエスト
 */
export type UpdateBaseImageRequest = {
  is_active: boolean
}

/**
 * 画像生成開始レスポンス（非同期処理）
 */
export type GenerationResponse = {
  generation_id: string
  status: "processing" | "completed" | "failed"
}
