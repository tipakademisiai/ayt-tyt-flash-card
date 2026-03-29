import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

// ── DEMO KULLANICILAR (backend olmadan çalışır) ───────────────
const DEMO_USERS = {
  'admin@ayttyt.com': {
    email: 'admin@ayttyt.com', password: 'admin123',
    first_name: 'Admin', last_name: 'Kullanıcı',
    role: 'admin', subscription: 'pro',
  },
  'egitmen@ayttyt.com': {
    email: 'egitmen@ayttyt.com', password: 'egitmen123',
    first_name: 'Ahmet', last_name: 'Eğitmen',
    role: 'trainer', subscription: 'pro',
  },
  'destek@ayttyt.com': {
    email: 'destek@ayttyt.com', password: 'destek123',
    first_name: 'Ayşe', last_name: 'Destek',
    role: 'support', subscription: 'pro',
  },
  'ogrenci@ayttyt.com': {
    email: 'ogrenci@ayttyt.com', password: 'ogrenci123',
    first_name: 'Mehmet', last_name: 'Öğrenci',
    role: 'customer', subscription: 'pro',
  },
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Sayfa yüklenince mevcut kullanıcıyı kontrol et
  useEffect(() => {
    const saved = localStorage.getItem('demo_user')
    if (saved) {
      setUser(JSON.parse(saved))
      setLoading(false)
      return
    }
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
    // Demo kullanıcı kontrolü
    const demo = DEMO_USERS[email]
    if (demo && demo.password === password) {
      localStorage.setItem('demo_user', JSON.stringify(demo))
      setUser(demo)
      return demo
    }
    // Gerçek API
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
    localStorage.removeItem('demo_user')
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
