"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  toggleCollapsed: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}