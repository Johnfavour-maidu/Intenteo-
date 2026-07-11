"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const AUTH_KEY = "intenteo-auth"

interface AuthContextType {
  isSignedIn: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  signIn: () => {},
  signOut: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    try {
      setIsSignedIn(localStorage.getItem(AUTH_KEY) === "true")
    } catch {}
    setHydrated(true)
  }, [])

  const signIn = useCallback(() => {
    try { localStorage.setItem(AUTH_KEY, "true") } catch {}
    setIsSignedIn(true)
    router.push("/")
  }, [router])

  const signOut = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("intenteo-"))
      keys.forEach(k => localStorage.removeItem(k))
      localStorage.removeItem(AUTH_KEY)
    } catch {}
    setIsSignedIn(false)
    router.push("/signin")
  }, [router])

  // Route guard
  useEffect(() => {
    if (!hydrated) return
    if (!isSignedIn && pathname !== "/signin") {
      router.push("/signin")
    }
  }, [hydrated, isSignedIn, pathname, router])

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
