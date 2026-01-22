import { Navigate, useLocation } from 'react-router-dom'
import { useAddress } from '@thirdweb-dev/react'
import useAuthStore from '@/store/useAuthStore'

const ProtectedRoute = ({ children }) => {
  const address = useAddress()
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!address || !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute