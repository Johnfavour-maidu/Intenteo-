"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  CheckSquare,
  Repeat,
  Target,
  Menu,
  X,
  Settings,
  BookOpen,
  Star,
  Compass,
  BarChart3,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MobileNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const bottomTabs: MobileNavItem[] = [
  { title: "Today", href: "/", icon: CalendarDays },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Habits", href: "/habits", icon: Repeat },
  { title: "Goals", href: "/goals", icon: Target },
]

const drawerItems: MobileNavItem[] = [
  { title: "Journal", href: "/journal", icon: BookOpen },
  { title: "Visions", href: "/visions", icon: Star },
  { title: "Browse Trackers", href: "/browse-trackers", icon: Compass },
  { title: "Reports & Exports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Bottom Tab Bar — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center h-14 px-2">
          {bottomTabs.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
                  isActive
                    ? "text-[#1E0E6B]"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className={cn("text-[10px] leading-tight", isActive ? "font-bold" : "font-medium")}>
                  {item.title}
                </span>
              </Link>
            )
          })}
          {/* More menu button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
              drawerOpen ? "text-[#1E0E6B]" : "text-muted-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] leading-tight font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <h3 className="text-sm font-bold text-foreground">More</h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <ScrollArea className="flex-1 px-4 pb-6">
              <nav className="space-y-1">
                {drawerItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
            </ScrollArea>
          </div>
        </div>
      )}
    </>
  )
}
