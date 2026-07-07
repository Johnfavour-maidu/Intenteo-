"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, X,
  CheckCircle2, Circle, Flame, Target, BookOpen, CheckSquare,
  TrendingUp, Sun, Moon, Sunset, Clock, Award, Zap,
  Sparkles, Star, Heart, MessageCircle, Camera, Mic,
  BarChart3, Calendar, Edit3, Link2, Smile, Quote,
  AlertTriangle, ArrowUp, ArrowDown,
} from "lucide-react"
import { Map as MapIcon } from "lucide-react"

/* ─── Date Helpers (en-GB consistent) ─── */

const getTodayISO = () => {
  try { return new Date().toISOString().split("T")[0] } catch { return "" }
}

const formatISO = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const formatDateLong = (d: Date): string => {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

const formatMonthYear = (d: Date): string => {
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
}

const formatDayName = (d: Date): string => {
  return d.toLocaleDateString("en-GB", { weekday: "short" })
}

const formatTime = (time?: string): string => {
  if (!time) return ""
  try {
    const [h, m] = time.split(":").map(Number)
    const ampm = h >= 12 ? "PM" : "AM"
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`
  } catch { return time }
}

const parseTime = (t?: string): number => {
  if (!t) return 0
  try { const [h, m] = t.split(":").map(Number); return h * 60 + (m || 0) } catch { return 0 }
}

const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

/* ─── Data Interfaces (mirrored from source modules) ─── */

interface HabitCompletion { completed: boolean; time?: string; notes?: string }
interface HabitRecord {
  id: string; name: string; description: string; category: string; colorHex: string
  icon: string; goal: string; streak: number; habitScore: number; paused?: boolean
  completions: Record<string, HabitCompletion>
  schedule: { type: string; slot?: string; time?: string }
  createdAt: string
}
interface TaskRecord {
  id: string; title: string; priority: string; notes: string; deadline: string
  date: string; completed: boolean; dailyCompletions?: Record<string, boolean>
  subtasks: { id: string; title: string; completed: boolean }[]
  createdAt: string
}
interface JournalEntry {
  id: string; title: string; content: string; type: string; mood?: string
  dateISO: string; time: string; tags: string[]; images?: string[]
  audioRecordings?: { id: string; name: string; url: string; duration: number }[]
}
interface GoalRecord {
  id: string; title: string; description: string; category: string
  progress: number; colorHex: string; icon: string; milestones: { id: string; title: string; completed: boolean }[]
  linkedHabits: string[]; status?: string; createdAt: string; updatedAt: string
}

/* ─── Timeline Entry Types ─── */

type EntryType = "habit_complete" | "habit_missed" | "task_complete" | "task_overdue"
  | "journal" | "mood" | "goal_progress" | "milestone" | "reflection"

interface TimelineEntry {
  id: string; type: EntryType; time?: string; timestamp?: number
  title: string; description?: string; icon?: string; color?: string; habitColor?: string
  data: Record<string, unknown>
}

/* ─── Data Loading ─── */

function loadHabits(): HabitRecord[] {
  try {
    const raw = localStorage.getItem("intenteo-habits")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((h: Record<string, unknown>) => ({
      id: (h.id as string) || "", name: (h.name as string) || "Habit",
      description: (h.description as string) || "", category: (h.category as string) || "General",
      colorHex: (h.colorHex as string) || "#8B5CF6", icon: (h.icon as string) || "",
      goal: (h.goal as string) || "", streak: (h.streak as number) || 0,
      habitScore: (h.habitScore as number) || 0, paused: (h.paused as boolean) || false,
      completions: (h.completions && typeof h.completions === "object")
        ? h.completions as Record<string, HabitCompletion> : {},
      schedule: (h.schedule && typeof h.schedule === "object")
        ? h.schedule as { type: string; slot?: string; time?: string } : { type: "anytime" },
      createdAt: (h.createdAt as string) || "",
    }))
  } catch { return [] }
}

function loadTasks(): TaskRecord[] {
  try {
    const raw = localStorage.getItem("intenteo-tasks")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((t: Record<string, unknown>) => ({
      id: (t.id as string) || "", title: (t.title as string) || "Task",
      priority: (t.priority as string) || "", notes: (t.notes as string) || "",
      deadline: (t.deadline as string) || "", date: (t.date as string) || "",
      completed: (t.completed as boolean) || false,
      dailyCompletions: (t.dailyCompletions && typeof t.dailyCompletions === "object")
        ? t.dailyCompletions as Record<string, boolean> : undefined,
      subtasks: Array.isArray(t.subtasks) ? t.subtasks as { id: string; title: string; completed: boolean }[] : [],
      createdAt: (t.createdAt as string) || "",
    }))
  } catch { return [] }
}

function loadJournal(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("intenteo-journal-entries")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((e: Record<string, unknown>) => ({
      id: (e.id as string) || "", title: (e.title as string) || "",
      content: (e.content as string) || "", type: (e.type as string) || "daily",
      mood: (e.mood as string) || undefined,
      dateISO: (e.dateISO as string) || (e.date as string) || "",
      time: (e.time as string) || "",
      tags: Array.isArray(e.tags) ? e.tags as string[] : [],
      images: Array.isArray(e.images) ? e.images as string[] : undefined,
      audioRecordings: Array.isArray(e.audioRecordings)
        ? e.audioRecordings as { id: string; name: string; url: string; duration: number }[] : undefined,
    }))
  } catch { return [] }
}

function loadGoals(): GoalRecord[] {
  try {
    const raw = localStorage.getItem("intenteo-goals")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((g: Record<string, unknown>) => ({
      id: (g.id as string) || "", title: (g.title as string) || "Goal",
      description: (g.description as string) || "", category: (g.category as string) || "General",
      progress: (g.progress as number) || 0,
      colorHex: (g.colorHex as string) || "#8B5CF6", icon: (g.icon as string) || "",
      milestones: Array.isArray(g.milestones)
        ? g.milestones as { id: string; title: string; completed: boolean }[] : [],
      linkedHabits: Array.isArray(g.linkedHabits) ? g.linkedHabits as string[] : [],
      status: (g.status as string) || undefined,
      createdAt: (g.createdAt as string) || "", updatedAt: (g.updatedAt as string) || "",
    }))
  } catch { return [] }
}

/* ─── Activity Color for Calendar ─── */

function getDayActivityColor(dateISO: string, habits: HabitRecord[], tasks: TaskRecord[], journal: JournalEntry[], goals: GoalRecord[]): { color: string; level: string } {
  const habitCompletions = habits.filter(h => {
    const c = h.completions[dateISO]
    return c && c.completed
  }).length
  const taskCompletions = tasks.filter(t => {
    if (t.dailyCompletions) return t.dailyCompletions[dateISO]
    return t.date === dateISO && t.completed
  }).length
  const hasJournal = journal.some(e => e.dateISO === dateISO)
  const goalUpdates = goals.filter(g => g.updatedAt && g.updatedAt.startsWith(dateISO))
  const goalMilestone = goalUpdates.some(g => {
    const recentComplete = g.milestones.filter(m => m.completed).length
    return recentComplete > 0
  })
  const total = habitCompletions + taskCompletions

  if (hasJournal) return { color: "#8B5CF6", level: "journal" }
  if (goalMilestone) return { color: "#3B82F6", level: "milestone" }
  if (total >= 5) return { color: "#22C55E", level: "excellent" }
  if (total >= 2) return { color: "#F97316", level: "average" }
  if (total >= 1) return { color: "#9CA3AF", level: "light" }
  return { color: "transparent", level: "none" }
}

/* ─── Build Daily Timeline ─── */

function buildTimeline(dateISO: string, habits: HabitRecord[], tasks: TaskRecord[], journal: JournalEntry[], goals: GoalRecord[]): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  // Habits
  habits.forEach(h => {
    const c = h.completions[dateISO]
    if (c && c.completed) {
      entries.push({
        id: `habit-${h.id}-${dateISO}`, type: "habit_complete",
        time: c.time, timestamp: c.time ? parseTime(c.time) : 120,
        title: h.name, description: h.goal ? `Linked to: ${h.goal}` : undefined,
        icon: h.icon || "✓", color: h.colorHex, habitColor: h.colorHex,
        data: { habitId: h.id, streak: h.streak, score: h.habitScore, type: "habit" },
      })
    } else if (!c && h.createdAt <= dateISO && !h.paused) {
      entries.push({
        id: `habit-missed-${h.id}-${dateISO}`, type: "habit_missed",
        time: undefined, timestamp: 1440,
        title: h.name, description: "Not completed", icon: "○",
        color: "#EF4444", habitColor: h.colorHex,
        data: { habitId: h.id, type: "habit" },
      })
    }
  })

  // Tasks
  tasks.forEach(t => {
    const isCompleted = t.dailyCompletions ? t.dailyCompletions[dateISO] : (t.date === dateISO && t.completed)
    if (isCompleted) {
      entries.push({
        id: `task-${t.id}-${dateISO}`, type: "task_complete",
        time: undefined, timestamp: 480,
        title: t.title, description: t.priority ? `${t.priority} priority` : undefined,
        icon: "📋", color: "#22C55E",
        data: { taskId: t.id, priority: t.priority, type: "task" },
      })
    }
    if (t.deadline === dateISO && !t.completed && !t.dailyCompletions?.[dateISO]) {
      entries.push({
        id: `task-overdue-${t.id}-${dateISO}`, type: "task_overdue",
        time: undefined, timestamp: 1320,
        title: t.title, description: "Overdue", icon: "⚠",
        color: "#EF4444",
        data: { taskId: t.id, type: "task" },
      })
    }
  })

  // Journal
  journal.filter(e => e.dateISO === dateISO).forEach(e => {
    entries.push({
      id: `journal-${e.id}`, type: "journal",
      time: e.time, timestamp: e.time ? parseTime(e.time) : 1080,
      title: e.title || "Journal Entry",
      description: e.content ? e.content.slice(0, 120) + (e.content.length > 120 ? "..." : "") : undefined,
      icon: e.type === "reflection" ? "💭" : e.type === "gratitude" ? "🙏" : "📝",
      color: "#8B5CF6",
      data: { entryId: e.id, type: e.type, mood: e.mood, tags: e.tags, hasImages: !!(e.images?.length), hasAudio: !!(e.audioRecordings?.length), sourceType: "journal" },
    })
    // Mood from journal
    if (e.mood) {
      entries.push({
        id: `mood-${e.id}`, type: "mood",
        time: e.time, timestamp: e.time ? parseTime(e.time) : 60,
        title: e.mood, icon: e.mood,
        color: "#F59E0B",
        data: { entryId: e.id, sourceType: "journal" },
      })
    }
  })

  // Goals
  goals.forEach(g => {
    if (g.updatedAt && g.updatedAt.startsWith(dateISO)) {
      entries.push({
        id: `goal-${g.id}-${dateISO}`, type: "goal_progress",
        time: undefined, timestamp: 600,
        title: g.title, description: `Progress: ${g.progress}%`,
        icon: g.icon || "🎯", color: g.colorHex,
        data: { goalId: g.id, progress: g.progress, type: "goal" },
      })
    }
  })

  entries.sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0))
  return entries
}

/* ─── Weekly/Monthly Stats ─── */

function computePeriodStats(startDate: Date, endDate: Date, habits: HabitRecord[], tasks: TaskRecord[], journal: JournalEntry[], goals: GoalRecord[]) {
  const dayCount = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const habitCompletions: { total: number; habitCounts: Record<string, number>; dayCounts: Record<string, number> } = { total: 0, habitCounts: {}, dayCounts: {} }
  const taskCompletions: { total: number } = { total: 0 }
  let journalDays = 0
  const moodScores: number[] = []
  let goalProgressChanges = 0
  const dailyScores: Record<string, number> = {}

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const iso = formatISO(d)
    if (iso > getTodayISO()) break

    let dayScore = 0
    habits.forEach(h => {
      if (h.completions[iso]?.completed) {
        habitCompletions.total++
        habitCompletions.habitCounts[h.id] = (habitCompletions.habitCounts[h.id] || 0) + 1
        dayScore += 2
      }
    })
    tasks.forEach(t => {
      const done = t.dailyCompletions ? t.dailyCompletions[iso] : (t.date === iso && t.completed)
      if (done) { taskCompletions.total++; dayScore += 1 }
    })
    if (journal.some(e => e.dateISO === iso)) { journalDays++; dayScore += 3 }
    goals.forEach(g => {
      if (g.updatedAt && g.updatedAt.startsWith(iso)) goalProgressChanges++
    })
    dailyScores[iso] = dayScore
  }

  const bestDay = Object.entries(dailyScores).sort((a, b) => b[1] - a[1])[0]
  const mostConsistentDay = Object.entries(dailyScores).filter(([, v]) => v > 0).length

  const allMoods = journal.filter(e => {
    const d = new Date(e.dateISO)
    return d >= startDate && d <= endDate && e.mood
  }).map(e => e.mood || "")
  const moodCounts: Record<string, number> = {}
  allMoods.forEach(m => { moodCounts[m] = (moodCounts[m] || 0) + 1 })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

  const avgIntentScore = habits.filter(h => !h.paused).length > 0
    ? Math.round(habits.filter(h => !h.paused).reduce((s, h) => s + h.habitScore, 0) / habits.filter(h => !h.paused).length)
    : 0

  return {
    dayCount, habitCompletions: habitCompletions.total, taskCompletions: taskCompletions.total,
    journalDays, goalProgressChanges, avgIntentScore, topMood,
    bestDay: bestDay?.[0] || "", bestDayScore: bestDay?.[1] || 0,
    mostConsistentDay,
    longestStreak: Math.max(...habits.map(h => h.streak), 0),
  }
}

/* ─── Insights Engine ─── */

interface Insight {
  type: "insight" | "recommendation"
  text: string
  icon: string
  color: string
}

function generateInsights(habits: HabitRecord[], tasks: TaskRecord[], journal: JournalEntry[], goals: GoalRecord[]): Insight[] {
  const insights: Insight[] = []

  // Check journal -> productivity correlation
  const journalDays = new Set(journal.map(e => e.dateISO))
  if (journalDays.size >= 5) {
    const journalProductivity = Array.from(journalDays).slice(-14).filter(day => {
      const dHabits = habits.filter(h => h.completions[day]?.completed).length
      const dTasks = tasks.filter(t => t.dailyCompletions?.[day] || t.date === day && t.completed).length
      return dHabits + dTasks > 3
    }).length
    const nonJournalProductivity = habits.length > 0 ? "daily activity" : "task completion"
    if (journalDays.size >= 7) {
      insights.push({
        type: "insight", icon: "📊",
        color: "#8B5CF6",
        text: `You are more productive on days you journal — your completion rates are higher on those days.`,
      })
    }
  }

  // Keystone habit detection
  const habitFreq: Record<string, number> = {}
  habits.forEach(h => {
    const count = Object.values(h.completions).filter(c => c.completed).length
    habitFreq[h.name] = count
  })
  const topHabit = Object.entries(habitFreq).sort((a, b) => b[1] - a[1])[0]
  if (topHabit && topHabit[1] >= 10) {
    insights.push({
      type: "insight", icon: "💪",
      color: "#F97316",
      text: `${topHabit[0]} is your strongest keystone habit — completed ${topHabit[1]} times.`,
    })
  }

  // Day-of-week patterns
  const dayMisses: Record<string, number> = {}
  habits.forEach(h => {
    Object.entries(h.completions).forEach(([date, c]) => {
      if (!c.completed) {
        try {
          const dayName = new Date(date).toLocaleDateString("en-GB", { weekday: "long" })
          dayMisses[dayName] = (dayMisses[dayName] || 0) + 1
        } catch {}
      }
    })
  })
  const worstDay = Object.entries(dayMisses).sort((a, b) => b[1] - a[1])[0]
  if (worstDay && worstDay[1] >= 3) {
    insights.push({
      type: "insight", icon: "📅",
      color: "#EF4444",
      text: `You tend to miss habits most often on ${worstDay[0]}s (${worstDay[1]} misses).`,
    })
  }

  // Consistency trend
  const highConsistencyHabits = habits.filter(h => h.habitScore >= 80)
  if (highConsistencyHabits.length > 0 && habits.length >= 3) {
    const pct = Math.round((highConsistencyHabits.length / habits.length) * 100)
    if (pct >= 50) {
      insights.push({
        type: "insight", icon: "📈",
        color: "#22C55E",
        text: `Your consistency is strong — ${pct}% of habits score 80+ in Intent Score.`,
      })
    }
  }

  // Streak insight
  const longestStreak = Math.max(...habits.map(h => h.streak), 0)
  if (longestStreak >= 14) {
    const habitName = habits.find(h => h.streak === longestStreak)?.name || ""
    insights.push({
      type: "insight", icon: "🔥",
      color: "#F97316",
      text: `Your longest streak is ${longestStreak} days${habitName ? ` (${habitName})` : ""}. Consistency compounds!`,
    })
  }

  return insights
}

function generateRecommendations(habits: HabitRecord[], tasks: TaskRecord[], journal: JournalEntry[], goals: GoalRecord[]): Insight[] {
  const recs: Insight[] = []

  // Low score habits need attention
  const lowScoreHabits = habits.filter(h => h.habitScore < 50 && !h.paused).slice(0, 3)
  lowScoreHabits.forEach(h => {
    recs.push({
      type: "recommendation", icon: "🎯",
      color: "#F97316",
      text: `${h.name} has a low Intent Score (${h.habitScore}). Try completing it earlier in the day.`,
    })
  })

  // Habits close to streak milestone
  habits.forEach(h => {
    if (h.streak > 0 && h.streak % 10 !== 0 && (h.streak + 1) % 10 === 0) {
      recs.push({
        type: "recommendation", icon: "🔥",
        color: "#EF4444",
        text: `${h.name} has a ${h.streak}-day streak. Complete it tomorrow to reach ${h.streak + 1} days!`,
      })
    }
  })

  // Goal progress
  const activeGoals = goals.filter(g => g.status !== "completed" && g.status !== "archived")
  activeGoals.forEach(g => {
    if (g.progress >= 80 && g.progress < 100) {
      recs.push({
        type: "recommendation", icon: "🎯",
        color: "#22C55E",
        text: `You are close to completing "${g.title}" (${g.progress}%). Stay consistent!`,
      })
    }
  })

  // Journal consistency
  const recentDays = 7
  const recentJournalCount = journal.filter(e => {
    const d = new Date(e.dateISO)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - recentDays)
    return d >= cutoff
  }).length
  if (recentJournalCount < 3) {
    recs.push({
      type: "recommendation", icon: "📝",
      color: "#8B5CF6",
      text: `You've journaled ${recentJournalCount}/${recentDays} recent days. Try to journal daily for better self-awareness.`,
    })
  }

  return recs
}

/* ─── Milestones Detection ─── */

interface Milestone {
  id: string; title: string; description: string; icon: string; color: string; date: string
}

function detectMilestones(habits: HabitRecord[], tasks: TaskRecord[], journal: JournalEntry[], goals: GoalRecord[]): Milestone[] {
  const milestones: Milestone[] = []
  const today = getTodayISO()

  const longestStreak = Math.max(...habits.map(h => h.streak), 0)
  if (longestStreak >= 21) {
    const habit = habits.find(h => h.streak === longestStreak)
    milestones.push({
      id: "streak-21", title: `${longestStreak}-Day Streak!`,
      description: habit ? `Amazing consistency with "${habit.name}"` : `Amazing habit consistency`,
      icon: "🔥", color: "#F97316", date: today,
    })
  }
  if (longestStreak >= 365) {
    milestones.push({
      id: "streak-365", title: "One Year Streak!",
      description: `An entire year of consistent habit completion`,
      icon: "🏆", color: "#F59E0B", date: today,
    })
  }

  const completedGoals = goals.filter(g => g.status === "completed" || g.progress >= 100)
  if (completedGoals.length >= 1) {
    milestones.push({
      id: "first-goal", title: "Goal Completed!",
      description: `"${completedGoals[0].title}" — amazing achievement`,
      icon: "🎯", color: "#22C55E", date: completedGoals[0].updatedAt || today,
    })
  }

  const journalCount = journal.length
  if (journalCount >= 100) {
    milestones.push({
      id: "journal-100", title: "100 Journal Entries",
      description: "A remarkable commitment to self-reflection",
      icon: "📝", color: "#8B5CF6", date: today,
    })
  }

  const taskCount = tasks.filter(t => t.completed || (t.dailyCompletions && Object.values(t.dailyCompletions).some(Boolean))).length
  if (taskCount >= 1000) {
    milestones.push({
      id: "tasks-1000", title: "1000 Tasks Completed",
      description: "You've accomplished a thousand things!",
      icon: "✓", color: "#3B82F6", date: today,
    })
  }

  const highScore = habits.some(h => h.habitScore >= 90)
  if (highScore) {
    const habit = habits.find(h => h.habitScore >= 90)
    milestones.push({
      id: "score-90", title: "First 90+ Intent Score",
      description: habit ? `"${habit.name}" is thriving` : `A habit is thriving`,
      icon: "⭐", color: "#F59E0B", date: today,
    })
  }

  return milestones
}

/* ─── Sub-Components ─── */

function CalendarGrid({ selectedDate, onSelect, habits, tasks, journal, goals }: {
  selectedDate: Date; onSelect: (d: Date) => void
  habits: HabitRecord[]; tasks: TaskRecord[]; journal: JournalEntry[]; goals: GoalRecord[]
}) {
  const [monthOffset, setMonthOffset] = useState(0)
  const today = getTodayISO()

  const baseDate = useMemo(() => {
    const d = new Date(selectedDate)
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [selectedDate, monthOffset])

  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = new Date(year, month, 1).getDay()

  useEffect(() => { setMonthOffset(0) }, [selectedDate])

  const handlePrev = () => setMonthOffset(o => o - 1)
  const handleNext = () => setMonthOffset(o => o + 1)

  const cells: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrev} className="p-1 hover:bg-white/30 rounded-lg transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold">{formatMonthYear(baseDate)}</h3>
        <button onClick={handleNext} className="p-1 hover:bg-white/30 rounded-lg transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const date = new Date(year, month, day)
          const iso = formatISO(date)
          const isToday = iso === today
          const isSelected = !monthOffset && day === selectedDate.getDate()
          const activity = getDayActivityColor(iso, habits, tasks, journal, goals)
          return (
            <button
              key={i} onClick={() => { setMonthOffset(0); onSelect(date) }}
              className={`relative flex flex-col items-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected ? "bg-[#1E0E6B] text-white shadow-sm" : isToday ? "bg-[#1E0E6B]/10 text-[#1E0E6B]" : "hover:bg-white/40 text-foreground"
              }`}
            >
              <span>{day}</span>
              {activity.color !== "transparent" && (
                <span className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ backgroundColor: activity.color }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

type JourneyTab = "day" | "week" | "month"

export function MyJourneyPage() {
  const [habits, setHabits] = useState<HabitRecord[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [goals, setGoals] = useState<GoalRecord[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<JourneyTab>("day")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [expandedYear, setExpandedYear] = useState<string | null>(null)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  useEffect(() => {
    setHabits(loadHabits())
    setTasks(loadTasks())
    setJournal(loadJournal())
    setGoals(loadGoals())
  }, [])

  // Refresh data every time the page gets focus
  useEffect(() => {
    const refresh = () => {
      setHabits(loadHabits())
      setTasks(loadTasks())
      setJournal(loadJournal())
      setGoals(loadGoals())
    }
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [])

  const todayISO = getTodayISO()
  const selectedISO = formatISO(selectedDate)

  const timelineEntries = useMemo(() => buildTimeline(selectedISO, habits, tasks, journal, goals), [selectedISO, habits, tasks, journal, goals])

  const weekStart = useMemo(() => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - d.getDay())
    return d
  }, [selectedDate])
  const weekEnd = useMemo(() => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 6)
    return d
  }, [weekStart])
  const monthStart = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), [selectedDate])
  const monthEnd = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), [selectedDate])

  const weekStats = useMemo(() => computePeriodStats(weekStart, weekEnd, habits, tasks, journal, goals), [weekStart, weekEnd, habits, tasks, journal, goals])
  const monthStats = useMemo(() => computePeriodStats(monthStart, monthEnd, habits, tasks, journal, goals), [monthStart, monthEnd, habits, tasks, journal, goals])

  const insights = useMemo(() => generateInsights(habits, tasks, journal, goals), [habits, tasks, journal, goals])
  const recommendations = useMemo(() => generateRecommendations(habits, tasks, journal, goals), [habits, tasks, journal, goals])
  const milestones = useMemo(() => detectMilestones(habits, tasks, journal, goals), [habits, tasks, journal, goals])

  const overallIntentScore = useMemo(() => {
    const active = habits.filter(h => !h.paused)
    return active.length > 0 ? Math.round(active.reduce((s, h) => s + h.habitScore, 0) / active.length) : 0
  }, [habits])

  // Separate timeline by time of day
  const morningEntries = timelineEntries.filter(e => (e.timestamp ?? 0) < 720)
  const afternoonEntries = timelineEntries.filter(e => (e.timestamp ?? 0) >= 720 && (e.timestamp ?? 0) < 1080)
  const eveningEntries = timelineEntries.filter(e => (e.timestamp ?? 0) >= 1080)

  // Filters
  const filterOptions = [
    { id: "all", label: "All Activity" },
    { id: "habit", label: "Habits" },
    { id: "task", label: "Tasks" },
    { id: "journal", label: "Journal" },
    { id: "goal", label: "Goals" },
    { id: "milestone", label: "Milestones" },
  ]

  const filteredTimeline = useMemo(() => {
    let entries = timelineEntries
    if (activeFilter !== "all") {
      entries = entries.filter(e => {
        const sourceType = (e.data.sourceType as string) || (e.data.type as string) || ""
        return sourceType === activeFilter || e.type.startsWith(activeFilter)
      })
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      entries = entries.filter(e => e.title.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q))
    }
    return entries
  }, [timelineEntries, activeFilter, searchQuery])

  // Filtered full data for search
  const filteredHabits = useMemo(() => {
    if (!searchQuery) return habits
    const q = searchQuery.toLowerCase()
    return habits.filter(h => h.name.toLowerCase().includes(q))
  }, [habits, searchQuery])

  const navigateTo = (path: string) => { window.location.href = path }

  const renderEntry = (entry: TimelineEntry) => {
    const isHabit = entry.type === "habit_complete" || entry.type === "habit_missed"
    const isTask = entry.type === "task_complete" || entry.type === "task_overdue"
    const isJournal = entry.type === "journal"
    const isMood = entry.type === "mood"
    const isGoal = entry.type === "goal_progress"
    const streak = entry.data.streak as number | undefined
    const score = entry.data.score as number | undefined
    const hasImages = entry.data.hasImages as boolean | undefined
    const hasAudio = entry.data.hasAudio as boolean | undefined

    return (
      <div
        key={entry.id}
        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/30 transition-colors cursor-pointer group"
        onClick={() => {
          if (isHabit) navigateTo("/habits")
          else if (isTask) navigateTo("/tasks")
          else if (isJournal || isMood) navigateTo("/journal")
          else if (isGoal) navigateTo("/goals")
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm"
          style={{ backgroundColor: entry.color ? `${entry.color}20` : "rgba(30,14,107,0.08)" }}>
          {entry.icon && /^[^\u0000-\u007F]/.test(entry.icon) ? <span>{entry.icon}</span> : (
            entry.type === "habit_complete" ? <CheckCircle2 className="h-4 w-4" style={{ color: entry.color }} /> :
            entry.type === "habit_missed" ? <Circle className="h-4 w-4 text-red-400" /> :
            entry.type === "task_complete" ? <CheckSquare className="h-4 w-4 text-green-500" /> :
            entry.type === "task_overdue" ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
            entry.type === "journal" ? <BookOpen className="h-4 w-4 text-purple-500" /> :
            entry.type === "goal_progress" ? <Target className="h-4 w-4" style={{ color: entry.color }} /> :
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color || "#8B5CF6" }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{entry.title}</span>
            {entry.time && <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(entry.time)}</span>}
          </div>
          {entry.description && <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>}
          {entry.type === "habit_complete" && streak && (
            <div className="flex items-center gap-1 mt-0.5">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-[10px] text-orange-500 font-medium">{streak} day streak</span>
            </div>
          )}
          {entry.type === "habit_complete" && score && (
            <span className="text-[10px] font-medium ml-2" style={{ color: score >= 80 ? "#22C55E" : score >= 50 ? "#F97316" : "#EF4444" }}>
              Score: {score}%
            </span>
          )}
          {entry.type === "journal" && (hasImages || hasAudio) && (
            <div className="flex items-center gap-1.5 mt-1">
              {hasImages && <Camera className="h-3 w-3 text-muted-foreground" />}
              {hasAudio && <Mic className="h-3 w-3 text-muted-foreground" />}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderTimelineSection = (label: string, icon: React.ReactNode, entries: TimelineEntry[]) => {
    if (entries.length === 0) return null
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h4 className="text-sm font-semibold text-foreground">{label}</h4>
        </div>
        <div className="space-y-0.5">
          {entries.map(renderEntry)}
        </div>
      </div>
    )
  }

  const renderEmptyDay = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MapIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
      <h3 className="text-lg font-medium text-foreground">Nothing recorded today</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">
        Take one intentional action to begin your journey.
      </p>
      <div className="flex gap-3 mt-6">
        <Button onClick={() => navigateTo("/habits")} variant="outline" size="sm">
          <CheckCircle2 className="h-4 w-4 mr-1" /> Complete a Habit
        </Button>
        <Button onClick={() => navigateTo("/journal")} variant="outline" size="sm">
          <BookOpen className="h-4 w-4 mr-1" /> Write in Journal
        </Button>
        <Button onClick={() => navigateTo("/tasks")} variant="outline" size="sm">
          <CheckSquare className="h-4 w-4 mr-1" /> Do a Task
        </Button>
      </div>
    </div>
  )

  /* ─── Life Timeline ─── */
  const lifeTimelineYears = useMemo(() => {
    const years: Record<string, Record<string, string[]>> = {}
    const addDate = (dateISO: string) => {
      if (!dateISO) return
      const [y, m] = dateISO.split("-")
      if (!years[y]) years[y] = {}
      if (!years[y][m]) years[y][m] = []
      if (!years[y][m].includes(dateISO)) years[y][m].push(dateISO)
    }
    habits.forEach(h => Object.keys(h.completions).forEach(addDate))
    tasks.forEach(t => { if (t.date) addDate(t.date); if (t.deadline) addDate(t.deadline) })
    journal.forEach(e => addDate(e.dateISO))
    goals.forEach(g => { if (g.updatedAt) addDate(g.updatedAt) })
    Object.keys(years).forEach(y => {
      Object.keys(years[y]).forEach(m => { years[y][m].sort() })
    })
    return Object.entries(years).sort(([a], [b]) => Number(b) - Number(a))
  }, [habits, tasks, journal, goals])

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Journey</h1>
        <p className="text-muted-foreground">Your life, one intentional day at a time.</p>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search My Journey..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-white/5 border-2 border-[#1E0E6B]/60 focus:border-[#1E0E6B] max-w-md"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterOptions.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeFilter === f.id ? "bg-[#1E0E6B] text-white" : "bg-white/50 text-muted-foreground hover:bg-white/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Calendar ── */}
      <CalendarGrid
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        habits={habits}
        tasks={tasks}
        journal={journal}
        goals={goals}
      />

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 w-fit">
        {([
          { id: "day" as JourneyTab, label: "Day" },
          { id: "week" as JourneyTab, label: "Week" },
          { id: "month" as JourneyTab, label: "Month" },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id ? "bg-[#1E0E6B] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Intent Score Banner ── */}
      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
        <div>
          <p className="text-sm text-muted-foreground">Overall Intent Score</p>
          <p className="text-2xl font-bold text-[#1E0E6B]">{overallIntentScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span></p>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className={`h-5 w-5 ${overallIntentScore >= 70 ? "text-green-500" : overallIntentScore >= 40 ? "text-orange-500" : "text-red-500"}`} />
        </div>
      </div>

      {/* ── Day View ── */}
      {activeTab === "day" && (
        <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold">{formatDateLong(selectedDate)}</h3>
          </div>
          <div className="p-4">
            {filteredTimeline.length === 0 && !searchQuery ? renderEmptyDay() : (
              <>
                {searchQuery ? (
                  <div className="space-y-0.5">
                    {filteredTimeline.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">No results found for "{searchQuery}"</p>
                    ) : filteredTimeline.map(renderEntry)}
                  </div>
                ) : (
                  <>
                    {renderTimelineSection("Morning", <Sun className="h-4 w-4 text-orange-500" />, morningEntries)}
                    {renderTimelineSection("Afternoon", <Sunset className="h-4 w-4 text-amber-500" />, afternoonEntries)}
                    {renderTimelineSection("Evening", <Moon className="h-4 w-4 text-indigo-500" />, eveningEntries)}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Week View ── */}
      {activeTab === "week" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Habits Completed</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{weekStats.habitCompletions}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Tasks Done</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{weekStats.taskCompletions}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Journal Days</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{weekStats.journalDays}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Avg Intent Score</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{weekStats.avgIntentScore}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Best Day</p>
              <p className="text-lg font-bold text-[#1E0E6B]">{weekStats.bestDay ? new Date(weekStats.bestDay + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }) : "—"}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Longest Streak</p>
              <p className="text-lg font-bold text-[#1E0E6B]">{weekStats.longestStreak} <span className="text-xs font-normal text-muted-foreground">days</span></p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Goal Progress</p>
              <p className="text-lg font-bold text-[#1E0E6B]">{weekStats.goalProgressChanges} <span className="text-xs font-normal text-muted-foreground">updates</span></p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Best Mood</p>
              <p className="text-lg font-bold">{weekStats.topMood || "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Month View ── */}
      {activeTab === "month" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Habits Completed</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{monthStats.habitCompletions}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Tasks Finished</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{monthStats.taskCompletions}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Journal Days</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{monthStats.journalDays}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Avg Intent Score</p>
              <p className="text-2xl font-bold text-[#1E0E6B]">{monthStats.avgIntentScore}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Longest Streak</p>
              <p className="text-lg font-bold text-[#1E0E6B]">{monthStats.longestStreak} <span className="text-xs font-normal text-muted-foreground">days</span></p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Goal Updates</p>
              <p className="text-lg font-bold text-[#1E0E6B]">{monthStats.goalProgressChanges}</p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Active Days</p>
              <p className="text-lg font-bold text-[#1E0E6B]">{monthStats.mostConsistentDay} <span className="text-xs font-normal text-muted-foreground">/ {monthStats.dayCount}</span></p>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
              <p className="text-xs text-muted-foreground mb-1">Avg Mood</p>
              <p className="text-lg font-bold">{monthStats.topMood || "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/30">
                <span className="text-lg shrink-0">{insight.icon}</span>
                <p className="text-sm text-foreground">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && (
        <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/30">
                <span className="text-lg shrink-0">{rec.icon}</span>
                <p className="text-sm text-foreground">{rec.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Milestones ── */}
      {milestones.length > 0 && (
        <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-semibold">Milestones</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {milestones.map(m => (
              <div key={m.id} className="flex items-start gap-3 p-4 rounded-xl bg-white/40 border border-white/20 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 text-lg"
                  style={{ backgroundColor: `${m.color}20` }}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Life Timeline ── */}
      <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Life Timeline</h3>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {lifeTimelineYears.map(([year, months]) => (
            <div key={year}>
              <button
                onClick={() => setExpandedYear(expandedYear === year ? null : year)}
                className="flex items-center gap-2 text-sm font-bold text-[#1E0E6B] hover:opacity-70 transition-opacity"
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${expandedYear === year ? "rotate-0" : "-rotate-90"}`} />
                {year}
                <span className="text-xs font-normal text-muted-foreground">({Object.keys(months).length} months)</span>
              </button>
              {expandedYear === year && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-[#1E0E6B]/10 pl-4">
                  {Object.entries(months).sort(([a], [b]) => Number(b) - Number(a)).map(([month, days]) => {
                    const monthKey = `${year}-${month}`
                    return (
                      <div key={monthKey}>
                        <button
                          onClick={() => setExpandedMonth(expandedMonth === monthKey ? null : monthKey)}
                          className="flex items-center gap-2 text-sm font-medium text-foreground hover:opacity-70 transition-opacity"
                        >
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedMonth === monthKey ? "rotate-0" : "-rotate-90"}`} />
                          {monthNames[Number(month) - 1]}
                          <span className="text-xs font-normal text-muted-foreground">({days.length} days)</span>
                        </button>
                        {expandedMonth === monthKey && (
                          <div className="ml-4 mt-1 space-y-1">
                            {days.map(dayISO => {
                              const dayHabits = habits.filter(h => h.completions[dayISO]?.completed).length
                              const dayTasks = tasks.filter(t => t.dailyCompletions?.[dayISO] || (t.date === dayISO && t.completed)).length
                              const dayJournal = journal.filter(e => e.dateISO === dayISO).length
                              const dateObj = new Date(dayISO + "T12:00:00")
                              return (
                                <button
                                  key={dayISO}
                                  onClick={() => { setExpandedDay(expandedDay === dayISO ? null : dayISO); setSelectedDate(dateObj); setActiveTab("day") }}
                                  className={`w-full text-left flex items-center gap-2 p-2 rounded-lg text-xs hover:bg-white/30 transition-colors ${
                                    dayISO === selectedISO ? "bg-[#1E0E6B]/10" : ""
                                  }`}
                                >
                                  <ChevronDown className={`h-3 w-3 transition-transform shrink-0 ${expandedDay === dayISO ? "rotate-0" : "-rotate-90"}`} />
                                  <span className="font-medium w-8">{new Date(dayISO + "T12:00:00").getDate()}</span>
                                  <div className="flex items-center gap-1.5">
                                    {dayHabits > 0 && <span className="flex items-center gap-0.5 text-[10px]"><CheckCircle2 className="h-3 w-3 text-green-500" />{dayHabits}</span>}
                                    {dayTasks > 0 && <span className="flex items-center gap-0.5 text-[10px]"><CheckSquare className="h-3 w-3 text-blue-500" />{dayTasks}</span>}
                                    {dayJournal > 0 && <span className="flex items-center gap-0.5 text-[10px]"><BookOpen className="h-3 w-3 text-purple-500" />{dayJournal}</span>}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {lifeTimelineYears.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Start using Intenteo to build your life timeline.</p>
          )}
        </div>
      </div>
    </div>
  )
}
