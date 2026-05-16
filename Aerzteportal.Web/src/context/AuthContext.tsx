import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { me as fetchMe, login as apiLogin, logout as apiLogout } from '../api/auth'

interface User {
  id: string
  name?: string | null
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMe()
      .then(r => setUser(r.user))
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    await apiLogin(username, password)
    const r = await fetchMe()
    setUser(r.user)
  }

  async function logout() {
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
