"use client"
import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Bell, Moon, Sun, Menu, Search, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useTheme } from "next-themes"
import { UniversalSearch } from "./universal-search"
import { CommandCenter } from "./command-center"
import { NotificationCenter, getUnreadCount } from "./notification-center"

function NotificationBadge() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    const update = () => setCount(getUnreadCount())
    update()
    const interval = setInterval(update, 15000)
    return () => clearInterval(interval)
  }, [])

  if (count === 0) return null
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1">
      {count > 99 ? "99+" : count}
    </span>
  )
}

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-50 animate-in fade-in duration-150">
          {label}
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900 dark:border-b-gray-800" />
        </span>
      )}
    </div>
  )
}

export function Header() {
  const { theme, setTheme } = useTheme()

  const [searchOpen, setSearchOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifTriggerRef = useRef<HTMLButtonElement>(null)

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

        <div className="relative flex-1 max-w-xs">
          <button
            onClick={toggleSearch}
            className="w-full flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-[#1E0E6B]/20 bg-background text-sm text-muted-foreground hover:border-[#1E0E6B]/40 transition-colors cursor-text"
            aria-label="Search anything"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search anything...</span>
          </button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <Tooltip label="Switch Theme">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Switch theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </Tooltip>

          <Tooltip label="Calendar">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCommand}
                className={commandOpen ? "bg-accent text-accent-foreground" : ""}
                aria-label="Calendar"
              >
                <Calendar className="h-5 w-5" />
              </Button>
              <CommandCenter open={commandOpen} onClose={() => setCommandOpen(false)} />
            </div>
          </Tooltip>

          <Tooltip label="Notifications">
            <div className="relative">
              <Button
                ref={notifTriggerRef}
                variant="ghost"
                size="icon"
                onClick={toggleNotif}
                className={`relative ${notifOpen ? "bg-accent text-accent-foreground" : ""}`}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <NotificationBadge />
              </Button>
              <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} triggerRef={notifTriggerRef} />
            </div>
          </Tooltip>

          <Tooltip label="My Profile">
            <Link href="/settings?tab=profile" aria-label="My Profile">
              <UserAvatar size="sm" fallback="JD" />
            </Link>
          </Tooltip>
        </div>
      </header>

      <UniversalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
