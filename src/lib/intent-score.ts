"use client"

import { loadTodayIntention } from "@/lib/intention-library"

export interface IntentScoreComponent {
  id: string
  label: string
  baseWeight: number
  earned: number
  max: number
  available: boolean
  status: "complete" | "incomplete" | "unavailable"
}

export interface IntentScoreBreakdown {
  total: number
  rating: string
  ratingColor: string
  components: IntentScoreComponent[]
  redistributed: boolean
  redistributionMessage: string | null
  insight: string
}

export interface DailyIntentScore {
  date: string
  score: number
  rating: string
  breakdown: IntentScoreBreakdown
  timestamp: string
}

const BASE_WEIGHTS = {
  intention: 0.20,
  tasks: 0.25,
  habits: 0.30,
  reflection: 0.15,
  alignment: 0.10,
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

function hasReviewDueToday(): { available: boolean; completed: boolean } {
  if (typeof window === "undefined") return { available: false, completed: false }
  try {
    const stored = localStorage.getItem("intenteo-vision")
    if (!stored) return { available: false, completed: false }
    const data = JSON.parse(stored)
    const today = getTodayISO()

    // Check purpose review
    if (data.purpose?.lastReviewedAt) {
      const lastReview = data.purpose.lastReviewedAt.split("T")[0]
      if (lastReview === today) return { available: true, completed: true }
    }

    // Check goals for review due
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    if (Array.isArray(goals)) {
      const hasReviewDue = goals.some((g: { reviewFrequency?: string; lastReviewedAt?: string }) => {
        if (!g.reviewFrequency || g.reviewFrequency === "none") return false
        if (!g.lastReviewedAt) return true
        const lastReview = new Date(g.lastReviewedAt)
        const freqDays: Record<string, number> = {
          weekly: 7, biweekly: 14, monthly: 30, bimonthly: 60, quarterly: 90
        }
        const days = freqDays[g.reviewFrequency] || 30
        const nextReview = new Date(lastReview)
        nextReview.setDate(nextReview.getDate() + days)
        return nextReview <= new Date(today)
      })
      if (hasReviewDue) return { available: true, completed: false }
    }

    return { available: false, completed: false }
  } catch { return { available: false, completed: false } }
}

function getRating(score: number): { label: string; color: string } {
  if (score >= 95) return { label: "Outstanding", color: "#7C3AED" }
  if (score >= 85) return { label: "Excellent", color: "#1E0E6B" }
  if (score >= 70) return { label: "Good", color: "#22C55E" }
  if (score >= 55) return { label: "Needs Attention", color: "#F59E0B" }
  return { label: "Reset Tomorrow", color: "#6B7280" }
}

function generateInsight(
  intentionSet: boolean,
  taskPercent: number,
  habitPercent: number,
  hasReflection: boolean,
  alignmentAvailable: boolean,
  alignmentCompleted: boolean,
  total: number,
): string {
  const strongAreas: string[] = []
  const weakAreas: string[] = []

  if (intentionSet) strongAreas.push("intention")
  else weakAreas.push("intention")

  if (taskPercent >= 80) strongAreas.push("tasks")
  else if (taskPercent < 50) weakAreas.push("tasks")

  if (habitPercent >= 80) strongAreas.push("habits")
  else if (habitPercent < 50) weakAreas.push("habits")

  if (hasReflection) strongAreas.push("reflection")
  else weakAreas.push("reflection")

  if (alignmentAvailable && !alignmentCompleted) weakAreas.push("alignment review")

  if (total >= 95) {
    return "Outstanding day! You engaged fully with every intentional opportunity available to you. Keep building this momentum."
  }
  if (total >= 85) {
    if (weakAreas.length === 0) return "Excellent work! You are living with great intention today. Every action compounds."
    return `Excellent progress! Your ${strongAreas[0]} practice is strong. ${weakAreas.length > 0 ? `A quick ${weakAreas[0]} check-in would complete your intentional cycle.` : "Keep going."}`
  }
  if (total >= 70) {
    if (weakAreas.length > 0) {
      const suggestions: Record<string, string> = {
        intention: "Take a moment to set or revisit your intention for today.",
        tasks: "Spend 10 minutes on your pending tasks to build momentum.",
        habits: "Complete one more habit to strengthen your streak.",
        reflection: "Spend five minutes journaling to complete today's intentional cycle.",
        "alignment review": "Take a quick alignment review to stay on course.",
      }
      return `Good progress! ${suggestions[weakAreas[0]] || "Keep going."}`
    }
    return "Good day. You are building consistency, which is the foundation of transformation."
  }
  if (total >= 55) {
    return "You have started well. Choose one intentional action right now to build momentum. Even small steps count."
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
  const alignment = hasReviewDueToday()

  // Calculate raw scores (0-1 of base weight)
  const taskPercent = totalTasksToday > 0 ? completedTasksToday / totalTasksToday : 0
  const habitPercent = totalHabits > 0 ? completedHabits / totalHabits : 0

  // Build components
  const components: IntentScoreComponent[] = [
    {
      id: "intention",
      label: "Daily Intention",
      baseWeight: BASE_WEIGHTS.intention,
      earned: intentionSet ? 1 : 0,
      max: 1,
      available: true,
      status: intentionSet ? "complete" : "incomplete",
    },
    {
      id: "tasks",
      label: "Tasks",
      baseWeight: BASE_WEIGHTS.tasks,
      earned: totalTasksToday > 0 ? taskPercent : 0,
      max: 1,
      available: totalTasksToday > 0,
      status: totalTasksToday > 0 ? (taskPercent >= 1 ? "complete" : "incomplete") : "unavailable",
    },
    {
      id: "habits",
      label: "Habits",
      baseWeight: BASE_WEIGHTS.habits,
      earned: totalHabits > 0 ? habitPercent : 0,
      max: 1,
      available: totalHabits > 0,
      status: totalHabits > 0 ? (habitPercent >= 1 ? "complete" : "incomplete") : "unavailable",
    },
    {
      id: "reflection",
      label: "Reflection",
      baseWeight: BASE_WEIGHTS.reflection,
      earned: hasReflection ? 1 : 0,
      max: 1,
      available: true,
      status: hasReflection ? "complete" : "incomplete",
    },
    {
      id: "alignment",
      label: "Alignment Reviews",
      baseWeight: BASE_WEIGHTS.alignment,
      earned: alignment.available ? (alignment.completed ? 1 : 0) : 0,
      max: 1,
      available: alignment.available,
      status: !alignment.available ? "unavailable" : (alignment.completed ? "complete" : "incomplete"),
    },
  ]

  // Dynamic weight redistribution
  const availableComponents = components.filter(c => c.available)
  const unavailableComponents = components.filter(c => !c.available)
  let redistributed = false

  if (unavailableComponents.length > 0 && availableComponents.length > 0) {
    redistributed = true
    const totalUnavailableWeight = unavailableComponents.reduce((sum, c) => sum + c.baseWeight, 0)
    const totalAvailableBaseWeight = availableComponents.reduce((sum, c) => sum + c.baseWeight, 0)

    availableComponents.forEach(c => {
      const proportion = totalAvailableBaseWeight > 0 ? c.baseWeight / totalAvailableBaseWeight : 1 / availableComponents.length
      c.baseWeight += totalUnavailableWeight * proportion
    })
  }

  // Calculate total score
  let total = 0
  components.forEach(c => {
    if (c.available) {
      total += c.earned * c.baseWeight * 100
    }
  })
  total = Math.round(Math.min(100, Math.max(0, total)))

  // Calculate display values (out of weight * 100)
  components.forEach(c => {
    if (c.available) {
      c.earned = Math.round(c.earned * c.baseWeight * 100)
      c.max = Math.round(c.baseWeight * 100)
    } else {
      c.earned = 0
      c.max = 0
    }
  })

  const { label: rating, color: ratingColor } = getRating(total)

  let redistributionMessage: string | null = null
  if (redistributed) {
    const unavailableLabels = unavailableComponents.map(c => c.label.toLowerCase()).join(", ")
    redistributionMessage = `No ${unavailableLabels} scheduled today. ${unavailableComponents.length === 1 ? "Its" : "Their"} weighting has been automatically redistributed across today's available intentional activities.`
  }

  const insight = generateInsight(
    intentionSet,
    taskPercent * 100,
    habitPercent * 100,
    hasReflection,
    alignment.available,
    alignment.completed,
    total,
  )

  return { total, rating, ratingColor, components, redistributed, redistributionMessage, insight }
}

export function saveDailyIntentScore(score: IntentScoreBreakdown): void {
  if (typeof window === "undefined") return
  const today = getTodayISO()
  const entry: DailyIntentScore = {
    date: today,
    score: score.total,
    rating: score.rating,
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
