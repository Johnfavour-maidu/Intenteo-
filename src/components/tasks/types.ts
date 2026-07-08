export type TaskPriority = "priority" | "progress" | "maintenance"
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly"
export type TaskView = "table" | "list"
export type TimeRange = "anytime" | "morning" | "afternoon" | "evening" | "night" | "custom"
export type MonthlyRepeatMode = "dayOfMonth" | "weekdayOfMonth"
export type SortMode = "manual" | "time-asc" | "time-desc" | "priority" | "progress" | "completion" | "dueDate" | "alpha-asc" | "alpha-desc" | "productivity" | "duration" | "recentlyEdited"

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  whyItMatters: string
  priority: TaskPriority
  deadline: string
  date: string
  dueTime: string
  timeRange: string
  timeRangeType: TimeRange
  estimatedDuration: number
  notes: string
  subtasks: Subtask[]
  recurrence: Recurrence
  recurrenceInterval?: number
  recurrenceWeekdays?: number[]
  monthlyRepeatMode?: MonthlyRepeatMode
  monthlyWeekdayIndex?: number
  monthlyWeekdayOrdinal?: number
  completed: boolean
  order: number
  createdAt: string
  dailyCompletions?: Record<string, boolean>
  deletedDates?: string[]
  linkedHabitId?: string
  linkedGoalId?: string
  linkedProjectId?: string
  category?: string
  contributionPercent?: number
  todayIntention?: string
  reminder?: boolean
}
