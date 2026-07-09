"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell, Moon, Sun, Menu, Calendar, Undo2, Redo2, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useTheme } from "next-themes"
import { useUndoRedo } from "@/components/providers/undo-redo-provider"
import { UniversalSearch } from "./universal-search"
import { CommandCenter } from "./command-center"
import { NotificationCenter } from "./notification-center"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { canUndo, canRedo, undo, redo } = useUndoRedo()

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

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSearch}
          className="gap-2 text-muted-foreground hover:text-foreground h-9 px-3"
        >
          <Command className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">Search</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium text-muted-foreground ml-1">
            ⌘K
          </kbd>
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canUndo}
            onClick={undo}
            className="h-9 w-9"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRedo}
            onClick={redo}
            className="h-9 w-9"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

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
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#EB9E5B]" />
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
