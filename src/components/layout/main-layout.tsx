"use client"

import React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useSidebar } from "./sidebar-context"
import { cn } from "@/lib/utils"
import { GlobalFloatingTeo } from "@/components/teo/global-floating-teo"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
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
  )
}