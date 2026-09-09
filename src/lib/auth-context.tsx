"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

const AUTH_KEY = "intenteo-auth"

const PUBLIC_ROUTES = new Set([
  "/",
  "/signin",
  "/signup",
  "/how-it-works",
  "/learn",
  "/blog",
  "/about",
  "/privacy",
  "/terms",
  "/contact",
  "/faq",
  "/download",
])

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.has(pathname)) return true
  if (pathname.startsWith("/blog/")) return true
  if (pathname.startsWith("/learn/")) return true
  return false
}

interface AuthContextType {
  isSignedIn: boolean
  isHydrated: boolean
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  isHydrated: false,
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

  // Route guard — redirect non-authed users away from app routes
  useEffect(() => {
    if (!hydrated) return
    if (!isSignedIn && !isPublicRoute(pathname)) {
      router.push("/signin")
    }
  }, [hydrated, isSignedIn, pathname, router])

  return (
    <AuthContext.Provider value={{ isSignedIn, isHydrated: hydrated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
