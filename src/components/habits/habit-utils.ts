"use client"

import type { Habit, HabitSchedule } from "./habit-types"

export type CompletionQuality = "perfect" | "good" | "partial" | "missed"
export type LifecycleStage = "planning" | "active" | "building" | "automatic" | "mastered" | "paused" | "archived"
export type HealthState = "excellent" | "on_track" | "needs_attention" | "at_risk"
export type TrendDirection = "up" | "down" | "stable"

export const QUALITY_WEIGHTS: Record<CompletionQuality, number> = {
  perfect: 1,
  good: 0.8,
  partial: 0.5,
  missed: 0,
}

export const HEALTH_THRESHOLDS = {
  excellent: 85,
  on_track: 70,
  needs_attention: 50,
  at_risk: 0,
}

export function getHealthState(habitScore: number, consistency: number): HealthState {
  const combined = habitScore * 0.7 + consistency * 0.3
  if (combined >= 85) return "excellent"
  if (combined >= 70) return "on_track"
  if (combined >= 50) return "needs_attention"
  return "at_risk"
}

export const HEALTH_CONFIG: Record<HealthState, { label: string; color: string; bg: string; icon: string }> = {
  excellent: { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50", icon: "🟢" },
  on_track: { label: "On Track", color: "text-blue-600", bg: "bg-blue-50", icon: "🔵" },
  needs_attention: { label: "Needs Attention", color: "text-amber-600", bg: "bg-amber-50", icon: "🟡" },
  at_risk: { label: "At Risk", color: "text-red-600", bg: "bg-red-50", icon: "🔴" },
}

export function calcLifecycleStage(habit: Habit): LifecycleStage {
  if (habit.archived) return "archived"
  if (habit.paused) return "paused"
  const created = new Date(habit.createdAt)
  const daysSinceCreation = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
  const completedCount = Object.keys(habit.completions || {}).filter(k => habit.completions[k]?.completed).length
  if (completedCount === 0) return "planning"
  if (daysSinceCreation < 7) return "active"
  if (daysSinceCreation < 30) return "building"
  if (daysSinceCreation < 90) return "automatic"
  return "mastered"
}

export const LIFECYCLE_CONFIG: Record<LifecycleStage, { label: string; color: string; bg: string }> = {
  planning: { label: "Planning", color: "text-gray-500", bg: "bg-gray-100" },
  active: { label: "Active", color: "text-emerald-600", bg: "bg-emerald-50" },
  building: { label: "Building", color: "text-blue-600", bg: "bg-blue-50" },
  automatic: { label: "Automatic", color: "text-[#1E0E6B]", bg: "bg-purple-50" },
  mastered: { label: "Mastered", color: "text-amber-600", bg: "bg-amber-50" },
  paused: { label: "Paused", color: "text-orange-500", bg: "bg-orange-50" },
  archived: { label: "Archived", color: "text-gray-400", bg: "bg-gray-50" },
}

export function calcTrend(habit: Habit): TrendDirection {
  const completions = habit.completions || {}
  const today = new Date()
  const getCount = (daysAgo: number, window: number): number => {
    let count = 0
    for (let i = daysAgo; i < daysAgo + window; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      if (completions[key]?.completed) count++
    }
    return count / window
  }
  const recent7 = getCount(0, 7)
  const prior30 = getCount(30, 30)
  if (recent7 > prior30 * 1.1) return "up"
  if (recent7 < prior30 * 0.9) return "down"
  return "stable"
}

export const TREND_CONFIG: Record<TrendDirection, { label: string; icon: string; color: string }> = {
  up: { label: "Improving", icon: "↑", color: "text-emerald-500" },
  down: { label: "Declining", icon: "↓", color: "text-red-500" },
  stable: { label: "Stable", icon: "→", color: "text-muted-foreground" },
}

export function calcWeightedCompletionRate(
  completions: Record<string, { completed: boolean; time?: string; notes?: string; quality?: CompletionQuality }>,
  createdAt: string | undefined | null,
): number {
  if (!completions) return 0
  const created = new Date(createdAt || Date.now())
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)))
  let weightedSum = 0
  Object.keys(completions).forEach(k => {
    const c = completions[k]
    if (c?.completed) {
      const q = c.quality || "good"
      weightedSum += QUALITY_WEIGHTS[q]
    }
  })
  return Math.min(100, Math.round((weightedSum / totalDays) * 100))
}

export function calcWeightedConsistency(
  completions: Record<string, { completed: boolean; time?: string; notes?: string; quality?: CompletionQuality }>,
  createdAt: string | undefined | null,
): number {
  return calcWeightedCompletionRate(completions, createdAt)
}

export function calcIntentScoreWithQuality(
  completions: Record<string, { completed: boolean; time?: string; notes?: string; quality?: CompletionQuality }>,
  schedule: HabitSchedule | undefined | null,
  createdAt: string | undefined | null,
  bestStreak: number,
  recoveryPenalty: number = 0,
): { score: number; completionRate: number; consistency: number; timeAccuracy: number | null } {
  try {
    const safeSchedule = schedule || { type: "anytime" } as HabitSchedule
    const safeCompletions = (completions && typeof completions === "object") ? completions : {}
    const safeCreatedAt = createdAt || new Date().toISOString().split("T")[0]
    const rawCompletionRate = calcWeightedCompletionRate(safeCompletions, safeCreatedAt)
    const consistency = calcWeightedConsistency(safeCompletions, safeCreatedAt)
    const streak = calcStreak(safeCompletions)
    const today = new Date().toISOString().split("T")[0]
    const todayCompletion = today ? safeCompletions[today] : undefined
    const timeAccuracy = todayCompletion?.completed ? calcTimeAccuracy(todayCompletion.time, safeSchedule) : null

    if (safeSchedule.type === "anytime") {
      const rawCompletion = rawCompletionRate * 0.5
      const streakComponent = Math.min(streak, 30) / 30 * 100 * 0.25
      const consistencyComponent = consistency * 0.20
      const raw = rawCompletion + streakComponent + consistencyComponent - recoveryPenalty
      return { score: Math.round(Math.min(100, Math.max(0, raw))), completionRate: rawCompletionRate, consistency, timeAccuracy: null }
    }
    const ta = timeAccuracy ?? 0
    const rawCompletion = rawCompletionRate * 0.4
    const streakComponent = Math.min(streak, 30) / 30 * 100 * 0.25
    const consistencyComponent = consistency * 0.20
    const taComponent = ta * 0.10
    const diffComponent = 5 * 0.05
    const raw = rawCompletion + streakComponent + consistencyComponent + taComponent + diffComponent - recoveryPenalty
    return { score: Math.round(Math.min(100, Math.max(0, raw))), completionRate: rawCompletionRate, consistency, timeAccuracy: ta }
  } catch {
    return { score: 0, completionRate: 0, consistency: 0, timeAccuracy: null }
  }
}

function calcStreak(completions: Record<string, { completed: boolean }> | undefined | null): number {
  if (!completions) return 0
  let streak = 0
  try {
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const todayCompleted = todayStr && completions[todayStr]?.completed
    for (let i = 1; i < 365; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      if (key && completions[key]?.completed) streak++
      else break
    }
    if (todayCompleted) streak++
  } catch { return 0 }
  return streak
}

function calcTimeAccuracy(completionTime: string | undefined, schedule: any): number | null {
  if (!schedule || schedule.type === "anytime") return null
  if (!completionTime) return 0
  const targetTime = schedule.time
  if (!targetTime) return null
  try {
    const diff = Math.abs(
      (() => { const [h, m] = completionTime.split(":").map(Number); return h * 60 + m })() -
      (() => { const [h, m] = targetTime.split(":").map(Number); return h * 60 + m })()
    )
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

export function generateSmartRecommendation(habit: Habit): string {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTotalMin = currentHour * 60 + currentMinute
  const today = now.toISOString().split("T")[0]
  const completedToday = habit.completions?.[today]?.completed
  const schedule = habit.schedule
  const streak = habit.streak || 0

  if (completedToday) {
    if (streak > 0 && streak % 7 === 0) {
      return `✓ Completed! You're on a ${streak}-day streak — keep it going!`
    }
    return `✓ Completed today. ${streak > 0 ? `${streak}-day streak active.` : ""}`
  }

  if (schedule?.type === "fixed" && schedule.time) {
    const [h, m] = schedule.time.split(":").map(Number)
    const scheduledMin = h * 60 + m
    if (currentTotalMin > scheduledMin + 60) {
      return "⚠ Complete now to avoid losing your streak"
    }
    if (currentTotalMin < scheduledMin - 60) {
      return `⏰ Due at ${h % 12 || 12}:${String(m).padStart(2, "0")}${h >= 12 ? "PM" : "AM"}`
    }
    if (currentTotalMin >= scheduledMin - 15 && currentTotalMin <= scheduledMin + 15) {
      return "⏰ Complete now — it's your scheduled time"
    }
  }

  if (schedule?.type === "preferred" && schedule.slot) {
    const slotHours: Record<string, [number, number]> = {
      morning: [5, 12], afternoon: [12, 17], evening: [17, 21], night: [21, 5],
    }
    const [start, end] = slotHours[schedule.slot] || [0, 24]
    if (currentHour >= start && currentHour < end) {
      return `⏰ Complete during ${schedule.slot} (${start}${start < 12 ? "AM" : "PM"}-${end % 12 || 12}${end >= 12 ? "PM" : "AM"})`
    }
  }

  if (streak > 0 && streak < 14) {
    const toMilestone = 14 - streak
    return `🔥 You're ${toMilestone} day${toMilestone > 1 ? "s" : ""} away from a ${streak < 7 ? "7" : "14"}-day streak`
  }
  if (streak === 0) {
    return "✨ Complete today to start a new streak"
  }

  const t = (schedule?.type === "fixed" || schedule?.type === "preferred") ? schedule.time : undefined
  return "✓ Complete " + (t ? `before ${t}` : "today")
}

export function generateCoaching(habit: Habit): string[] {
  const tips: string[] = []
  const completions = habit.completions || {}
  const consistency = habit.consistency || 0
  const streak = habit.streak || 0
  const health = getHealthState(habit.habitScore, consistency)

  if (health === "excellent") tips.push("Excellent consistency. Keep up the great work!")
  if (health === "on_track" || health === "needs_attention") {
    if (consistency < 70) tips.push("Try to complete this habit at the same time each day to build consistency.")
    if (streak > 0 && streak < 7) tips.push(`You're on a ${streak}-day streak. Focus on not breaking it.`)
  }
  if (health === "at_risk") {
    tips.push("Don't skip two consecutive days. Recovery is easier when you stay active.")
    tips.push("Consider reducing the difficulty or duration to make it easier to complete.")
  }

  const dayMissed: Record<string, number> = {}
  Object.keys(completions).forEach(k => {
    if (!completions[k]?.completed) {
      const d = new Date(k)
      const dayName = d.toLocaleDateString("en-GB", { weekday: "long" })
      dayMissed[dayName] = (dayMissed[dayName] || 0) + 1
    }
  })
  const mostMissed = Object.entries(dayMissed).sort((a, b) => b[1] - a[1])[0]
  if (mostMissed && mostMissed[1] >= 3) {
    tips.push(`Most missed on ${mostMissed[0]}s — plan ahead for that day.`)
  }

  const schedule = habit.schedule
  if (schedule?.type === "preferred" && schedule.slot) {
    tips.push(`Try pairing ${habit.name} with another ${schedule.slot} habit.`)
  }

  if (tips.length === 0) {
    tips.push("You're doing well. Stay consistent!")
  }
  return tips
}

export function getScoreBreakdown(habit: Habit): { label: string; points: number; max: number; raw: string; color: string }[] {
  const completionRate = habit.completionRate || 0
  const streak = habit.streak || 0
  const consistency = habit.consistency || 0
  const timeAccuracy = habit.timeAccuracy ?? null
  const difficulty = habit.difficulty || "medium"
  const flexSchedule = habit.schedule?.type === "anytime"

  const completionPoints = Math.round(completionRate * 0.4)
  const streakPoints = Math.round(Math.min(streak, 30) / 30 * 100 * 0.25)
  const consistencyPoints = Math.round(consistency * 0.2)
  const timeAccuracyPoints = timeAccuracy !== null ? Math.round(timeAccuracy * 0.1) : 0
  const difficultyPoints = difficulty === "easy" ? 0 : difficulty === "medium" ? 5 : 10

  const items = [
    { label: "Completion", points: completionPoints, max: 40, raw: `${completionPoints} / 40`, color: "bg-emerald-500" },
    { label: "Streak", points: streakPoints, max: 25, raw: `${streakPoints} / 25`, color: "bg-orange-500" },
    { label: "Consistency", points: consistencyPoints, max: 20, raw: `${consistencyPoints} / 20`, color: "bg-blue-500" },
  ]
  if (!flexSchedule && timeAccuracy !== null) {
    items.push({ label: "Time Accuracy", points: timeAccuracyPoints, max: 10, raw: `${timeAccuracyPoints} / 10`, color: "bg-[#1E0E6B]" })
  }
  items.push({ label: "Difficulty", points: difficultyPoints, max: 5, raw: `${difficultyPoints} / 5`, color: "bg-red-500" })
  return items
}

export function getRecoveryPenalty(streak: number): number {
  if (streak === 0) return 0
  return Math.min(5, Math.round(streak * 0.02))
}
