"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef, Component, type ReactNode } from "react"
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
  X,
  Check,
  ChevronDown,
  ArrowUpDown,
  Info,
} from "lucide-react"

/* ─── Error Boundary ─── */

interface ErrorBoundaryState { hasError: boolean; error: Error | null }
interface ErrorBoundaryProps { children: ReactNode; fallbackLabel?: string }

class HabitsErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">Unable to load {this.props.fallbackLabel || "this section"}</h3>
          <p className="text-sm text-muted-foreground mt-1">Something went wrong. Please try again.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

interface HabitScheduleAnytime { type: "anytime" }
interface HabitSchedulePreferred { type: "preferred"; slot?: "morning" | "afternoon" | "evening" | "night"; time?: string }
interface HabitScheduleFixed { type: "fixed"; time: string }
type HabitSchedule = HabitScheduleAnytime | HabitSchedulePreferred | HabitScheduleFixed

interface HabitReminderFixed { enabled: boolean; before?: number; after?: number }
type HabitReminder = { enabled: false } | HabitReminderFixed

type RecurrenceType = "daily" | "weekdays" | "weekends" | "twice_per_week" | "three_per_week" | "four_per_week" | "five_per_week" | "custom_days" | "every_x_days" | "every_x_weeks" | "monthly"

interface HabitRecurrence {
  type: RecurrenceType
  customDays?: string[]
  interval?: number
}

interface Habit {
  id: string
  name: string
  description: string
  category: string
  customCategory?: string
  recurrence: HabitRecurrence
  duration: string
  totalDuration: string
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
  difficulty?: "easy" | "medium" | "hard"
  streakFreeze?: number
  paused?: boolean
}

type TrackerPeriod = "week" | "month" | "year"
type SortMode = "all" | "completed_today" | "not_completed" | "highest_score" | "lowest_score" | "longest_streak" | "newest" | "oldest" | "category" | "category_az" | "category_za" | "habits_az" | "habits_za" | "colour" | "schedule_type"

const getTodayISO = () => {
  try { return new Date().toISOString().split("T")[0] }
  catch { return "" }
}

const formatDateISO = (date: Date): string => {
  try {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch { return "" }
}

const formatDayName = (date: Date): string => { try { return date.toLocaleDateString("en-GB", { weekday: "short" }) } catch { return "" } }
const formatDayNumber = (date: Date): string => { try { return date.getDate().toString() } catch { return "" } }
const formatMonthYear = (date: Date): string => { try { return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) } catch { return "" } }

/* ─── Habit Normalization (handles old/missing fields) ─── */

function normalizeHabit(h: Record<string, unknown>): Habit {
  const schedule = (h.schedule && typeof h.schedule === "object" && "type" in (h.schedule as Record<string, unknown>))
    ? h.schedule as HabitSchedule
    : { type: "anytime" } as HabitSchedule
  const recurrence = (h.recurrence && typeof h.recurrence === "object" && "type" in (h.recurrence as Record<string, unknown>))
    ? h.recurrence as HabitRecurrence
    : { type: "daily" } as HabitRecurrence
  const reminder = (h.reminder && typeof h.reminder === "object" && "enabled" in (h.reminder as Record<string, unknown>))
    ? h.reminder as HabitReminder
    : { enabled: false } as HabitReminder
  return {
    id: (h.id as string) || String(Date.now()),
    name: (h.name as string) || "Untitled Habit",
    description: (h.description as string) || "",
    category: (h.category as string) || "General",
    customCategory: (h.customCategory as string) || undefined,
    recurrence,
    duration: (h.duration as string) || "10 mins",
    totalDuration: (h.totalDuration as string) || "No end date",
    schedule,
    reminder,
    goal: (h.goal as string) || "",
    whyItMatters: (h.whyItMatters as string) || "",
    streak: typeof h.streak === "number" ? h.streak : 0,
    bestStreak: typeof h.bestStreak === "number" ? h.bestStreak : 0,
    completedToday: typeof h.completedToday === "boolean" ? h.completedToday : false,
    completionRate: typeof h.completionRate === "number" ? h.completionRate : 0,
    consistency: typeof h.consistency === "number" ? h.consistency : 0,
    timeAccuracy: typeof h.timeAccuracy === "number" || h.timeAccuracy === null ? (h.timeAccuracy as number | null) : null,
    habitScore: typeof h.habitScore === "number" ? h.habitScore : 0,
    color: (h.color as string) || "Purple",
    colorHex: (h.colorHex as string) || "#8B5CF6",
    icon: (h.icon as string) || "",
    completions: (h.completions && typeof h.completions === "object") ? h.completions as Record<string, { completed: boolean; time?: string; notes?: string }> : {},
    createdAt: (h.createdAt as string) || getTodayISO(),
    difficulty: (h.difficulty as "easy" | "medium" | "hard") || "medium",
    streakFreeze: typeof h.streakFreeze === "number" ? h.streakFreeze : 0,
    paused: typeof h.paused === "boolean" ? h.paused : false,
  }
}

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
  { name: "Black", hex: "#000000" },
]

const CATEGORIES = ["Mindfulness", "Health", "Learning", "Productivity", "Mental Health", "Social", "Faith", "Custom"]
const ICONS = ["⭐", "📝", "🧘", "💪", "📚", "💧", "📵", "🌙", "📅", "🎯", "🚀", "💡", "🙏", "❤️", "🏃", "🎓"]
const TOTAL_DURATION_PRESETS = ["30 days", "60 days", "90 days", "180 days", "365 days", "No end date"]
const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

function formatTime12(time24: string | undefined | null): string {
  if (!time24 || typeof time24 !== "string") return ""
  try {
    const [h, m] = time24.split(":").map(Number)
    if (!Number.isFinite(h) || !Number.isFinite(m)) return ""
    const ampm = h >= 12 ? "PM" : "AM"
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
  } catch { return "" }
}

function timeToMinutes(time: string): number {
  if (!time || typeof time !== "string") return 0
  try {
    const [h, m] = time.split(":").map(Number)
    if (!Number.isFinite(h) || !Number.isFinite(m)) return 0
    return h * 60 + m
  } catch { return 0 }
}

function minutesDiff(a: string, b: string): number {
  return Math.abs(timeToMinutes(a) - timeToMinutes(b))
}

/* ─── Scoring Engine ─── */

const DIFFICULTY_BONUS = { easy: 0, medium: 5, hard: 10 }

function calcTimeAccuracy(completionTime: string | undefined, schedule: HabitSchedule | undefined | null): number | null {
  if (!schedule || schedule.type === "anytime") return null
  if (!completionTime) return 0
  const targetTime = schedule.time
  if (!targetTime) return null
  try {
    const diff = minutesDiff(completionTime, targetTime)
    if (!Number.isFinite(diff)) return null
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
  } catch { return null }
  return null
}

function calcStreak(completions: Record<string, { completed: boolean }> | undefined | null): number {
  if (!completions || typeof completions !== "object") return 0
  let streak = 0
  try {
    const today = new Date()
    const todayStr = formatDateISO(today)
    const todayCompleted = todayStr && completions[todayStr]?.completed

    // Start from yesterday and go backwards
    for (let i = 1; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = formatDateISO(d)
      if (key && completions[key]?.completed) streak++
      else break
    }

    // Add today if completed
    if (todayCompleted) streak++
  } catch { return 0 }
  return streak
}

function calcConsistency(completions: Record<string, { completed: boolean }> | undefined | null, createdAt: string | undefined | null): number {
  if (!completions || typeof completions !== "object") return 0
  try {
    const created = new Date(createdAt || Date.now())
    const now = new Date()
    const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
    const completedDays = Object.keys(completions).filter(k => completions[k]?.completed).length
    return Math.min(100, Math.round((completedDays / totalDays) * 100))
  } catch { return 0 }
}

function calcCompletionRate(completions: Record<string, { completed: boolean }> | undefined | null, createdAt: string | undefined | null): number {
  return calcConsistency(completions, createdAt)
}

function calcHabitScore(
  completions: Record<string, { completed: boolean; time?: string }> | undefined | null,
  schedule: HabitSchedule | undefined | null,
  createdAt: string | undefined | null,
  bestStreak: number,
): { score: number; completionRate: number; consistency: number; timeAccuracy: number | null } {
  try {
    const safeSchedule = schedule || { type: "anytime" } as HabitSchedule
    const safeCompletions = (completions && typeof completions === "object") ? completions : {}
    const safeCreatedAt = createdAt || getTodayISO()
    const completionRate = calcCompletionRate(safeCompletions, safeCreatedAt)
    const streak = calcStreak(safeCompletions)
    const consistency = calcConsistency(safeCompletions, safeCreatedAt)
    const today = getTodayISO()
    const todayCompletion = today ? safeCompletions[today] : undefined
    const timeAccuracy = todayCompletion?.completed ? calcTimeAccuracy(todayCompletion.time, safeSchedule) : null

    if (safeSchedule.type === "anytime") {
      const raw = completionRate * 0.50 + Math.min(streak, 30) / 30 * 100 * 0.25 + consistency * 0.20
      return { score: Math.round(Math.min(100, Math.max(0, raw))), completionRate, consistency, timeAccuracy: null }
    }
    const ta = timeAccuracy ?? 0
    const raw = completionRate * 0.40 + Math.min(streak, 30) / 30 * 100 * 0.25 + consistency * 0.20 + ta * 0.10 + DIFFICULTY_BONUS.medium * 0.05
    return { score: Math.round(Math.min(100, Math.max(0, raw))), completionRate, consistency, timeAccuracy: ta }
  } catch {
    return { score: 0, completionRate: 0, consistency: 0, timeAccuracy: null }
  }
}

/* ─── Weekly Occurrence Engine ─── */

function getWeeklyOccurrences(recurrence: HabitRecurrence | undefined | null): number {
  if (!recurrence || typeof recurrence !== "object") return 7
  try {
    switch (recurrence.type) {
      case "daily": return 7
      case "weekdays": return 5
      case "weekends": return 2
      case "twice_per_week": return 2
      case "three_per_week": return 3
      case "four_per_week": return 4
      case "five_per_week": return 5
      case "custom_days": return recurrence.customDays?.length || 0
      case "every_x_days": return Math.round(7 / Math.max(1, recurrence.interval || 1))
      case "every_x_weeks": return Math.round(7 / Math.max(1, (recurrence.interval || 1) * 7))
      case "monthly": return 7
      default: return 7
    }
  } catch { return 7 }
}

function isHabitScheduledOnDate(habit: Habit | undefined | null, dateStr: string): boolean {
  if (!habit || !dateStr) return true
  const r = habit.recurrence
  if (!r || typeof r !== "object") return true
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return true
    const dayOfWeek = date.getDay()
    const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]
    switch (r.type) {
      case "daily": return true
      case "weekdays": return dayOfWeek >= 1 && dayOfWeek <= 5
      case "weekends": return dayOfWeek === 0 || dayOfWeek === 6
      case "twice_per_week": case "three_per_week": case "four_per_week": case "five_per_week": return true
      case "custom_days": return r.customDays?.includes(dayName) || false
      case "every_x_days": {
        const created = new Date(habit.createdAt || Date.now())
        const diff = Math.floor((date.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff % (r.interval || 1) === 0
      }
      case "every_x_weeks": {
        const created = new Date(habit.createdAt || Date.now())
        const weekDiff = Math.floor((date.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 7))
        return weekDiff >= 0 && weekDiff % (r.interval || 1) === 0
      }
      case "monthly": return date.getDate() === new Date(habit.createdAt || Date.now()).getDate()
      default: return true
    }
  } catch { return true }
}

/* ─── Animated Number Hook ─── */

function useAnimatedNumber(target: number, duration = 400): number {
  const [display, setDisplay] = useState(target)
  const frameRef = useRef<number>(0)
  const startRef = useRef(0)
  const fromRef = useRef(target)

  useEffect(() => {
    if (typeof window === "undefined" || typeof requestAnimationFrame === "undefined") return
    if (target === fromRef.current) return
    fromRef.current = display
    startRef.current = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(fromRef.current + (target - fromRef.current) * eased))
      if (progress < 1) frameRef.current = requestAnimationFrame(animate)
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [target, duration])

  return display
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
    { id: "1", name: "Morning Journal", description: "Write for 10 minutes about intentions and gratitude", category: "Mindfulness", duration: "10 mins", totalDuration: "No end date", recurrence: { type: "daily" }, schedule: { type: "preferred", slot: "morning", time: "07:00" }, reminder: { enabled: false }, goal: "Write daily", whyItMatters: "Start each day with intention", completedToday: true, color: "Purple", colorHex: "#8B5CF6", icon: "📝", completions, createdAt: "2025-01-01" },
    { id: "2", name: "Meditate", description: "10 minutes of guided meditation", category: "Mental Health", duration: "10 mins", totalDuration: "90 days", recurrence: { type: "daily" }, schedule: { type: "preferred", slot: "morning", time: "06:30" }, reminder: { enabled: false }, goal: "Daily practice", whyItMatters: "Inner peace and clarity", completedToday: true, color: "Blue", colorHex: "#3B82F6", icon: "🧘", completions, createdAt: "2025-01-05" },
    { id: "3", name: "Exercise", description: "30 minutes of physical activity", category: "Health", duration: "30 mins", totalDuration: "60 days", recurrence: { type: "weekdays" }, schedule: { type: "preferred", slot: "evening", time: "17:00" }, reminder: { enabled: false }, goal: "Stay fit", whyItMatters: "Physical health is foundational", completedToday: true, color: "Green", colorHex: "#22C55E", icon: "💪", completions, createdAt: "2025-01-10" },
    { id: "4", name: "Read 30 Minutes", description: "Read books on personal growth", category: "Learning", duration: "30 mins", totalDuration: "365 days", recurrence: { type: "daily" }, schedule: { type: "anytime" }, reminder: { enabled: false }, goal: "Read more", whyItMatters: "Knowledge compounds", completedToday: true, color: "Orange", colorHex: "#F97316", icon: "📚", completions, createdAt: "2025-01-03" },
    { id: "5", name: "Drink 8 Glasses", description: "Stay hydrated throughout the day", category: "Health", duration: "5 mins", totalDuration: "No end date", recurrence: { type: "daily" }, schedule: { type: "anytime" }, reminder: { enabled: false }, goal: "Stay hydrated", whyItMatters: "Hydration fuels everything", completedToday: false, color: "Teal", colorHex: "#14B8A6", icon: "💧", completions, createdAt: "2025-01-15" },
    { id: "6", name: "No Social Media Before Noon", description: "Protect morning focus time", category: "Productivity", duration: "5 mins", totalDuration: "No end date", recurrence: { type: "daily" }, schedule: { type: "fixed", time: "12:00" }, reminder: { enabled: true, before: 30 }, goal: "Focus better", whyItMatters: "Deep work requires boundaries", completedToday: false, color: "Red", colorHex: "#EF4444", icon: "📵", completions, createdAt: "2025-01-20" },
    { id: "7", name: "Evening Reflection", description: "Review the day and set intentions for tomorrow", category: "Mindfulness", duration: "15 mins", totalDuration: "90 days", recurrence: { type: "daily" }, schedule: { type: "preferred", slot: "night", time: "21:00" }, reminder: { enabled: false }, goal: "Reflect daily", whyItMatters: "Growth comes from reflection", completedToday: false, color: "Pink", colorHex: "#EC4899", icon: "🌙", completions, createdAt: "2025-01-08" },
    { id: "8", name: "Pray", description: "Spend time in prayer and gratitude", category: "Faith", duration: "10 mins", totalDuration: "No end date", recurrence: { type: "daily" }, schedule: { type: "preferred", slot: "morning", time: "06:00" }, reminder: { enabled: false }, goal: "Spiritual growth", whyItMatters: "Faith grounds the soul", completedToday: true, color: "Yellow", colorHex: "#EAB308", icon: "🙏", completions, createdAt: "2025-01-02" },
  ]
  return habits.map(h => {
    const result = calcHabitScore(h.completions, h.schedule, h.createdAt, 0)
    const streak = calcStreak(h.completions)
    return { ...h, streak, bestStreak: streak, completionRate: result.completionRate, consistency: result.consistency, timeAccuracy: result.timeAccuracy, habitScore: result.score }
  })
}

/* ─── Summary Bar ─── */

type CardFilter = "today" | "weekly" | "score" | "streak" | "all" | null

const AnimatedValue = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const animated = useAnimatedNumber(value)
  return <span>{animated}{suffix}</span>
}

/* ─── Intent Score Breakdown Popover ─── */

const IntentScoreBreakdown = ({
  habit,
  onClose,
}: {
  habit: Habit
  onClose: () => void
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const completionRate = habit.completionRate || 0
  const streak = habit.streak || 0
  const consistency = habit.consistency || 0
  const timeAccuracy = habit.timeAccuracy ?? null
  const difficulty = habit.difficulty || "medium"

  const completionPoints = Math.round(completionRate * 0.5)
  const streakPoints = Math.round(Math.min(streak, 30) / 30 * 100 * 0.25)
  const consistencyPoints = Math.round(consistency * 0.2)
  const timeAccuracyPoints = timeAccuracy !== null ? Math.round(timeAccuracy * 0.1) : 0
  const difficultyPoints = difficulty === "easy" ? 0 : difficulty === "medium" ? 5 : 10

  const breakdown = [
    { label: "Completion", points: completionPoints, max: 50, color: "bg-emerald-500" },
    { label: "Streak", points: streakPoints, max: 25, color: "bg-orange-500" },
    { label: "Consistency", points: consistencyPoints, max: 20, color: "bg-blue-500" },
    ...(timeAccuracy !== null ? [{ label: "Time Accuracy", points: timeAccuracyPoints, max: 10, color: "bg-purple-500" }] : []),
    { label: "Difficulty", points: difficultyPoints, max: 10, color: "bg-red-500" },
  ]

  return (
    <div ref={ref} className="absolute z-50 top-full mt-2 right-0 w-72 p-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm">Intent Score Breakdown</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {breakdown.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">{item.label}</span>
              <span className="text-xs font-medium">{item.points} pts</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${item.color}`}
                style={{ width: `${(item.points / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Total Score</span>
          <span className="text-lg font-bold text-[#1E0E6B]">{habit.habitScore}</span>
        </div>
      </div>
    </div>
  )
}

const SummaryCard = ({
  label,
  primary,
  secondary,
  gradient,
  accentColor,
  icon,
  tooltip,
  infoText,
  onClick,
  isActive,
}: {
  label: string
  primary: string
  secondary?: string
  gradient: string
  accentColor: string
  icon: React.ReactNode
  tooltip: React.ReactNode
  infoText: string
  onClick: () => void
  isActive?: boolean
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showInfo) return
    const handleClickOutside = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setShowInfo(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showInfo])

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        onClick={onClick}
        className={`rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg border-2 ${isActive ? "ring-2 ring-[#1E0E6B] ring-offset-2" : ""}`}
        style={{ borderColor: accentColor }}
      >
        <div className="bg-white dark:bg-gray-950 px-4 py-2.5 h-full relative rounded-[10px]">
          <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shrink-0`}>
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xl font-bold leading-tight">{primary}</p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
              {secondary && <p className="text-[10px] text-muted-foreground mt-0.5">{secondary}</p>}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo) }}
            className="absolute bottom-2 right-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          {showInfo && (
            <div className="absolute z-50 bottom-full mb-2 right-2 w-64 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-white/20 text-xs text-muted-foreground leading-relaxed" ref={infoRef}>
              {infoText}
            </div>
          )}
        </div>
      </div>
      {showTooltip && (
        <div className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-white/20 text-xs space-y-1.5 pointer-events-none">
          {tooltip}
        </div>
      )}
    </div>
  )
}

const SummaryBar = ({ habits, selectedDate, activeFilter, onFilterChange, onSortChange }: {
  habits: Habit[]
  selectedDate: Date
  activeFilter: CardFilter
  onFilterChange: (f: CardFilter) => void
  onSortChange: (s: SortMode) => void
}) => {
  const today = getTodayISO()
  const totalCount = habits.length

  /* Card 1: Today's Progress */
  const todayScheduled = habits.filter(h => isHabitScheduledOnDate(h, today)).length
  const todayCompleted = habits.filter(h => isHabitScheduledOnDate(h, today) && h.completions[today]?.completed).length
  const todayPercent = todayScheduled > 0 ? Math.round((todayCompleted / todayScheduled) * 100) : 0

  /* Card 2: Weekly Completion */
  const weekStart = new Date(selectedDate)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekDates: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    weekDates.push(formatDateISO(d))
  }
  let weekScheduled = 0, weekCompleted = 0
  habits.forEach(h => {
    weekDates.forEach(d => {
      if (isHabitScheduledOnDate(h, d)) {
        weekScheduled++
        if (h.completions[d]?.completed) weekCompleted++
      }
    })
  })
  const weekPercent = weekScheduled > 0 ? Math.round((weekCompleted / weekScheduled) * 100) : 0

  /* Card 3: Monthly Completion */
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthDates: string[] = []
  for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
    monthDates.push(formatDateISO(d))
  }
  let monthScheduled = 0, monthCompleted = 0
  habits.forEach(h => {
    monthDates.forEach(d => {
      if (isHabitScheduledOnDate(h, d)) {
        monthScheduled++
        if (h.completions[d]?.completed) monthCompleted++
      }
    })
  })
  const monthPercent = monthScheduled > 0 ? Math.round((monthCompleted / monthScheduled) * 100) : 0

  /* Card 4: Highest Streak */
  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0)
  const bestStreakHabit = habits.find(h => h.bestStreak === bestStreak)

  /* Card 5: Active Habits */
  const activeCount = totalCount

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <SummaryCard
        label="Today's Progress"
        primary={totalCount === 0 ? "--" : `${todayCompleted} / ${todayScheduled}`}
        secondary={totalCount === 0 ? "No habits today" : `${todayPercent}%`}
        gradient="from-emerald-400 to-green-500"
        accentColor="#22C55E"
        icon={<CheckCircle2 className="h-5 w-5 text-white" />}
        isActive={activeFilter === "today"}
        onClick={() => onFilterChange(activeFilter === "today" ? null : "today")}
        infoText="Completed habits today out of today's scheduled habits. Example: 8 of 9 habits completed."
        tooltip={
          <>
            <p className="font-medium text-foreground">Today's Progress</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Completed today</span><span className="font-medium">{todayCompleted}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Scheduled today</span><span className="font-medium">{todayScheduled}</span></div>
            <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">Completion</span><span className="font-medium">{todayPercent}%</span></div>
          </>
        }
      />

      <SummaryCard
        label="Weekly Completion"
        primary={totalCount === 0 ? "--" : `${weekPercent}%`}
        secondary={totalCount === 0 ? "Nothing scheduled" : `${weekCompleted}/${weekScheduled} completed`}
        gradient="from-blue-400 to-cyan-500"
        accentColor="#3B82F6"
        icon={<TrendingUp className="h-5 w-5 text-white" />}
        isActive={activeFilter === "weekly"}
        onClick={() => onFilterChange(activeFilter === "weekly" ? null : "weekly")}
        infoText="Weekly completion percentage. Calculated using: Completed scheduled habits ÷ Total scheduled habits this week. Excludes future days."
        tooltip={
          <>
            <p className="font-medium text-foreground">Weekly Completion</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Scheduled this week</span><span className="font-medium">{weekScheduled}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-medium">{weekCompleted}</span></div>
            <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">Completion</span><span className="font-medium">{weekPercent}%</span></div>
          </>
        }
      />

      <SummaryCard
        label="Monthly Completion"
        primary={totalCount === 0 ? "--" : `${monthPercent}%`}
        secondary={totalCount === 0 ? "No data yet" : `${monthCompleted}/${monthScheduled} completed`}
        gradient="from-purple-400 to-pink-500"
        accentColor="#8B5CF6"
        icon={<TrendingUp className="h-5 w-5 text-white" />}
        isActive={activeFilter === "score"}
        onClick={() => { onFilterChange(activeFilter === "score" ? null : "score"); onSortChange("highest_score") }}
        infoText="Monthly completion percentage. Calculated using: Completed scheduled habits ÷ Total scheduled habits for the current month so far. Future dates are excluded."
        tooltip={
          <>
            <p className="font-medium text-foreground">Monthly Completion</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Completed</span><span className="font-medium">{monthCompleted}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Scheduled</span><span className="font-medium">{monthScheduled}</span></div>
            <div className="flex justify-between border-t pt-1"><span className="text-muted-foreground">Completion</span><span className="font-medium">{monthPercent}%</span></div>
          </>
        }
      />

      <SummaryCard
        label="Highest Streak"
        primary={totalCount === 0 ? "0" : `${bestStreak}`}
        secondary={totalCount === 0 ? "No streaks yet" : bestStreakHabit?.name}
        gradient="from-orange-400 to-amber-500"
        accentColor="#F97316"
        icon={<Flame className="h-5 w-5 text-white" />}
        isActive={activeFilter === "streak"}
        onClick={() => { onFilterChange(activeFilter === "streak" ? null : "streak"); onSortChange("longest_streak") }}
        infoText="Your longest uninterrupted streak among all habits."
        tooltip={
          <>
            <p className="font-medium text-foreground">Highest Streak</p>
            {bestStreakHabit ? (
              <div className="flex justify-between"><span className="text-muted-foreground">{bestStreakHabit.name}</span><span className="font-medium">{bestStreak} days</span></div>
            ) : (
              <p className="text-muted-foreground">No streaks yet</p>
            )}
          </>
        }
      />

      <SummaryCard
        label="Active Habits"
        primary={totalCount === 0 ? "0" : `${activeCount}`}
        secondary={totalCount === 0 ? "Create your first habit" : "Currently active"}
        gradient="from-indigo-400 to-blue-500"
        accentColor="#1E0E6B"
        icon={<Target className="h-5 w-5 text-white" />}
        isActive={activeFilter === "all"}
        onClick={() => onFilterChange(activeFilter === "all" ? null : "all")}
        infoText="The total number of active habits currently being tracked."
        tooltip={
          <>
            <p className="font-medium text-foreground">Active Habits</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Currently active</span><span className="font-medium">{activeCount}</span></div>
          </>
        }
      />
    </div>
  )
}

/* ─── Tracker Calendar ─── */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

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
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()
  const currentYearNum = new Date().getFullYear()
  const years = Array.from({ length: 7 }, (_, i) => currentYearNum - 2 + i)

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
        <Button variant={period === "week" ? "default" : "ghost"} size="sm" onClick={() => onPeriodChange("week")} className={period === "week" ? "bg-[#1E0E6B] text-white h-8 px-2 text-xs" : "h-8 px-2 text-xs"}>Week</Button>
        <Button variant={period === "month" ? "default" : "ghost"} size="sm" onClick={() => onPeriodChange("month")} className={period === "month" ? "bg-[#1E0E6B] text-white h-8 px-2 text-xs" : "h-8 px-2 text-xs"}>Month</Button>
        <Button variant={period === "year" ? "default" : "ghost"} size="sm" onClick={() => onPeriodChange("year")} className={period === "year" ? "bg-[#1E0E6B] text-white h-8 px-2 text-xs" : "h-8 px-2 text-xs"}>Year</Button>
      </div>
      {period === "month" && (
        <select value={currentMonth} onChange={(e) => {
          const newDate = new Date(selectedDate)
          newDate.setMonth(parseInt(e.target.value))
          onDateSelect(newDate)
        }}
          className="appearance-none px-2 py-1 text-xs border border-[#1E0E6B]/40 rounded-lg bg-white/50 dark:bg-white/5 cursor-pointer pr-6"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.375rem center" }}>
          {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
      )}
      {period === "year" && (
        <select value={currentYear} onChange={(e) => {
          const newDate = new Date(selectedDate)
          newDate.setFullYear(parseInt(e.target.value))
          onDateSelect(newDate)
        }}
          className="appearance-none px-2 py-1 text-xs border border-[#1E0E6B]/40 rounded-lg bg-white/50 dark:bg-white/5 cursor-pointer pr-6"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.375rem center" }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      )}
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
  linkedGoals,
  draggedId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  habits: Habit[]
  selectedDate: Date
  period: TrackerPeriod
  onToggleCell: (habitId: string, dateStr: string) => void
  onEdit: (habit: Habit) => void
  linkedGoals?: { id: string; title: string; linkedHabits: string[]; colorHex: string }[]
  draggedId?: string | null
  dragOverId?: string | null
  onDragStart?: (id: string) => void
  onDragOver?: (e: React.DragEvent, id: string) => void
  onDrop?: (id: string) => void
  onDragEnd?: () => void
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

  const getScheduleBadge = (schedule: HabitSchedule | undefined | null) => {
    if (!schedule || typeof schedule !== "object") return <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Flexible ✓</span>
    if (schedule.type === "anytime") return <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">Flexible ✓</span>
    if (schedule.type === "preferred") {
      const label = schedule.slot ? schedule.slot[0].toUpperCase() + schedule.slot.slice(1) : formatTime12(schedule.time || "")
      return <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">Preferred · {label}</span>
    }
    return <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Fixed · {formatTime12(schedule.time)}</span>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[1050px]">
        <thead>
          <tr className="border-b border-white/20">
            <th className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[40px] border-r border-white/10"></th>
            <th className="sticky left-[40px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[200px] border-r border-white/10">Habit</th>
            <th className="sticky left-[240px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[100px] border-r border-white/10">Category</th>
            <th className="sticky left-[340px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[80px] border-r border-white/10">Duration</th>
            <th className="sticky left-[420px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[120px] border-r border-white/10">Linked Goal</th>
            <th className="sticky left-[540px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[90px] border-r border-white/10">Intent Score</th>
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
          {habits.map((habit) => {
            const isDragging = draggedId === habit.id
            const isDragOver = dragOverId === habit.id && dragOverId !== draggedId
            return (
            <tr key={habit.id}
              draggable
              onDragStart={() => onDragStart?.(habit.id)}
              onDragOver={(e) => onDragOver?.(e, habit.id)}
              onDrop={() => onDrop?.(habit.id)}
              onDragEnd={onDragEnd}
              className={`border-b border-white/10 transition-colors cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""} ${isDragOver ? "border-t-2 border-t-[#1E0E6B]" : ""} hover:bg-white/30 dark:hover:bg-white/5`}>
              <td className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.colorHex }} />
              </td>
              <td className="sticky left-[40px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <button onClick={() => onEdit(habit)} className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left">
                  {habit.icon ? <span className="text-lg shrink-0">{habit.icon}</span> : <span className="w-5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-[#1E0E6B] hover:underline leading-tight truncate">{habit.name}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Flame className="h-2.5 w-2.5 shrink-0" style={{ color: habit.colorHex }} />
                      <span className="text-[10px] text-muted-foreground">{habit.streak} streak</span>
                      {(habit.streakFreeze || 0) > 0 && <span className="text-[10px]">❄️{habit.streakFreeze}</span>}
                      {habit.paused && <span className="text-[10px] text-amber-500 font-medium">⏸ Paused</span>}
                      {getScheduleBadge(habit.schedule)}
                    </div>
                  </div>
                </button>
              </td>
              <td className="sticky left-[240px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">{habit.customCategory || habit.category}</Badge>
                </div>
              </td>
              <td className="sticky left-[340px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                {(() => {
                  const completedCount = Object.keys(habit.completions || {}).filter(k => habit.completions[k]?.completed).length
                  const totalStr = habit.totalDuration || "No end date"
                  if (totalStr === "No end date" || totalStr.toLowerCase() === "indefinite") {
                    return <span className="text-[10px] text-muted-foreground font-medium">{completedCount} / ∞</span>
                  }
                  const numMatch = totalStr.match(/(\d+)/)
                  const totalDays = numMatch ? parseInt(numMatch[1]) : null
                  if (totalDays) {
                    return <span className="text-[10px] text-muted-foreground font-medium">{completedCount} / {totalDays}</span>
                  }
                  return <span className="text-[10px] text-muted-foreground font-medium">{completedCount} / ∞</span>
                })()}
              </td>
              <td className="sticky left-[420px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
                <button onClick={() => onEdit(habit)} className="text-left hover:opacity-70 transition-opacity cursor-pointer w-full">
                {(() => {
                  const linkedGoal = linkedGoals?.find(g => g.linkedHabits?.includes(habit.name))
                  if (linkedGoal) {
                    return (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: linkedGoal.colorHex }} />
                        <span className="text-[10px] font-medium text-[#1E0E6B] truncate max-w-[100px]">{linkedGoal.title}</span>
                      </div>
                    )
                  }
                  return <span className="text-[10px] text-muted-foreground italic">No linked goal</span>
                })()}
                </button>
              </td>
              <td className="sticky left-[540px] z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10">
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
                      onClick={() => !isFuture && !habit.paused && onToggleCell(habit.id, dateStr)}
                      onMouseEnter={() => setHoveredCell({ habitId: habit.id, date: dateStr })}
                      onMouseLeave={() => setHoveredCell(null)}
                      disabled={isFuture || habit.paused}
                      className={`w-7 h-7 rounded-md transition-all ${
                        isFuture || habit.paused ? "cursor-not-allowed opacity-30" : isCompleted ? "cursor-pointer hover:scale-110" : "cursor-pointer hover:bg-white/50 border border-dashed border-gray-300"
                      }`}
                      style={isCompleted ? { backgroundColor: habit.colorHex } : undefined}
                    >
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-white mx-auto" />}
                    </button>
                  </td>
                )
              })}
            </tr>
          )})}
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
  onDelete,
  habit,
  goals,
  onCreateGoal,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: Omit<Habit, "id" | "completions" | "createdAt" | "streak" | "bestStreak" | "completionRate" | "consistency" | "timeAccuracy" | "habitScore">) => void
  onDelete: (id: string) => void
  habit?: Habit | null
  goals?: { id: string; title: string }[]
  onCreateGoal?: () => void
}) => {
  const [name, setName] = useState(habit?.name || "")
  const [description, setDescription] = useState(habit?.description || "")
  const [category, setCategory] = useState(habit?.category || "Mindfulness")
  const [customCategory, setCustomCategory] = useState(habit?.customCategory || "")
  const [duration, setDuration] = useState(habit?.duration || "10 mins")
  const [totalDuration, setTotalDuration] = useState(habit?.totalDuration || "No end date")
  const [totalDurationCustom, setTotalDurationCustom] = useState("")
  const [scheduleType, setScheduleType] = useState<"anytime" | "preferred" | "fixed">(habit?.schedule?.type || "anytime")
  const [preferredSlot, setPreferredSlot] = useState<"morning" | "afternoon" | "evening" | "night">((habit?.schedule?.type === "preferred" ? habit.schedule.slot : undefined) || "morning")
  const [useSpecificTime, setUseSpecificTime] = useState(habit?.schedule?.type === "preferred" && !!habit.schedule.time)
  const [preferredTime, setPreferredTime] = useState(habit?.schedule?.type === "preferred" ? (habit.schedule.time || "08:00") : "08:00")
  const [fixedTime, setFixedTime] = useState(habit?.schedule?.type === "fixed" ? habit.schedule.time : "08:00")
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminder?.enabled || false)
  const [reminderBefore, setReminderBefore] = useState(habit?.reminder && "before" in habit.reminder ? (habit.reminder.before || 15) : 15)
  const [reminderAfter, setReminderAfter] = useState(habit?.reminder && "after" in habit.reminder ? (habit.reminder.after || 30) : 30)
  const [goal, setGoal] = useState(habit?.goal || "")
  const [linkedGoalId, setLinkedGoalId] = useState(habit?.goal || "")
  const [whyItMatters, setWhyItMatters] = useState(habit?.whyItMatters || "")
  const [icon, setIcon] = useState(habit?.icon || "")
  const [colorIdx, setColorIdx] = useState(
    HABIT_COLORS.findIndex(c => c.name === habit?.color) >= 0 ? HABIT_COLORS.findIndex(c => c.name === habit?.color) : 0
  )
  const [showIconDropdown, setShowIconDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(habit?.recurrence?.type || "daily")
  const [customDays, setCustomDays] = useState<string[]>(habit?.recurrence?.customDays || [])
  const [interval, setInterval] = useState(habit?.recurrence?.interval || 2)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(habit?.difficulty || "medium")
  const [streakFreeze, setStreakFreeze] = useState(habit?.streakFreeze || 0)
  const [paused, setPaused] = useState(habit?.paused || false)

  useEffect(() => {
    if (habit) {
      try {
        setName(habit.name || ""); setDescription(habit.description || ""); setCategory(habit.category || "Mindfulness")
        setCustomCategory(habit.customCategory || ""); setDuration(habit.duration || "10 mins")
        setTotalDuration(habit.totalDuration || "No end date"); setGoal(habit.goal || ""); setWhyItMatters(habit.whyItMatters || "")
        setLinkedGoalId(habit.goal || "")
        setIcon(habit.icon || "")
        const idx = HABIT_COLORS.findIndex(c => c.name === habit.color)
        if (idx >= 0) setColorIdx(idx)
        const sch = habit.schedule || { type: "anytime" }
        setScheduleType(sch.type || "anytime")
        if (sch.type === "preferred") {
          setPreferredSlot(sch.slot || "morning")
          setUseSpecificTime(!!sch.time)
          setPreferredTime(sch.time || "08:00")
        } else if (sch.type === "fixed") {
          setFixedTime(sch.time || "08:00")
        }
        const rem = habit.reminder || { enabled: false }
        setReminderEnabled(rem.enabled || false)
        if (rem.enabled && "before" in rem) {
          setReminderBefore(rem.before || 15)
          setReminderAfter(rem.after || 30)
        }
        setRecurrenceType(habit.recurrence?.type || "daily")
        setCustomDays(habit.recurrence?.customDays || [])
        setInterval(habit.recurrence?.interval || 2)
        setDifficulty(habit.difficulty || "medium")
        setStreakFreeze(habit.streakFreeze || 0)
        setPaused(habit.paused || false)
        const td = habit.totalDuration || "No end date"
        if (!TOTAL_DURATION_PRESETS.includes(td) && td !== "No end date") {
          setTotalDuration("custom")
          setTotalDurationCustom(td)
        }
      } catch {
        setName(""); setDescription(""); setCategory("Mindfulness"); setCustomCategory("")
        setDuration("10 mins"); setTotalDuration("No end date"); setTotalDurationCustom("")
        setScheduleType("anytime"); setPreferredSlot("morning")
        setUseSpecificTime(false); setPreferredTime("08:00"); setFixedTime("08:00")
        setReminderEnabled(false); setReminderBefore(15); setReminderAfter(30)
        setGoal(""); setWhyItMatters(""); setIcon(""); setColorIdx(0)
        setRecurrenceType("daily"); setCustomDays([]); setInterval(2)
      }
    } else {
      setName(""); setDescription(""); setCategory("Mindfulness"); setCustomCategory("")
      setDuration("10 mins"); setTotalDuration("No end date"); setTotalDurationCustom("")
      setScheduleType("anytime"); setPreferredSlot("morning")
      setUseSpecificTime(false); setPreferredTime("08:00"); setFixedTime("08:00")
      setReminderEnabled(false); setReminderBefore(15); setReminderAfter(30)
      setGoal(""); setWhyItMatters(""); setIcon(""); setColorIdx(0)
      setRecurrenceType("daily"); setCustomDays([]); setInterval(2)
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
    if (!reminderEnabled || scheduleType !== "fixed") return { enabled: false }
    return { enabled: true, before: reminderBefore, after: reminderAfter }
  }

  const buildRecurrence = (): HabitRecurrence => {
    return { type: recurrenceType, customDays: recurrenceType === "custom_days" ? customDays : undefined, interval: (recurrenceType === "every_x_days" || recurrenceType === "every_x_weeks") ? interval : undefined }
  }

  const effectiveTotalDuration = totalDuration === "custom" ? (totalDurationCustom || "No end date") : totalDuration

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

          {/* Duration per session */}
          <div>
            <label className="text-sm font-medium">Duration (per session)</label>
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 10 mins" className="mt-1" />
          </div>

          {/* Habit Duration & Recurrence - Compact Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Recurrence</label>
              <select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                className="mt-1 w-full appearance-none px-3 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer pr-8"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center" }}>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="twice_per_week">Twice per Week</option>
                <option value="three_per_week">Three Times per Week</option>
                <option value="four_per_week">Four Times per Week</option>
                <option value="five_per_week">Five Times per Week</option>
                <option value="custom_days">Custom Days</option>
                <option value="every_x_days">Every X Days</option>
                <option value="every_x_weeks">Every X Weeks</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Habit Duration</label>
              <select value={totalDuration === "No end date" ? "indefinite" : totalDuration} onChange={(e) => {
                const val = e.target.value
                if (val === "indefinite") setTotalDuration("No end date")
                else if (val === "custom") setTotalDuration("custom")
                else setTotalDuration(val)
              }}
                className="mt-1 w-full appearance-none px-3 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer pr-8"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center" }}>
                <option value="7 days">7 Days</option>
                <option value="14 days">14 Days</option>
                <option value="21 days">21 Days</option>
                <option value="30 days">30 Days</option>
                <option value="60 days">60 Days</option>
                <option value="90 days">90 Days</option>
                <option value="180 days">180 Days</option>
                <option value="365 days">365 Days</option>
                <option value="indefinite">Indefinite</option>
                <option value="custom">Custom...</option>
              </select>
              {totalDuration === "custom" && (
                <Input value={totalDurationCustom} onChange={(e) => setTotalDurationCustom(e.target.value)}
                  placeholder="e.g., 50 days, 73 days" className="mt-2" />
              )}
            </div>
          </div>
          {recurrenceType === "custom_days" && (
            <div className="flex flex-wrap gap-2 mt-2">
              {WEEK_DAYS.map(day => (
                <Button key={day} variant={customDays.includes(day) ? "default" : "outline"} size="sm"
                  onClick={() => setCustomDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                  className={`text-xs ${customDays.includes(day) ? "bg-[#1E0E6B] text-white" : ""}`}>
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          )}
          {(recurrenceType === "every_x_days" || recurrenceType === "every_x_weeks") && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">Every</span>
              <Input type="number" min="2" max="365" value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value) || 2)} className="w-20 text-sm h-8" />
              <span className="text-sm">{recurrenceType === "every_x_days" ? "days" : "weeks"}</span>
            </div>
          )}

          {/* Difficulty Level */}
          <div>
            <label className="text-sm font-medium">Difficulty Level</label>
            <div className="flex gap-2 mt-1">
              {(["easy", "medium", "hard"] as const).map(d => (
                <Button key={d} variant={difficulty === d ? "default" : "outline"} size="sm"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 text-xs ${difficulty === d ? "bg-[#1E0E6B] text-white" : ""}`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Streak Freeze & Pause */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Streak Freeze</label>
              <p className="text-[10px] text-muted-foreground mb-1">Earned at 21-day streak</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg">❄️</span>
                <span className="text-sm font-medium">{streakFreeze} freeze{streakFreeze !== 1 ? "s" : ""} remaining</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Pause Habit</label>
              <p className="text-[10px] text-muted-foreground mb-1">Temporarily stop tracking</p>
              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)} className="accent-[#1E0E6B] w-4 h-4" />
                <span className="text-sm">{paused ? "Paused" : "Active"}</span>
              </label>
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

          {/* Reminder Settings - Only for Fixed Time */}
          {scheduleType === "fixed" && (
            <div>
              <label className="text-sm font-medium">Reminder Settings</label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} className="accent-[#1E0E6B]" />
                  Enable Reminder
                </label>
                {reminderEnabled && (
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
          )}

          <div>
            <label className="text-sm font-medium">Goal</label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Write daily" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Why This Habit Matters</label>
            <Input value={whyItMatters} onChange={(e) => setWhyItMatters(e.target.value)} placeholder="e.g., Start each day with intention" className="mt-1" />
          </div>

          {/* Linked Goal */}
          <div>
            <label className="text-sm font-medium">Linked Goal</label>
            {!goals || goals.length === 0 ? (
              <div className="mt-2 p-3 rounded-lg border border-dashed border-white/30 bg-white/30 dark:bg-white/5 text-center">
                <p className="text-xs text-muted-foreground mb-2">No goals found.</p>
                <p className="text-xs text-muted-foreground mb-3">Habits become more meaningful when connected to a goal.</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" className="glow text-white text-xs h-7" onClick={onCreateGoal}>Create Goal</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setLinkedGoalId("")}>Skip for now</Button>
                </div>
              </div>
            ) : (
              <div className="mt-1">
                <select
                  value={linkedGoalId}
                  onChange={(e) => setLinkedGoalId(e.target.value)}
                  className="w-full appearance-none px-3 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer pr-8"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center" }}
                >
                  <option value="">Select Goal</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.title}>{g.title}</option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="glow text-white text-xs h-7" onClick={onCreateGoal}>Create Goal</Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setLinkedGoalId("")}>Skip for now</Button>
                </div>
              </div>
            )}
          </div>

          {/* Colour & Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="text-sm font-medium">Colour</label>
              <button type="button" onClick={() => { setShowColorDropdown(!showColorDropdown); setShowIconDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: HABIT_COLORS[colorIdx].hex }} />
                  <span className="text-sm">{HABIT_COLORS[colorIdx].name}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {showColorDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 space-y-1">
                  {HABIT_COLORS.map((c, i) => (
                    <button key={c.name} onClick={() => { setColorIdx(i); setShowColorDropdown(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${colorIdx === i ? "bg-[#1E0E6B]/10" : "hover:bg-muted"}`}>
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }} />
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
                  {icon ? <span className="text-lg">{icon}</span> : <span className="text-sm text-muted-foreground">None</span>}
                  <span className="text-sm">Icon</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {showIconDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => { setIcon(""); setShowIconDropdown(false) }}
                      className={`text-sm p-2 rounded-lg transition-all text-center ${icon === "" ? "bg-[#EB9E5B]/20 scale-110 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>
                      None
                    </button>
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
        </div>

        <div className="flex flex-col gap-2 pt-2">
          {habit && (
            <button
              onClick={() => { if (confirm("Are you sure you want to delete this habit? This action cannot be undone.")) { onDelete(habit.id); onClose() } }}
              className="w-full py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
            >
              Delete Habit
            </button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={() => {
              if (name.trim()) {
                const selectedColor = HABIT_COLORS[colorIdx]
                onSave({
                  name, description, category: category === "Custom" ? "Custom" : category,
                  customCategory: category === "Custom" ? customCategory : undefined,
                  duration, totalDuration: effectiveTotalDuration,
                  recurrence: buildRecurrence(),
                  schedule: buildSchedule(),
                  reminder: buildReminder(),
                  goal: linkedGoalId || goal, whyItMatters,
                  completedToday: habit?.completedToday || false,
                  color: selectedColor.name, colorHex: selectedColor.hex, icon,
                  difficulty, streakFreeze, paused,
                })
                onClose()
              }
            }} className="flex-1 glow text-white">
              {habit ? "Save Changes" : "Add Habit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [linkedGoals, setLinkedGoals] = useState<{ id: string; title: string; linkedHabits: string[]; colorHex: string }[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [trackerPeriod, setTrackerPeriod] = useState<TrackerPeriod>("month")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortMode>("all")
  const [activeFilter, setActiveFilter] = useState<CardFilter>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("intenteo-habits")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setHabits(parsed.map((h: Record<string, unknown>) => {
              const normalized = normalizeHabit(h)
              const result = calcHabitScore(normalized.completions, normalized.schedule, normalized.createdAt, normalized.bestStreak)
              const streak = calcStreak(normalized.completions)
              return { ...normalized, streak, bestStreak: Math.max(normalized.bestStreak, streak), completionRate: result.completionRate, consistency: result.consistency, timeAccuracy: result.timeAccuracy, habitScore: result.score }
            }))
          } else {
            setHabits(createSampleHabits())
          }
        } catch { setHabits(createSampleHabits()) }
      } else {
        setHabits(createSampleHabits())
      }
    } catch {
      setHabits(createSampleHabits())
    }
    try {
      const sg = localStorage.getItem("intenteo-goals")
      if (sg) {
        const parsed = JSON.parse(sg)
        if (Array.isArray(parsed)) {
          setLinkedGoals(parsed.map((g: any) => ({ id: g.id, title: g.title, linkedHabits: g.linkedHabits || [], colorHex: g.colorHex })))
        }
      }
    } catch {}
    setIsLoading(false)
  }, [])

  useEffect(() => { try { if (!isLoading) localStorage.setItem("intenteo-habits", JSON.stringify(habits)) } catch {} }, [habits, isLoading])
  useEffect(() => { try { localStorage.setItem("intenteo-habits-period", trackerPeriod) } catch {} }, [trackerPeriod])

  const toggleHabit = useCallback((id: string, dateStr?: string) => {
    const targetDate = dateStr || formatDateISO(selectedDate)
    setHabits(prev => prev.map(habit => {
      if (habit.id !== id) return habit
      if (habit.paused) return habit
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
      const result = calcHabitScore(newCompletions, habit.schedule, habit.createdAt, Math.max(habit.bestStreak, streak))
      // Award streak freeze at 21 days
      let newFreezes = habit.streakFreeze || 0
      if (streak >= 21 && streak % 21 === 0 && !wasCompleted) {
        newFreezes = newFreezes + 1
      }
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
        streakFreeze: newFreezes,
      }
    }))
  }, [selectedDate])

  const saveHabit = useCallback((habitData: Omit<Habit, "id" | "completions" | "createdAt" | "streak" | "bestStreak" | "completionRate" | "consistency" | "timeAccuracy" | "habitScore">) => {
    if (editingHabit) {
      setHabits(prev => prev.map(h => {
        if (h.id !== editingHabit.id) return h
        const updated = { ...h, ...habitData }
        try {
          const result = calcHabitScore(updated.completions, updated.schedule, updated.createdAt, updated.bestStreak)
          const streak = calcStreak(updated.completions)
          return { ...updated, streak, bestStreak: Math.max(updated.bestStreak, streak), completionRate: result.completionRate, consistency: result.consistency, timeAccuracy: result.timeAccuracy, habitScore: result.score }
        } catch { return updated }
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
    setHabits(prev => prev.filter(h => h.id !== id))
  }, [])

  const handleHabitDragStart = useCallback((id: string) => {
    setDraggedId(id)
  }, [])

  const handleHabitDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }, [])

  const handleHabitDrop = useCallback((targetId: string) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return }
    setHabits(prev => {
      const items = [...prev]
      const d = items.findIndex(t => t.id === draggedId)
      const r = items.findIndex(t => t.id === targetId)
      if (d === -1 || r === -1) return prev
      const [dragged] = items.splice(d, 1)
      items.splice(r, 0, dragged)
      return items
    })
    setDraggedId(null); setDragOverId(null)
  }, [draggedId])

  const handleHabitDragEnd = useCallback(() => {
    setDraggedId(null); setDragOverId(null)
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = Array.isArray(habits) ? [...habits] : []
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(h => (h.name || "").toLowerCase().includes(q) || (h.category || "").toLowerCase().includes(q) || (h.customCategory || "").toLowerCase().includes(q) || (h.color || "").toLowerCase().includes(q))
    }
    const today = getTodayISO()
    if (activeFilter === "today") {
      result = result.filter(h => isHabitScheduledOnDate(h, today))
    } else if (activeFilter === "weekly") {
      const weekStart = new Date(selectedDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekDates: string[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        weekDates.push(formatDateISO(d))
      }
      result = result.filter(h => weekDates.some(d => isHabitScheduledOnDate(h, d)))
    }
    switch (sortBy) {
      case "completed_today": result = result.filter(h => h.completions[today]?.completed); break
      case "not_completed": result = result.filter(h => !h.completions[today]?.completed); break
      case "highest_score": result.sort((a, b) => b.habitScore - a.habitScore); break
      case "lowest_score": result.sort((a, b) => a.habitScore - b.habitScore); break
      case "longest_streak": result.sort((a, b) => b.streak - a.streak); break
      case "newest": result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()); break
      case "oldest": result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()); break
      case "category": result.sort((a, b) => (a.category || "").localeCompare(b.category || "")); break
      case "category_az": result.sort((a, b) => (a.customCategory || a.category || "").localeCompare(b.customCategory || b.category || "")); break
      case "category_za": result.sort((a, b) => (b.customCategory || b.category || "").localeCompare(a.customCategory || a.category || "")); break
      case "habits_az": result.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break
      case "habits_za": result.sort((a, b) => (b.name || "").localeCompare(a.name || "")); break
      case "colour": result.sort((a, b) => (a.color || "").localeCompare(b.color || "")); break
      case "schedule_type": result.sort((a, b) => (a.schedule?.type || "anytime").localeCompare(b.schedule?.type || "anytime")); break
    }
    return result
  }, [habits, searchQuery, sortBy, activeFilter, selectedDate])

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading habits...</div></div>

  // Monthly completion for circular badge
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthDates: string[] = []
  for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
    monthDates.push(formatDateISO(d))
  }
  let monthScheduled = 0, monthCompleted = 0
  habits.forEach(h => {
    monthDates.forEach(d => {
      if (isHabitScheduledOnDate(h, d)) {
        monthScheduled++
        if (h.completions[d]?.completed) monthCompleted++
      }
    })
  })
  const monthlyPercent = monthScheduled > 0 ? Math.round((monthCompleted / monthScheduled) * 100) : 0

  // Overall Intent Score (weighted average excluding paused/archived/future habits)
  const activeHabits = habits.filter(h => !h.paused)
  const overallIntentScore = activeHabits.length > 0
    ? Math.round(activeHabits.reduce((sum, h) => sum + h.habitScore, 0) / activeHabits.length)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
            <p className="text-muted-foreground">Build your identity through consistent action</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Circular Intent Score with Label */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="relative h-12 w-12 shrink-0">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                    className="text-[#1E0E6B]/15" />
                  <circle
                    cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                    className="text-[#1E0E6B]"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 * (1 - overallIntentScore / 100)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-[#1E0E6B]">{overallIntentScore}</span>
                </div>
              </div>
              <span className="text-[9px] text-muted-foreground font-medium">Intent Score</span>
            </div>
            <Button onClick={() => { setEditingHabit(null); setIsModalOpen(true) }}
              className="glow h-9 shrink-0">
              <Plus className="mr-1 h-4 w-4" /> Add Habit
            </Button>
          </div>
        </div>
      </div>

      <HabitsErrorBoundary fallbackLabel="summary cards">
        <SummaryBar habits={habits} selectedDate={selectedDate} activeFilter={activeFilter} onFilterChange={setActiveFilter} onSortChange={setSortBy} />
      </HabitsErrorBoundary>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search habits..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-white/5 border-2 border-[#1E0E6B]/60 focus:border-[#1E0E6B] max-w-md" />
        </div>
        {activeFilter && (
          <button
            onClick={() => setActiveFilter(null)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1E0E6B] bg-[#1E0E6B]/10 rounded-lg hover:bg-[#1E0E6B]/20 transition-colors shrink-0"
          >
            <X className="h-3 w-3" />
            {activeFilter === "today" && "Today's Habits"}
            {activeFilter === "weekly" && "This Week's Habits"}
            {activeFilter === "score" && "Sorted by Score"}
            {activeFilter === "streak" && "Sorted by Streak"}
            {activeFilter === "all" && "All Habits"}
          </button>
        )}
        <div className="relative">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortMode)}
            className="appearance-none pl-8 pr-8 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer">
            <option value="all">All</option>
            <option value="completed_today">Completed Today</option>
            <option value="not_completed">Not Completed</option>
            <option value="highest_score">Highest Intent Score</option>
            <option value="lowest_score">Lowest Intent Score</option>
            <option value="longest_streak">Longest Streak</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="category">Category</option>
            <option value="category_az">Category A-Z</option>
            <option value="category_za">Category Z-A</option>
            <option value="habits_az">Habits A-Z</option>
            <option value="habits_za">Habits Z-A</option>
            <option value="colour">Colour</option>
            <option value="schedule_type">Schedule Type</option>
          </select>
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <TrackerCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          period={trackerPeriod}
          onPeriodChange={setTrackerPeriod}
        />
      </div>

      <HabitsErrorBoundary fallbackLabel="habit tracker">
        <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
          {filteredAndSorted.length > 0 ? (
            <TrackerView habits={filteredAndSorted} selectedDate={selectedDate} period={trackerPeriod} onToggleCell={toggleHabit} onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }} linkedGoals={linkedGoals} draggedId={draggedId} dragOverId={dragOverId} onDragStart={handleHabitDragStart} onDragOver={handleHabitDragOver} onDrop={handleHabitDrop} onDragEnd={handleHabitDragEnd} />
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
      </HabitsErrorBoundary>

      <HabitsErrorBoundary fallbackLabel="habit form">
        <HabitModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingHabit(null) }} onSave={saveHabit} onDelete={deleteHabit} habit={editingHabit} goals={linkedGoals} onCreateGoal={() => { window.location.href = "/goals?openAdd=true" }} />
      </HabitsErrorBoundary>
    </div>
  )
}
