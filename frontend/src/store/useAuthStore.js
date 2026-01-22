import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        console.log('✅ Setting auth:', { user: user?.walletAddress, hasToken: !!token })
        set({ user, token, isAuthenticated: true })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }))
      },

      logout: () => {
        console.log('🚪 Logging out')
        set({ user: null, token: null, isAuthenticated: false })
        // Clear localStorage
        localStorage.removeItem('auth-storage')
      },

      getToken: () => {
        return get().token
      },

      // Check if auth is valid
      isAuthValid: () => {
        const { token, user } = get()
        return !!(token && user)
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      // Persist all state
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore