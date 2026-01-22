import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useAddress } from '@thirdweb-dev/react'
import useAuthStore from '@/store/useAuthStore'
import { fixWalletConnectModal } from './utils/walletConnectFix'

import 'react-toastify/dist/ReactToastify.css'

// Layouts
import MainLayout from './layouts/MainLayout'

// Pages
import Home from './pages/Home'
import ExploreCampaigns from './pages/ExploreCampaigns'
import CampaignDetail from './pages/CampaignDetail'
import CreateCampaign from './pages/CreateCampaign'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

// Protected Route
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  useEffect(() => {
    fixWalletConnectModal()
  }, [])

 const location = useLocation()
  const address = useAddress()
  const { isAuthenticated, user } = useAuthStore()

  // Debug logging
  useEffect(() => {
    console.log('📍 Route changed:', location.pathname)
    console.log('👛 Wallet address:', address)
    console.log('🔐 Authenticated:', isAuthenticated)
    console.log('👤 User:', user)
  }, [location, address, isAuthenticated, user])

  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<ExploreCampaigns />} />
          <Route path="campaign/:id" element={<CampaignDetail />} />
          <Route path="profile/:address" element={<Profile />} />
          
          {/* Protected Routes */}
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App