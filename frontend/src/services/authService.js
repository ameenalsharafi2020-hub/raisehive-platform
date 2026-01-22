import api from './api'
import { ethers } from 'ethers'

class AuthService {
  async getNonce(walletAddress) {
    try {
      console.log('📝 Requesting nonce for:', walletAddress)
      const response = await api.post('/auth/nonce', { walletAddress })
      console.log('✅ Nonce received')
      return response.data
    } catch (error) {
      console.error('❌ Get nonce error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to get authentication nonce')
    }
  }

  async authenticateWallet(walletAddress, signature, message) {
    try {
      console.log('🔐 Authenticating wallet:', walletAddress)
      const response = await api.post('/auth/wallet', {
        walletAddress,
        signature,
        message
      })
      console.log('✅ Authentication successful')
      return response.data
    } catch (error) {
      console.error('❌ Authenticate wallet error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Failed to authenticate wallet')
    }
  }

  async signMessage(message) {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    try {
      console.log('✍️ Requesting signature...')
      console.log('📄 Message:', message)
      
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      
      // Request signature
      const signature = await signer.signMessage(message)
      
      console.log('✅ Message signed successfully')
      console.log('📝 Signature:', signature.slice(0, 20) + '...')
      
      return signature
    } catch (error) {
      console.error('❌ Sign message error:', error)
      
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        throw new Error('Signature request rejected by user')
      }
      
      throw error
    }
  }

  async loginWithWallet(walletAddress) {
    try {
      console.log('🚀 Starting wallet authentication process...')
      console.log('📍 Wallet address:', walletAddress)
      
      // Step 1: Get nonce
      const nonceResponse = await this.getNonce(walletAddress)
      const { message } = nonceResponse.data
      
      console.log('📋 Step 1/3: Nonce received ✅')

      // Step 2: Sign message
      const signature = await this.signMessage(message)
      
      console.log('📋 Step 2/3: Message signed ✅')

      // Step 3: Authenticate
      const authResponse = await this.authenticateWallet(
        walletAddress,
        signature,
        message
      )
      
      console.log('📋 Step 3/3: Authentication complete ✅')
      console.log('🎉 Login successful!')
      
      return authResponse

    } catch (error) {
      console.error('❌ Login failed:', error.message)
      throw error
    }
  }

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    return response.data
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  }
}

export default new AuthService()