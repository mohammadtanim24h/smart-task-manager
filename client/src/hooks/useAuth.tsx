import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AuthUser, AuthResponse } from "@/lib/api"

type AuthContextType = {
  isLoggedIn: boolean
  user: AuthUser | null
  token: string | null
  login: (auth: AuthResponse) => void
  logout: () => void
}

const STORAGE_KEYS = {
  TOKEN: "stm_token",
  USER: "stm_user",
} as const

function getUserFromStorage(): AuthUser | null {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userStr) return null

    const user = JSON.parse(userStr) as AuthUser
    // Validate that user has required fields
    if (user && user.id && user.email && user.name) {
      return user
    }
    return null
  } catch {
    return null
  }
}

function getTokenFromStorage(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => getUserFromStorage())
  const [token, setToken] = useState<string | null>(() => getTokenFromStorage())

  // Listen for storage changes (e.g., from other tabs or logout)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.USER) {
        setUser(getUserFromStorage())
      }
      if (e.key === STORAGE_KEYS.TOKEN) {
        setToken(getTokenFromStorage())
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const login = (auth: AuthResponse) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, auth.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(auth.user))
    setUser(auth.user)
    setToken(auth.token)
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setUser(null)
    setToken(null)
  }

  const isLoggedIn = !!(user && token)

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to check if user is logged in by checking localStorage
 * @returns Object containing isLoggedIn status, user data, token, and logout function
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

