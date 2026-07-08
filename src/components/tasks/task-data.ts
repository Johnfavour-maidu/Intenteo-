"use client"

import { Task } from "./types"

const now = new Date().toISOString()

function isoDate(d: Date) {
  return d.toISOString().split("T")[0]
}
function displayDate(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "long", month: "short", day: "numeric" })
}

const todayISO = isoDate(new Date())
const tomorrowISO = isoDate(new Date(Date.now() + 86400000))

function nextMondayISO() {
  const d = new Date()
  const day = d.getDay()
  const diff = ((1 - day + 7) % 7) || 7
  return isoDate(new Date(d.getTime() + diff * 86400000))
}

const jul1 = "2026-07-01"
const jul2 = "2026-07-02"
const jul3 = "2026-07-03"
const jul4 = "2026-07-04"
const jul5 = "2026-07-05"

export const sampleTasks: Task[] = [
  { id: "jul1-1", title: "Morning workout", whyItMatters: "Physical fitness directly impacts cognitive performance.", priority: "priority", deadline: "Wednesday, Jul 1", date: jul1, dueTime: "6:00 AM", timeRange: "6:00 AM – 7:00 AM", timeRangeType: "custom", estimatedDuration: 60, notes: "Upper body + cardio.", subtasks: [{ id: "j1s1", title: "Warm up – 10 min", completed: true }, { id: "j1s2", title: "Strength training – 30 min", completed: true }, { id: "j1s3", title: "Cardio – 15 min", completed: true }], recurrence: "none", completed: true, order: 0, createdAt: "2026-07-01T06:00:00.000Z" },
  { id: "jul1-2", title: "Read 30 minutes", whyItMatters: "Reading compounds knowledge over time.", priority: "maintenance", deadline: "Wednesday, Jul 1", date: jul1, dueTime: "9:00 PM", timeRange: "9:00 PM – 9:30 PM", timeRangeType: "custom", estimatedDuration: 30, notes: "Currently reading: Atomic Habits.", subtasks: [], recurrence: "none", completed: true, order: 1, createdAt: "2026-07-01T21:00:00.000Z" },
  { id: "jul1-3", title: "Team stand-up", whyItMatters: "Quick daily syncs keep the team moving at full speed.", priority: "progress", deadline: "Wednesday, Jul 1", date: jul1, dueTime: "9:30 AM", timeRange: "9:30 AM – 9:45 AM", timeRangeType: "custom", estimatedDuration: 15, notes: "Keep it to 15 minutes max.", subtasks: [], recurrence: "none", completed: true, order: 2, createdAt: "2026-07-01T09:30:00.000Z" },
  { id: "jul1-4", title: "Grocery shopping", whyItMatters: "Healthy meals fuel productive days.", priority: "maintenance", deadline: "Wednesday, Jul 1", date: jul1, dueTime: "5:00 PM", timeRange: "5:00 PM – 5:45 PM", timeRangeType: "custom", estimatedDuration: 45, notes: "Buy vegetables, chicken, and oats.", subtasks: [], recurrence: "none", completed: true, order: 3, createdAt: "2026-07-01T17:00:00.000Z" },
  { id: "jul2-1", title: "Write blog post", whyItMatters: "Content marketing drives traffic and builds authority.", priority: "priority", deadline: "Thursday, Jul 2", date: jul2, dueTime: "2:00 PM", timeRange: "2:00 PM – 4:00 PM", timeRangeType: "custom", estimatedDuration: 120, notes: "Topic: Building intentional habits.", subtasks: [{ id: "j2s1", title: "Outline draft", completed: true }, { id: "j2s2", title: "Write introduction", completed: true }, { id: "j2s3", title: "Add images", completed: false }], recurrence: "none", completed: false, order: 0, createdAt: "2026-07-02T14:00:00.000Z" },
  { id: "jul2-2", title: "Meditate for 10 minutes", whyItMatters: "Meditation rewires the brain for focus and calm.", priority: "maintenance", deadline: "Thursday, Jul 2", date: jul2, dueTime: "7:30 AM", timeRange: "7:30 AM – 7:40 AM", timeRangeType: "custom", estimatedDuration: 10, notes: "Use the Headspace app.", subtasks: [], recurrence: "none", completed: true, order: 1, createdAt: "2026-07-02T07:30:00.000Z" },
  { id: "jul2-3", title: "Call with design team", whyItMatters: "Design decisions shape the user experience.", priority: "progress", deadline: "Thursday, Jul 2", date: jul2, dueTime: "11:00 AM", timeRange: "11:00 AM – 11:30 AM", timeRangeType: "custom", estimatedDuration: 30, notes: "Review latest mockups.", subtasks: [], recurrence: "none", completed: true, order: 2, createdAt: "2026-07-02T11:00:00.000Z" },
  { id: "jul3-1", title: "Review proposal", whyItMatters: "Thorough review prevents costly revisions.", priority: "priority", deadline: "Friday, Jul 3", date: jul3, dueTime: "10:00 AM", timeRange: "10:00 AM – 12:00 PM", timeRangeType: "custom", estimatedDuration: 120, notes: "Check budget figures and verify timeline.", subtasks: [{ id: "j3s1", title: "Check budget figures", completed: true }, { id: "j3s2", title: "Verify timeline", completed: true }], recurrence: "none", completed: true, order: 0, createdAt: "2026-07-03T10:00:00.000Z" },
  { id: "jul3-2", title: "Prayer journal", whyItMatters: "Spiritual discipline anchors the mind.", priority: "maintenance", deadline: "Friday, Jul 3", date: jul3, dueTime: "7:00 AM", timeRange: "7:00 AM – 7:30 AM", timeRangeType: "custom", estimatedDuration: 30, notes: "", subtasks: [], recurrence: "none", completed: true, order: 1, createdAt: "2026-07-03T07:00:00.000Z" },
  { id: "jul3-3", title: "Clean the house", whyItMatters: "A clean space supports a clear mind.", priority: "maintenance", deadline: "Friday, Jul 3", date: jul3, dueTime: "3:00 PM", timeRange: "3:00 PM – 4:00 PM", timeRangeType: "custom", estimatedDuration: 60, notes: "", subtasks: [], recurrence: "none", completed: true, order: 2, createdAt: "2026-07-03T15:00:00.000Z" },
  { id: "jul3-4", title: "Code review for feature branch", whyItMatters: "Good code reviews prevent bugs.", priority: "progress", deadline: "Friday, Jul 3", date: jul3, dueTime: "3:00 PM", timeRange: "3:00 PM – 3:45 PM", timeRangeType: "custom", estimatedDuration: 45, notes: "Focus on the authentication module.", subtasks: [], recurrence: "none", completed: true, order: 3, createdAt: "2026-07-03T15:00:00.000Z" },
  { id: "jul4-1", title: "Client meeting", whyItMatters: "Building relationships drives long-term growth.", priority: "priority", deadline: "Saturday, Jul 4", date: jul4, dueTime: "10:00 AM", timeRange: "10:00 AM – 11:00 AM", timeRangeType: "custom", estimatedDuration: 60, notes: "Discuss Q3 roadmap.", subtasks: [], recurrence: "none", completed: true, order: 0, createdAt: "2026-07-04T10:00:00.000Z" },
  { id: "jul4-2", title: "Vibecode session", whyItMatters: "Deep work sessions compound into major progress.", priority: "progress", deadline: "Saturday, Jul 4", date: jul4, dueTime: "2:00 PM", timeRange: "2:00 PM – 4:00 PM", timeRangeType: "custom", estimatedDuration: 120, notes: "Focus on the new feature branch.", subtasks: [], recurrence: "none", completed: true, order: 1, createdAt: "2026-07-04T14:00:00.000Z" },
  { id: "jul4-3", title: "Plan weekend activities", whyItMatters: "Rest and adventure fuel creativity.", priority: "maintenance", deadline: "Saturday, Jul 4", date: jul4, dueTime: "5:00 PM", timeRange: "5:00 PM – 5:30 PM", timeRangeType: "custom", estimatedDuration: 30, notes: "Look into the mountain cabin option.", subtasks: [], recurrence: "none", completed: true, order: 2, createdAt: "2026-07-04T17:00:00.000Z" },
  { id: "jul5-1", title: "Morning meditation", whyItMatters: "Start the day with clarity.", priority: "maintenance", deadline: "Sunday, Jul 5", date: jul5, dueTime: "7:00 AM", timeRange: "7:00 AM – 7:15 AM", timeRangeType: "custom", estimatedDuration: 15, notes: "", subtasks: [{ id: "j5s1", title: "Guided breathing", completed: true }, { id: "j5s2", title: "Gratitude journaling", completed: true }], recurrence: "none", completed: true, order: 0, createdAt: "2026-07-05T07:00:00.000Z" },
  { id: "jul5-2", title: "Reflection", whyItMatters: "Weekly reflection keeps you aligned with long-term goals.", priority: "maintenance", deadline: "Sunday, Jul 5", date: jul5, dueTime: "8:00 PM", timeRange: "8:00 PM – 8:30 PM", timeRangeType: "custom", estimatedDuration: 30, notes: "Review the week wins and areas to improve.", subtasks: [], recurrence: "none", completed: false, order: 1, createdAt: "2026-07-05T20:00:00.000Z" },
  { id: "jul5-3", title: "Workout session", whyItMatters: "Physical fitness directly impacts cognitive performance.", priority: "priority", deadline: "Sunday, Jul 5", date: jul5, dueTime: "6:00 PM", timeRange: "6:00 PM – 7:00 PM", timeRangeType: "custom", estimatedDuration: 60, notes: "Leg day.", subtasks: [{ id: "j5s3", title: "Warm up – 10 min", completed: true }, { id: "j5s4", title: "Squats – 4 sets", completed: true }, { id: "j5s5", title: "Lunges – 3 sets", completed: false }, { id: "j5s6", title: "Cool down – 5 min", completed: false }], recurrence: "none", completed: false, order: 2, createdAt: "2026-07-05T18:00:00.000Z" },
  { id: "future-mon-1", title: "Vibecode session", whyItMatters: "Deep work sessions compound into major project progress.", priority: "progress", deadline: "Monday, Jul 6", date: nextMondayISO(), dueTime: "2:00 PM", timeRange: "2:00 PM – 4:00 PM", timeRangeType: "custom", estimatedDuration: 120, notes: "Focus on the new feature branch.", subtasks: [], recurrence: "none", completed: false, order: 0, createdAt: now },
  { id: "future-mon-2", title: "Project planning", whyItMatters: "Planning prevents wasted effort.", priority: "priority", deadline: "Monday, Jul 6", date: nextMondayISO(), dueTime: "10:00 AM", timeRange: "10:00 AM – 11:00 AM", timeRangeType: "custom", estimatedDuration: 60, notes: "Review roadmap and assign tasks.", subtasks: [], recurrence: "none", completed: false, order: 1, createdAt: now },
  { id: "future-mon-3", title: "Exercise", whyItMatters: "Physical fitness directly impacts cognitive performance.", priority: "maintenance", deadline: "Monday, Jul 6", date: nextMondayISO(), dueTime: "6:00 PM", timeRange: "6:00 PM – 7:00 PM", timeRangeType: "custom", estimatedDuration: 60, notes: "Full body workout.", subtasks: [], recurrence: "none", completed: false, order: 2, createdAt: now },
  { id: "future-mon-4", title: "Weekly review", whyItMatters: "Weekly review keeps you aligned with long-term goals.", priority: "maintenance", deadline: "Monday, Jul 6", date: nextMondayISO(), dueTime: "8:00 PM", timeRange: "8:00 PM – 8:30 PM", timeRangeType: "custom", estimatedDuration: 30, notes: "Review the week wins and areas to improve.", subtasks: [], recurrence: "none", completed: false, order: 3, createdAt: now },
]
