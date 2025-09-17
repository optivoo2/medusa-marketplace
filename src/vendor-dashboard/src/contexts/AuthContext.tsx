import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
}

interface Vendor {
  id: string
  name: string
  email: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  vendor: Vendor | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('vendor_token')
    if (storedToken) {
      setToken(storedToken)
      // Verify token and get user/vendor info
      verifyToken(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/api/vendor/profile')
      setUser(response.data.user)
      setVendor(response.data.vendor)
    } catch (error) {
      localStorage.removeItem('vendor_token')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/vendor/auth', { email, password })
      const { user, vendor, token } = response.data
      
      setUser(user)
      setVendor(vendor)
      setToken(token)
      localStorage.setItem('vendor_token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } catch (error) {
      throw new Error('Falha ao entrar na plataforma')
    }
  }

  const logout = () => {
    setUser(null)
    setVendor(null)
    setToken(null)
    localStorage.removeItem('vendor_token')
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    vendor,
    token,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
