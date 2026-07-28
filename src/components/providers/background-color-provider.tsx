"use client"

import { useEffect } from "react"
import { loadUserSettings } from "@/lib/user-settings"

export function BackgroundColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyBackgroundColor = () => {
      try {
        const settings = loadUserSettings()
        const color = settings.appearance?.backgroundColor || "#FAFBFF"
        document.documentElement.style.setProperty("--background", color)
      } catch {
        document.documentElement.style.setProperty("--background", "#FAFBFF")
      }
    }

    applyBackgroundColor()

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "intenteo-user-settings") applyBackgroundColor()
    }
    window.addEventListener("storage", handleStorage)

    const handleSettingsChanged = () => applyBackgroundColor()
    window.addEventListener("user-settings-changed", handleSettingsChanged)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("user-settings-changed", handleSettingsChanged)
    }
  }, [])

  return <>{children}</>
}
