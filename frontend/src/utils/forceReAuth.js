import useAuthStore from '@/store/useAuthStore'
import authService from '@/services/authService'

export const forceReAuthenticate = async (address) => {
  try {
    console.log('🔄 Force re-authenticating:', address)
    
    const { logout, setAuth } = useAuthStore.getState()
    
    // Logout first
    logout()
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Re-authenticate
    const response = await authService.loginWithWallet(address)
    setAuth(response.data.user, response.data.token)
    
    console.log('✅ Re-authentication successful')
    return true
  } catch (error) {
    console.error('❌ Re-authentication failed:', error)
    return false
  }
}