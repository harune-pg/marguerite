import { Link, Navigate, Outlet, useParams } from "react-router-dom"
import Sidebar from "@/components/admin/Sidebar"
import { useStore } from "@/hooks/useStore"

export default function AdminLayout() {
  const { storeId } = useParams<{ storeId: string }>()

  if (!storeId || Number.isNaN(Number(storeId))) {
    return <Navigate to="/admin/register" replace />
  }

  const { store, baseImages, updateStore, toggleImageActive, addGeneratingImage } =
    useStore(storeId)

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
            addGeneratingImage,
          }}
        />
      </main>
    </div>
  )
}
