"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  BookOpen,
  Repeat,
  BarChart3,
  Sparkles,
  Settings,
  User,
  Compass,
  Brain,
  Clock,
  Trophy,
  Bell,
  ChevronLeft,
  ChevronRight,
  Folder,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UserAvatar } from "@/components/ui/user-avatar"

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
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Projects", href: "/projects", icon: Folder },
]

const aiNav: NavItem[] = [
  { title: "AI Coach", href: "/coach", icon: Sparkles, badge: "Téo" },
  { title: "Life GPS", href: "/life-gps", icon: Compass },
  { title: "Decision Journal", href: "/decisions", icon: Brain },
]

const analyticsNav: NavItem[] = [
  { title: "Memory Timeline", href: "/timeline", icon: Clock },
  { title: "Challenges", href: "/challenges", icon: Trophy },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
]

const bottomNav: NavItem[] = [
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Profile", href: "/profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4">
          {!collapsed ? (
            <Link href="/" className="flex items-center">
              <img
                src="/logo.svg"
                alt="Intenteo"
                className="h-10 w-auto"
              />
            </Link>
          ) : (
            <Link href="/" className="flex items-center justify-center">
              <img
                src="/favicon.svg"
                alt="Intenteo"
                className="h-8 w-8"
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <Separator />

        {/* User Profile */}
        <div className={cn("flex items-center gap-3 p-4", collapsed && "justify-center")}>
          <UserAvatar size="md" fallback="JD" status="online" />
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Live with Intentionality</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </p>
            )}
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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

          {!collapsed && (
            <p className="mb-2 mt-6 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              AI & Insights
            </p>
          )}
          <nav className="space-y-1">
            {aiNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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

          {!collapsed && (
            <p className="mb-2 mt-6 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Analytics
            </p>
          )}
          <nav className="space-y-1">
            {analyticsNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
        </ScrollArea>

        {/* Bottom Navigation */}
        <div className="border-t p-3">
          <nav className="space-y-1">
            {bottomNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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
