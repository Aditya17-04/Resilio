import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ExecutiveDashboard from './pages/ExecutiveDashboard'
import NetworkGraph from './pages/NetworkGraph'
import RiskIntelligence from './pages/RiskIntelligence'
import PredictiveAlerts from './pages/PredictiveAlerts'
import ResilienceSimulator from './pages/ResilienceSimulator'

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<ExecutiveDashboard />} />
          <Route path="/network" element={<NetworkGraph />} />
          <Route path="/risk" element={<RiskIntelligence />} />
          <Route path="/alerts" element={<PredictiveAlerts />} />
          <Route path="/simulator" element={<ResilienceSimulator />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1E293B', color: '#E2E8F0', border: '1px solid rgba(51,65,85,0.5)' }
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
