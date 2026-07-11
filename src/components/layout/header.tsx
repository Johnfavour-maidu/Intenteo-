"use client"
import React, { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Bell, Moon, Sun, Menu, Search, Calendar, User, Settings, Map, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useTheme } from "next-themes"
import { UniversalSearch } from "./universal-search"
import { CommandCenter } from "./command-center"
import { NotificationCenter, getUnreadCount } from "./notification-center"
import { useUserProfile } from "@/lib/user-profile-context"

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
  const { name, username, avatar, avatarFocalPoint } = useUserProfile()

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

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!profileOpen) return
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [profileOpen])

  const handleSignOut = useCallback(() => {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith("intenteo-"))
      keys.forEach(k => localStorage.removeItem(k))
    } catch {}
    window.location.reload()
  }, [])

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

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-accent"
              aria-label="Profile menu"
            >
              {avatar ? (
                <div className="h-8 w-8 rounded-full overflow-hidden">
                  <img
                    src={avatar}
                    alt={name || "User"}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${avatarFocalPoint.x * 100}% ${avatarFocalPoint.y * 100}%` }}
                  />
                </div>
              ) : (
                <UserAvatar size="sm" fallback={name ? name.charAt(0).toUpperCase() : "U"} />
              )}
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-[#1E0E6B]/10 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-[#1E0E6B]/10">
                  <p className="text-sm font-semibold truncate">{name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">@{username || "user"}</p>
                </div>
                <div className="py-1">
                  <Link href="/settings?tab=profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[#1E0E6B]/5 transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" /> My Profile
                  </Link>
                  <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[#1E0E6B]/5 transition-colors">
                    <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                  </Link>
                  <Link href="/journey" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[#1E0E6B]/5 transition-colors">
                    <Map className="h-4 w-4 text-muted-foreground" /> My Journey
                  </Link>
                </div>
                <div className="border-t border-[#1E0E6B]/10 py-1">
                  <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-[#1E0E6B]/5 transition-colors w-full">
                    <LogOut className="h-4 w-4 text-muted-foreground" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <UniversalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
