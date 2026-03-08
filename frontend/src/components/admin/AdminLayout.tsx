import { Outlet, useParams } from "react-router-dom"
import Sidebar from "@/components/admin/Sidebar"
import { useStore } from "@/hooks/useStore"

export default function AdminLayout() {
  const { storeId } = useParams<{ storeId: string }>()
  const { store, baseImages, updateStore, toggleImageActive, addGeneratingImage } =
    useStore(storeId!)

  if (!store) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar storeName={store.name} storeId={storeId!} />
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
