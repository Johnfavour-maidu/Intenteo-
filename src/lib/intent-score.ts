"use client"

import { loadTodayIntention } from "@/lib/intention-library"

export interface IntentScoreComponent {
  id: string
  label: string
  earnedPercent: number
  maxPercent: number
  complete: boolean
}

export interface IntentScoreBreakdown {
  total: number
  components: IntentScoreComponent[]
  insight: string
}

export interface DailyIntentScore {
  date: string
  score: number
  breakdown: IntentScoreBreakdown
  timestamp: string
}

const WEIGHTS = {
  tasks: 0.35,
  habits: 0.35,
  intention: 0.15,
  reflection: 0.15,
}

function getTodayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function hasJournalEntryToday(): boolean {
  if (typeof window === "undefined") return false
  try {
    const entries = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]")
    if (!Array.isArray(entries)) return false
    const today = getTodayISO()
    return entries.some((e: { dateISO?: string; createdAt?: string }) =>
      e.dateISO === today || (e.createdAt && e.createdAt.startsWith(today))
    )
  } catch { return false }
}

function generateInsight(
  intentionSet: boolean,
  taskPercent: number,
  habitPercent: number,
  hasReflection: boolean,
  total: number,
): string {
  const missing: string[] = []
  if (!intentionSet) missing.push("intention")
  if (taskPercent < 50) missing.push("tasks")
  if (habitPercent < 50) missing.push("habits")
  if (!hasReflection) missing.push("reflection")

  const done: string[] = []
  if (intentionSet) done.push("intention")
  if (taskPercent >= 80) done.push("tasks")
  if (habitPercent >= 80) done.push("habits")
  if (hasReflection) done.push("reflection")

  if (total >= 95) {
    return "Outstanding day! You engaged fully with every intentional opportunity available to you. Keep building this momentum."
  }
  if (total >= 80) {
    if (missing.length === 0) return "Excellent work! You are living with great intention today. Every action compounds."
    const next = missing[0]
    const prompts: Record<string, string> = {
      intention: "Take a moment to set or revisit your intention for today.",
      tasks: "Spend 10 minutes on your pending tasks to build momentum.",
      habits: "Complete one more habit to strengthen your streak.",
      reflection: "Spend five minutes journaling to complete today's intentional cycle.",
    }
    return `Great progress! Your ${done[0] || "efforts"} are strong. ${prompts[next] || "Keep going."}`
  }
  if (total >= 50) {
    if (missing.length > 0) {
      const prompts: Record<string, string> = {
        intention: "Set your intention for today to anchor your focus.",
        tasks: "Complete one task to build momentum.",
        habits: "Check off one habit to strengthen your streak.",
        reflection: "Write a quick reflection to close your intentional cycle.",
      }
      return `You have started well. ${prompts[missing[0]] || "Choose one action to build momentum."}`
    }
    return "You are building consistency. Keep going."
  }
  return "Every day is a fresh start. Pick one thing: set your intention, complete a habit, or write a quick reflection. Start small."
}

export function calculateIntentScore(): IntentScoreBreakdown {
  const intention = loadTodayIntention()
  const intentionSet = !!intention?.intention?.text

  const today = getTodayISO()
  let totalTasksToday = 0
  let completedTasksToday = 0
  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
    if (Array.isArray(tasks)) {
      const todayTasks = tasks.filter((t: { date?: string }) => t.date === today)
      totalTasksToday = todayTasks.length
      completedTasksToday = todayTasks.filter((t: { completed?: boolean }) => t.completed).length
    }
  } catch {}

  let totalHabits = 0
  let completedHabits = 0
  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
    if (Array.isArray(habits)) {
      const active = habits.filter((h: { archived?: boolean; paused?: boolean }) => !h.archived && !h.paused)
      totalHabits = active.length
      completedHabits = active.filter((h: { completedToday?: boolean }) => h.completedToday).length
    }
  } catch {}

  const hasReflection = hasJournalEntryToday()

  const taskRatio = totalTasksToday > 0 ? completedTasksToday / totalTasksToday : 0
  const habitRatio = totalHabits > 0 ? completedHabits / totalHabits : 0

  const taskEarned = taskRatio * WEIGHTS.tasks * 100
  const habitEarned = habitRatio * WEIGHTS.habits * 100
  const intentionEarned = intentionSet ? WEIGHTS.intention * 100 : 0
  const reflectionEarned = hasReflection ? WEIGHTS.reflection * 100 : 0

  const total = Math.round(taskEarned + habitEarned + intentionEarned + reflectionEarned)

  const components: IntentScoreComponent[] = [
    {
      id: "tasks",
      label: "Tasks",
      earnedPercent: Math.round(taskEarned),
      maxPercent: Math.round(WEIGHTS.tasks * 100),
      complete: totalTasksToday > 0 && taskRatio >= 1,
    },
    {
      id: "habits",
      label: "Habits",
      earnedPercent: Math.round(habitEarned),
      maxPercent: Math.round(WEIGHTS.habits * 100),
      complete: totalHabits > 0 && habitRatio >= 1,
    },
    {
      id: "intention",
      label: "Daily Intention",
      earnedPercent: Math.round(intentionEarned),
      maxPercent: Math.round(WEIGHTS.intention * 100),
      complete: intentionSet,
    },
    {
      id: "reflection",
      label: "Reflection",
      earnedPercent: Math.round(reflectionEarned),
      maxPercent: Math.round(WEIGHTS.reflection * 100),
      complete: hasReflection,
    },
  ]

  const insight = generateInsight(intentionSet, taskRatio * 100, habitRatio * 100, hasReflection, total)

  return { total, components, insight }
}

export function saveDailyIntentScore(score: IntentScoreBreakdown): void {
  if (typeof window === "undefined") return
  const today = getTodayISO()
  const entry: DailyIntentScore = {
    date: today,
    score: score.total,
    breakdown: score,
    timestamp: new Date().toISOString(),
  }

  try {
    const stored = JSON.parse(localStorage.getItem("intenteo-intent-scores") || "[]")
    const existing = stored.findIndex((s: DailyIntentScore) => s.date === today)
    if (existing >= 0) {
      stored[existing] = entry
    } else {
      stored.push(entry)
    }
    localStorage.setItem("intenteo-intent-scores", JSON.stringify(stored.slice(-365)))
  } catch {}
}

export function getDailyIntentScores(): DailyIntentScore[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem("intenteo-intent-scores") || "[]")
  } catch { return [] }
}

export function getWeeklyAverage(): number {
  const scores = getDailyIntentScores()
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStr = weekAgo.toISOString().split("T")[0]

  const weekScores = scores.filter(s => s.date >= weekStr)
  if (weekScores.length === 0) return 0
  return Math.round(weekScores.reduce((sum, s) => sum + s.score, 0) / weekScores.length)
}

export function getMonthlyAverage(): number {
  const scores = getDailyIntentScores()
  const now = new Date()
  const monthAgo = new Date(now)
  monthAgo.setDate(monthAgo.getDate() - 30)
  const monthStr = monthAgo.toISOString().split("T")[0]

  const monthScores = scores.filter(s => s.date >= monthStr)
  if (monthScores.length === 0) return 0
  return Math.round(monthScores.reduce((sum, s) => sum + s.score, 0) / monthScores.length)
}

export function getLongestHighIntentStreak(): number {
  const scores = getDailyIntentScores()
  if (scores.length === 0) return 0

  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date))
  let maxStreak = 0
  let currentStreak = 0

  for (const score of sorted) {
    if (score.score >= 70) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  }
  return maxStreak
}
