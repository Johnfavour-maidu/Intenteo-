const fs = require('fs');
const path = require('path');

const content = `"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef, memo, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  Clock,
  ChevronDown,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

interface Habit {
  id: string
  name: string
  description: string
  category: string
  customCategory?: string
  frequency: "daily" | "weekly"
  duration: string
  totalDuration: string
  reminderTime: string
  goal: string
  streak: number
  bestStreak: number
  completedToday: boolean
  completionRate: number
  habitScore: number
  color: string
  colorHex: string
  icon: string
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
  createdAt: string
}

type TrackerPeriod = "week" | "month" | "year"

const getTodayISO = () => new Date().toISOString().split("T")[0]

const formatDateISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return \`\${year}-\${month}-\${day}\`
}

const formatDayName = (date: Date): string => date.toLocaleDateString("en-US", { weekday: "short" })
const formatDayNumber = (date: Date): string => date.getDate().toString()
const formatMonthYear = (date: Date): string => date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

const getMonthDates = (year: number, month: number): Date[] => {
  const dates: Date[] = []
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay()
  for (let i = -startOffset; i < 42 - startOffset; i++) {
    dates.push(new Date(year, month, 1 + i))
  }
  return dates
}

const HABIT_COLORS: { name: string; hex: string }[] = [
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Orange", hex: "#F97316" },
  { name: "Green", hex: "#22C55E" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Red", hex: "#EF4444" },
  { name: "Teal", hex: "#14B8A6" },
]

const CATEGORIES = ["Mindfulness", "Health", "Learning", "Productivity", "Mental Health", "Social", "Faith", "Custom"]

const ICONS = ["⭐", "📝", "🧘", "💪", "📚", "💧", "📵", "🌙", "📅", "🎯", "🚀", "💡", "🙏", "❤️", "🏃", "🎓"]

const TOTAL_DURATION_OPTIONS = ["Undefined", "30 days", "60 days", "90 days", "365 days", "Indefinite"]

const createSampleHabits = (): Habit[] => {
  const today = new Date()
  const completions: Record<string, { completed: boolean; time?: string; notes?: string }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateISO(d)
    if (Math.random() > 0.3) completions[dateStr] = { completed: true, time: "08:00" }
  }
  return [
    { id: "1", name: "Morning Journal", description: "Write for 10 minutes about intentions and gratitude", category: "Mindfulness", frequency: "daily", duration: "10 mins", totalDuration: "Indefinite", reminderTime: "07:00", goal: "Write daily", streak: 12, bestStreak: 21, completedToday: true, completionRate: 85, habitScore: 92, color: "Purple", colorHex: "#8B5CF6", icon: "📝", completions, createdAt: "2025-01-01" },
    { id: "2", name: "Meditate", description: "10 minutes of guided meditation", category: "Mental Health", frequency: "daily", duration: "10 mins", totalDuration: "90 days", reminderTime: "06:30", goal: "Daily practice", streak: 8, bestStreak: 15, completedToday: true, completionRate: 70, habitScore: 78, color: "Blue", colorHex: "#3B82F6", icon: "🧘", completions, createdAt: "2025-01-05" },
    { id: "3", name: "Exercise", description: "30 minutes of physical activity", category: "Health", frequency: "daily", duration: "30 mins", totalDuration: "60 days", reminderTime: "17:00", goal: "Stay fit", streak: 5, bestStreak: 10, completedToday: true, completionRate: 65, habitScore: 72, color: "Green", colorHex: "#22C55E", icon: "💪", completions, createdAt: "2025-01-10" },
    { id: "4", name: "Read 30 Minutes", description: "Read books on personal growth", category: "Learning", frequency: "daily", duration: "30 mins", totalDuration: "365 days", reminderTime: "20:00", goal: "Read more", streak: 15, bestStreak: 30, completedToday: true, completionRate: 80, habitScore: 88, color: "Orange", colorHex: "#F97316", icon: "📚", completions, createdAt: "2025-01-03" },
    { id: "5", name: "Drink 8 Glasses", description: "Stay hydrated throughout the day", category: "Health", frequency: "daily", duration: "5 mins", totalDuration: "30 days", reminderTime: "09:00", goal: "Stay hydrated", streak: 3, bestStreak: 7, completedToday: false, completionRate: 55, habitScore: 60, color: "Teal", colorHex: "#14B8A6", icon: "💧", completions, createdAt: "2025-01-15" },
    { id: "6", name: "No Social Media Before Noon", description: "Protect morning focus time", category: "Productivity", frequency: "daily", duration: "5 mins", totalDuration: "Indefinite", reminderTime: "08:00", goal: "Focus better", streak: 0, bestStreak: 5, completedToday: false, completionRate: 40, habitScore: 45, color: "Red", colorHex: "#EF4444", icon: "📵", completions, createdAt: "2025-01-20" },
    { id: "7", name: "Evening Reflection", description: "Review the day and set intentions for tomorrow", category: "Mindfulness", frequency: "daily", duration: "15 mins", totalDuration: "90 days", reminderTime: "21:00", goal: "Reflect daily", streak: 7, bestStreak: 14, completedToday: false, completionRate: 75, habitScore: 80, color: "Pink", colorHex: "#EC4899", icon: "🌙", completions, createdAt: "2025-01-08" },
    { id: "8", name: "Weekly Planning", description: "Review and plan the upcoming week", category: "Productivity", frequency: "weekly", duration: "45 mins", totalDuration: "Indefinite", reminderTime: "09:00", goal: "Stay organized", streak: 4, bestStreak: 8, completedToday: true, completionRate: 85, habitScore: 85, color: "Yellow", colorHex: "#EAB308", icon: "📅", completions, createdAt: "2025-01-02" },
  ]
}

/* ─── Summary Bar ─── */

const SummaryBar = ({ habits, selectedDate }: { habits: Habit[]; selectedDate: Date }) => {
  const dateStr = formatDateISO(selectedDate)
  const completedToday = habits.filter(h => h.completions[dateStr]?.completed).length
  const totalCount = habits.length
  const weeklyRate = totalCount > 0 ? Math.round((completedToday / totalCount) * 100) : 0
  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0)
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  let monthlyCompleted = 0, monthlyTotal = 0
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const dStr = formatDateISO(d)
    habits.forEach(h => { if (h.completions[dStr]) monthlyCompleted++; monthlyTotal++ })
  }
  const monthlyRate = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0

  const cards = [
    { label: "Today", value: \`\${completedToday}/\${totalCount}\`, gradient: "from-emerald-400 to-green-500", icon: <CheckCircle2 className="h-5 w-5 text-white" /> },
    { label: "Weekly %", value: \`\${weeklyRate}%\`, gradient: "from-blue-400 to-cyan-500", icon: <TrendingUp className="h-5 w-5 text-white" /> },
    { label: "Monthly %", value: \`\${monthlyRate}%\`, gradient: "from-purple-400 to-pink-500", icon: <TrendingUp className="h-5 w-5 text-white" /> },
    { label: "Best Streak", value: bestStreak.toString(), gradient: "from-orange-400 to-amber-500", icon: <Flame className="h-5 w-5 text-white" /> },
    { label: "Total Habits", value: totalCount.toString(), gradient: "from-indigo-400 to-blue-500", icon: <Target className="h-5 w-5 text-white" /> },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl border border-[#1E0E6B]/15 bg-white dark:bg-gray-950 p-4">
          <div className="flex items-center gap-3">
            <div className={\`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br \${card.gradient}\`}>
              {card.icon}
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Tracker Calendar (compact, icon-style) ─── */

const TrackerCalendar = ({
  selectedDate,
  onDateSelect,
  period,
  onPeriodChange,
}: {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  period: TrackerPeriod
  onPeriodChange: (p: TrackerPeriod) => void
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => {
        const newDate = new Date(selectedDate)
        if (period === "week") newDate.setDate(newDate.getDate() - 7)
        else if (period === "month") newDate.setMonth(newDate.getMonth() - 1)
        else newDate.setFullYear(newDate.getFullYear() - 1)
        onDateSelect(newDate)
      }}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1">
        <Button variant={period === "week" ? "default" : "ghost"} size="sm" onClick={() => onPeriodChange("week")} className={period === "week" ? "bg-[#1E0E6B] text-white h-8 px-2 text-xs" : "h-8 px-2 text-xs"}>W</Button>
        <Button variant={period === "month" ? "default" : "ghost"} size="sm" onClick={() => onPeriodChange("month")} className={period === "month" ? "bg-[#1E0E6B] text-white h-8 px-2 text-xs" : "h-8 px-2 text-xs"}>M</Button>
        <Button variant={period === "year" ? "default" : "ghost"} size="sm" onClick={() => onPeriodChange("year")} className={period === "year" ? "bg-[#1E0E6B] text-white h-8 px-2 text-xs" : "h-8 px-2 text-xs"}>Y</Button>
      </div>
      <span className="text-sm font-medium min-w-[120px] text-center">{formatMonthYear(selectedDate)}</span>
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => {
        const newDate = new Date(selectedDate)
        if (period === "week") newDate.setDate(newDate.getDate() + 7)
        else if (period === "month") newDate.setMonth(newDate.getMonth() + 1)
        else newDate.setFullYear(newDate.getFullYear() + 1)
        onDateSelect(newDate)
      }}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

/* ─── Tracker View ─── */

const TrackerView = ({
  habits,
  selectedDate,
  period,
  onToggleCell,
  onEdit,
}: {
  habits: Habit[]
  selectedDate: Date
  period: TrackerPeriod
  onToggleCell: (habitId: string, dateStr: string) => void
  onEdit: (habit: Habit) => void
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; date: string } | null>(null)

  const dates = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    if (period === "week") {
      const start = new Date(selectedDate)
      start.setDate(start.getDate() - start.getDay())
      return getWeekDates(start)
    } else if (period === "month") {
      return getMonthDates(year, month)
    } else {
      const allDates: Date[] = []
      for (let m = 0; m < 12; m++) allDates.push(...getMonthDates(year, m))
      return allDates
    }
  }, [selectedDate, period])

  const today = getTodayISO()

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[900px]">
        <thead>
          <tr className="border-b border-white/20">
            <th className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[40px] border-r border-white/10"></th>
            <th className="sticky left-[40px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[160px] border-r border-white/10">Habit</th>
            <th className="sticky left-[200px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[100px] border-r border-white/10">Category</th>
            <th className="sticky left-[300px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[90px] border-r border-white/10">Duration</th>
            <th className="sticky left-[390px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[70px] border-r border-white/10">Score</th>
            {dates.map((date) => {
              const dateStr = formatDateISO(date)
              const isToday = dateStr === today
              return (
                <th key={dateStr} className={\`p-1.5 text-center font-medium text-xs min-w-[44px] \${isToday ? "text-[#1E0E6B] font-bold bg-[#1E0E6B]/5" : "text-muted-foreground"}\`}>
                  <div className="flex flex-col items-center gap-0">
                    <span className="text-[10px]">{formatDayName(date)}</span>
                    <span className="text-sm">{formatDayNumber(date)}</span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id} className="border-b border-white/10 hover:bg-white/30 dark:hover:bg-white/5 transition-colors">
              <td className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.colorHex }} />
              </td>
              <td className="sticky left-[40px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <button onClick={() => onEdit(habit)} className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left">
                  <span className="text-lg">{habit.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-[#1E0E6B] hover:underline leading-tight">{habit.name}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Flame className="h-2.5 w-2.5" style={{ color: habit.colorHex }} />{habit.streak} streak
                    </p>
                  </div>
                </button>
              </td>
              <td className="sticky left-[200px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <Badge variant="secondary" className="text-[10px]">{habit.customCategory || habit.category}</Badge>
              </td>
              <td className="sticky left-[300px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{habit.duration}</span>
              </td>
              <td className="sticky left-[390px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <span className={\`text-sm font-semibold \${habit.habitScore >= 80 ? "text-emerald-500" : habit.habitScore >= 50 ? "text-amber-500" : "text-red-500"}\`}>
                  {habit.habitScore}
                </span>
              </td>
              {dates.map((date) => {
                const dateStr = formatDateISO(date)
                const isCompleted = habit.completions[dateStr]?.completed || false
                const isFuture = dateStr > today
                return (
                  <td key={dateStr} className="p-1 text-center">
                    <button
                      onClick={() => !isFuture && onToggleCell(habit.id, dateStr)}
                      onMouseEnter={() => setHoveredCell({ habitId: habit.id, date: dateStr })}
                      onMouseLeave={() => setHoveredCell(null)}
                      disabled={isFuture}
                      className={\`w-7 h-7 rounded-md transition-all \${
                        isFuture ? "cursor-not-allowed opacity-30" : isCompleted ? "cursor-pointer hover:scale-110" : "cursor-pointer hover:bg-white/50 border border-dashed border-gray-300"
                      }\`}
                      style={isCompleted ? { backgroundColor: habit.colorHex } : undefined}
                    >
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-white mx-auto" />}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Add/Edit Habit Modal ─── */

const HabitModal = ({
  isOpen,
  onClose,
  onSave,
  habit,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: Omit<Habit, "id" | "completions" | "createdAt">) => void
  habit?: Habit | null
}) => {
  const [name, setName] = useState(habit?.name || "")
  const [description, setDescription] = useState(habit?.description || "")
  const [category, setCategory] = useState(habit?.category || "Mindfulness")
  const [customCategory, setCustomCategory] = useState(habit?.customCategory || "")
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency || "daily")
  const [duration, setDuration] = useState(habit?.duration || "10 mins")
  const [totalDuration, setTotalDuration] = useState(habit?.totalDuration || "Undefined")
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || "08:00")
  const [goal, setGoal] = useState(habit?.goal || "")
  const [icon, setIcon] = useState(habit?.icon || "⭐")
  const [colorIdx, setColorIdx] = useState(
    HABIT_COLORS.findIndex(c => c.name === habit?.color) >= 0 ? HABIT_COLORS.findIndex(c => c.name === habit?.color) : 0
  )
  const [showIconDropdown, setShowIconDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const [habitScore, setHabitScore] = useState(habit?.habitScore || 50)

  useEffect(() => {
    if (habit) {
      setName(habit.name); setDescription(habit.description); setCategory(habit.category)
      setCustomCategory(habit.customCategory || ""); setFrequency(habit.frequency)
      setDuration(habit.duration); setTotalDuration(habit.totalDuration)
      setReminderTime(habit.reminderTime); setGoal(habit.goal); setIcon(habit.icon)
      setHabitScore(habit.habitScore || 50)
      const idx = HABIT_COLORS.findIndex(c => c.name === habit.color)
      if (idx >= 0) setColorIdx(idx)
    } else {
      setName(""); setDescription(""); setCategory("Mindfulness"); setCustomCategory("")
      setFrequency("daily"); setDuration("10 mins"); setTotalDuration("Undefined")
      setReminderTime("08:00"); setGoal(""); setIcon("⭐"); setColorIdx(0); setHabitScore(50)
    }
  }, [habit])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{habit ? "Edit Habit" : "Add New Habit"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Habit Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Morning Journal" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Write for 10 minutes" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORIES.map((cat) => (
                <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat)}
                  className={category === cat ? "bg-[#1E0E6B] text-white" : ""}>
                  {cat}
                </Button>
              ))}
            </div>
            {category === "Custom" && (
              <Input value={customCategory} onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter your custom category name" className="mt-2" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duration (per session)</label>
              <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 10 mins" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Total Habit Duration</label>
              <select value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
                {TOTAL_DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Reminder Time</label>
            <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Recurrence</label>
            <div className="flex gap-2 mt-1">
              <Button variant={frequency === "daily" ? "default" : "outline"} onClick={() => setFrequency("daily")} className={frequency === "daily" ? "bg-[#1E0E6B] text-white" : ""}>Daily</Button>
              <Button variant={frequency === "weekly" ? "default" : "outline"} onClick={() => setFrequency("weekly")} className={frequency === "weekly" ? "bg-[#1E0E6B] text-white" : ""}>Weekly</Button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Habit Score ({habitScore})</label>
            <input type="range" min="0" max="100" value={habitScore} onChange={(e) => setHabitScore(parseInt(e.target.value))} className="mt-1 w-full accent-[#1E0E6B]" />
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>50</span><span>100</span></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-sm font-medium">Colour</label>
              <button type="button" onClick={() => { setShowColorDropdown(!showColorDropdown); setShowIconDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: HABIT_COLORS[colorIdx].hex }} />
                  <span className="text-sm">{HABIT_COLORS[colorIdx].name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {showColorDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 space-y-1">
                  {HABIT_COLORS.map((c, i) => (
                    <button key={c.name} onClick={() => { setColorIdx(i); setShowColorDropdown(false) }}
                      className={\`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors \${colorIdx === i ? "bg-[#1E0E6B]/10" : "hover:bg-muted"}\`}>
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                      {colorIdx === i && <Check className="h-4 w-4 ml-auto text-[#1E0E6B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <label className="text-sm font-medium">Icon</label>
              <button type="button" onClick={() => { setShowIconDropdown(!showIconDropdown); setShowColorDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm">Icon</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {showIconDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    {ICONS.map((ic) => (
                      <button key={ic} onClick={() => { setIcon(ic); setShowIconDropdown(false) }}
                        className={\`text-xl p-2 rounded-lg transition-all text-center \${icon === ic ? "bg-[#EB9E5B]/20 scale-110 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}\`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Goal</label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Write daily" className="mt-1" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => {
            if (name.trim()) {
              const selectedColor = HABIT_COLORS[colorIdx]
              onSave({
                name, description, category: category === "Custom" ? "Custom" : category,
                customCategory: category === "Custom" ? customCategory : undefined,
                frequency, duration, totalDuration, reminderTime, goal,
                streak: habit?.streak || 0, bestStreak: habit?.bestStreak || 0,
                completedToday: habit?.completedToday || false, completionRate: habit?.completionRate || 0,
                habitScore, color: selectedColor.name, colorHex: selectedColor.hex, icon,
              })
              onClose()
            }
          }} className="flex-1 glow text-white">
            {habit ? "Save Changes" : "Add Habit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [trackerPeriod, setTrackerPeriod] = useState<TrackerPeriod>("week")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("intenteo-habits")
    if (saved) { try { setHabits(JSON.parse(saved)) } catch { setHabits(createSampleHabits()) } }
    else { setHabits(createSampleHabits()) }
    setIsLoading(false)
  }, [])

  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-habits", JSON.stringify(habits)) }, [habits, isLoading])
  useEffect(() => { localStorage.setItem("intenteo-habits-period", trackerPeriod) }, [trackerPeriod])

  const toggleHabit = useCallback((id: string, dateStr?: string) => {
    const targetDate = dateStr || formatDateISO(selectedDate)
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit
      const existing = habit.completions[targetDate]
      const wasCompleted = existing?.completed || false
      const newCompletions = { ...habit.completions }
      if (wasCompleted) { delete newCompletions[targetDate] }
      else { newCompletions[targetDate] = { completed: true, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) } }
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 365; i++) {
        const d = new Date(today); d.setDate(d.getDate() - i)
        if (newCompletions[formatDateISO(d)]?.completed) streak++
        else break
      }
      const totalCompletions = Object.keys(newCompletions).length
      const daysSinceCreation = Math.max(1, Math.ceil((Date.now() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
      const completionRate = Math.min(100, Math.round((totalCompletions / daysSinceCreation) * 100))
      const habitScore = Math.round((completionRate * 0.5) + (Math.min(streak, 30) / 30 * 100 * 0.3) + (Math.min(habit.bestStreak, 30) / 30 * 100 * 0.2))
      return { ...habit, completions: newCompletions, completedToday: targetDate === getTodayISO() ? !wasCompleted : habit.completedToday, streak, bestStreak: Math.max(habit.bestStreak, streak), completionRate, habitScore }
    }))
  }, [selectedDate])

  const saveHabit = useCallback((habitData: Omit<Habit, "id" | "completions" | "createdAt">) => {
    if (editingHabit) { setHabits(prev => prev.map(h => h.id === editingHabit.id ? { ...h, ...habitData } : h)) }
    else { setHabits(prev => [...prev, { ...habitData, id: Date.now().toString(), completions: {}, createdAt: getTodayISO() }]) }
    setEditingHabit(null)
  }, [editingHabit])

  const deleteHabit = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) { setHabits(prev => prev.filter(h => h.id !== id)) }
  }, [])

  const filteredHabits = useMemo(() => {
    if (!searchQuery) return habits
    const q = searchQuery.toLowerCase()
    return habits.filter(h => h.name.toLowerCase().includes(q) || h.category.toLowerCase().includes(q) || (h.customCategory || "").toLowerCase().includes(q) || h.color.toLowerCase().includes(q) || h.duration.toLowerCase().includes(q))
  }, [habits, searchQuery])

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading habits...</div></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">Build your identity through consistent action</p>
          </div>
          <div className="flex gap-2 items-center">
            <TrackerCalendar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              period={trackerPeriod}
              onPeriodChange={setTrackerPeriod}
            />
            <Button onClick={() => { setEditingHabit(null); setIsModalOpen(true) }}
              className="glow h-9 shrink-0">
              <Plus className="mr-1 h-4 w-4" /> Add Habit
            </Button>
          </div>
        </div>
      </div>

      <SummaryBar habits={habits} selectedDate={selectedDate} />

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search habits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white/50 dark:bg-white/5 border-white/20 max-w-md" />
      </div>

      {/* Tracker table */}
      <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        {filteredHabits.length > 0 ? (
          <TrackerView habits={filteredHabits} selectedDate={selectedDate} period={trackerPeriod} onToggleCell={toggleHabit} onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }} />
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No habits found</h3>
            <p className="text-muted-foreground mt-1">{searchQuery ? "Try a different search term" : "Add your first habit to get started"}</p>
            {!searchQuery && (
              <Button onClick={() => setIsModalOpen(true)} className="mt-4 glow text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Habit
              </Button>
            )}
          </div>
        )}
      </div>

      <HabitModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingHabit(null) }} onSave={saveHabit} habit={editingHabit} />
    </div>
  )
}`;

const filePath = path.join(__dirname, '..', 'src', 'components', 'habits', 'habits-page.tsx');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Habits page refined successfully!');
console.log('File size:', content.length, 'bytes');
