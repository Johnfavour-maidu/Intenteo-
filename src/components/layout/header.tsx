"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell, Moon, Sun, Menu, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useTheme } from "next-themes"
import { UniversalSearch } from "./universal-search"
import { CommandCenter } from "./command-center"
import { NotificationCenter } from "./notification-center"

function NotificationBadge() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const getUnreadCount = () => {
      try {
        const readIds: string[] = JSON.parse(localStorage.getItem("intenteo-notifications-read") || "[]")
        const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
        const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
        const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
        const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
        const journal = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]")
        let total = 0
        if (Array.isArray(tasks)) total += tasks.length
        if (Array.isArray(habits)) total += habits.filter((h: any) => h.streak >= 7).length
        if (Array.isArray(goals)) total += goals.filter((g: any) => g.progress >= 25).length
        if (Array.isArray(reminders)) total += reminders.length
        if (Array.isArray(journal)) total += journal.length
        const unread = total - readIds.length
        setCount(Math.max(0, unread))
      } catch { setCount(0) }
    }
    getUnreadCount()
    const interval = setInterval(getUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function Header() {
  const { theme, setTheme } = useTheme()

  const [searchOpen, setSearchOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const closeAll = useCallback(() => {
    setSearchOpen(false)
    setCommandOpen(false)
    setNotifOpen(false)
  }, [])

  const toggleSearch = useCallback(() => {
    const next = !searchOpen
    closeAll()
    setSearchOpen(next)
  }, [searchOpen, closeAll])

  const toggleCommand = useCallback(() => {
    const next = !commandOpen
    closeAll()
    setCommandOpen(next)
  }, [commandOpen, closeAll])

  const toggleNotif = useCallback(() => {
    const next = !notifOpen
    closeAll()
    setNotifOpen(next)
  }, [notifOpen, closeAll])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        closeAll()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [closeAll])

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-xl px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative flex-1 max-w-md">
          <button
            onClick={toggleSearch}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-[#1E0E6B]/20 bg-background text-sm text-muted-foreground hover:border-[#1E0E6B]/40 transition-colors cursor-text"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search anything...</span>
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCommand}
              className={commandOpen ? "bg-accent text-accent-foreground" : ""}
            >
              <Calendar className="h-5 w-5" />
            </Button>
            <CommandCenter open={commandOpen} onClose={() => setCommandOpen(false)} />
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotif}
              className={`relative ${notifOpen ? "bg-accent text-accent-foreground" : ""}`}
            >
              <Bell className="h-5 w-5" />
              <NotificationBadge />
            </Button>
            <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          <Link href="/settings?tab=profile">
            <UserAvatar size="sm" fallback="JD" />
          </Link>
        </div>
      </header>

      <UniversalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
