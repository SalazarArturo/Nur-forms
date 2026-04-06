import { create } from 'zustand'
import { authApi } from '../api/services'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authApi.login({ email, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      set({ token, user, loading: false })
      return user
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión'
      set({ error: msg, loading: false })
      throw err
    }
  },

  fetchMe: async () => {
    try {
      const res = await authApi.me()
      set({ user: res.data.user || res.data })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null })
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
