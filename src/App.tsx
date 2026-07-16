import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { SidebarLayout } from "./layouts/SidebarLayout"
import { AuthProvider, useAuth } from "./context/AuthContext"

import Dashboard from "./pages/Dashboard"
import Folder from "./pages/Folder"
import FolderDetails from "./pages/FolderDetails"
import Team from "./pages/Team"
import History from "./pages/History"
import Monitoring from "./pages/Monitoring"
import Settings from "./pages/Settings"
import Login from "./pages/Login"

import { SpreadsheetLayout } from "./layouts/SpreadsheetLayout"
import SpreadsheetEditor from "./pages/SpreadsheetEditor"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth()
  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { session } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
      
      {/* Spreadsheet Full Screen Route */}
      <Route element={<ProtectedRoute><SpreadsheetLayout /></ProtectedRoute>}>
        <Route path="/spreadsheet/:spreadsheetId" element={<SpreadsheetEditor />} />
      </Route>

      {/* Main Dashboard Routes with Sidebar */}
      <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/folders" element={<Folder />} />
        <Route path="/folders/:folderId" element={<FolderDetails />} />
        <Route path="/team" element={<Team />} />
        <Route path="/history" element={<History />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
