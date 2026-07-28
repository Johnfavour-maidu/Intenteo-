"use client"

import { useEffect } from "react"
import { loadUserSettings } from "@/lib/user-settings"

function lightenHex(hex: string, amount: number): string {
  const h = hex.replace("#", "")
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  const nr = Math.round(r + (255 - r) * amount)
  const ng = Math.round(g + (255 - g) * amount)
  const nb = Math.round(b + (255 - b) * amount)
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`
}

export function applyBackgroundColor(color: string) {
  document.documentElement.style.setProperty("--background", color)
  document.documentElement.style.setProperty("--card", lightenHex(color, 0.15))
  document.documentElement.style.setProperty("--popover", lightenHex(color, 0.15))
  document.documentElement.style.setProperty("--sidebar-background", color)
}

export function resetBackgroundColor() {
  const defaults = ["--background", "--card", "--popover", "--sidebar-background"]
  defaults.forEach((v) => document.documentElement.style.removeProperty(v))
}

export function BackgroundColorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => {
      try {
        const settings = loadUserSettings()
        const color = settings.appearance?.backgroundColor
        if (color && color !== "#FAFBFF") {
          applyBackgroundColor(color)
        } else {
          resetBackgroundColor()
        }
      } catch {
        resetBackgroundColor()
      }
    }

    apply()

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "intenteo-user-settings") apply()
    }
    window.addEventListener("storage", handleStorage)

    const handleSettingsChanged = () => apply()
    window.addEventListener("user-settings-changed", handleSettingsChanged)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("user-settings-changed", handleSettingsChanged)
    }
  }, [])

  return <>{children}</>
}
