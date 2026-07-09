"use client"
import React, { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Bell,
  ArrowRight,
  X,
  Search,
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

  return notifications
}

export function getUnreadCount(): number {
  const notifications = generateNotifications()
  const readIds = getReadIds()
  return notifications.filter((n) => !readIds.includes(n.id)).length
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])
  const [modalSearchQuery, setModalSearchQuery] = useState("")

  const notifications = useMemo(() => (open || modalOpen ? generateNotifications() : []), [open, modalOpen])

  useEffect(() => {
    setReadIds(getReadIds())
  }, [open, modalOpen])

  const unreadIds = useMemo(() => {
    return notifications.filter((n) => !readIds.includes(n.id)).map((n) => n.id)
  }, [notifications, readIds])

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

  const filteredNotifications = useMemo(() => {
    if (!modalSearchQuery.trim()) return notifications
    const q = modalSearchQuery.toLowerCase()
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q)
    )
  }, [notifications, modalSearchQuery])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  useEffect(() => {
    if (!modalOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [modalOpen])

  return (
    <>
      {/* Mini Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Notifications</span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    markAsRead(notif.id)
                    router.push(notif.href)
                    onClose()
                  }}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="relative mt-0.5 shrink-0">
                    {!readIds.includes(notif.id) && (
                      <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    <span className="text-muted-foreground">{notif.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{notif.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notif.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{notif.timestamp}</span>
                </button>
              ))}
            </div>

            <div className="border-t px-4 py-2.5">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-7 justify-between"
                onClick={() => {
                  setModalOpen(true)
                  onClose()
                }}
              >
                View All Notifications
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="fixed left-1/2 top-1/2 z-[61] -translate-x-1/2 -translate-y-1/2 w-full max-w-[520px] max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">Notifications</h2>
                  {unreadIds.length > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {unreadIds.length} unread
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-7 gap-1.5" onClick={markAllRead}>
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark All Read
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setModalOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="px-6 pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-2">
                {filteredNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Bell className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          markAsRead(notif.id)
                          router.push(notif.href)
                          setModalOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-colors text-left",
                          !readIds.includes(notif.id) ? "bg-muted/40" : "hover:bg-muted/30"
                        )}
                      >
                        <div className="relative mt-0.5 shrink-0">
                          {!readIds.includes(notif.id) && (
                            <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500" />
                          )}
                          <span className="text-muted-foreground">{notif.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm", !readIds.includes(notif.id) ? "font-semibold" : "font-medium")}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{notif.subtitle}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{notif.timestamp}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
