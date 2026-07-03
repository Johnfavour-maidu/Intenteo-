export type TaskPriority = "priority" | "progress" | "maintenance"
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly"
export type TaskView = "table" | "list"

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
  dueTime: string
  estimatedDuration: number
  notes: string
  subtasks: Subtask[]
  recurrence: Recurrence
  completed: boolean
  order: number
  createdAt: string
}
