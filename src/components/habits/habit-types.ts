"use client"

export interface HabitRecurrence {
  type: string
  customDays?: string[]
  interval?: number
}

export type HabitSchedule = { type: string; slot?: string; time?: string; endTime?: string }
export type HabitReminder = { enabled: boolean; before?: number; after?: number }

export type CompletionQuality = "perfect" | "good" | "partial" | "missed"

export interface Habit {
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
  completions: Record<string, { completed: boolean; time?: string; notes?: string; quality?: CompletionQuality }>
  createdAt: string
  difficulty?: "easy" | "medium" | "hard"
  streakFreeze?: number
  paused?: boolean
  recoveriesUsed?: number
  lastMissedRecovery?: string
  archived?: boolean
  archivedDate?: string
  pinned?: boolean
}

export type TrackerPeriod = "week" | "month" | "year"
