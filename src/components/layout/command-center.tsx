"use client"
import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Target, Repeat, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CommandCenterProps {
  open: boolean
  onClose: () => void
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function CommandCenter({ open, onClose }: CommandCenterProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  useEffect(() => {
    if (open) {
      setCurrentMonth(today.getMonth())
      setCurrentYear(today.getFullYear())
      setSelectedDay(today.getDate())
      setShowQuickAdd(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "short" })

  const selectedDateKey =
    selectedDay !== null
      ? formatDateKey(
          currentMonth === today.getMonth() && currentYear === today.getFullYear() ? today.getFullYear() : currentYear,
          currentMonth,
          selectedDay
        )
      : null

  const getScheduleForDate = (dateKey: string) => {
    const items: { title: string; time: string; type: string; icon: React.ReactNode }[] = []
    try {
      const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
      if (Array.isArray(tasks)) {
        for (const task of tasks) {
          if (task.dueDate === dateKey || task.due === dateKey) {
            items.push({ title: task.title || "Task", time: task.time || "", type: "task", icon: <Target className="h-3.5 w-3.5" /> })
          }
        }
      }
    } catch {}
    try {
      const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
      if (Array.isArray(habits)) {
        for (const habit of habits) {
          if (habit.schedule?.includes(dateKey)) {
            items.push({ title: habit.name || "Habit", time: habit.time || "", type: "habit", icon: <Repeat className="h-3.5 w-3.5" /> })
          }
        }
      }
    } catch {}
    return items
  }

  const scheduleItems = selectedDateKey ? getScheduleForDate(selectedDateKey) : []

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
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-sm font-semibold">
                  {today.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/calendar")}
                className="text-xs h-7 px-2"
              >
                Open Calendar
              </Button>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-medium">
                {monthName} {currentYear}
              </span>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear()
                const isSelected = day === selectedDay
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "relative h-7 w-full text-[11px] rounded-md flex items-center justify-center transition-colors",
                      isSelected && !isToday && "bg-[#1E0E6B] text-white",
                      isToday && !isSelected && "bg-[#1E0E6B]/10 text-[#1E0E6B] font-bold",
                      !isSelected && !isToday && "hover:bg-muted text-foreground"
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Day Schedule */}
          {selectedDateKey && (
            <div className="border-t px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {selectedDay === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear()
                    ? "Today's Schedule"
                    : `Schedule — ${monthName} ${selectedDay}, ${currentYear}`}
                </span>
              </div>
              {scheduleItems.length === 0 ? (
                <p className="text-xs text-muted-foreground/60">No events scheduled</p>
              ) : (
                <div className="space-y-1.5">
                  {scheduleItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{item.icon}</span>
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.time && <span className="text-muted-foreground">{item.time}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Add */}
          <div className="border-t px-4 py-3">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="w-full flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="h-4 w-4" />
              Quick Add
            </button>
            <AnimatePresence>
              {showQuickAdd && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-1">
                    <button
                      onClick={() => { router.push("/tasks?new=true"); onClose() }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors"
                    >
                      <Target className="h-3.5 w-3.5 text-[#1E0E6B]" />
                      New Task
                    </button>
                    <button
                      onClick={() => { router.push("/tasks?new=true&type=reminder"); onClose() }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors"
                    >
                      <Bell className="h-3.5 w-3.5 text-[#EB9E5B]" />
                      New Reminder
                    </button>
                    <button
                      onClick={() => { router.push("/calendar?new=event"); onClose() }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-muted transition-colors"
                    >
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      New Event
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => { router.push("/calendar"); onClose() }}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Full Calendar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={() => {
                setSelectedDay(today.getDate())
                setCurrentMonth(today.getMonth())
                setCurrentYear(today.getFullYear())
              }}
            >
              Go To Today
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
