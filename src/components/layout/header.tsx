"use client"
import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Bell, Moon, Sun, Menu, Undo2, Redo2, Search, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useTheme } from "next-themes"
import { useUndoRedo } from "@/components/providers/undo-redo-provider"
import { UniversalSearch } from "./universal-search"
import { CommandCenter } from "./command-center"
import { NotificationCenter } from "./notification-center"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const { theme, setTheme } = useTheme()
  const { canUndo, canRedo, undo, redo } = useUndoRedo()

  const [searchOpen, setSearchOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const handleUndo = useCallback(() => {
    undo()
    showToast("Undo successful")
  }, [undo, showToast])

  const handleRedo = useCallback(() => {
    redo()
    showToast("Redo successful")
  }, [redo, showToast])

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

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            disabled={!canUndo}
            onClick={handleUndo}
            className="h-9 w-9"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!canRedo}
            onClick={handleRedo}
            className="h-9 w-9"
            title="Redo"
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

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-foreground text-background text-sm px-4 py-2 rounded-full shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
