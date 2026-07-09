"use client"
import React, { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Bell,
  X,
  CheckCheck,
  Target,
  Repeat,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  timestamp: string
  href: string
  sortTime: number
}

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

function getReadIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem("intenteo-notifications-read") || "[]")
  } catch {
    return []
  }
}

function saveReadIds(ids: string[]) {
  localStorage.setItem("intenteo-notifications-read", JSON.stringify(ids))
}

function generateNotifications(): Notification[] {
  const notifications: Notification[] = []
  const now = Date.now()

  function timeAgo(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days === 1) return "Yesterday"
    return `${days}d ago`
  }

  // Demo notifications — always present
  notifications.push({
    id: "demo-review",
    title: "Daily Review completed",
    subtitle: "Your reflection has been saved.",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    timestamp: "Just now",
    href: "/tasks",
    sortTime: now,
  })
  notifications.push({
    id: "demo-reminder",
    title: "Reminder",
    subtitle: "Call Oga",
    icon: <Bell className="h-4 w-4 text-orange-500" />,
    timestamp: "9:00 AM",
    href: "/calendar",
    sortTime: now - 3600000,
  })
  notifications.push({
    id: "demo-goal",
    title: "Goal Progress",
    subtitle: "Launch Intenteo MVP reached 50%.",
    icon: <Target className="h-4 w-4 text-blue-500" />,
    timestamp: "1 hour ago",
    href: "/goals",
    sortTime: now - 3600000 * 2,
  })
  notifications.push({
    id: "demo-habit",
    title: "Habit Completed",
    subtitle: "Morning Prayer completed.",
    icon: <Repeat className="h-4 w-4 text-purple-500" />,
    timestamp: "Yesterday",
    href: "/habits",
    sortTime: now - 86400000,
  })
  notifications.push({
    id: "demo-task",
    title: "Task Completed",
    subtitle: "Review Q2 strategy document finished.",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    timestamp: "Yesterday",
    href: "/tasks",
    sortTime: now - 86400000 * 2,
  })

  // Real data — tasks completed today
  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]") as Record<string, unknown>[]
    const today = new Date().toISOString().split("T")[0]
    if (Array.isArray(tasks)) {
      const completed = tasks.filter(
        (t) =>
          (t.completed === true || t.status === "done") &&
          (t.completedDate === today || (typeof t.updatedAt === "string" && t.updatedAt.startsWith(today)))
      )
      for (const task of completed.slice(0, 3)) {
        const ts = typeof task.completedDate === "string" ? new Date(task.completedDate).getTime() : now
        notifications.push({
          id: `task-${String(task.id)}`,
          title: String(task.title || "Task completed"),
          subtitle: "Marked as done",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          timestamp: timeAgo(now - ts),
          href: "/tasks",
          sortTime: ts,
        })
      }
    }
  } catch {}

  // Real data — habits with milestone streaks
  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]") as Record<string, unknown>[]
    if (Array.isArray(habits)) {
      for (const habit of habits.slice(0, 2)) {
        const streak = Number(habit.streak || 0)
        if (streak >= 7 && streak % 7 === 0) {
          notifications.push({
            id: `habit-streak-${String(habit.id)}`,
            title: `${String(habit.name || "Habit")} streak: ${streak} days`,
            subtitle: `${streak >= 30 ? "Incredible" : streak >= 14 ? "Amazing" : "Great"} consistency!`,
            icon: <Repeat className="h-4 w-4 text-purple-500" />,
            timestamp: "Ongoing",
            href: "/habits",
            sortTime: now - 1000,
          })
        }
      }
    }
  } catch {}

  // Real data — goals hitting milestones
  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]") as Record<string, unknown>[]
    if (Array.isArray(goals)) {
      for (const goal of goals.slice(0, 2)) {
        const progress = Number(goal.progress || 0)
        if (progress >= 50) {
          notifications.push({
            id: `goal-${String(goal.id)}`,
            title: `${String(goal.title || "Goal")}: ${progress}% reached`,
            subtitle: progress >= 100 ? "Completed!" : "Milestone achieved",
            icon: <Target className="h-4 w-4 text-blue-500" />,
            timestamp: "Active",
            href: "/goals",
            sortTime: now - 500,
          })
          break
        }
      }
    }
  } catch {}

  // Sort by most recent first
  notifications.sort((a, b) => b.sortTime - a.sortTime)

  // Cap at 30 notifications
  return notifications.slice(0, 30)
}

export function getUnreadCount(): number {
  const notifications = generateNotifications()
  const readIds = getReadIds()
  return notifications.filter((n) => !readIds.includes(n.id)).length
}

export function NotificationCenter({ open, onClose, triggerRef }: NotificationCenterProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const [readIds, setReadIds] = useState<string[]>([])
  const [expanded, setExpanded] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null)

  const notifications = useMemo(() => (open ? generateNotifications() : []), [open])

  const INITIAL_COUNT = 5

  const visibleNotifications = useMemo(() => {
    return expanded ? notifications : notifications.slice(0, INITIAL_COUNT)
  }, [notifications, expanded])

  const hasMore = notifications.length > INITIAL_COUNT

  useEffect(() => {
    if (open && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
  }, [open, triggerRef])

  useEffect(() => {
    if (!open) {
      setExpanded(false)
      return
    }
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && triggerRef?.current && !triggerRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose, triggerRef])

  useEffect(() => {
    setReadIds(getReadIds())
  }, [open])

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id]
      saveReadIds(next)
      return next
    })
  }, [])

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = [...new Set([...prev, ...notifications.map((n) => n.id)])]
      saveReadIds(next)
      return next
    })
  }, [notifications])

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).length
  }, [notifications, readIds])

  return (
    <AnimatePresence>
      {open && dropdownPos && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="fixed w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-[100]"
          style={{ top: dropdownPos.top, right: dropdownPos.right }}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-[11px] h-6 px-2 gap-1" onClick={markAllRead}>
                  <CheckCheck className="h-3 w-3" />
                  Read all
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Notifications list */}
          <motion.div
            animate={{ height: expanded ? 700 : 420 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="h-full overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <span className="text-3xl mb-3">{"\u{1F389}"}</span>
                  <p className="text-sm font-medium">You&apos;re all caught up.</p>
                  <p className="text-xs text-muted-foreground mt-1">New reminders, achievements and updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-0.5 px-1 py-1">
                  {visibleNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id)
                        router.push(notif.href)
                        onClose()
                      }}
                      className={cn(
                        "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                        !readIds.includes(notif.id) ? "bg-muted/40" : "hover:bg-muted/30"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        <span className="text-muted-foreground">{notif.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !readIds.includes(notif.id) ? "font-semibold" : "font-medium")}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{notif.subtitle}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{notif.timestamp}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          {hasMore && !expanded && (
            <div className="border-t px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() => setExpanded(true)}
              >
                Show Older Notifications
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
