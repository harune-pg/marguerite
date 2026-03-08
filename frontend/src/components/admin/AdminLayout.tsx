import { Link, Navigate, Outlet, useParams } from "react-router-dom"
import Sidebar from "@/components/admin/Sidebar"
import { useStore } from "@/hooks/useStore"

export default function AdminLayout() {
  const { storeId } = useParams<{ storeId: string }>()

  if (!storeId || Number.isNaN(Number(storeId))) {
    return <Navigate to="/admin/register" replace />
  }

  const { store, baseImages, loading, updateStore, toggleImageActive, generateImage } =
    useStore(storeId)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="size-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-500">店舗が見つかりません</p>
        <Link to="/admin/register" className="text-sm text-indigo-500 hover:underline">
          新規登録はこちら
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar storeName={store.name} storeId={storeId} />
      <main className="flex-1 overflow-auto">
        <Outlet
          context={{
            store,
            baseImages,
            updateStore,
            toggleImageActive,
            generateImage,
          }}
        />
      </main>
    </div>
  )
}
