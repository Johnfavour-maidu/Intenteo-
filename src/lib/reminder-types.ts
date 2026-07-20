"use client"

export type ReminderFrequency = "one-time" | "daily" | "weekly" | "monthly" | "custom"
export type ReminderSource = "task" | "journal" | "goal" | "habit" | "vision" | "purpose"

export interface Reminder {
  id: string
  title: string
  date: string
  time: string
  frequency: ReminderFrequency
  completed: boolean
  source: ReminderSource
  sourceId?: string
  createdAt: string
}

const STORAGE_KEY = "intenteo-reminders"

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((r: any) => ({
      id: r.id || crypto.randomUUID(),
      title: r.title || r.text || "Reminder",
      date: r.date || "",
      time: r.time || "",
      frequency: r.frequency || "one-time",
      completed: r.completed || false,
      source: r.source || "task",
      sourceId: r.sourceId,
      createdAt: r.createdAt || new Date().toISOString(),
    }))
  } catch {
    return []
  }
}

export function saveReminders(reminders: Reminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

export function addReminder(reminder: Omit<Reminder, "id" | "createdAt">): Reminder {
  const all = loadReminders()
  const newReminder: Reminder = {
    ...reminder,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  all.push(newReminder)
  saveReminders(all)
  return newReminder
}

export function updateReminder(id: string, updates: Partial<Reminder>): void {
  const all = loadReminders()
  saveReminders(all.map(r => r.id === id ? { ...r, ...updates } : r))
}

export function deleteReminder(id: string): void {
  const all = loadReminders()
  saveReminders(all.filter(r => r.id !== id))
}

export function getRemindersForDate(dateKey: string): Reminder[] {
  return loadReminders().filter(r => r.date === dateKey && !r.completed)
}

export function getSmartDateLabel(dateStr: string): { label: string; color: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + "T00:00:00")
  target.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return { label: "Today", color: "text-emerald-600 dark:text-emerald-400" }
  if (diffDays === 1) return { label: "Tomorrow", color: "text-orange-500 dark:text-orange-400" }
  if (diffDays < 0) return { label: `Overdue \u2022 ${diffDays === -1 ? "Yesterday" : `${Math.abs(diffDays)} days ago`}`, color: "text-red-500 dark:text-red-400" }
  const dayName = target.toLocaleDateString("en-US", { weekday: "short" })
  const dayNum = target.getDate()
  const monthName = target.toLocaleDateString("en-US", { month: "short" })
  return { label: `${dayName}, ${dayNum} ${monthName}`, color: "text-blue-600 dark:text-blue-400" }
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}
