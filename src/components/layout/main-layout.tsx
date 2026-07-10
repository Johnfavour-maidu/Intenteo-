"use client"

import React, { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useSidebar } from "./sidebar-context"
import { cn } from "@/lib/utils"
import { GlobalFloatingTeo } from "@/components/teo/global-floating-teo"
import { UserProfileProvider } from "@/lib/user-profile-context"
import { loadUserSettings } from "@/lib/user-settings"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { collapsed } = useSidebar()
  const [bgColor, setBgColor] = useState("#FAFBFF")

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

  // Poll for same-tab changes
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const settings = loadUserSettings()
        setBgColor(settings.appearance.backgroundColor)
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <UserProfileProvider>
      <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: bgColor }}>
        <Sidebar />
        <div
          className={cn(
            "transition-all duration-200 ease-in-out",
            collapsed ? "pl-[72px]" : "pl-64"
          )}
        >
          <Header />
          <main className="p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <GlobalFloatingTeo />
      </div>
    </UserProfileProvider>
  )
}
