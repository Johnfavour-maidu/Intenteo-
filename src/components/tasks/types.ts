export type TaskPriority = "high" | "medium" | "low"
export type TaskEnergy = "high" | "medium" | "low"
export type TaskStatus = "pending" | "in-progress" | "completed" | "archived"
export type TaskView = "list" | "kanban" | "timeline" | "calendar" | "matrix" | "table" | "compact"
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom"

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface TaskComment {
  id: string
  text: string
  author: string
  createdAt: string
}

export interface TaskAttachment {
  id: string
  name: string
  type: string
  url: string
}

export interface TaskActivity {
  id: string
  action: string
  timestamp: string
}

export interface TaskDependency {
  id: string
  taskId: string
  title: string
}

export interface Task {
  id: string
  title: string
  purpose: string
  whyItMatters: string
  futureSelfAlignment: string
  futureSelfBadge: string
  connectedGoal: string
  projectName: string
  category: string
  priority: TaskPriority
  intentScore: number
  deadline: string
  dueTime: string
  estimatedDuration: number
  actualDuration?: number
  energyRequired: TaskEnergy
  tags: string[]
  subtasks: Subtask[]
  attachments: TaskAttachment[]
  comments: TaskComment[]
  activity: TaskActivity[]
  dependencies: TaskDependency[]
  status: TaskStatus
  completed: boolean
  completionPercent: number
  isRecurring: boolean
  recurrence: Recurrence
  location?: string
  notes: string
  voiceNotes: string[]
  calendarSync: boolean
  reminder?: string
  createdAt: string
  updatedAt: string
  xp: number
  aiSuggestion?: string
}

export interface TaskFilter {
  id: string
  label: string
  icon?: string
  active: boolean
}
