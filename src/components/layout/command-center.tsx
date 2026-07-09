"use client"
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Repeat,
  Bell,
  BookOpen,
  Flag,
  CheckCircle,
  Plus,
  ListChecks,
  Check,
  Trash2,
  Pencil,
  X,
} from "lucide-react"
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

function toISODate(d: Date) {
  return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatPrettyDay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

interface ReminderItem {
  id: string
  title: string
  date: string
  time: string
  completed: boolean
}

function loadRemindersForDate(dateKey: string): ReminderItem[] {
  try {
    const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
    if (Array.isArray(reminders)) {
      return reminders
        .filter((r: any) => r.date === dateKey)
        .map((r: any) => ({
          id: r.id || crypto.randomUUID(),
          title: r.title || r.text || "Reminder",
          date: r.date || dateKey,
          time: r.time || "",
          completed: r.completed || false,
        }))
    }
  } catch {}
  return []
}

function saveReminders(reminders: any[]) {
  localStorage.setItem("intenteo-reminders", JSON.stringify(reminders))
}

function loadAllReminders(): any[] {
  try {
    const raw = localStorage.getItem("intenteo-reminders")
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CommandCenter({ open, onClose }: CommandCenterProps) {
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [refreshKey, setRefreshKey] = useState(0)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [reminderText, setReminderText] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  useEffect(() => {
    if (open) {
      setCurrentMonth(today.getMonth())
      setCurrentYear(today.getFullYear())
      setSelectedDay(today.getDate())
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
  const monthName = new Date(currentYear, currentMonth).toLocaleString("default", { month: "short" })

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  const isToday = useCallback(
    (day: number) => day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear(),
    [currentMonth, currentYear]
  )

  const selectedDateKey =
    selectedDay !== null
      ? formatDateKey(
          isToday(selectedDay) ? today.getFullYear() : currentYear,
          isToday(selectedDay) ? today.getMonth() : currentMonth,
          selectedDay
        )
      : null

  const todayKey = toISODate(today)
  const isPastDate = selectedDateKey ? selectedDateKey < todayKey : false
  const selectedReminders = selectedDateKey ? loadRemindersForDate(selectedDateKey) : []

  const handleSaveReminder = () => {
    if (!reminderText.trim() || !selectedDateKey || isPastDate) return
    try {
      const existing = loadAllReminders()
      existing.push({
        id: crypto.randomUUID(),
        title: reminderText.trim(),
        date: selectedDateKey,
        createdAt: new Date().toISOString(),
      })
      saveReminders(existing)
    } catch {}
    setReminderText("")
    setShowReminderForm(false)
    setRefreshKey((k) => k + 1)
  }

  const handleToggleDone = (id: string) => {
    const all = loadAllReminders()
    const updated = all.map((r) => r.id === id ? { ...r, completed: !r.completed } : r)
    saveReminders(updated)
    setRefreshKey((k) => k + 1)
  }

  const handleDelete = (id: string) => {
    const all = loadAllReminders()
    saveReminders(all.filter((r) => r.id !== id))
    setRefreshKey((k) => k + 1)
  }

  const handleEditSave = (id: string) => {
    if (!editText.trim()) return
    const all = loadAllReminders()
    saveReminders(all.map((r) => r.id === id ? { ...r, title: editText.trim() } : r))
    setEditingId(null)
    setEditText("")
    setRefreshKey((k) => k + 1)
  }

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
            <p className="text-xs text-muted-foreground mb-0.5">Today</p>
            <p className="text-sm font-semibold">
              {today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
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
                const selected = day === selectedDay
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "h-7 w-full text-[11px] rounded-full flex items-center justify-center transition-colors font-medium",
                      isToday(day) && "bg-[#1E0E6B] text-white font-bold",
                      selected && !isToday(day) && "bg-[#1E0E6B] text-white",
                      !selected && !isToday(day) && "hover:bg-muted text-foreground"
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Reminders for selected day */}
          {selectedDateKey && (
            <div className="border-t px-4 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                {selectedDateKey === todayKey ? "Today's Reminders" : `${formatPrettyDay(selectedDateKey)}`}
              </p>
              {selectedReminders.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/60 italic">
                  {selectedDateKey === todayKey ? "No reminders for today" : "No reminders"}
                </p>
              ) : (
                <div className="space-y-1">
                  {selectedReminders.map((r) => (
                    <div key={r.id} className="flex items-center gap-2 text-xs group">
                      <button
                        onClick={() => handleToggleDone(r.id)}
                        className={cn(
                          "shrink-0 h-4 w-4 rounded-full border flex items-center justify-center transition-colors",
                          r.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-muted-foreground/40 hover:border-green-500"
                        )}
                      >
                        {r.completed && <Check className="h-2.5 w-2.5" />}
                      </button>
                      {editingId === r.id ? (
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleEditSave(r.id); if (e.key === "Escape") setEditingId(null) }}
                          onBlur={() => handleEditSave(r.id)}
                          className="flex-1 text-xs px-1.5 py-0.5 rounded border bg-background focus:outline-none focus:ring-1 focus:ring-[#1E0E6B]/30"
                          autoFocus
                        />
                      ) : (
                        <span className={cn("flex-1 truncate", r.completed && "line-through text-muted-foreground")}>{r.title}</span>
                      )}
                      {r.time && <span className="text-muted-foreground text-[10px] shrink-0">{r.time}</span>}
                      {editingId !== r.id && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={() => { setEditingId(r.id); setEditText(r.title) }} className="p-0.5 rounded hover:bg-muted text-muted-foreground">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-0.5 rounded hover:bg-red-100 text-muted-foreground hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Quick Reminder */}
              <div className="mt-2">
                {!showReminderForm ? (
                  <button
                    onClick={() => { if (!isPastDate) setShowReminderForm(true) }}
                    className={`flex items-center gap-1.5 text-[11px] transition-colors ${isPastDate ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"}`}
                    disabled={isPastDate}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Quick Reminder
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pt-0.5">
                      <input
                        type="text"
                        value={reminderText}
                        onChange={(e) => setReminderText(e.target.value)}
                        placeholder={isPastDate ? "Reminders cannot be added to past dates." : "What would you like to remember?"}
                        className="w-full text-xs px-2.5 py-1.5 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-[#1E0E6B]/30"
                        disabled={isPastDate}
                        autoFocus={!isPastDate}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveReminder(); if (e.key === "Escape") setShowReminderForm(false) }}
                      />
                      {isPastDate && (
                        <p className="text-[10px] text-muted-foreground/60">You can only create reminders for today or future dates.</p>
                      )}
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-6 text-[11px] px-2.5" onClick={handleSaveReminder} disabled={isPastDate || !reminderText.trim()}>
                          Save Reminder
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[11px] px-2.5" onClick={() => { setShowReminderForm(false); setReminderText("") }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7"
              onClick={() => { router.push("/calendar"); onClose() }}
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Open Full Calendar
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
