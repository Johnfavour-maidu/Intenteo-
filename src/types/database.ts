// Database Schema Types for Intenteo
// These types define the data models for the application

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  bio?: string
  futureSelfSummary?: string
  lifeVision?: string
  intentScore: number
  productivityScore: number
  longestStreak: number
  values: string[]
  lifeWheel: LifeWheel
  createdAt: Date
  updatedAt: Date
}

export interface LifeWheel {
  health: number
  career: number
  finance: number
  relationships: number
  faith: number
  learning: number
  mentalWellbeing: number
  fun: number
}

export interface Notification {
  id: string
  userId: string
  icon: string
  title: string
  message: string
  category: NotificationCategory
  read: boolean
  actionLabel?: string
  actionUrl?: string
  createdAt: Date
}

export type NotificationCategory =
  | "ai"
  | "achievements"
  | "reminders"
  | "calendar"
  | "challenges"
  | "accountability"
  | "system"
  | "mentions"

export interface CalendarEvent {
  id: string
  userId: string
  title: string
  description?: string
  date: Date
  startTime?: string
  endTime?: string
  category: EventCategory
  color: string
  location?: string
  isRecurring: boolean
  recurringRule?: string
  createdAt: Date
  updatedAt: Date
}

export type EventCategory =
  | "task"
  | "goal"
  | "habit"
  | "journal"
  | "meeting"
  | "personal"
  | "challenge"

export interface Decision {
  id: string
  userId: string
  title: string
  category: string
  reason: string
  alternatives: string[]
  pros: string[]
  cons: string[]
  expectedOutcome: string
  confidence: number
  riskLevel: "low" | "medium" | "high"
  date: Date
  reviewDate?: Date
  actualOutcome?: string
  lessonsLearned?: string
  status: DecisionStatus
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type DecisionStatus = "pending" | "successful" | "failed" | "cancelled"

export interface Memory {
  id: string
  userId: string
  title: string
  description: string
  date: Date
  category: MemoryCategory
  tags: string[]
  mood?: number
  photo?: string
  createdAt: Date
  updatedAt: Date
}

export type MemoryCategory =
  | "journal"
  | "achievement"
  | "photo"
  | "trip"
  | "project"
  | "milestone"
  | "goal"
  | "decision"
  | "reflection"

export interface Challenge {
  id: string
  userId: string
  title: string
  description: string
  category: string
  duration: number
  daysCompleted: number
  progress: number
  xpReward: number
  intentScoreReward: number
  startDate?: Date
  endDate?: Date
  status: ChallengeStatus
  createdAt: Date
  updatedAt: Date
}

export type ChallengeStatus = "active" | "completed" | "suggested" | "community"

export interface Achievement {
  id: string
  userId: string
  name: string
  description: string
  icon: string
  color: string
  unlockedAt: Date
}

export interface Task {
  id: string
  userId: string
  title: string
  purpose: string
  futureSelfAlignment: string
  intentScore: number
  deadline?: Date
  completed: boolean
  priority: "high" | "medium" | "low"
  tags: string[]
  projectId?: string
  habitId?: string
  estimatedDuration?: number
  actualDuration?: number
  energyRequirement: "low" | "medium" | "high"
  createdAt: Date
  updatedAt: Date
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  category: string
  type: "annual" | "quarterly" | "monthly" | "weekly"
  progress: number
  deadline?: Date
  intentScore: number
  futureSelfAlignment: string
  milestones: Milestone[]
  createdAt: Date
  updatedAt: Date
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
}

export interface Habit {
  id: string
  userId: string
  name: string
  description: string
  category: string
  frequency: "daily" | "weekly"
  streak: number
  bestStreak: number
  completedToday: boolean
  completionRate: number
  intentScore: number
  futureSelfAlignment: string
  color: string
  icon: string
  createdAt: Date
  updatedAt: Date
}

export interface JournalEntry {
  id: string
  userId: string
  title: string
  content: string
  type: JournalType
  date: Date
  mood?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type JournalType =
  | "morning"
  | "daily"
  | "reflection"
  | "gratitude"
  | "decision"
  | "dream"
  | "legacy"

// API Response Types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
