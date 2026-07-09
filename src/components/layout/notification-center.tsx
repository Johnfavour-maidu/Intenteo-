"use client"
import React, { useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Repeat, Target, BookOpen, Bell, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  color: string
  timestamp: string
  href: string
}

interface NotificationCenterProps {
  open: boolean
  onClose: () => void
}

function generateNotifications(): Notification[] {
  const notifications: Notification[] = []
  const today = new Date().toISOString().split("T")[0]

  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]") as Record<string, unknown>[]
    if (Array.isArray(tasks)) {
      const completed = tasks.filter(
        (t) =>
          (t.completed === true || t.status === "done") &&
          (t.completedDate === today || (typeof t.updatedAt === "string" && t.updatedAt.startsWith(today)))
      )
      for (const task of completed.slice(0, 3)) {
        notifications.push({
          id: `task-${String(task.id)}`,
          title: String(task.title || "Task completed"),
          subtitle: "Marked as done",
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: "text-emerald-500",
          timestamp: "Today",
          href: "/tasks",
        })
      }
    }
  } catch {}

  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]") as Record<string, unknown>[]
    if (Array.isArray(habits)) {
      for (const habit of habits.slice(0, 3)) {
        const streak = Number(habit.streak || 0)
        if (streak > 1) {
          notifications.push({
            id: `habit-${String(habit.id)}`,
            title: `${String(habit.name || "Habit")} streak: ${streak} days`,
            subtitle: "Keep it going!",
            icon: <Repeat className="h-4 w-4" />,
            color: "text-[#EB9E5B]",
            timestamp: "Ongoing",
            href: "/habits",
          })
        }
      }
    }
  } catch {}

  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]") as Record<string, unknown>[]
    if (Array.isArray(goals)) {
      for (const goal of goals.slice(0, 2)) {
        const progress = Number(goal.progress || 0)
        if (progress >= 75) {
          notifications.push({
            id: `goal-${String(goal.id)}`,
            title: `${String(goal.title || "Goal")}: ${progress}%`,
            subtitle: "Almost there!",
            icon: <Target className="h-4 w-4" />,
            color: "text-[#1E0E6B]",
            timestamp: "Active",
            href: "/goals",
          })
        }
      }
    }
  } catch {}

  try {
    const journal = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]") as Record<string, unknown>[]
    if (Array.isArray(journal)) {
      const todayEntries = journal.filter(
        (e) => typeof e.date === "string" && e.date.startsWith(today)
      )
      for (const entry of todayEntries.slice(0, 2)) {
        notifications.push({
          id: `journal-${String(entry.id)}`,
          title: String(entry.title || "Journal entry"),
          subtitle: "Written today",
          icon: <BookOpen className="h-4 w-4" />,
          color: "text-violet-500",
          timestamp: "Today",
          href: "/journal",
        })
      }
    }
  } catch {}

  if (notifications.length === 0) {
    notifications.push({
      id: "empty-1",
      title: "All caught up!",
      subtitle: "No recent activity to show",
      icon: <Sparkles className="h-4 w-4" />,
      color: "text-muted-foreground",
      timestamp: "Now",
      href: "/dashboard",
    })
  }

  return notifications
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const notifications = useMemo(() => (open ? generateNotifications() : []), [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  return (
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
              <Bell className="h-4 w-4" />
              <span className="text-sm font-semibold">Notifications</span>
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => {
                  router.push(notif.href)
                  onClose()
                }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <span className={cn("mt-0.5 shrink-0", notif.color)}>{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{notif.subtitle}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{notif.timestamp}</span>
              </button>
            ))}
          </div>

          <div className="border-t px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 justify-between"
              onClick={() => { router.push("/settings?tab=notifications"); onClose() }}
            >
              View All Notifications
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
