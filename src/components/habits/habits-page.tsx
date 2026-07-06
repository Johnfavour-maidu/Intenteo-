"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  X,
  Check,
  Clock,
  ChevronDown,
} from "lucide-react"

interface HabitScheduleAnytime { type: "anytime" }
interface HabitSchedulePreferred { type: "preferred"; slot?: "morning" | "afternoon" | "evening" | "night"; time?: string }
interface HabitScheduleFixed { type: "fixed"; time: string }
type HabitSchedule = HabitScheduleAnytime | HabitSchedulePreferred | HabitScheduleFixed

interface HabitReminderAnytime { enabled: boolean; timeSlot?: "morning" | "afternoon" | "evening" }
interface HabitReminderTimed { enabled: boolean; before?: number; after?: number }
type HabitReminder = HabitReminderAnytime | HabitReminderTimed

interface Habit {
  id: string
  name: string
  description: string
  category: string
  customCategory?: string
  frequency: "daily" | "weekly"
  duration: string
  totalDuration: string
  difficulty: "easy" | "medium" | "hard"
  schedule: HabitSchedule
  reminder: HabitReminder
  goal: string
  whyItMatters: string
  streak: number
  bestStreak: number
  completedToday: boolean
  completionRate: number
  consistency: number
  timeAccuracy: number | null
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
  return `${year}-${month}-${day}`
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
const DIFFICULTY_OPTIONS: { value: "easy" | "medium" | "hard"; label: string; color: string }[] = [
  { value: "easy", label: "Easy", color: "text-emerald-500 bg-emerald-50" },
  { value: "medium", label: "Medium", color: "text-amber-500 bg-amber-50" },
  { value: "hard", label: "Hard", color: "text-red-500 bg-red-50" },
]

const SCHEDULE_LABELS = {
  anytime: "Flexible Schedule ✓",
  preferred: (s?: string) => `Preferred ${s ? `· ${s[0].toUpperCase() + s.slice(1)}` : ""}`,
  fixed: (t: string) => `Fixed · ${formatTime12(t)}`,
}

function formatTime12(time24: string): string {
  if (!time24) return ""
  const [h, m] = time24.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function minutesDiff(a: string, b: string): number {
  return Math.abs(timeToMinutes(a) - timeToMinutes(b))
}

/* ─── Scoring Engine ─── */

const DIFFICULTY_BONUS = { easy: 0, medium: 5, hard: 10 }

function calcTimeAccuracy(completionTime: string | undefined, schedule: HabitSchedule): number | null {
  if (schedule.type === "anytime") return null
  if (!completionTime) return 0

  const targetTime = schedule.type === "fixed" ? schedule.time : schedule.time
  if (!targetTime) return null

  const diff = minutesDiff(completionTime, targetTime)

  if (schedule.type === "fixed") {
    if (diff <= 5) return 100
    if (diff <= 15) return 80
    if (diff <= 30) return 60
    return 20
  }

  if (schedule.type === "preferred") {
    if (diff <= 15) return 100
    if (diff <= 30) return 90
    if (diff <= 60) return 75
    if (diff <= 120) return 50
    return 25
  }

  return null
}

function calcStreak(completions: Record<string, { completed: boolean }>): number {
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (completions[formatDateISO(d)]?.completed) streak++
    else break
  }
  return streak
}

function calcConsistency(completions: Record<string, { completed: boolean }>, createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  const completedDays = Object.keys(completions).filter(k => completions[k].completed).length
  return Math.min(100, Math.round((completedDays / totalDays) * 100))
}

function calcCompletionRate(completions: Record<string, { completed: boolean }>, createdAt: string): number {
  const created = new Date(createdAt)
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  const completedDays = Object.keys(completions).filter(k => completions[k].completed).length
  return Math.min(100, Math.round((completedDays / totalDays) * 100))
}

function calcHabitScore(
  completions: Record<string, { completed: boolean; time?: string }>,
  schedule: HabitSchedule,
  difficulty: "easy" | "medium" | "hard",
  createdAt: string,
  bestStreak: number,
): { score: number; completionRate: number; consistency: number; timeAccuracy: number | null } {
  const completionRate = calcCompletionRate(completions, createdAt)
  const streak = calcStreak(completions)
  const consistency = calcConsistency(completions, createdAt)

  const today = getTodayISO()
  const todayCompletion = completions[today]
  const timeAccuracy = todayCompletion?.completed ? calcTimeAccuracy(todayCompletion.time, schedule) : null

  const difficultyBonus = DIFFICULTY_BONUS[difficulty]

  if (schedule.type === "anytime") {
    const raw = completionRate * 0.50 + Math.min(streak, 30) / 30 * 100 * 0.25 + consistency * 0.20 + difficultyBonus * 0.05
    return { score: Math.round(Math.min(100, raw)), completionRate, consistency, timeAccuracy: null }
  }

  const ta = timeAccuracy ?? 0
  const raw = completionRate * 0.40 + Math.min(streak, 30) / 30 * 100 * 0.25 + consistency * 0.20 + ta * 0.10 + difficultyBonus * 0.05
  return { score: Math.round(Math.min(100, raw)), completionRate, consistency, timeAccuracy: ta }
}

/* ─── Sample Data ─── */

const createSampleHabits = (): Habit[] => {
  const today = new Date()
  const completions: Record<string, { completed: boolean; time?: string; notes?: string }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateISO(d)
    if (Math.random() > 0.3) completions[dateStr] = { completed: true, time: "08:" + String(Math.floor(Math.random() * 60)).padStart(2, "0") }
  }
  const habits: Omit<Habit, "streak" | "bestStreak" | "completionRate" | "consistency" | "timeAccuracy" | "habitScore">[] = [
    { id: "1", name: "Morning Journal", description: "Write for 10 minutes about intentions and gratitude", category: "Mindfulness", frequency: "daily", duration: "10 mins", totalDuration: "Indefinite", difficulty: "medium", schedule: { type: "preferred", slot: "morning", time: "07:00" }, reminder: { enabled: true, before: 15 }, goal: "Write daily", whyItMatters: "Start each day with intention", completedToday: true, color: "Purple", colorHex: "#8B5CF6", icon: "📝", completions, createdAt: "2025-01-01" },
    { id: "2", name: "Meditate", description: "10 minutes of guided meditation", category: "Mental Health", frequency: "daily", duration: "10 mins", totalDuration: "90 days", difficulty: "easy", schedule: { type: "preferred", slot: "morning", time: "06:30" }, reminder: { enabled: true, before: 15 }, goal: "Daily practice", whyItMatters: "Inner peace and clarity", completedToday: true, color: "Blue", colorHex: "#3B82F6", icon: "🧘", completions, createdAt: "2025-01-05" },
    { id: "3", name: "Exercise", description: "30 minutes of physical activity", category: "Health", frequency: "daily", duration: "30 mins", totalDuration: "60 days", difficulty: "hard", schedule: { type: "preferred", slot: "evening", time: "17:00" }, reminder: { enabled: true, before: 15 }, goal: "Stay fit", whyItMatters: "Physical health is foundational", completedToday: true, color: "Green", colorHex: "#22C55E", icon: "💪", completions, createdAt: "2025-01-10" },
    { id: "4", name: "Read 30 Minutes", description: "Read books on personal growth", category: "Learning", frequency: "daily", duration: "30 mins", totalDuration: "365 days", difficulty: "medium", schedule: { type: "anytime" }, reminder: { enabled: true, timeSlot: "evening" }, goal: "Read more", whyItMatters: "Knowledge compounds", completedToday: true, color: "Orange", colorHex: "#F97316", icon: "📚", completions, createdAt: "2025-01-03" },
    { id: "5", name: "Drink 8 Glasses", description: "Stay hydrated throughout the day", category: "Health", frequency: "daily", duration: "5 mins", totalDuration: "30 days", difficulty: "easy", schedule: { type: "anytime" }, reminder: { enabled: false }, goal: "Stay hydrated", whyItMatters: "Hydration fuels everything", completedToday: false, color: "Teal", colorHex: "#14B8A6", icon: "💧", completions, createdAt: "2025-01-15" },
    { id: "6", name: "No Social Media Before Noon", description: "Protect morning focus time", category: "Productivity", frequency: "daily", duration: "5 mins", totalDuration: "Indefinite", difficulty: "hard", schedule: { type: "fixed", time: "12:00" }, reminder: { enabled: true, before: 30 }, goal: "Focus better", whyItMatters: "Deep work requires boundaries", completedToday: false, color: "Red", colorHex: "#EF4444", icon: "📵", completions, createdAt: "2025-01-20" },
    { id: "7", name: "Evening Reflection", description: "Review the day and set intentions for tomorrow", category: "Mindfulness", frequency: "daily", duration: "15 mins", totalDuration: "90 days", difficulty: "medium", schedule: { type: "preferred", slot: "night", time: "21:00" }, reminder: { enabled: true, before: 15 }, goal: "Reflect daily", whyItMatters: "Growth comes from reflection", completedToday: false, color: "Pink", colorHex: "#EC4899", icon: "🌙", completions, createdAt: "2025-01-08" },
    { id: "8", name: "Pray", description: "Spend time in prayer and gratitude", category: "Faith", frequency: "daily", duration: "10 mins", totalDuration: "Indefinite", difficulty: "easy", schedule: { type: "preferred", slot: "morning", time: "06:00" }, reminder: { enabled: true, before: 15 }, goal: "Spiritual growth", whyItMatters: "Faith grounds the soul", completedToday: true, color: "Yellow", colorHex: "#EAB308", icon: "🙏", completions, createdAt: "2025-01-02" },
  ]
  return habits.map(h => {
    const result = calcHabitScore(h.completions, h.schedule, h.difficulty, h.createdAt, 0)
    const streak = calcStreak(h.completions)
    return { ...h, streak, bestStreak: streak, completionRate: result.completionRate, consistency: result.consistency, timeAccuracy: result.timeAccuracy, habitScore: result.score }
  })
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
  const avgTimeAccuracy = habits.filter(h => h.timeAccuracy !== null).reduce((sum, h) => sum + (h.timeAccuracy || 0), 0) / Math.max(1, habits.filter(h => h.timeAccuracy !== null).length)
  const timeAccDisplay = habits.some(h => h.timeAccuracy !== null) ? Math.round(avgTimeAccuracy) : null
  const avgConsistency = habits.length > 0 ? Math.round(habits.reduce((sum, h) => sum + h.consistency, 0) / habits.length) : 0

  const cards = [
    { label: "Today", value: `${completedToday}/${totalCount}`, gradient: "from-emerald-400 to-green-500", borderGrad: "linear-gradient(135deg, #22C55E, #22C55E33)", icon: <CheckCircle2 className="h-5 w-5 text-white" /> },
    { label: "Weekly %", value: `${weeklyRate}%`, gradient: "from-blue-400 to-cyan-500", borderGrad: "linear-gradient(135deg, #3B82F6, #3B82F633)", icon: <TrendingUp className="h-5 w-5 text-white" /> },
    { label: "Monthly %", value: `${monthlyRate}%`, gradient: "from-purple-400 to-pink-500", borderGrad: "linear-gradient(135deg, #8B5CF6, #EC489933)", icon: <TrendingUp className="h-5 w-5 text-white" /> },
    { label: "Highest Streak", value: bestStreak.toString(), gradient: "from-orange-400 to-amber-500", borderGrad: "linear-gradient(135deg, #F97316, #F9731633)", icon: <Flame className="h-5 w-5 text-white" /> },
    { label: "Total Habits", value: totalCount.toString(), gradient: "from-indigo-400 to-blue-500", borderGrad: "linear-gradient(135deg, #1E0E6B, #3B82F633)", icon: <Target className="h-5 w-5 text-white" /> },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <div key={i} className="rounded-xl p-[1px]" style={{ backgroundImage: card.borderGrad }}>
          <div className="rounded-[11px] bg-white dark:bg-gray-950 p-4 h-full">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Tracker Calendar ─── */

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
  onDelete,
}: {
  habits: Habit[]
  selectedDate: Date
  period: TrackerPeriod
  onToggleCell: (habitId: string, dateStr: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
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

  const getScheduleBadge = (schedule: HabitSchedule) => {
    if (schedule.type === "anytime") return <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Flexible ✓</span>
    if (schedule.type === "preferred") {
      const label = schedule.slot ? schedule.slot[0].toUpperCase() + schedule.slot.slice(1) : formatTime12(schedule.time || "")
      return <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Preferred · {label}</span>
    }
    return <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Fixed · {formatTime12(schedule.time)}</span>
  }

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
                <th key={dateStr} className={`p-1.5 text-center font-medium text-xs min-w-[44px] ${isToday ? "text-[#1E0E6B] font-bold bg-[#1E0E6B]/5" : "text-muted-foreground"}`}>
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
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(habit)} className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left flex-1 min-w-0">
                    <span className="text-lg shrink-0">{habit.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-[#1E0E6B] hover:underline leading-tight truncate">{habit.name}</p>
                      <div className="flex items-center gap-1 flex-wrap">
                        <Flame className="h-2.5 w-2.5 shrink-0" style={{ color: habit.colorHex }} />
                        <span className="text-[10px] text-muted-foreground">{habit.streak} streak</span>
                        {getScheduleBadge(habit.schedule)}
                      </div>
                    </div>
                  </button>
                  <button onClick={() => onDelete(habit.id)} className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete habit">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
              <td className="sticky left-[200px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <Badge variant="secondary" className="text-[10px]">{habit.customCategory || habit.category}</Badge>
              </td>
              <td className="sticky left-[300px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{habit.duration}</span>
              </td>
              <td className="sticky left-[390px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <span className={`text-sm font-semibold ${habit.habitScore >= 80 ? "text-emerald-500" : habit.habitScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
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
                      className={`w-7 h-7 rounded-md transition-all ${
                        isFuture ? "cursor-not-allowed opacity-30" : isCompleted ? "cursor-pointer hover:scale-110" : "cursor-pointer hover:bg-white/50 border border-dashed border-gray-300"
                      }`}
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
  onSave: (habit: Omit<Habit, "id" | "completions" | "createdAt" | "streak" | "bestStreak" | "completionRate" | "consistency" | "timeAccuracy" | "habitScore">) => void
  habit?: Habit | null
}) => {
  const [name, setName] = useState(habit?.name || "")
  const [description, setDescription] = useState(habit?.description || "")
  const [category, setCategory] = useState(habit?.category || "Mindfulness")
  const [customCategory, setCustomCategory] = useState(habit?.customCategory || "")
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency || "daily")
  const [duration, setDuration] = useState(habit?.duration || "10 mins")
  const [totalDuration, setTotalDuration] = useState(habit?.totalDuration || "Undefined")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(habit?.difficulty || "medium")
  const [scheduleType, setScheduleType] = useState<"anytime" | "preferred" | "fixed">(habit?.schedule?.type || "anytime")
  const [preferredSlot, setPreferredSlot] = useState<"morning" | "afternoon" | "evening" | "night">((habit?.schedule?.type === "preferred" ? habit.schedule.slot : undefined) || "morning")
  const [useSpecificTime, setUseSpecificTime] = useState(habit?.schedule?.type === "preferred" && !!habit.schedule.time)
  const [preferredTime, setPreferredTime] = useState(habit?.schedule?.type === "preferred" ? (habit.schedule.time || "08:00") : "08:00")
  const [fixedTime, setFixedTime] = useState(habit?.schedule?.type === "fixed" ? habit.schedule.time : "08:00")
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminder?.enabled || false)
  const [reminderTimeSlot, setReminderTimeSlot] = useState<"morning" | "afternoon" | "evening">((habit?.reminder as HabitReminderAnytime)?.timeSlot || "morning")
  const [reminderBefore, setReminderBefore] = useState(habit?.reminder && "before" in habit.reminder ? (habit.reminder.before || 15) : 15)
  const [reminderAfter, setReminderAfter] = useState(habit?.reminder && "after" in habit.reminder ? (habit.reminder.after || 30) : 30)
  const [goal, setGoal] = useState(habit?.goal || "")
  const [whyItMatters, setWhyItMatters] = useState(habit?.whyItMatters || "")
  const [icon, setIcon] = useState(habit?.icon || "⭐")
  const [colorIdx, setColorIdx] = useState(
    HABIT_COLORS.findIndex(c => c.name === habit?.color) >= 0 ? HABIT_COLORS.findIndex(c => c.name === habit?.color) : 0
  )
  const [showIconDropdown, setShowIconDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)

  useEffect(() => {
    if (habit) {
      setName(habit.name); setDescription(habit.description); setCategory(habit.category)
      setCustomCategory(habit.customCategory || ""); setFrequency(habit.frequency)
      setDuration(habit.duration); setTotalDuration(habit.totalDuration)
      setDifficulty(habit.difficulty || "medium"); setGoal(habit.goal); setWhyItMatters(habit.whyItMatters || "")
      setIcon(habit.icon)
      const idx = HABIT_COLORS.findIndex(c => c.name === habit.color)
      if (idx >= 0) setColorIdx(idx)
      setScheduleType(habit.schedule.type)
      if (habit.schedule.type === "preferred") {
        setPreferredSlot(habit.schedule.slot || "morning")
        setUseSpecificTime(!!habit.schedule.time)
        setPreferredTime(habit.schedule.time || "08:00")
      } else if (habit.schedule.type === "fixed") {
        setFixedTime(habit.schedule.time)
      }
      if (habit.reminder) {
        setReminderEnabled(habit.reminder.enabled)
        if ("timeSlot" in habit.reminder) setReminderTimeSlot(habit.reminder.timeSlot || "morning")
        if ("before" in habit.reminder) setReminderBefore(habit.reminder.before || 15)
        if ("after" in habit.reminder) setReminderAfter(habit.reminder.after || 30)
      }
    } else {
      setName(""); setDescription(""); setCategory("Mindfulness"); setCustomCategory("")
      setFrequency("daily"); setDuration("10 mins"); setTotalDuration("Undefined")
      setDifficulty("medium"); setScheduleType("anytime"); setPreferredSlot("morning")
      setUseSpecificTime(false); setPreferredTime("08:00"); setFixedTime("08:00")
      setReminderEnabled(false); setReminderTimeSlot("morning"); setReminderBefore(15); setReminderAfter(30)
      setGoal(""); setWhyItMatters(""); setIcon("⭐"); setColorIdx(0)
    }
  }, [habit])

  if (!isOpen) return null

  const buildSchedule = (): HabitSchedule => {
    if (scheduleType === "anytime") return { type: "anytime" }
    if (scheduleType === "fixed") return { type: "fixed", time: fixedTime }
    if (useSpecificTime) return { type: "preferred", time: preferredTime }
    return { type: "preferred", slot: preferredSlot }
  }

  const buildReminder = (): HabitReminder => {
    if (!reminderEnabled) return { enabled: false }
    if (scheduleType === "anytime") return { enabled: true, timeSlot: reminderTimeSlot }
    return { enabled: true, before: reminderBefore, after: reminderAfter }
  }

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
              <label className="text-sm font-medium">Difficulty</label>
              <div className="flex gap-2 mt-1">
                {DIFFICULTY_OPTIONS.map(d => (
                  <Button key={d.value} variant={difficulty === d.value ? "default" : "outline"} size="sm"
                    onClick={() => setDifficulty(d.value)}
                    className={difficulty === d.value ? `${d.color} border-0` : ""}>
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="text-sm font-medium">Habit Schedule</label>
            <div className="space-y-2 mt-2">
              {(["anytime", "preferred", "fixed"] as const).map(type => (
                <label key={type} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${scheduleType === type ? "border-[#1E0E6B] bg-[#1E0E6B]/5" : "border-white/20 hover:border-white/40"}`}>
                  <input type="radio" name="scheduleType" checked={scheduleType === type} onChange={() => setScheduleType(type)}
                    className="accent-[#1E0E6B]" />
                  <div>
                    <p className="text-sm font-medium capitalize">{type === "anytime" ? "Anytime" : type === "preferred" ? "Preferred Time" : "Fixed Time"}</p>
                    <p className="text-xs text-muted-foreground">
                      {type === "anytime" && "Complete whenever it fits your day"}
                      {type === "preferred" && "Gentle reminder around your preferred time"}
                      {type === "fixed" && "Strict schedule — must happen at this time"}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {scheduleType === "preferred" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Time</label>
              <div className="flex flex-wrap gap-2">
                {(["morning", "afternoon", "evening", "night"] as const).map(slot => (
                  <Button key={slot} variant={preferredSlot === slot && !useSpecificTime ? "default" : "outline"} size="sm"
                    onClick={() => { setPreferredSlot(slot); setUseSpecificTime(false) }}
                    className={!useSpecificTime && preferredSlot === slot ? "bg-[#1E0E6B] text-white" : ""}>
                    {slot[0].toUpperCase() + slot.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" checked={useSpecificTime} onChange={() => setUseSpecificTime(true)} className="accent-[#1E0E6B]" />
                  Specific Time
                </label>
                {useSpecificTime && (
                  <Input type="time" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-32" />
                )}
              </div>
            </div>
          )}

          {scheduleType === "fixed" && (
            <div>
              <label className="text-sm font-medium">Fixed Time</label>
              <Input type="time" value={fixedTime} onChange={(e) => setFixedTime(e.target.value)} className="mt-1 w-40" />
            </div>
          )}

          {/* Recurrence */}
          <div>
            <label className="text-sm font-medium">Recurrence</label>
            <div className="flex gap-2 mt-1">
              <Button variant={frequency === "daily" ? "default" : "outline"} onClick={() => setFrequency("daily")} className={frequency === "daily" ? "bg-[#1E0E6B] text-white" : ""}>Daily</Button>
              <Button variant={frequency === "weekly" ? "default" : "outline"} onClick={() => setFrequency("weekly")} className={frequency === "weekly" ? "bg-[#1E0E6B] text-white" : ""}>Weekly</Button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-medium">Duration</label>
            <select value={totalDuration} onChange={(e) => setTotalDuration(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
              {TOTAL_DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Colour & Icon */}
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
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${colorIdx === i ? "bg-[#1E0E6B]/10" : "hover:bg-muted"}`}>
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
                        className={`text-xl p-2 rounded-lg transition-all text-center ${icon === ic ? "bg-[#EB9E5B]/20 scale-110 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reminder Settings */}
          <div>
            <label className="text-sm font-medium">Reminder Settings</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} className="accent-[#1E0E6B]" />
                Enable Reminder
              </label>
              {reminderEnabled && scheduleType === "anytime" && (
                <div className="flex gap-2">
                  {(["morning", "afternoon", "evening"] as const).map(slot => (
                    <Button key={slot} variant={reminderTimeSlot === slot ? "default" : "outline"} size="sm"
                      onClick={() => setReminderTimeSlot(slot)}
                      className={reminderTimeSlot === slot ? "bg-[#1E0E6B] text-white" : ""}>
                      {slot[0].toUpperCase() + slot.slice(1)}
                    </Button>
                  ))}
                </div>
              )}
              {reminderEnabled && scheduleType !== "anytime" && (
                <div className="flex gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Before (min)</label>
                    <Input type="number" min="5" max="120" value={reminderBefore} onChange={(e) => setReminderBefore(parseInt(e.target.value) || 15)} className="mt-1 w-24 text-sm h-8" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">After (min)</label>
                    <Input type="number" min="0" max="120" value={reminderAfter} onChange={(e) => setReminderAfter(parseInt(e.target.value) || 30)} className="mt-1 w-24 text-sm h-8" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Goal</label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Write daily" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Why This Habit Matters</label>
            <Input value={whyItMatters} onChange={(e) => setWhyItMatters(e.target.value)} placeholder="e.g., Start each day with intention" className="mt-1" />
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
                frequency, duration, totalDuration, difficulty,
                schedule: buildSchedule(),
                reminder: buildReminder(),
                goal, whyItMatters,
                completedToday: habit?.completedToday || false,
                color: selectedColor.name, colorHex: selectedColor.hex, icon,
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHabits(parsed.map((h: Habit) => {
          const result = calcHabitScore(h.completions, h.schedule, h.difficulty, h.createdAt, h.bestStreak || 0)
          const streak = calcStreak(h.completions)
          return { ...h, streak, bestStreak: Math.max(h.bestStreak || 0, streak), completionRate: result.completionRate, consistency: result.consistency, timeAccuracy: result.timeAccuracy, habitScore: result.score }
        }))
      } catch { setHabits(createSampleHabits()) }
    }
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
      if (wasCompleted) {
        delete newCompletions[targetDate]
      } else {
        newCompletions[targetDate] = {
          completed: true,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        }
      }
      const streak = calcStreak(newCompletions)
      const result = calcHabitScore(newCompletions, habit.schedule, habit.difficulty, habit.createdAt, Math.max(habit.bestStreak, streak))
      return {
        ...habit,
        completions: newCompletions,
        completedToday: targetDate === getTodayISO() ? !wasCompleted : habit.completedToday,
        streak,
        bestStreak: Math.max(habit.bestStreak, streak),
        completionRate: result.completionRate,
        consistency: result.consistency,
        timeAccuracy: result.timeAccuracy,
        habitScore: result.score,
      }
    }))
  }, [selectedDate])

  const saveHabit = useCallback((habitData: Omit<Habit, "id" | "completions" | "createdAt" | "streak" | "bestStreak" | "completionRate" | "consistency" | "timeAccuracy" | "habitScore">) => {
    if (editingHabit) {
      setHabits(prev => prev.map(h => {
        if (h.id !== editingHabit.id) return h
        const updated = { ...h, ...habitData }
        const result = calcHabitScore(updated.completions, updated.schedule, updated.difficulty, updated.createdAt, updated.bestStreak)
        const streak = calcStreak(updated.completions)
        return { ...updated, streak, bestStreak: Math.max(updated.bestStreak, streak), completionRate: result.completionRate, consistency: result.consistency, timeAccuracy: result.timeAccuracy, habitScore: result.score }
      }))
    }
    else {
      setHabits(prev => [...prev, {
        ...habitData,
        id: Date.now().toString(),
        completions: {},
        createdAt: getTodayISO(),
        streak: 0,
        bestStreak: 0,
        completionRate: 0,
        consistency: 0,
        timeAccuracy: null,
        habitScore: 0,
      }])
    }
    setEditingHabit(null)
  }, [editingHabit])

  const deleteHabit = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this habit? This action cannot be undone.")) {
      setHabits(prev => prev.filter(h => h.id !== id))
    }
  }, [])

  const filteredHabits = useMemo(() => {
    if (!searchQuery) return habits
    const q = searchQuery.toLowerCase()
    return habits.filter(h => h.name.toLowerCase().includes(q) || h.category.toLowerCase().includes(q) || (h.customCategory || "").toLowerCase().includes(q) || h.color.toLowerCase().includes(q) || h.duration.toLowerCase().includes(q))
  }, [habits, searchQuery])

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading habits...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">Build your identity through consistent action</p>
          </div>
          <Button onClick={() => { setEditingHabit(null); setIsModalOpen(true) }}
            className="glow h-9 shrink-0">
            <Plus className="mr-1 h-4 w-4" /> Add Habit
          </Button>
        </div>
      </div>

      <SummaryBar habits={habits} selectedDate={selectedDate} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search habits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-white/5 border-[#1E0E6B]/30 focus:border-[#1E0E6B] max-w-md" />
        </div>
        <TrackerCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          period={trackerPeriod}
          onPeriodChange={setTrackerPeriod}
        />
      </div>

      <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        {filteredHabits.length > 0 ? (
          <TrackerView habits={filteredHabits} selectedDate={selectedDate} period={trackerPeriod} onToggleCell={toggleHabit} onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }} onDelete={deleteHabit} />
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
}
