"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { loadUserSettings, type UserSettings } from "./user-settings"

interface UserProfileContextType {
  name: string
  username: string
  avatar: string
  avatarFocalPoint: { x: number; y: number }
  email: string
  refresh: () => void
}

const UserProfileContext = createContext<UserProfileContextType>({
  name: "",
  username: "",
  avatar: "",
  avatarFocalPoint: { x: 0.5, y: 0.5 },
  email: "",
  refresh: () => {},
})

export function useUserProfile() {
  return useContext(UserProfileContext)
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState(() => {
    const settings = loadUserSettings()
    return {
      name: settings.profile.name,
      username: settings.profile.username,
      avatar: settings.profile.avatar,
      avatarFocalPoint: settings.profile.avatarFocalPoint || { x: 0.5, y: 0.5 },
      email: settings.profile.email,
    }
  })

  const refresh = useCallback(() => {
    const settings = loadUserSettings()
    setProfile({
      name: settings.profile.name,
      username: settings.profile.username,
      avatar: settings.profile.avatar,
      avatarFocalPoint: settings.profile.avatarFocalPoint || { x: 0.5, y: 0.5 },
      email: settings.profile.email,
    })
  }, [])

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "intenteo-user-settings") {
        refresh()
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [refresh])

  // Poll for changes every 2 seconds (same-tab sync from settings page)
  useEffect(() => {
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <UserProfileContext.Provider value={{ ...profile, refresh }}>
      {children}
    </UserProfileContext.Provider>
  )
}
