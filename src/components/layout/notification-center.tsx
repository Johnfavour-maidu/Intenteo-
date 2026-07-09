"use client"
import React, { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Repeat,
  Target,
  Calendar,
  Bell,
  BookOpen,
  Sparkles,
  ArrowRight,
  X,
  Search,
  CheckCheck,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

type NotificationSource = "task" | "habit" | "goal" | "calendar" | "reminder" | "journal" | "teo"

interface Notification {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  source: NotificationSource
  timestamp: string
  dateKey: string
  href: string
}

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

const SOURCE_ICONS: Record<NotificationSource, React.ReactNode> = {
  task: <CheckCircle2 className="h-4 w-4" />,
  habit: <Repeat className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  reminder: <Bell className="h-4 w-4" />,
  journal: <BookOpen className="h-4 w-4" />,
  teo: <Sparkles className="h-4 w-4" />,
}

const SOURCE_LABELS: Record<NotificationSource, string> = {
  task: "Task",
  habit: "Habit",
  goal: "Goal",
  calendar: "Calendar",
  reminder: "Reminder",
  journal: "Journal",
  teo: "Téo",
}

const FILTER_TABS = ["All", "Unread", "Tasks", "Goals", "Habits", "Calendar", "Journal", "Téo"] as const
type FilterTab = (typeof FILTER_TABS)[number]

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
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0]

  function relativeTimestamp(dateStr: string): { display: string; dateKey: string } {
    if (!dateStr) return { display: "Unknown", dateKey: "older" }
    const d = new Date(dateStr)
    const dStr = d.toISOString().split("T")[0]
    if (dStr === today) return { display: "Today", dateKey: "today" }
    if (dStr === yesterday) return { display: "Yesterday", dateKey: "yesterday" }
    return { display: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), dateKey: "older" }
  }

  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]") as Record<string, unknown>[]
    if (Array.isArray(tasks)) {
      const completed = tasks.filter(
        (t) =>
          (t.completed === true || t.status === "done") &&
          (t.completedDate === today || (typeof t.updatedAt === "string" && t.updatedAt.startsWith(today)))
      )
      for (const task of completed.slice(0, 4)) {
        const ts = relativeTimestamp(String(task.completedDate || task.updatedAt || ""))
        notifications.push({
          id: `task-${String(task.id)}`,
          title: String(task.title || "Task completed"),
          subtitle: "Marked as done",
          icon: SOURCE_ICONS.task,
          source: "task",
          timestamp: ts.display,
          dateKey: ts.dateKey,
          href: "/tasks",
        })
      }
      const upcoming = tasks.filter(
        (t) =>
          t.completed !== true &&
          t.status !== "done" &&
          typeof t.dueDate === "string" &&
          t.dueDate >= today &&
          t.dueDate <= new Date(now.getTime() + 3 * 86400000).toISOString().split("T")[0]
      )
      for (const task of upcoming.slice(0, 2)) {
        const ts = relativeTimestamp(String(task.dueDate))
        notifications.push({
          id: `task-due-${String(task.id)}`,
          title: String(task.title || "Task due"),
          subtitle: `Due ${ts.display === "Today" ? "today" : ts.display === "Yesterday" ? "yesterday" : "soon"}`,
          icon: SOURCE_ICONS.task,
          source: "task",
          timestamp: ts.display,
          dateKey: ts.dateKey,
          href: "/tasks",
        })
      }
    }
  } catch {}

  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]") as Record<string, unknown>[]
    if (Array.isArray(habits)) {
      for (const habit of habits.slice(0, 4)) {
        const streak = Number(habit.streak || 0)
        if (streak >= 7 && streak % 7 === 0) {
          notifications.push({
            id: `habit-streak-${String(habit.id)}`,
            title: `${String(habit.name || "Habit")} streak: ${streak} days`,
            subtitle: `${streak >= 30 ? "Incredible" : streak >= 14 ? "Amazing" : "Great"} consistency!`,
            icon: SOURCE_ICONS.habit,
            source: "habit",
            timestamp: "Ongoing",
            dateKey: "today",
            href: "/habits",
          })
        }
      }
    }
  } catch {}

  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]") as Record<string, unknown>[]
    if (Array.isArray(goals)) {
      for (const goal of goals.slice(0, 3)) {
        const progress = Number(goal.progress || 0)
        const milestones = [25, 50, 75, 100]
        for (const m of milestones) {
          if (progress >= m) {
            notifications.push({
              id: `goal-${String(goal.id)}-${m}`,
              title: `${String(goal.title || "Goal")}: ${m}% reached`,
              subtitle: m === 100 ? "Completed!" : "Milestone achieved",
              icon: SOURCE_ICONS.goal,
              source: "goal",
              timestamp: "Active",
              dateKey: "today",
              href: "/goals",
            })
            break
          }
        }
      }
    }
  } catch {}

  try {
    const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]") as Record<string, unknown>[]
    if (Array.isArray(reminders)) {
      for (const r of reminders.slice(0, 2)) {
        if (typeof r.time === "string") {
          const ts = relativeTimestamp(r.time)
          if (ts.dateKey === "today" || ts.dateKey === "yesterday") {
            notifications.push({
              id: `reminder-${String(r.id)}`,
              title: String(r.title || "Reminder"),
              subtitle: String(r.description || "Due now"),
              icon: SOURCE_ICONS.reminder,
              source: "reminder",
              timestamp: ts.display,
              dateKey: ts.dateKey,
              href: "/dashboard",
            })
          }
        }
      }
    }
  } catch {}

  try {
    const entries = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]") as Record<string, unknown>[]
    if (Array.isArray(entries)) {
      const todayEntries = entries.filter(
        (e) => typeof e.date === "string" && e.date.startsWith(today)
      )
      for (const entry of todayEntries.slice(0, 2)) {
        notifications.push({
          id: `journal-${String(entry.id)}`,
          title: String(entry.title || "Journal entry"),
          subtitle: "Written today",
          icon: SOURCE_ICONS.journal,
          source: "journal",
          timestamp: "Today",
          dateKey: "today",
          href: "/journal",
        })
      }
    }
  } catch {}

  try {
    const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]") as Record<string, unknown>[]
    if (Array.isArray(reviews)) {
      const todayReviews = reviews.filter(
        (r) => typeof r.date === "string" && r.date.startsWith(today)
      )
      for (const review of todayReviews.slice(0, 1)) {
        notifications.push({
          id: `review-${String(review.id)}`,
          title: String(review.title || "Daily review"),
          subtitle: "Completed today",
          icon: SOURCE_ICONS.teo,
          source: "teo",
          timestamp: "Today",
          dateKey: "today",
          href: "/dashboard",
        })
      }
    }
  } catch {}

  if (notifications.length === 0) {
    notifications.push({
      id: "empty-1",
      title: "All caught up!",
      subtitle: "No recent activity to show",
      icon: SOURCE_ICONS.teo,
      source: "teo",
      timestamp: "Now",
      dateKey: "today",
      href: "/dashboard",
    })
  }

  return notifications
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All")
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

  const clearRead = useCallback(() => {
    setReadIds([])
    saveReadIds([])
  }, [])

  const filterToSource: Record<string, NotificationSource | null> = {
    Tasks: "task",
    Goals: "goal",
    Habits: "habit",
    Calendar: "calendar",
    Journal: "journal",
    "Téo": "teo",
  }

  const filteredNotifications = useMemo(() => {
    let list = notifications
    if (activeFilter === "Unread") {
      list = list.filter((n) => !readIds.includes(n.id))
    } else if (activeFilter !== "All" && filterToSource[activeFilter]) {
      list = list.filter((n) => n.source === filterToSource[activeFilter])
    }
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase()
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subtitle.toLowerCase().includes(q) ||
          SOURCE_LABELS[n.source].toLowerCase().includes(q)
      )
    }
    return list
  }, [notifications, activeFilter, readIds, modalSearchQuery])

  const groupedNotifications = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = []
    const todayItems = filteredNotifications.filter((n) => n.dateKey === "today")
    const yesterdayItems = filteredNotifications.filter((n) => n.dateKey === "yesterday")
    const olderItems = filteredNotifications.filter((n) => n.dateKey !== "today" && n.dateKey !== "yesterday")
    if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems })
    if (yesterdayItems.length > 0) groups.push({ label: "Yesterday", items: yesterdayItems })
    if (olderItems.length > 0) groups.push({ label: "Earlier", items: olderItems })
    return groups
  }, [filteredNotifications])

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
              {notifications.slice(0, 5)
                .map((notif) => (
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
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
                      <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {SOURCE_LABELS[notif.source]}
                      </span>
                    </div>
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
              className="fixed left-1/2 top-1/2 z-[61] -translate-x-1/2 -translate-y-1/2 w-full max-w-[780px] max-h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
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
                  <Button variant="ghost" size="sm" className="text-xs h-7 gap-1.5" onClick={clearRead}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Read
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

              <div className="px-6 pb-2 flex gap-1 overflow-x-auto">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors",
                      activeFilter === tab
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-2">
                {groupedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Bell className="h-10 w-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No notifications</p>
                    <p className="text-xs mt-1">You&apos;re all caught up!</p>
                  </div>
                ) : (
                  groupedNotifications.map((group) => (
                    <div key={group.label} className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.items.map((notif) => (
                          <button
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
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
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[10px] text-muted-foreground">{notif.timestamp}</span>
                              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                {SOURCE_LABELS[notif.source]}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
