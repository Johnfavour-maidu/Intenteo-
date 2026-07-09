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
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${day}/${m}/${y}`
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

interface HabitCompletion { completed: boolean; time?: string; notes?: string; quality?: string }
interface HabitRecord {
  id: string; name: string; description: string; category: string; colorHex: string
  icon: string; goal: string; streak: number; habitScore: number; paused?: boolean
  completions: Record<string, HabitCompletion>
  schedule: { type: string; slot?: string; time?: string }
  createdAt: string
  recoveriesUsed?: number
  bestStreak?: number
  archived?: boolean
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
      recoveriesUsed: (h.recoveriesUsed as number) || 0,
      bestStreak: (h.bestStreak as number) || 0,
      archived: (h.archived as boolean) || false,
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
      // Count streak ending on this date
      let streakOnDate = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date(dateISO)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split("T")[0]
        if (h.completions[key]?.completed) streakOnDate++
        else break
      }
      const quality = c.quality || "good"
      const isRecovered = quality === "partial"
      const streakMilestones = [7, 14, 21, 30, 60, 90, 180, 365]
      const isMilestone = streakMilestones.includes(streakOnDate)

      entries.push({
        id: `habit-${h.id}-${dateISO}`, type: "habit_complete",
        time: c.time, timestamp: c.time ? parseTime(c.time) : 120,
        title: isRecovered ? `${h.name} (Recovered)` : isMilestone ? `${h.name} — ${streakOnDate}-day streak!` : h.name,
        description: isRecovered ? `Recovered with partial completion` : isMilestone ? `Amazing consistency streak!` : h.goal ? `Linked to: ${h.goal}` : undefined,
        icon: isRecovered ? "🔄" : isMilestone ? "🏆" : h.icon || "✓",
        color: h.colorHex, habitColor: h.colorHex,
        data: { habitId: h.id, streak: streakOnDate, score: h.habitScore, type: "habit", quality, milestone: isMilestone },
      })
    } else if (!c && h.createdAt <= dateISO && !h.paused && dateISO <= getTodayISO()) {
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

  // Recoveries
  const habitsWithRecovery = habits.filter(h => (h.recoveriesUsed || 0) > 0)
  habitsWithRecovery.forEach(h => {
    milestones.push({
      id: `recovery-${h.id}`, title: `Recovered "${h.name}"`,
      description: `Used streak recovery ${h.recoveriesUsed} time${(h.recoveriesUsed || 0) > 1 ? "s" : ""}`,
      icon: "🔄", color: "#8B5CF6", date: today,
    })
  })

  // Habits mastered (score >= 85)
  const masteredHabits = habits.filter(h => h.habitScore >= 85 && !h.paused)
  masteredHabits.forEach(h => {
    milestones.push({
      id: `mastered-${h.id}`, title: `Mastered: ${h.name}`,
      description: `Achieved Excellent health state with ${h.habitScore} Intent Score`,
      icon: "⭐", color: "#22C55E", date: today,
    })
  })

  // Best streak per habit
  habits.filter(h => (h.bestStreak || 0) >= 7).forEach(h => {
    milestones.push({
      id: `best-streak-${h.id}`, title: `${h.bestStreak}-Day Streak: ${h.name}`,
      description: `Best consistency streak for this habit`,
      icon: "🔥", color: "#F97316", date: today,
    })
  })

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

/* ─── Review Data Interface ─── */

interface ReviewData {
  date: string
  wentWell?: string; improve?: string; intentional?: number; mood?: string
  biggestWin?: string; biggestChallenge?: string; gratitude?: string; lesson?: string
  intention?: string; carryForward?: string[]
  productivity?: number; tasksCompleted?: number
  completedHabits?: number; totalHabits?: number
  createdAt?: string
}

function loadReviews(): ReviewData[] {
  try {
    const raw = localStorage.getItem("intenteo-reviews")
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

/* ─── Period Aggregation ─── */

interface PeriodChapter {
  label: string
  dateRange: string
  reviewCount: number
  avgIntentScore: number
  avgProductivity: number
  storySummary: string
  habitsImproved: string[]
  goalsProgressed: string[]
  moodTrend: string
  majorWins: string[]
  challenges: string[]
  lessonsLearned: string[]
  teoInsight: string
}

function aggregatePeriod(reviews: ReviewData[], startISO: string, endISO: string): PeriodChapter {
  const filtered = reviews.filter(r => r.date >= startISO && r.date <= endISO)
  const count = filtered.length

  const avgIntent = count > 0 ? Math.round(filtered.reduce((s, r) => s + (r.intentional || 7), 0) / count) : 0
  const avgProd = count > 0 ? Math.round(filtered.reduce((s, r) => s + (r.productivity || 0), 0) / count) : 0

  const moodCounts: Record<string, number> = {}
  filtered.forEach(r => { if (r.mood) moodCounts[r.mood] = (moodCounts[r.mood] || 0) + 1 })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "neutral"

  const wins = filtered.map(r => r.biggestWin).filter((w): w is string => !!w && w.trim().length > 0)
  const challenges = filtered.map(r => r.biggestChallenge).filter((c): c is string => !!c && c.trim().length > 0)
  const lessons = filtered.map(r => r.lesson).filter((l): l is string => !!l && l.trim().length > 0)

  const storyParts: string[] = []
  if (count === 0) storyParts.push("No reviews recorded for this period.")
  else if (count === 1) storyParts.push(`You completed 1 daily review.`)
  else storyParts.push(`You completed ${count} daily reviews.`)
  if (avgIntent >= 8) storyParts.push("Your intentionality was very high.")
  else if (avgIntent >= 5) storyParts.push("You maintained moderate intentionality.")
  else if (count > 0) storyParts.push("Intentionality could use more focus.")
  if (wins.length > 0) storyParts.push(`You celebrated ${wins.length} win${wins.length > 1 ? "s" : ""}.`)
  if (challenges.length > 0) storyParts.push(`You faced ${challenges.length} challenge${challenges.length > 1 ? "s" : ""}.`)

  const teoParts: string[] = []
  if (count === 0) teoParts.push("Start recording daily reviews to unlock insights.")
  else {
    if (avgIntent >= 8) teoParts.push("Great intentionality this period. Keep it up!")
    if (avgProd >= 80) teoParts.push("Your productivity scores are excellent.")
    if (challenges.length > wins.length) teoParts.push("More challenges than wins — consider focusing on small victories.")
    if (teoParts.length === 0) teoParts.push("Consistency is the key to growth. Keep showing up.")
  }

  return {
    label: "",
    dateRange: `${startISO} to ${endISO}`,
    reviewCount: count,
    avgIntentScore: avgIntent,
    avgProductivity: avgProd,
    storySummary: storyParts.join(" "),
    habitsImproved: [],
    goalsProgressed: [],
    moodTrend: topMood,
    majorWins: wins.slice(0, 5),
    challenges: challenges.slice(0, 5),
    lessonsLearned: lessons.slice(0, 5),
    teoInsight: teoParts[0] || "Every day is a step forward.",
  }
}

/* ─── Main Component ─── */

type JourneyTab = "day" | "week" | "month" | "quarter" | "year" | "life"

export function MyJourneyPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [habits, setHabits] = useState<HabitRecord[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [goals, setGoals] = useState<GoalRecord[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<JourneyTab>("day")
  const [searchQuery] = useState("")

  useEffect(() => {
    setReviews(loadReviews())
    setHabits(loadHabits())
    setTasks(loadTasks())
    setJournal(loadJournal())
    setGoals(loadGoals())
  }, [])

  useEffect(() => {
    const refresh = () => {
      setReviews(loadReviews())
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

  const overallIntentScore = useMemo(() => {
    if (reviews.length === 0) {
      const active = habits.filter(h => !h.paused)
      return active.length > 0 ? Math.round(active.reduce((s, h) => s + h.habitScore, 0) / active.length) : 0
    }
    return Math.round(reviews.reduce((s, r) => s + (r.intentional || 7), 0) / reviews.length * 10)
  }, [reviews, habits])

  /* ─── Period Chapters ─── */

  const dayChapter = useMemo((): PeriodChapter => {
    const dayReviews = reviews.filter(r => r.date === selectedISO)
    if (dayReviews.length === 0) return { label: "Day", dateRange: selectedISO, reviewCount: 0, avgIntentScore: 0, avgProductivity: 0, storySummary: "No review recorded for this day.", habitsImproved: [], goalsProgressed: [], moodTrend: "", majorWins: [], challenges: [], lessonsLearned: [], teoInsight: "Complete a daily review to see your story." }
    const r = dayReviews[0]
    return {
      label: "Day", dateRange: selectedISO, reviewCount: 1,
      avgIntentScore: r.intentional || 0, avgProductivity: r.productivity || 0,
      storySummary: r.wentWell ? `Today you reflected: "${r.wentWell}"` : "A day of intentional living.",
      habitsImproved: [], goalsProgressed: [],
      moodTrend: r.mood || "",
      majorWins: r.biggestWin ? [r.biggestWin] : [],
      challenges: r.biggestChallenge ? [r.biggestChallenge] : [],
      lessonsLearned: r.lesson ? [r.lesson] : [],
      teoInsight: r.gratitude ? `You practiced gratitude: "${r.gratitude}"` : "Keep reflecting each day.",
    }
  }, [reviews, selectedISO])

  const weekChapter = useMemo((): PeriodChapter => {
    const d = new Date(selectedDate)
    const start = new Date(d); start.setDate(d.getDate() - d.getDay())
    const end = new Date(start); end.setDate(start.getDate() + 6)
    const chapter = aggregatePeriod(reviews, formatISO(start), formatISO(end))
    chapter.label = "Week"
    return chapter
  }, [reviews, selectedDate])

  const monthChapter = useMemo((): PeriodChapter => {
    const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    const chapter = aggregatePeriod(reviews, formatISO(start), formatISO(end))
    chapter.label = "Month"
    return chapter
  }, [reviews, selectedDate])

  const quarterChapter = useMemo((): PeriodChapter => {
    const q = Math.floor(selectedDate.getMonth() / 3)
    const start = new Date(selectedDate.getFullYear(), q * 3, 1)
    const end = new Date(selectedDate.getFullYear(), q * 3 + 3, 0)
    const chapter = aggregatePeriod(reviews, formatISO(start), formatISO(end))
    chapter.label = "Quarter"
    return chapter
  }, [reviews, selectedDate])

  const yearChapter = useMemo((): PeriodChapter => {
    const start = new Date(selectedDate.getFullYear(), 0, 1)
    const end = new Date(selectedDate.getFullYear(), 11, 31)
    const chapter = aggregatePeriod(reviews, formatISO(start), formatISO(end))
    chapter.label = "Year"
    return chapter
  }, [reviews, selectedDate])

  const lifeChapter = useMemo((): PeriodChapter => {
    if (reviews.length === 0) return { label: "Life", dateRange: "All time", reviewCount: 0, avgIntentScore: 0, avgProductivity: 0, storySummary: "Start your journey by completing daily reviews.", habitsImproved: [], goalsProgressed: [], moodTrend: "", majorWins: [], challenges: [], lessonsLearned: [], teoInsight: "Your story begins with one intentional step." }
    const sorted = [...reviews].sort((a, b) => a.date.localeCompare(b.date))
    const first = sorted[0].date
    const last = sorted[sorted.length - 1].date
    const chapter = aggregatePeriod(reviews, first, last)
    chapter.label = "Life"
    chapter.storySummary = `Your journey spans ${reviews.length} reviews from ${first} to ${last}. ${chapter.storySummary}`
    return chapter
  }, [reviews])

  const activeChapter = useMemo(() => {
    switch (activeTab) {
      case "day": return dayChapter
      case "week": return weekChapter
      case "month": return monthChapter
      case "quarter": return quarterChapter
      case "year": return yearChapter
      case "life": return lifeChapter
    }
  }, [activeTab, dayChapter, weekChapter, monthChapter, quarterChapter, yearChapter, lifeChapter])

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
    reviews.forEach(r => addDate(r.date))
    Object.keys(years).forEach(y => {
      Object.keys(years[y]).forEach(m => { years[y][m].sort() })
    })
    return Object.entries(years).sort(([a], [b]) => Number(b) - Number(a))
  }, [habits, tasks, journal, goals, reviews])

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

  const navigateTo = (path: string) => { window.location.href = path }

  const tabs: { id: JourneyTab; label: string }[] = [
    { id: "day", label: "Day" },
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "quarter", label: "Quarter" },
    { id: "year", label: "Year" },
    { id: "life", label: "Life" },
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Journey</h1>
        <p className="text-muted-foreground">Your life, one intentional day at a time.</p>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-1 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 w-fit overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
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

      {/* ── Chapter Content ── */}
      <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">{activeChapter.label} Review</h3>
          <p className="text-xs text-muted-foreground">{activeChapter.dateRange}</p>
        </div>
        <div className="p-4 space-y-4">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-muted/40 border text-center">
              <p className="text-2xl font-bold text-[#1E0E6B]">{activeChapter.reviewCount}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reviews</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border text-center">
              <p className="text-2xl font-bold text-[#1E0E6B]">{activeChapter.avgIntentScore}/10</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Intent</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border text-center">
              <p className="text-2xl font-bold text-[#1E0E6B]">{activeChapter.avgProductivity}%</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Productivity</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border text-center">
              <p className="text-2xl font-bold capitalize">{activeChapter.moodTrend || "—"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mood Trend</p>
            </div>
          </div>

          {/* Story Summary */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Story Summary</span>
            </div>
            <p className="text-sm">{activeChapter.storySummary}</p>
          </div>

          {/* Major Wins */}
          {activeChapter.majorWins.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/40 border">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Major Wins</span>
              </div>
              <div className="space-y-1.5">
                {activeChapter.majorWins.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges */}
          {activeChapter.challenges.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/40 border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Challenges</span>
              </div>
              <div className="space-y-1.5">
                {activeChapter.challenges.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-orange-500 shrink-0 mt-0.5">!</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Learned */}
          {activeChapter.lessonsLearned.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/40 border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Lessons Learned</span>
              </div>
              <div className="space-y-1.5">
                {activeChapter.lessonsLearned.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 shrink-0 mt-0.5">*</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Téo Insight */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-purple-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Téo Insight</span>
            </div>
            <p className="text-sm">{activeChapter.teoInsight}</p>
          </div>

          {activeChapter.reviewCount === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MapIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No reviews for this period yet.</p>
              <Button onClick={() => navigateTo("/tasks")} variant="outline" size="sm" className="mt-3">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Complete a Review
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Life Timeline ── */}
      <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Life Timeline</h3>
        </div>
        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
          {lifeTimelineYears.map(([year, months]) => (
            <div key={year}>
              <div className="flex items-center gap-2 text-sm font-bold text-[#1E0E6B]">
                <ChevronDown className="h-4 w-4" />
                {year}
                <span className="text-xs font-normal text-muted-foreground">({Object.keys(months).length} months)</span>
              </div>
              <div className="ml-4 mt-2 space-y-2 border-l-2 border-[#1E0E6B]/10 pl-4">
                {Object.entries(months).sort(([a], [b]) => Number(b) - Number(a)).map(([month, days]) => (
                  <div key={`${year}-${month}`}>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ChevronDown className="h-3 w-3" />
                      {monthNames[Number(month) - 1]}
                      <span className="text-xs font-normal text-muted-foreground">({days.length} days)</span>
                    </div>
                    <div className="ml-4 mt-1 space-y-1">
                      {days.map(dayISO => {
                        const dayReviews = reviews.filter(r => r.date === dayISO)
                        const hasReview = dayReviews.length > 0
                        const dayHabits = habits.filter(h => h.completions[dayISO]?.completed).length
                        const dayTasks = tasks.filter(t => t.dailyCompletions?.[dayISO] || (t.date === dayISO && t.completed)).length
                        return (
                          <div key={dayISO} className="flex items-center gap-2 p-2 rounded-lg text-xs">
                            <span className="font-medium w-8">{new Date(dayISO + "T12:00:00").getDate()}</span>
                            <div className="flex items-center gap-1.5">
                              {hasReview && <span className="flex items-center gap-0.5 text-[10px]"><BookOpen className="h-3 w-3 text-purple-500" />review</span>}
                              {dayHabits > 0 && <span className="flex items-center gap-0.5 text-[10px]"><CheckCircle2 className="h-3 w-3 text-green-500" />{dayHabits}</span>}
                              {dayTasks > 0 && <span className="flex items-center gap-0.5 text-[10px]"><CheckSquare className="h-3 w-3 text-blue-500" />{dayTasks}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {lifeTimelineYears.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">Start using Intenteo to build your life timeline.</p>
          )}
        </div>
      </div>

      {/* ── Personal Statistics ── */}
      <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">Personal Statistics</h3>
          <p className="text-xs text-muted-foreground">Your lifetime metrics and progress</p>
        </div>
        <div className="p-4 space-y-6">

          {/* Overview */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Overview</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "✦", label: "Intent Score", value: String(overallIntentScore) },
                { icon: "🔥", label: "Current Streak", value: `${Math.max(...habits.map(h => h.streak), 0)} Days` },
                { icon: "🏆", label: "Longest Streak", value: `${Math.max(...habits.map(h => h.bestStreak || h.streak), 0)} Days` },
                { icon: "📅", label: "Days Active", value: String(new Set([...habits.flatMap(h => Object.keys(h.completions)), ...tasks.map(t => t.date), ...journal.map(e => e.dateISO), ...reviews.map(r => r.date)].filter(Boolean)).size) },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl border text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-lg font-bold mt-1">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Productivity</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "✅", label: "Tasks Completed", value: String(tasks.filter(t => t.completed || (t.dailyCompletions && Object.values(t.dailyCompletions).some(Boolean))).length) },
                { icon: "💪", label: "Habits Completed", value: String(habits.reduce((sum, h) => sum + Object.values(h.completions).filter(c => c.completed).length, 0)) },
                { icon: "🎯", label: "Goals Completed", value: String(goals.filter(g => g.status === "completed" || g.progress >= 100).length) },
                { icon: "📖", label: "Journal Entries", value: String(journal.length) },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl border text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-lg font-bold mt-1">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Growth */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Growth</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "📊", label: "Monthly Progress", value: reviews.length > 0 ? `${Math.round(reviews.reduce((s, r) => s + (r.productivity || 0), 0) / reviews.length)}%` : "0%" },
                { icon: "📈", label: "Habit Consistency", value: habits.length > 0 ? `${Math.round(habits.filter(h => h.habitScore >= 70).length / habits.length * 100)}%` : "0%" },
                { icon: "🎯", label: "Goal Completion", value: goals.length > 0 ? `${Math.round(goals.filter(g => g.progress >= 100).length / goals.length * 100)}%` : "0%" },
                { icon: "📝", label: "Reviews Completed", value: String(reviews.length) },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-xl border text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-lg font-bold mt-1">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Achievements</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {detectMilestones(habits, tasks, journal, goals).slice(0, 6).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border">
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-[10px] text-muted-foreground">{m.description}</p>
                  </div>
                </div>
              ))}
              {detectMilestones(habits, tasks, journal, goals).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-3 text-center py-4">Keep going to unlock achievements!</p>
              )}
            </div>
          </div>

          {/* Insights */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-3">Insights</p>
            <div className="space-y-2">
              {generateInsights(habits, tasks, journal, goals).map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border">
                  <span className="text-lg">{insight.icon}</span>
                  <p className="text-sm">{insight.text}</p>
                </div>
              ))}
              {generateRecommendations(habits, tasks, journal, goals).slice(0, 2).map((rec, i) => (
                <div key={`rec-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-dashed">
                  <span className="text-lg">{rec.icon}</span>
                  <p className="text-sm">{rec.text}</p>
                </div>
              ))}
              {generateInsights(habits, tasks, journal, goals).length === 0 && generateRecommendations(habits, tasks, journal, goals).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Use Intenteo more to unlock personalized insights.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
