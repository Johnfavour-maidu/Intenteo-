"use client"

import React from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useSidebar } from "./sidebar-context"
import { useUserProfile } from "@/lib/user-profile-context"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNav: NavItem[] = [
  { title: "Today", href: "/", icon: LayoutDashboard },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Journal", href: "/journal", icon: BookOpen },
  { title: "Habits", href: "/habits", icon: Repeat },
  { title: "Visions", href: "/visions", icon: Star },
  { title: "Goals", href: "/goals", icon: Target },
]

const bottomNav: NavItem[] = [
  { title: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapsed } = useSidebar()
  const { name, username, avatar, avatarFocalPoint } = useUserProfile()

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
        {/* Logo Section */}
        {!collapsed ? (
          <div className="flex h-16 items-center px-4">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="Intenteo — Live with Intentionality"
                className="h-14 w-auto transition-opacity duration-200 ease-in-out"
              />
            </Link>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-center px-4">
            <Link href="/" className="flex items-center justify-center">
              <img
                src="/favicon-40.png"
                alt="Intenteo"
                className="h-10 w-10 transition-opacity duration-200 ease-in-out"
              />
            </Link>
          </div>
        )}

        <Separator />

        {/* User Profile — links to Settings Profile */}
        <Link href="/settings?tab=profile" className={cn("flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors", collapsed && "justify-center")}>
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
              <p className="text-xs text-muted-foreground truncate">{username ? `@${username}` : "Live with Intentionality"}</p>
            </div>
          )}
        </Link>

        <Separator />

        {/* Main Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {mainNav.map((item) => (
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
          </nav>
        </ScrollArea>

        {/* Bottom — Settings only */}
        <div className="border-t p-3">
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
