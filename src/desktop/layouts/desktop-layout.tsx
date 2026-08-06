"use client"

import React, { useEffect, useState } from "react"
import { DesktopSidebar } from "../navigation/sidebar"
import { DesktopHeader } from "../navigation/header"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/components/layout/sidebar-context"
import { GlobalFloatingTeo } from "@/components/teo/global-floating-teo"
import { UserProfileProvider } from "@/lib/user-profile-context"
import { useAuth } from "@/lib/auth-context"
import { loadUserSettings } from "@/lib/user-settings"
import { carryUnfinishedTasksForward, registerKeyboardShortcuts } from "@/lib/settings-actions"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface DesktopLayoutProps {
  children: React.ReactNode
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const { collapsed } = useSidebar()
  const { resolvedTheme } = useTheme()
  const [bgColor, setBgColor] = useState("#FAFBFF")
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    const settings = loadUserSettings()
    setBgColor(settings.appearance.backgroundColor)

    const handler = (e: StorageEvent) => {
      if (e.key === "intenteo-user-settings") {
        try {
          const updated = loadUserSettings()
          setBgColor(updated.appearance.backgroundColor)
        } catch {}
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const settings = loadUserSettings()
        setBgColor(settings.appearance.backgroundColor)
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    carryUnfinishedTasksForward()
  }, [])

  useEffect(() => {
    const cleanup = registerKeyboardShortcuts(router)
    return cleanup
  }, [router])

  if (!isSignedIn) {
    return <>{children}</>
  }

  return (
    <UserProfileProvider>
      <div
        className="min-h-screen bg-background transition-colors duration-300"
        style={!isDark ? { backgroundColor: bgColor } : undefined}
      >
        <DesktopSidebar />

        <div
          className={cn(
            "transition-all duration-200 ease-in-out",
            collapsed ? "pl-[72px]" : "pl-64"
          )}
        >
          <DesktopHeader />
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>

        <GlobalFloatingTeo />
      </div>
    </UserProfileProvider>
  )
}
