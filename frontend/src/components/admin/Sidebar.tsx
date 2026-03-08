import { Image, Settings, Store } from "lucide-react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/utils"

type SidebarProps = {
  storeName: string
  storeId: string
}

export default function Sidebar({ storeName, storeId }: SidebarProps) {
  const navItems = [
    {
      label: "ベース画像",
      icon: Image,
      to: `/admin/stores/${storeId}`,
      end: true,
    },
    {
      label: "店舗設定",
      icon: Settings,
      to: `/admin/stores/${storeId}/settings`,
    },
  ]

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-white">
      {/* ロゴ */}
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="font-['Bricolage_Grotesque'] text-lg font-bold text-indigo-500">
          🔍 まちがいさがし
        </span>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 space-y-1 px-3 pt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )
            }
          >
            <item.icon className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 下部: 店舗名 */}
      <div className="border-t px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
            <Store className="size-4" />
          </div>
          <span className="truncate text-sm font-medium text-gray-700">
            {storeName}
          </span>
        </div>
      </div>
    </aside>
  )
}
