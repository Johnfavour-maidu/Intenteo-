"use client"

import React, { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  Repeat,
  Settings,
  ChevronLeft,
  ChevronRight,
  Star,
  Compass,
  Pin,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useSidebar } from "./sidebar-context"
import { useUserProfile } from "@/lib/user-profile-context"
import {
  getQuickAccessItems,
  isQuickAccessExpanded,
  setQuickAccessExpanded,
  type QuickAccessItem,
} from "@/lib/quick-access"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface NavSection {
  section: string
  items: NavItem[]
}

const mainNav: NavSection[] = [
  {
    section: "EXECUTION",
    items: [
      { title: "Today", href: "/", icon: LayoutDashboard },
      { title: "Tasks", href: "/tasks", icon: CheckSquare },
      { title: "Habits", href: "/habits", icon: Repeat },
      { title: "Journal", href: "/journal", icon: BookOpen },
    ],
  },
  {
    section: "PLANNING",
    items: [
      { title: "Goals", href: "/goals", icon: Target },
      { title: "Visions", href: "/visions", icon: Star },
    ],
  },
]

const bottomNav: NavItem[] = [
  { title: "Browse Trackers", href: "/browse-trackers", icon: Compass },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed } = useSidebar()
  const { name, username, avatar, avatarFocalPoint } = useUserProfile()
  const [quickItems, setQuickItems] = useState<QuickAccessItem[]>([])
  const [qaExpanded, setQaExpanded] = useState(true)

  const refreshQuickItems = useCallback(() => {
    setQuickItems(getQuickAccessItems())
    setQaExpanded(isQuickAccessExpanded())
  }, [])

  useEffect(() => {
    refreshQuickItems()
    window.addEventListener("quick-access-changed", refreshQuickItems)
    return () => window.removeEventListener("quick-access-changed", refreshQuickItems)
  }, [refreshQuickItems])

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl transition-all duration-200 ease-in-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Collapse/Expand Arrow — positioned outside logo area */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-6 z-50 h-6 w-6 rounded-full border bg-card shadow-md hover:bg-muted"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      <div className="flex h-full flex-col">
        {/* Logo Section — aligns with profile and nav left edge */}
        {!collapsed ? (
          <div className="flex h-14 w-full items-center justify-start px-4">
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/logo.png"
                alt="Intenteo"
                className="h-10 w-auto max-w-[220px] object-contain"
                style={{ imageRendering: "auto" }}
              />
            </Link>
          </div>
        ) : (
          <div className="flex h-14 items-center justify-center">
            <Link href="/" className="flex items-center justify-center">
              <img
                src="/favicon.png"
                alt="Intenteo"
                className="h-10 w-10 object-contain"
                style={{ imageRendering: "auto" }}
              />
            </Link>
          </div>
        )}

        <Separator />

        {/* User Profile — links to Settings Profile */}
        <Link href="/settings?tab=profile" className={cn("flex items-center gap-3 py-2.5 px-4 hover:bg-muted/30 transition-colors", collapsed && "justify-center")}>
          {avatar ? (
            <div className="h-10 w-10 rounded-full overflow-hidden shrink-0">
              <img
                src={avatar}
                alt={name || "User"}
                className="h-full w-full object-cover"
                style={{ objectPosition: `${avatarFocalPoint.x * 100}% ${avatarFocalPoint.y * 100}%` }}
              />
            </div>
          ) : (
            <UserAvatar size="md" fallback={name ? name.charAt(0).toUpperCase() : "U"} status="online" />
          )}
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{username ? `@${username}` : "Live with Intentionality"}</p>
            </div>
          )}
        </Link>

        <Separator />

        {/* Main Navigation */}
        <ScrollArea className="flex-1 px-4 py-3">
          <nav className="space-y-1">
            {mainNav.map((section, sectionIndex) => (
              <div key={section.section} className={`space-y-1 ${sectionIndex > 0 ? "pt-4" : ""}`}>
                {!collapsed && (
                  <div className="px-3 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      {section.section}
                    </span>
                  </div>
                )}
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Pinned Items — from Quick Access */}
          {quickItems.length > 0 && !collapsed && (
            <div className="mt-4">
              <button
                onClick={() => {
                  const next = !qaExpanded
                  setQaExpanded(next)
                  setQuickAccessExpanded(next)
                }}
                className="flex items-center gap-1 px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <Pin className="h-3 w-3" />
                Pinned
                <ChevronRight className={cn("h-3 w-3 ml-auto transition-transform", qaExpanded && "rotate-90")} />
              </button>
              {qaExpanded && (
                <nav className="space-y-0.5">
                  {quickItems.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="group flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <Link
                        href={item.route}
                        className="flex items-center gap-2 flex-1 min-w-0"
                      >
                        <span className="text-base shrink-0">{item.icon}</span>
                        <span className="text-xs font-medium truncate">{item.title}</span>
                      </Link>
                    </div>
                  ))}
                </nav>
              )}
            </div>
          )}

          {quickItems.length > 0 && collapsed && (
            <div className="mt-4 space-y-1 px-4">
              {quickItems.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.route}
                  className="flex items-center justify-center py-1.5"
                  title={item.title}
                >
                  <span className="text-lg">{item.icon}</span>
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Bottom — Browse Trackers + Settings */}
        <div className="border-t px-4 py-3">
          <nav className="space-y-1">
            {bottomNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  )
}
