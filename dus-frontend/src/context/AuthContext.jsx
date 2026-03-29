import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Sayfa yüklenince mevcut kullanıcıyı kontrol et
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authAPI.me()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.clear()
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData)
    localStorage.setItem('access_token',  data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout({ refresh: localStorage.getItem('refresh_token') })
    } catch {}
    localStorage.clear()
    setUser(null)
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }))
  }, [])

  // Rol kontrol yardımcıları
  const isAdmin    = user?.role === 'admin'
  const isTrainer  = user?.role === 'trainer'
  const isSupport  = user?.role === 'support'
  const isCustomer = user?.role === 'customer'
  const isStaff    = ['admin', 'trainer', 'support'].includes(user?.role)

  // Plan kontrol
  const hasPro       = user?.subscription === 'pro'
  const hasStandart  = user?.subscription === 'standart'
  const hasTrial     = user?.subscription === 'trial'
  const hasAI        = hasPro || isTrainer || isAdmin  // AI kart üretimi

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, updateUser,
      isAdmin, isTrainer, isSupport, isCustomer, isStaff,
      hasPro, hasStandart, hasTrial, hasAI,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
