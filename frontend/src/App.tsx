import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import AdminLayout from "@/components/admin/AdminLayout"
import RegisterPage from "@/pages/admin/RegisterPage"
import StoreDashboardPage from "@/pages/admin/StoreDashboardPage"
import StoreSettingsPage from "@/pages/admin/StoreSettingsPage"
import GamePage from "@/pages/play/GamePage"
import LandingPage from "@/pages/play/LandingPage"
import ResultPage from "@/pages/play/ResultPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ルートパスは店舗登録画面にリダイレクト */}
        <Route path="/" element={<Navigate to="/admin/register" replace />} />

        {/* 管理画面 */}
        <Route path="/admin/register" element={<RegisterPage />} />
        <Route path="/admin/stores/:storeId" element={<AdminLayout />}>
          <Route index element={<StoreDashboardPage />} />
          <Route path="settings" element={<StoreSettingsPage />} />
        </Route>

        {/* 客側画面 */}
        <Route path="/play/:storeId" element={<LandingPage />} />
        <Route path="/play/:storeId/game" element={<GamePage />} />
        <Route path="/play/:storeId/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
