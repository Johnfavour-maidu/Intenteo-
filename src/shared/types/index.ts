// ══════════════════════════════════════════════════════════════
// Unified Shared Types — Intenteo
// Canonical location for all domain types across the codebase.
// ══════════════════════════════════════════════════════════════

// ─── HELPER FUNCTIONS ────────────────────────────────────────

export const getTodayISO = () => new Date().toISOString().split("T")[0]
export const getDaysRemaining = (dl: string) => Math.max(0, Math.ceil((new Date(dl).getTime() - Date.now()) / 86400000))
export const getDaysCompleted = (sd: string) => Math.max(0, Math.ceil((Date.now() - new Date(sd).getTime()) / 86400000))

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

// ══════════════════════════════════════════════════════════════
// TASKS (components/tasks/types.ts)
// ══════════════════════════════════════════════════════════════

export type TaskPriority = "priority" | "progress" | "maintenance"
export type Recurrence = "none" | "daily" | "weekly" | "monthly" | "yearly"
export type TaskView = "table" | "list"
export type TimeRange = "anytime" | "morning" | "afternoon" | "evening" | "night" | "custom"
export type MonthlyRepeatMode = "dayOfMonth" | "weekdayOfMonth"
export type TasksSortMode = "manual" | "time-asc" | "time-desc" | "priority" | "progress" | "completion" | "dueDate" | "alpha-asc" | "alpha-desc" | "productivity" | "duration" | "recentlyEdited"

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

// ══════════════════════════════════════════════════════════════
// HABITS (components/habits/habit-types.ts)
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// GOALS (components/goals/types.ts)
// ══════════════════════════════════════════════════════════════

export interface Milestone { id: string; title: string; completed: boolean; weight?: number }

export interface GoalProjectTimeline {
  id: string; projectName: string; description: string; startDate: string; endDate: string
  status: "not-started" | "in-progress" | "completed" | "on-hold"; progress: number; notes: string
  milestones?: string[]
}

export interface ProjectTask {
  id: string; title: string; completed: boolean
  subtasks: { id: string; title: string; completed: boolean }[]
}

export interface Project {
  id: string; name: string; description: string; status: "planning" | "active" | "completed" | "on-hold"
  progress: number; priority: "low" | "medium" | "high"; startDate: string; dueDate: string
  tasks: ProjectTask[]; notes: string; color: string; colorHex: string; icon: string
  tags: string[]; goalId: string; createdAt: string; updatedAt: string
}

export interface LinkedHabitWeight { habitId: string; habitName: string; weight: number }

export interface Goal {
  id: string; title: string; description: string; category: string; customCategory?: string
  priority: "none" | "low" | "medium" | "high"; progress: number; deadline: string; startDate: string
  type: "annual" | "quarterly" | "monthly" | "weekly" | "custom"; whyItMatters: string
  milestones: Milestone[]; linkedHabits: string[]; linkedHabitWeights?: LinkedHabitWeight[]
  notes: string; color: string; colorHex: string
  icon: string; trackingMethod: "manual" | "milestone" | "auto"
  weighting?: { milestones: number; habits: number }
  progressStrategy?: "balanced" | "milestone-focused" | "habit-focused" | "milestones-only" | "habits-only" | "custom"
  milestoneWeight?: number
  habitWeight?: number
  projectTimelines?: GoalProjectTimeline[]
  timeline?: string; status?: "not-started" | "in-progress" | "completed" | "overdue" | "archived"
  timeHorizon?: TimeHorizon
  visionId?: string
  habitCompletionRate?: number; lastActivity?: string
  createdAt: string; updatedAt: string
}

export interface GoalHabit {
  id: string; name: string; color: string; colorHex: string; icon: string
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
  streak: number; habitScore: number; createdAt?: string
}

export interface GoalVisionBoardItem {
  id: string; type: "image" | "quote" | "bible-verse" | "video" | "link"
  content: string; title?: string; url?: string; createdAt: string
}

export interface GoalVision {
  id: string; title: string; description?: string; lifeAreaId: string
  icon: string; archived: boolean
  boardItems: GoalVisionBoardItem[]
  createdAt: string; updatedAt: string
}

export type GoalFilterMode = "all" | "life-vision" | "10-year" | "5-year" | "annual" | "quarterly" | "monthly" | "weekly" | "daily" | "projects" | "completed" | "in-progress" | "not-started" | "overdue" | "archived"
export type GoalsSortMode = "deadline" | "progress" | "updated" | "priority" | "name" | "newest" | "oldest"
export type TimeHorizon = "this-year" | "2-years" | "5-years" | "10-years" | "lifetime"

// ══════════════════════════════════════════════════════════════
// GOALS — Constants & Sample Data
// ══════════════════════════════════════════════════════════════

export const TIME_HORIZONS: { value: TimeHorizon; label: string }[] = [
  { value: "this-year", label: "This Year" },
  { value: "2-years", label: "2 Years" },
  { value: "5-years", label: "5 Years" },
  { value: "10-years", label: "10 Years" },
  { value: "lifetime", label: "Lifetime" },
]

export const TIME_HORIZON_BADGES: Record<TimeHorizon, { label: string; bg: string; color: string }> = {
  "this-year": { label: "This Year", bg: "bg-blue-50", color: "text-blue-600" },
  "2-years": { label: "2 Years", bg: "bg-purple-50", color: "text-purple-600" },
  "5-years": { label: "5 Years", bg: "bg-emerald-50", color: "text-emerald-600" },
  "10-years": { label: "10 Years", bg: "bg-amber-50", color: "text-amber-600" },
  "lifetime": { label: "Lifetime", bg: "bg-rose-50", color: "text-rose-600" },
}

export const VISION_CATEGORIES = [
  { name: "Career", icon: "\u{1F4BC}", color: "#3B82F6" },
  { name: "Family", icon: "\u{1F3E0}", color: "#EF4444" },
  { name: "Finance", icon: "\u{1F4B0}", color: "#EAB308" },
  { name: "Health", icon: "\u{1F4AA}", color: "#22C55E" },
  { name: "Impact", icon: "\u{1F30D}", color: "#14B8A6" },
  { name: "Faith", icon: "\u{1F64F}", color: "#8B5CF6" },
  { name: "Relationships", icon: "\u2764\uFE0F", color: "#EC4899" },
  { name: "Learning", icon: "\u{1F4DA}", color: "#F97316" },
  { name: "Personal Growth", icon: "\u2B50", color: "#1E0E6B" },
  { name: "Custom", icon: "\u2728", color: "#6B7280" },
]

export const GOAL_CATEGORIES = [
  { name: "Personal Growth", color: "#1E0E6B" },
  { name: "Health", color: "#22C55E" },
  { name: "Career", color: "#3B82F6" },
  { name: "Finance", color: "#EAB308" },
  { name: "Learning", color: "#F97316" },
  { name: "Relationships", color: "#EC4899" },
  { name: "Faith", color: "#1E0E6B" },
  { name: "Business", color: "#14B8A6" },
  { name: "Family", color: "#EF4444" },
  { name: "Custom", color: "#6B7280" },
]

export const GOAL_COLORS = [
  { name: "Purple", hex: "#1E0E6B" }, { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" }, { name: "Orange", hex: "#F97316" },
  { name: "Red", hex: "#EF4444" }, { name: "Pink", hex: "#EC4899" },
  { name: "Teal", hex: "#14B8A6" }, { name: "Black", hex: "#000000" },
]

export const GOAL_ICONS = ["\u{1F3AF}","\u2B50","\u{1F680}","\u{1F4A1}","\u{1F525}","\u{1F48E}","\u{1F3C6}","\u{1F4C8}","\u{1F4AA}","\u{1F4DA}","\u{1F4B0}","\u2764\uFE0F","\u{1F64F}","\u{1F393}","\u{1F4BC}","\u{1F331}"]

export const PROJECT_TEMPLATES = [
  { name: "Book Writing", icon: "\u{1F4DA}", tasks: ["Outline chapters", "Write first draft", "Edit & revise", "Publish"] },
  { name: "Website Launch", icon: "\u{1F310}", tasks: ["Design mockups", "Build frontend", "Build backend", "Test & launch"] },
  { name: "Fitness Challenge", icon: "\u{1F4AA}", tasks: ["Set goals", "Create plan", "Start training", "Track progress"] },
  { name: "Business Launch", icon: "\u{1F680}", tasks: ["Market research", "Business plan", "Build MVP", "Launch"] },
  { name: "Research", icon: "\u{1F52C}", tasks: ["Define scope", "Gather data", "Analyze", "Write report"] },
  { name: "Course Creation", icon: "\u{1F393}", tasks: ["Plan curriculum", "Create content", "Record lessons", "Publish"] },
]

export const createSampleGoals = (): Goal[] => [
  { id:"1", title:"Launch Intenteo MVP", description:"Ship the first version to beta", category:"Career", priority:"high", progress:0, deadline:"2026-09-30", startDate:"2026-01-01", type:"quarterly", whyItMatters:"Build something meaningful", milestones:[{id:"m1",title:"UI design",completed:true},{id:"m2",title:"API ready",completed:true},{id:"m3",title:"Beta test",completed:false},{id:"m4",title:"Launch",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Purple", colorHex:"#1E0E6B", icon:"\u{1F680}", trackingMethod:"milestone", progressStrategy:"milestones-only", timeline:"Quarterly", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
  { id:"2", title:"Run a Half Marathon", description:"Complete 21km under 2 hours", category:"Health", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Health is wealth", milestones:[{id:"m5",title:"Run 5km",completed:true},{id:"m6",title:"Run 10km",completed:true},{id:"m7",title:"Run 15km",completed:false},{id:"m8",title:"Run 21km",completed:false}], linkedHabits:["Exercise"], linkedHabitWeights:[{habitId:"h2",habitName:"Exercise",weight:100}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F4AA}", trackingMethod:"milestone", progressStrategy:"balanced", timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-05-15" },
  { id:"3", title:"Read 24 Books", description:"2 books per month on leadership", category:"Learning", priority:"none", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Knowledge is power", milestones:[], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4DA}", trackingMethod:"milestone", progressStrategy:"habits-only", timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
  { id:"4", title:"Save $10,000", description:"Build emergency fund", category:"Finance", priority:"high", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Financial security", milestones:[{id:"m9",title:"Save $2,500",completed:true},{id:"m10",title:"Save $5,000",completed:false},{id:"m11",title:"Save $7,500",completed:false},{id:"m12",title:"Save $10,000",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Teal", colorHex:"#14B8A6", icon:"\u{1F4B0}", trackingMethod:"milestone", progressStrategy:"milestones-only", timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-04-01" },
  { id:"5", title:"Deepen Faith Walk", description:"Build a consistent devotional and prayer life", category:"Faith", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Spiritual growth anchors everything", milestones:[{id:"m13",title:"Daily devotion habit",completed:true},{id:"m14",title:"Complete Bible reading plan",completed:false},{id:"m15",title:"Join small group",completed:false}], linkedHabits:["Morning Devotion"], linkedHabitWeights:[{habitId:"h5",habitName:"Morning Devotion",weight:100}], notes:"", color:"Purple", colorHex:"#1E0E6B", icon:"\u{1F64F}", trackingMethod:"milestone", progressStrategy:"balanced", timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-02-01", updatedAt:"2026-06-01" },
  { id:"6", title:"Strengthen Relationships", description:"Be more intentional with family and friends", category:"Relationships", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Relationships are life's greatest treasure", milestones:[{id:"m16",title:"Weekly family dinner",completed:true},{id:"m17",title:"Monthly friend hangout",completed:false},{id:"m18",title:"Plan family trip",completed:false}], linkedHabits:["Call a Friend"], linkedHabitWeights:[{habitId:"h6",habitName:"Call a Friend",weight:100}], notes:"", color:"Pink", colorHex:"#EC4899", icon:"\u2764\uFE0F", trackingMethod:"milestone", progressStrategy:"balanced", timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-15", updatedAt:"2026-05-20" },
  { id:"7", title:"Master TypeScript", description:"Become an expert in TypeScript and advanced patterns", category:"Learning", priority:"low", progress:0, deadline:"2026-09-30", startDate:"2026-04-01", type:"quarterly", whyItMatters:"Better code quality and career growth", milestones:[{id:"m19",title:"Complete advanced course",completed:false},{id:"m20",title:"Build 3 practice projects",completed:false},{id:"m21",title:"Contribute to open source",completed:false}], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Blue", colorHex:"#3B82F6", icon:"\u{1F4BB}", trackingMethod:"milestone", progressStrategy:"balanced", timeline:"Quarterly", status:"not-started", timeHorizon:"this-year", createdAt:"2026-04-01", updatedAt:"2026-04-01" },
  { id:"8", title:"Launch Side Project", description:"Build and ship a profitable SaaS product", category:"Business", priority:"high", progress:0, deadline:"2026-10-31", startDate:"2026-03-01", type:"quarterly", whyItMatters:"Create additional income and impact", milestones:[{id:"m22",title:"Validate idea",completed:true},{id:"m23",title:"Build MVP",completed:false},{id:"m24",title:"Get first 10 paying users",completed:false},{id:"m25",title:"Reach $1k MRR",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Teal", colorHex:"#14B8A6", icon:"\u{1F680}", trackingMethod:"milestone", progressStrategy:"milestones-only", timeline:"Quarterly", status:"in-progress", timeHorizon:"2-years", createdAt:"2026-03-01", updatedAt:"2026-06-15" },
  { id:"9", title:"Learn French", description:"Reach conversational fluency in French", category:"Learning", priority:"low", progress:0, deadline:"2027-06-30", startDate:"2026-07-01", type:"annual", whyItMatters:"Connecting with culture and opening travel opportunities", milestones:[{id:"m26",title:"Complete Duolingo streak 30 days",completed:true},{id:"m27",title:"Watch 5 French films",completed:false},{id:"m28",title:"Hold 10-min conversation",completed:false},{id:"m29",title:"Read a French book",completed:false}], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Blue", colorHex:"#3B82F6", icon:"\u{1F30D}", trackingMethod:"milestone", progressStrategy:"balanced", timeline:"Annual", status:"in-progress", timeHorizon:"2-years", createdAt:"2026-07-01", updatedAt:"2026-07-01" },
  { id:"10", title:"Launch YouTube Channel", description:"Create and grow a personal development channel", category:"Business", priority:"medium", progress:0, deadline:"2027-03-31", startDate:"2026-08-01", type:"annual", whyItMatters:"Share knowledge and build a personal brand", milestones:[{id:"m30",title:"Plan 10 video topics",completed:false},{id:"m31",title:"Record first 3 videos",completed:false},{id:"m32",title:"Reach 100 subscribers",completed:false},{id:"m33",title:"Reach 1,000 subscribers",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Pink", colorHex:"#EC4899", icon:"\u{1F3AC}", trackingMethod:"milestone", progressStrategy:"milestones-only", timeline:"Annual", status:"not-started", timeHorizon:"2-years", createdAt:"2026-08-01", updatedAt:"2026-08-01" },
  { id:"11", title:"Run a Marathon", description:"Complete a full 42km marathon", category:"Health", priority:"high", progress:0, deadline:"2027-04-30", startDate:"2026-09-01", type:"annual", whyItMatters:"Push physical limits and prove discipline", milestones:[{id:"m34",title:"Run 15km non-stop",completed:false},{id:"m35",title:"Run 21km half marathon",completed:false},{id:"m36",title:"Run 30km training run",completed:false},{id:"m37",title:"Complete marathon",completed:false}], linkedHabits:["Exercise"], linkedHabitWeights:[{habitId:"h2",habitName:"Exercise",weight:100}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F3C3}", trackingMethod:"milestone", progressStrategy:"balanced", timeline:"Annual", status:"not-started", timeHorizon:"5-years", createdAt:"2026-09-01", updatedAt:"2026-09-01" },
]

export const createSampleProjects = (): Project[] => [
  { id:"p1", name:"Build Habit Tracker", description:"Design and build the habit tracking feature", status:"active", progress:72, priority:"high", startDate:"2026-03-01", dueDate:"2026-07-31", tasks:[{id:"t1",title:"Design UI",completed:true,subtasks:[]},{id:"t2",title:"Build components",completed:true,subtasks:[]},{id:"t3",title:"Add persistence",completed:false,subtasks:[]},{id:"t4",title:"Test & deploy",completed:false,subtasks:[]}], notes:"", color:"Indigo", colorHex:"#1E0E6B", icon:"\u{1F4CA}", tags:["dev","ui"], goalId:"1", createdAt:"2026-03-01", updatedAt:"2026-06-01" },
  { id:"p2", name:"Launch Website", description:"Deploy intenteo.vercel.app to production", status:"active", progress:100, priority:"high", startDate:"2026-01-01", dueDate:"2026-06-30", tasks:[{id:"t5",title:"Setup domain",completed:true,subtasks:[]},{id:"t6",title:"Configure DNS",completed:true,subtasks:[]},{id:"t7",title:"Deploy",completed:true,subtasks:[]}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F310}", tags:["dev"], goalId:"1", createdAt:"2026-01-01", updatedAt:"2026-06-15" },
  { id:"p3", name:"Marketing Campaign", description:"Social media and content marketing", status:"active", progress:30, priority:"medium", startDate:"2026-04-01", dueDate:"2026-08-31", tasks:[{id:"t8",title:"Content calendar",completed:true,subtasks:[]},{id:"t9",title:"Create posts",completed:false,subtasks:[]},{id:"t10",title:"Analytics",completed:false,subtasks:[]}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4E2}", tags:["marketing"], goalId:"1", createdAt:"2026-04-01", updatedAt:"2026-05-01" },
  { id:"p4", name:"Training Plan", description:"12-week half marathon training", status:"active", progress:40, priority:"medium", startDate:"2026-03-01", dueDate:"2026-06-30", tasks:[{id:"t11",title:"Week 1-4: Base",completed:true,subtasks:[]},{id:"t12",title:"Week 5-8: Build",completed:false,subtasks:[]},{id:"t13",title:"Week 9-12: Peak",completed:false,subtasks:[]}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F3C3}", tags:["fitness"], goalId:"2", createdAt:"2026-03-01", updatedAt:"2026-05-15" },
  { id:"p5", name:"Reading List", description:"Curate and track 24 books", status:"active", progress:50, priority:"low", startDate:"2026-01-01", dueDate:"2026-12-31", tasks:[{id:"t14",title:"Jan-Mar books",completed:true,subtasks:[]},{id:"t15",title:"Apr-Jun books",completed:true,subtasks:[]},{id:"t16",title:"Jul-Sep books",completed:false,subtasks:[]}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4D6}", tags:["learning"], goalId:"3", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
]

// ══════════════════════════════════════════════════════════════
// REMINDERS (lib/reminder-types.ts)
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// INTENT SCORE (lib/intent-score.ts)
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// VISION FRAMEWORK (lib/vision-framework.ts)
// ══════════════════════════════════════════════════════════════

export interface Purpose {
  statement: string
  notes: string
  lifeAreaIds: string[]
  reviewFrequency: "weekly" | "monthly" | "quarterly" | "annually"
  lastReviewedAt: string
  updatedAt: string
}

export interface PurposeReview {
  id: string
  reflection: string
  question: string
  reviewDate: string
  createdAt: string
}

export interface LifeArea {
  id: string
  name: string
  icon: string
  color: string
  description: string
  pinned: boolean
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CoreValue {
  id: string
  name: string
  icon: string
  description: string
  purposeConnection: string
  pinned: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Commitment {
  id: string
  title: string
  description: string
  relatedValueIds: string[]
  relatedLifeAreaIds: string[]
  relatedVisionIds: string[]
  healthStatus: "keeping" | "mostly" | "needs-attention" | "broken"
  pinned: boolean
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface VisionFramework {
  id: string
  title: string
  description?: string
  lifeAreaId: string
  icon: string
  purposeAlignment: string
  reviewFrequency: "weekly" | "biweekly" | "monthly" | "bimonthly" | "quarterly"
  relatedValueIds: string[]
  relatedCommitmentIds: string[]
  relatedGoalIds: string[]
  relatedProjectIds: string[]
  relatedHabitIds: string[]
  boardItems: VisionBoardItem[]
  coverImage: string
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface VisionBoardItem {
  id: string
  type: "image" | "quote" | "bible-verse" | "video" | "link" | "note"
  content: string
  title: string
  url: string
  createdAt: string
}

export type RoadmapTimeHorizon = "1-year" | "2-years" | "5-years" | "10-years" | "20-years" | "lifetime"
export type MilestoneStatus = "not-started" | "in-progress" | "completed" | "on-hold"

export interface RoadmapMilestone {
  id: string
  visionId: string
  title: string
  description?: string
  timeHorizon: RoadmapTimeHorizon
  targetYear: number
  targetDate: string
  progress: number
  status: MilestoneStatus
  notes?: string
  relatedGoalIds: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface VisionSearchResult {
  type: "purpose" | "value" | "commitment" | "vision" | "milestone" | "board-item" | "life-area"
  id: string
  title: string
  subtitle: string
  icon: string
}

// ══════════════════════════════════════════════════════════════
// VISION FRAMEWORK — Constants
// ══════════════════════════════════════════════════════════════

export const DEFAULT_LIFE_AREAS: Array<{ name: string; icon: string; color: string; description: string }> = [
  { name: "Career", icon: "💼", color: "#3B82F6", description: "Your professional life and career aspirations." },
  { name: "Relationships", icon: "❤️", color: "#EC4899", description: "Friendships, community, and social connections." },
  { name: "Family", icon: "👨‍👩‍👧", color: "#F59E0B", description: "Your family and home life." },
  { name: "Faith", icon: "🙏", color: "#8B5CF6", description: "Spiritual growth and relationship with God." },
  { name: "Finance", icon: "💰", color: "#10B981", description: "Financial health, wealth building, and stewardship." },
  { name: "Health", icon: "💪", color: "#EF4444", description: "Physical, mental, and emotional wellbeing." },
  { name: "Personal Growth", icon: "🧠", color: "#F97316", description: "Learning, development, and self-improvement." },
  { name: "Impact", icon: "🌍", color: "#06B6D4", description: "Service, mentorship, and making a difference." },
  { name: "Education", icon: "📚", color: "#6366F1", description: "Academic pursuits, skills, and knowledge." },
  { name: "Creativity", icon: "🎨", color: "#D946EF", description: "Artistic expression, innovation, and imagination." },
  { name: "Mental Health", icon: "🧘", color: "#14B8A6", description: "Mindfulness, therapy, and emotional resilience." },
  { name: "Fitness", icon: "🏃", color: "#F43F5E", description: "Exercise, training, and physical performance." },
  { name: "Nutrition", icon: "🥗", color: "#22C55E", description: "Healthy eating, diet, and meal planning." },
  { name: "Spirituality", icon: "🕊️", color: "#A855F7", description: "Meditation, prayer, and inner peace." },
  { name: "Community", icon: "🏘️", color: "#0EA5E9", description: "Local involvement, volunteering, and belonging." },
  { name: "Hobbies", icon: "🎯", color: "#EAB308", description: "Leisure activities, passions, and fun." },
  { name: "Travel", icon: "✈️", color: "#2DD4BF", description: "Exploration, adventure, and cultural experiences." },
  { name: "Home", icon: "🏠", color: "#D97706", description: "Home environment, living space, and comfort." },
  { name: "Romance", icon: "💑", color: "#E11D48", description: "Intimate relationships and partnership." },
  { name: "Parenting", icon: "👶", color: "#FB923C", description: "Raising children and family development." },
  { name: "Leadership", icon: "👑", color: "#7C3AED", description: "Guiding others, influence, and authority." },
  { name: "Emotional Intelligence", icon: "🫀", color: "#F472B6", description: "Self-awareness, empathy, and regulation." },
  { name: "Time Management", icon: "⏰", color: "#64748B", description: "Productivity, scheduling, and efficiency." },
  { name: "Social Skills", icon: "🤝", color: "#38BDF8", description: "Communication, networking, and interpersonal skills." },
  { name: "Rest & Recovery", icon: "😴", color: "#818CF8", description: "Sleep, relaxation, and recharging." },
  { name: "Environment", icon: "🌿", color: "#4ADE80", description: "Sustainability, nature, and surroundings." },
  { name: "Legacy", icon: "🏛️", color: "#94A3B8", description: "Long-term impact and what you leave behind." },
  { name: "Adventure", icon: "🏔️", color: "#F59E0B", description: "New experiences, risks, and excitement." },
  { name: "Discipline", icon: "⚡", color: "#FBBF24", description: "Consistency, habits, and self-control." },
  { name: "Joy", icon: "😊", color: "#34D399", description: "Happiness, playfulness, and positive energy." },
]

export const REVIEW_FREQUENCY_CONFIG: Record<Purpose["reviewFrequency"], { label: string; days: number }> = {
  weekly: { label: "Weekly", days: 7 },
  monthly: { label: "Monthly", days: 30 },
  quarterly: { label: "Quarterly", days: 90 },
  annually: { label: "Annually", days: 365 },
}

export const VISION_REVIEW_FREQUENCY_CONFIG: Record<VisionFramework["reviewFrequency"], { label: string; days: number }> = {
  weekly: { label: "Weekly", days: 7 },
  biweekly: { label: "Every 2 Weeks", days: 14 },
  monthly: { label: "Monthly", days: 30 },
  bimonthly: { label: "Every 2 Months", days: 60 },
  quarterly: { label: "Quarterly (90 Days)", days: 90 },
}

export const REVIEW_QUESTIONS = [
  "Has your purpose stayed the same, or evolved?",
  "What decisions this period aligned with your purpose?",
  "Where did you drift from your purpose, and why?",
  "Who or what reminds you of your purpose?",
  "What would make your purpose feel more alive?",
  "What are you tolerating that conflicts with your purpose?",
  "How has your definition of a meaningful life changed?",
]

// ══════════════════════════════════════════════════════════════
// RESOURCES (lib/resources.ts)
// ══════════════════════════════════════════════════════════════

export type ResourceCategory =
  | "Purpose" | "Vision" | "Goals" | "Habits" | "Tasks" | "Journal"
  | "Mindfulness" | "Health" | "Learning" | "Productivity" | "Leadership"
  | "Finance" | "Relationships" | "Faith" | "Personal Growth"

export type ResourceType = "article" | "guide" | "exercise" | "worksheet" | "template" | "prompt" | "book" | "video" | "podcast" | "checklist" | "framework"

export type DifficultyLevel = "beginner" | "intermediate" | "advanced"

export interface Resource {
  id: string
  title: string
  description: string
  category: ResourceCategory
  type: ResourceType
  difficulty: DifficultyLevel
  content: string
  tags: string[]
  trackerId?: string
  readTime?: string
}

export type ModuleKey = "today" | "goals" | "habits" | "journal" | "visions" | "tasks"

export const RESOURCE_CATEGORIES: { id: ResourceCategory; label: string; icon: string; description: string }[] = [
  { id: "Purpose", label: "Purpose", icon: "🎯", description: "Discover your meaning and mission" },
  { id: "Vision", label: "Vision", icon: "🔮", description: "Create a compelling future" },
  { id: "Goals", label: "Goals", icon: "🏆", description: "Set and achieve meaningful goals" },
  { id: "Habits", label: "Habits", icon: "🔄", description: "Build lasting positive routines" },
  { id: "Tasks", label: "Tasks", icon: "✅", description: "Execute with focus and clarity" },
  { id: "Journal", label: "Journal", icon: "📖", description: "Reflect and grow through writing" },
  { id: "Mindfulness", label: "Mindfulness", icon: "🧘", description: "Find peace and presence" },
  { id: "Health", label: "Health", icon: "💪", description: "Nourish your body and mind" },
  { id: "Learning", label: "Learning", icon: "📚", description: "Expand your knowledge" },
  { id: "Productivity", label: "Productivity", icon: "⚡", description: "Accomplish more with intention" },
  { id: "Leadership", label: "Leadership", icon: "👑", description: "Lead with purpose and influence" },
  { id: "Finance", label: "Finance", icon: "💰", description: "Build wealth with wisdom" },
  { id: "Relationships", label: "Relationships", icon: "❤️", description: "Deepen connection and trust" },
  { id: "Faith", label: "Faith", icon: "🙏", description: "Grow spiritually and stay grounded" },
  { id: "Personal Growth", label: "Personal Growth", icon: "🌱", description: "Become your best self" },
]

export const RESOURCE_TYPES: { id: ResourceType; label: string; icon: string }[] = [
  { id: "article", label: "Articles", icon: "📄" },
  { id: "guide", label: "Guides", icon: "📘" },
  { id: "exercise", label: "Exercises", icon: "🎯" },
  { id: "worksheet", label: "Worksheets", icon: "📝" },
  { id: "template", label: "Templates", icon: "📋" },
  { id: "prompt", label: "Reflection Prompts", icon: "💭" },
  { id: "book", label: "Book Recommendations", icon: "📕" },
  { id: "video", label: "Videos", icon: "🎬" },
  { id: "podcast", label: "Podcasts", icon: "🎧" },
  { id: "checklist", label: "Checklists", icon: "☑️" },
  { id: "framework", label: "Frameworks", icon: "🏗️" },
]

export const TRACKER_RESOURCE_MAP: Record<string, ResourceCategory[]> = {
  mood: ["Personal Growth", "Mindfulness", "Journal"],
  period: ["Health"],
  weight: ["Health", "Habits"],
  exercise: ["Health", "Habits", "Productivity"],
  lifestyle: ["Habits", "Health", "Productivity"],
  finance: ["Finance", "Goals"],
  content: ["Productivity", "Learning"],
  student: ["Learning", "Productivity", "Tasks"],
  business: ["Leadership", "Finance", "Goals"],
  mindfulness: ["Mindfulness", "Faith", "Personal Growth"],
  custom: ["Personal Growth"],
}

export const ALL_RESOURCES: Resource[] = [
  { id: "purpose-1", title: "Discovering Your Life Purpose", description: "A step-by-step guide to uncovering the deeper meaning behind your existence and aligning your daily actions with your core mission.", category: "Purpose", type: "guide", difficulty: "beginner", content: "Your purpose is the intersection of what you love, what you are good at, what the world needs, and what you can be rewarded for. Start by reflecting on these four areas:\n\n1. **Passion**: What activities make you lose track of time?\n2. **Skill**: What do others come to you for help with?\n3. **Need**: What problem in the world breaks your heart?\n4. **Value**: What can you offer that others would invest in?\n\nWrite your answers down. Look for the overlap. That intersection is where your purpose begins to take shape.\n\n**Exercise**: Write a Purpose Statement in one sentence: 'I use my [skill] to [action] for [audience] so that [impact].'", tags: ["purpose", "meaning", "self-discovery"], readTime: "8 min" },
  { id: "purpose-2", title: "Values Clarification Exercise", description: "Identify and prioritize the core values that guide your decisions, relationships, and life direction.", category: "Purpose", type: "exercise", difficulty: "beginner", content: "Your values are your internal compass. When you live aligned with your values, you feel authentic and fulfilled. When you do not, you feel restless and conflicted.\n\n**Step 1**: From the list below, select your top 10 values:\nIntegrity, Freedom, Family, Growth, creativity, Adventure, Service, Faith, Knowledge, Health, Wealth, Love, Justice, Simplicity, Courage, Humility, Excellence, Gratitude, Patience, Connection\n\n**Step 2**: Narrow to your top 5.\n\n**Step 3**: For each value, write one sentence about why it matters to you.\n\n**Step 4**: Rank them 1-5. When two values conflict, which one wins?\n\nThese are your non-negotiable values. Use them as a filter for every major decision.", tags: ["values", "purpose", "identity"], readTime: "15 min" },
  { id: "purpose-3", title: "Life Mission Worksheet", description: "A structured worksheet to craft your personal life mission statement that guides all your goals and decisions.", category: "Purpose", type: "worksheet", difficulty: "intermediate", content: "**Life Mission Worksheet**\n\n**Part 1: Reflection**\n- What moments in your life have felt most meaningful?\n- When have you felt most alive and aligned?\n- What would you do if money were no object?\n- What legacy do you want to leave?\n\n**Part 2: Drafting**\nComplete these sentences:\n- I am at my best when I...\n- The impact I want to have is...\n- The people I want to serve are...\n- The change I want to see in the world is...\n\n**Part 3: Synthesis**\nCombine your answers into a 1-2 sentence mission statement. Revise it until it feels true.\n\n**Example**: 'To inspire and equip young leaders to discover their purpose and build lives of meaning, impact, and faith.'", tags: ["purpose", "mission", "planning"], readTime: "20 min" },
  { id: "vision-1", title: "Creating a Compelling Life Vision", description: "Learn how to craft a vivid, emotionally resonant picture of your ideal future across every area of life.", category: "Vision", type: "guide", difficulty: "beginner", content: "A life vision is a detailed picture of your ideal future. It is not a goal list; it is a narrative of who you are becoming.\n\n**The Vision Framework**:\nWrite a paragraph for each area of your life as if it is 5 years from now and everything has gone perfectly:\n\n1. **Health & Energy**: How do you feel? What does your body look like?\n2. **Relationships**: Who is around you? How do they describe you?\n3. **Career & Purpose**: What are you building? What is your impact?\n4. **Finances**: What is your financial position? What freedom do you have?\n5. **Personal Growth**: What have you learned? Who have you become?\n6. **Faith & Spirituality**: What is your spiritual life like?\n7. **Fun & Adventure**: What experiences have you had?\n\nRead your vision daily. Let it shape your goals.", tags: ["vision", "future", "planning"], readTime: "12 min" },
  { id: "vision-2", title: "Vision Board Creation Guide", description: "A practical guide to creating a visual vision board that keeps your future front and center in your daily life.", category: "Vision", type: "guide", difficulty: "beginner", content: "A vision board is a visual representation of your goals and dreams. It serves as a daily reminder of what you are working toward.\n\n**How to Create Your Vision Board**:\n\n1. **Gather images** that represent your ideal life (magazines, Pinterest, screenshots)\n2. **Choose a board** (physical corkboard or digital like Canva)\n3. **Organize by life area**: Health, Career, Relationships, Faith, Finance, Growth\n4. **Add words** that reinforce your values and identity\n5. **Place it** where you will see it every morning and evening\n\n**Pro Tip**: The most effective vision boards are reviewed daily, not just created once. Spend 2 minutes each morning visualizing yourself already living this vision.", tags: ["vision", "visualization", "goals"], readTime: "10 min" },
  { id: "vision-3", title: "Future Self Exercise", description: "A powerful journaling exercise to connect with your future self and bridge the gap between who you are and who you are becoming.", category: "Vision", type: "exercise", difficulty: "intermediate", content: "**Future Self Journaling Exercise**\n\nSet a timer for 15 minutes. Write a letter FROM your future self (5 years from now) TO your current self.\n\nYour future self should:\n- Describe a typical day in their life\n- Share what they are most proud of\n- Explain what habits got them there\n- Warn about the pitfalls to avoid\n- Offer encouragement for the hard days\n\n**Prompt starters**:\n- 'Dear [name], I am writing to you from [year]. I want you to know that...'\n- 'The thing you are most worried about right now...'\n- 'The habit that changed everything was...'\n- 'I wish you knew that...'\n\n**After writing**: Read it aloud. What is one thing your future self wants you to start doing today?", tags: ["vision", "journaling", "self-discovery"], readTime: "15 min" },
  { id: "goals-1", title: "Milestone Planning: From Big Dream to Action Steps", description: "Learn how to break any ambitious goal into manageable milestones that create momentum and maintain motivation.", category: "Goals", type: "guide", difficulty: "beginner", content: "Big goals feel overwhelming. Milestones make them achievable.\n\n**The Milestone Method**:\n\n1. **Define the Goal**: Write it in one sentence with a deadline\n2. **Work Backward**: Ask 'What needs to be true 1 month before completion?' Then 'What needs to be true 1 month before that?'\n3. **Create 3-5 Milestones**: Each milestone is a significant checkpoint\n4. **Break Milestones into Projects**: Each project is a 1-4 week effort\n5. **Break Projects into Tasks**: Each task is a 1-3 day action\n\n**Example**:\n- Goal: Launch online course by December\n- Milestone 1 (Sep): Course content complete\n- Milestone 2 (Oct): Sales page live\n- Milestone 3 (Nov): Beta test done\n- Project: Record Module 1\n- Task: Write outline for Lesson 1", tags: ["goals", "planning", "milestones"], readTime: "10 min" },
  { id: "goals-2", title: "SMART vs Outcome Goals", description: "Understand the difference between process goals and outcome goals, and when to use each approach.", category: "Goals", type: "article", difficulty: "intermediate", content: "**Outcome Goals vs Process Goals**\n\n**Outcome Goals** define WHAT you want to achieve:\n- 'Lose 10kg in 3 months'\n- 'Get promoted to manager'\n- 'Save $10,000 by December'\n\n**Process Goals** define WHAT YOU WILL DO consistently:\n- 'Exercise 4 times per week'\n- 'Complete one stretch project per month'\n- 'Automate $500/month to savings'\n\n**The Key Insight**: You cannot directly control outcomes, but you can always control your process. The best goal systems use BOTH:\n\n1. Set an inspiring outcome goal\n2. Identify the process goals that will get you there\n3. Track the process goals daily/weekly\n4. Review the outcome goal monthly\n\nThis is why Intenteo tracks both your goals AND your habits - they are two sides of the same coin.", tags: ["goals", "strategy", "planning"], readTime: "7 min" },
  { id: "goals-3", title: "Goal Review Template", description: "A structured template for conducting weekly and monthly goal reviews that keep you on track and adapting.", category: "Goals", type: "template", difficulty: "beginner", content: "**Weekly Goal Review Template**\n\n**1. Progress Check** (5 min)\n- What did I accomplish this week toward my goals?\n- What did I NOT accomplish? Why?\n- Am I on track, ahead, or behind?\n\n**2. Process Review** (5 min)\n- Did I follow my process goals this week?\n- Which habits did I maintain? Which did I miss?\n- What worked well? What needs adjusting?\n\n**3. Next Week Planning** (5 min)\n- What are my top 3 priorities next week?\n- What one thing, if done, would move the needle most?\n- What obstacles might arise and how will I handle them?\n\n**4. Reflection** (5 min)\n- What am I most grateful for this week?\n- What did I learn?\n- How am I growing?", tags: ["goals", "review", "planning"], readTime: "5 min" },
  { id: "habits-1", title: "Habit Stacking: The Power of Linked Routines", description: "Learn the habit stacking technique to seamlessly integrate new habits into your existing daily routine.", category: "Habits", type: "guide", difficulty: "beginner", content: "**Habit Stacking** is the technique of linking a new habit to an existing one.\n\n**The Formula**:\n'After I [CURRENT HABIT], I will [NEW HABIT]'\n\n**Examples**:\n- After I pour my morning coffee, I will write 3 things I am grateful for\n- After I sit down at my desk, I will review my top 3 priorities\n- After I brush my teeth at night, I will read for 10 minutes\n- After I finish lunch, I will take a 5-minute walk\n\n**Why It Works**:\nYour brain already has neural pathways for existing habits. By linking a new behavior to an established one, you piggyback on those existing neural connections.\n\n**Tips**:\n- Start with habits that take less than 2 minutes\n- Keep the stack small (2-3 habits max)\n- Be specific about when and where", tags: ["habits", "routine", "behavior"], readTime: "6 min" },
  { id: "habits-2", title: "Identity-Based Habits: Becoming vs Doing", description: "Shift from outcome-focused habits to identity-focused habits for lasting transformation.", category: "Habits", type: "article", difficulty: "intermediate", content: "**The Most Powerful Way to Change Your Habits**\n\nMost people focus on outcomes: 'I want to lose weight' or 'I want to read more.'\n\nThe most effective approach focuses on identity: 'I am becoming a healthy person' or 'I am a reader.'\n\n**Three Levels of Change**:\n1. **Outcomes**: What you get (results)\n2. **Processes**: What you do (habits and systems)\n3. **Identity**: What you believe (who you are)\n\n**The Shift**:\nInstead of: 'I am trying to quit smoking'\nSay: 'I am not a smoker'\n\nInstead of: 'I want to run a marathon'\nSay: 'I am a runner'\n\n**How to Build Identity Habits**:\n- Every action is a vote for the type of person you want to become\n- Start with one small habit that proves your new identity\n- Each time you show up, you are casting a vote\n- Over time, the votes add up and the identity becomes real", tags: ["habits", "identity", "behavior"], readTime: "8 min" },
  { id: "habits-3", title: "The Habit Troubleshooting Guide", description: "A systematic guide to diagnose why a habit is not sticking and fix the underlying issue.", category: "Habits", type: "checklist", difficulty: "intermediate", content: "**Habit Troubleshooting Checklist**\n\nWhen a habit is not sticking, work through these diagnostic questions:\n\n**1. Is the cue obvious?**\n- [ ] Is there a clear trigger?\n- [ ] Is it tied to an existing routine?\n- [ ] Have you placed visual reminders?\n\n**2. Is the craving attractive?**\n- [ ] Are you pairing it with something enjoyable?\n- [ ] Are you part of a community that does this?\n- [ ] Do you believe this habit aligns with your identity?\n\n**3. Is the response easy?**\n- [ ] Is the habit too big? (Scale it down to 2 minutes)\n- [ ] Do you have everything you need ready?\n- [ ] Is the environment set up for success?\n\n**4. Is the reward satisfying?**\n- [ ] Is there immediate positive feedback?\n- [ ] Are you tracking the habit visually?\n- [ ] Are you celebrating small wins?\n\n**5. Common Fixes**:\n- Habit too big? Make it smaller\n- Wrong time of day? Move it\n- Missing accountability? Add a partner\n- No intrinsic motivation? Reconnect to your 'why'", tags: ["habits", "troubleshooting", "behavior"], readTime: "10 min" },
  { id: "tasks-1", title: "Deep Work: Focused Execution in a Distracted World", description: "Learn the principles of deep work and how to create blocks of uninterrupted focus for your most important tasks.", category: "Tasks", type: "guide", difficulty: "intermediate", content: "**Deep Work** is the ability to focus without distraction on a cognitively demanding task.\n\n**The Deep Work Rules**:\n\n1. **Work Deeply**: Choose your deep work philosophy:\n   - Monastic: Eliminate all distractions (rare)\n   - Bimodal: dedicate defined stretches to deep work\n   - Rhythmic: Same time every day (most practical)\n   - Journalistic: Fit deep work whenever possible\n\n2. **Embrace Boredom**: Do not constantly seek stimulation. Train your focus muscle.\n\n3. **Quit Social Media** (or at least audit ruthlessly)\n\n4. **Drain the Shallows**: Minimize low-value tasks\n\n**How to Start**:\n- Block 90 minutes on your calendar\n- Turn off all notifications\n- Work on ONE task\n- Do not check email or messages\n- Track your deep work hours weekly", tags: ["productivity", "focus", "tasks"], readTime: "8 min" },
  { id: "tasks-2", title: "Time Blocking: Reclaim Your Calendar", description: "Master the time blocking technique to take control of your schedule and ensure your priorities get the time they deserve.", category: "Tasks", type: "guide", difficulty: "beginner", content: "**Time Blocking** is the practice of planning every part of your day in advance.\n\n**How to Time Block**:\n\n1. **Capture everything**: Brain dump all tasks, commitments, and habits\n2. **Estimate time**: Be realistic (add 25% buffer)\n3. **Prioritize**: Use the Eisenhower Matrix (Urgent/Important)\n4. **Block your day**: Assign every hour a specific purpose\n5. **Protect your blocks**: Treat them like appointments\n\n**Sample Time-Blocked Day**:\n- 6:00-7:00 Morning routine (exercise, journaling)\n- 7:00-9:00 Deep work block 1\n- 9:00-9:30 Email and messages\n- 9:30-11:30 Deep work block 2\n- 11:30-12:00 Admin tasks\n- 12:00-1:00 Lunch and rest\n- 1:00-3:00 Meetings and collaboration\n- 3:00-4:30 Deep work block 3\n- 4:30-5:00 Review and plan tomorrow\n\n**Pro Tip**: Leave 30-minute buffers between deep work blocks.", tags: ["productivity", "planning", "tasks"], readTime: "7 min" },
  { id: "tasks-3", title: "The Eisenhower Matrix for Priority Management", description: "Use the urgent-important matrix to categorize tasks and focus on what truly matters.", category: "Tasks", type: "framework", difficulty: "beginner", content: "**The Eisenhower Matrix**\n\n| | Urgent | Not Urgent |\n|---|---|---|\n| **Important** | DO (do immediately) | SCHEDULE (plan time for it) |\n| **Not Important** | DELEGATE (get someone else) | ELIMINATE (remove entirely) |\n\n**Quadrant 1 - DO** (Urgent + Important)\nCrises, deadlines, emergencies. Handle these now.\n\n**Quadrant 2 - SCHEDULE** (Not Urgent + Important)\nPlanning, prevention, relationship building, new opportunities. This is where success comes from. Spend most time here.\n\n**Quadrant 3 - DELEGATE** (Urgent + Not Important)\nSome meetings, many emails, other people's priorities. Delegate or minimize.\n\n**Quadrant 4 - ELIMINATE** (Not Urgent + Not Important)\nTime wasters, excessive social media, busywork. Remove ruthlessly.\n\n**The Goal**: Maximize Quadrant 2 time. This is the secret of highly effective people.", tags: ["productivity", "priorities", "tasks"], readTime: "5 min" },
  { id: "journal-1", title: "100 Reflection Prompts for Self-Awareness", description: "A curated collection of journaling prompts designed to deepen self-understanding and uncover blind spots.", category: "Journal", type: "prompt", difficulty: "beginner", content: "**Morning Prompts**:\n1. What am I most excited about today?\n2. What would make today great?\n3. What am I grateful for right now?\n4. What is my intention for today?\n5. If today had a theme, what would it be?\n\n**Evening Prompts**:\n1. What went well today?\n2. What did I learn?\n3. When did I feel most alive?\n4. What would I do differently?\n5. What am I proud of?\n\n**Deep Reflection Prompts**:\n1. What pattern in my life keeps repeating?\n2. What am I avoiding and why?\n3. What would I do if I were not afraid?\n4. When do I feel most authentic?\n5. What does my ideal day look like?\n\n**Relationship Prompts**:\n1. Who energizes me? Who drains me?\n2. What kind of friend am I being?\n3. What conversation am I avoiding?\n4. How can I show love better today?", tags: ["journaling", "reflection", "self-awareness"], readTime: "10 min" },
  { id: "journal-2", title: "Gratitude Journaling: The Science of Thankfulness", description: "Learn how gratitude journaling rewires your brain for happiness and how to do it effectively.", category: "Journal", type: "article", difficulty: "beginner", content: "**The Science of Gratitude**\n\nResearch shows gratitude journaling:\n- Increases happiness by 25%\n- Improves sleep quality\n- Reduces physical pain\n- Strengthens relationships\n- Builds resilience\n\n**How to Practice**:\n\n1. **Be specific**: Not 'I am grateful for my family' but 'I am grateful my daughter laughed at my joke at dinner tonight'\n\n2. **Feel the emotion**: Do not just write the words. Re-experience the feeling.\n\n3. **Add variety**: Write about different things each day\n\n4. **Include people**: Gratitude toward others is more powerful than gratitude for things\n\n5. **Look for the unexpected**: Notice surprises and delights\n\n**The 3-3-3 Method**:\nWrite 3 things you are grateful for, 3 things that went well, and 3 things you are looking forward to. Takes less than 5 minutes.", tags: ["gratitude", "journaling", "wellbeing"], readTime: "6 min" },
  { id: "journal-3", title: "Decision Journaling Framework", description: "A structured approach to documenting and learning from your decisions over time.", category: "Journal", type: "template", difficulty: "intermediate", content: "**Decision Journal Template**\n\n**The Decision**:\n- Date: ___\n- Decision: ___\n- Stakes: Low / Medium / High\n- Time horizon: Immediate / Short-term / Long-term\n\n**Context**:\n- What options did I consider?\n- What information did I have?\n- Who else was involved?\n- What was my emotional state?\n\n**Reasoning**:\n- Why did I choose this option?\n- What did I believe would happen?\n- What were my key assumptions?\n- What would change my mind?\n\n**Outcome** (fill in 30-90 days later):\n- What actually happened?\n- What did I learn?\n- Were my assumptions correct?\n- What would I do differently?\n\n**The Power of Decision Journaling**:\nOver time, you will see patterns in your decision-making. You will learn which types of decisions you make well and which ones need more careful thought.", tags: ["journaling", "decisions", "learning"], readTime: "8 min" },
  { id: "mindfulness-1", title: "Beginner's Guide to Meditation", description: "Everything you need to start a meditation practice, from your first session to building a lasting habit.", category: "Mindfulness", type: "guide", difficulty: "beginner", content: "**Your First Meditation Session**\n\n**Step 1: Set Up**\n- Find a quiet spot\n- Set a timer for 5 minutes\n- Sit comfortably (chair, cushion, or floor)\n- Close your eyes or soften your gaze\n\n**Step 2: Breathe**\n- Breathe naturally\n- Focus on the sensation of air entering and leaving your nostrils\n- When your mind wanders (it will), gently bring attention back\n\n**Step 3: Handle Thoughts**\n- Thoughts are not failures. They are part of meditation.\n- Notice the thought like a cloud passing\n- Label it gently: 'thinking'\n- Return to your breath\n\n**Step 4: End**\n- Slowly open your eyes\n- Notice how you feel\n- Do not judge the session\n\n**Building the Habit**:\n- Start with 5 minutes daily\n- Increase by 1 minute each week\n- Same time each day (morning is ideal)\n- Consistency matters more than duration", tags: ["meditation", "mindfulness", "beginner"], readTime: "8 min" },
  { id: "mindfulness-2", title: "Breathing Exercises for Every Situation", description: "A collection of evidence-based breathing techniques for stress relief, focus, energy, and sleep.", category: "Mindfulness", type: "exercise", difficulty: "beginner", content: "**5 Breathing Techniques**\n\n**1. Box Breathing (for calm)**\n- Inhale 4 seconds\n- Hold 4 seconds\n- Exhale 4 seconds\n- Hold 4 seconds\n- Repeat 4 times\n\n**2. 4-7-8 Breathing (for sleep)**\n- Inhale 4 seconds\n- Hold 7 seconds\n- Exhale 8 seconds\n- Repeat 3 times\n\n**3. Energizing Breath (for energy)**\n- Quick, forceful inhales through nose\n- Quick, forceful exhales through mouth\n- 30 breaths in 30 seconds\n- Then normal breathing\n\n**4. Extended Exhale (for anxiety)**\n- Inhale for 4 seconds\n- Exhale for 8 seconds\n- The longer exhale activates your parasympathetic nervous system\n\n**5. Morning Breath (for focus)**\n- Deep inhale through nose (4 sec)\n- Hold (4 sec)\n- Exhale through mouth (6 sec)\n- Repeat 5 times", tags: ["breathing", "mindfulness", "stress"], readTime: "5 min" },
  { id: "mindfulness-3", title: "The Scientific Benefits of Mindfulness", description: "Research-backed evidence showing how mindfulness practice transforms your brain, body, and behavior.", category: "Mindfulness", type: "article", difficulty: "beginner", content: "**What Science Says About Mindfulness**\n\n**Brain Changes** (Harvard, 2011):\n- 8 weeks of meditation increased gray matter in the hippocampus (learning and memory)\n- Decreased gray matter in the amygdala (stress and fear)\n\n**Stress Reduction** (American Psychological Association):\n- Mindfulness-based stress reduction (MBSR) reduces cortisol levels\n- Participants reported 31% reduction in perceived stress\n\n**Emotional Regulation** (JAMA Internal Medicine, 2014):\n- Mindfulness meditation reduced anxiety by 38%\n- Reduced depression by 31%\n- Reduced chronic pain by 28%\n\n**Focus and Productivity** (University of Washington, 2013):\n- Meditators stayed on task 40% longer\n- Switched tasks less frequently\n- Reported less negative emotion after task-switching\n\n**Physical Health**:\n- Lower blood pressure\n- Improved immune function\n- Better sleep quality\n- Reduced chronic inflammation\n\nThe evidence is clear: regular mindfulness practice fundamentally changes your brain and body for the better.", tags: ["mindfulness", "science", "research"], readTime: "10 min" },
  { id: "mindfulness-4", title: "Mindful Walking Practice", description: "A guided practice for turning your daily walk into a mindfulness session that grounds and restores you.", category: "Mindfulness", type: "exercise", difficulty: "beginner", content: "**Mindful Walking Practice**\n\nThis practice transforms a regular walk into a meditation in motion.\n\n**How to Practice**:\n\n1. **Start Standing**: Feel your feet on the ground. Notice the weight distribution.\n\n2. **Begin Walking Slowly**: Half your normal speed. Feel each step.\n\n3. **Focus on Sensations**:\n   - Heel touches ground\n   - Weight transfers forward\n   - Toes press off\n   - Foot lifts\n\n4. **Engage Your Senses**:\n   - What do you see? (colors, light, movement)\n   - What do you hear? (birds, wind, distant sounds)\n   - What do you feel? (air on skin, ground underfoot)\n\n5. **When Your Mind Wanders**: Gently bring attention back to your feet.\n\n6. **Duration**: 10-20 minutes\n\n**Best Settings**:\n- Nature (parks, trails, gardens)\n- Quiet streets early morning\n- Indoor hallways when weather is poor\n\n**When to Use**:\n- When feeling anxious or overwhelmed\n- As a morning centering practice\n- During a lunch break reset", tags: ["walking", "mindfulness", "exercise"], readTime: "5 min" },
  { id: "health-1", title: "Sleep Hygiene: The Complete Guide", description: "Evidence-based strategies to improve your sleep quality, fall asleep faster, and wake up refreshed.", category: "Health", type: "guide", difficulty: "beginner", content: "**The Sleep Hygiene Checklist**\n\n**Environment**:\n- [ ] Room temperature: 65-68F (18-20C)\n- [ ] Complete darkness (blackout curtains or eye mask)\n- [ ] Quiet environment (earplugs or white noise)\n- [ ] Comfortable mattress and pillows\n- [ ] No screens in bedroom\n\n**Routine**:\n- [ ] Same bedtime every night (even weekends)\n- [ ] Same wake time every morning\n- [ ] Wind-down routine 60 minutes before bed\n- [ ] No caffeine after 2 PM\n- [ ] No heavy meals 3 hours before bed\n\n**Evening Habits**:\n- [ ] Dim lights 2 hours before bed\n- [ ] Read (physical book, not screens)\n- [ ] Light stretching or breathing exercises\n- [ ] Journal or brain dump worries\n- [ ] Avoid stimulating content\n\n**What to Avoid**:\n- Screens 1 hour before bed (blue light blocks melatonin)\n- Alcohol before bed (disrupts REM sleep)\n- Naps longer than 20 minutes\n- Irregular sleep schedule", tags: ["sleep", "health", "routine"], readTime: "8 min" },
  { id: "health-2", title: "Evening Wind-Down Routine", description: "Create a calming pre-sleep ritual that signals to your body and mind that it is time to rest.", category: "Health", type: "template", difficulty: "beginner", content: "**Evening Wind-Down Template**\n\n**90 Minutes Before Bed**:\n- Dim all lights in your home\n- Put away work devices\n- Light conversation with family or quiet activity\n\n**60 Minutes Before Bed**:\n- Put phone on Do Not Disturb\n- Make a cup of herbal tea (chamomile, valerian, or peppermint)\n- Light stretching or gentle yoga (5-10 min)\n- Take a warm shower or bath\n\n**30 Minutes Before Bed**:\n- Read a physical book (fiction or light non-fiction)\n- Practice gratitude journaling (3 things)\n- Do a breathing exercise (4-7-8 technique)\n- Review tomorrow (brief planning, not problem-solving)\n\n**In Bed**:\n- 5 minutes of body scan meditation\n- Focus on slow, deep breathing\n- If mind is racing: write thoughts on bedside notepad\n\n**Consistency is Key**: Your body will learn this routine and begin preparing for sleep automatically.", tags: ["sleep", "routine", "health"], readTime: "6 min" },
  { id: "health-3", title: "Understanding Your Circadian Rhythm", description: "Learn how your internal body clock works and how to align your schedule with it for optimal energy and health.", category: "Health", type: "article", difficulty: "intermediate", content: "**Your Circadian Rhythm Explained**\n\nYour body runs on a 24-hour internal clock that regulates sleep, energy, hormones, and body temperature.\n\n**Key Hormone Cycles**:\n- **6-8 AM**: Cortisol peaks (wake up, feel alert)\n- **10 AM - 2 PM**: Peak cognitive performance\n- **2-4 PM**: Post-lunch dip (natural low point)\n- **5-7 PM**: Peak physical performance\n- **9-10 PM**: Melatonin rises (prepare for sleep)\n- **2-4 AM**: Deepest sleep, lowest body temperature\n\n**How to Align With Your Rhythm**:\n\n1. **Morning (6-10 AM)**: Get sunlight within 30 minutes of waking. This resets your clock.\n2. **Midday (10 AM-2 PM)**: Do your most demanding cognitive work.\n3. **Afternoon (2-5 PM)**: Schedule meetings, admin, or light tasks.\n4. **Evening (5-9 PM)**: Exercise, socialize, light activities.\n5. **Night (9-10 PM)**: Wind down, dim lights, prepare for sleep.\n\n**The #1 Mistake**: Using bright screens after 9 PM. Blue light suppresses melatonin by up to 50%.", tags: ["sleep", "health", "rhythm"], readTime: "9 min" },
  { id: "learning-1", title: "Speed Reading Techniques", description: "Practical techniques to increase your reading speed without sacrificing comprehension.", category: "Learning", type: "guide", difficulty: "intermediate", content: "**Speed Reading Fundamentals**\n\n**The Problem**: Most people read at 200-250 words per minute. With training, you can reach 400-700+ wpm.\n\n**Technique 1: Reduce Subvocalization**\n- Subvocalizing (saying words in your head) limits speed\n- Use a finger or pen to guide your eyes\n- Focus on groups of words, not individual words\n\n**Technique 2: Expand Peripheral Vision**\n- Instead of focusing on one word, see 3-5 words at once\n- Practice by widening your focus on each line\n- Use a pacer (finger or pen) to guide your eyes\n\n**Technique 3: Chunking**\n- Group words into meaningful phrases\n- Instead of 'the/cat/sat/on/the/mat'\n- Read: 'the cat sat on the mat'\n\n**Technique 4: Regression Elimination**\n- Stop going back to re-read\n- Trust your comprehension\n- If something is important, it will appear again\n\n**Practice Plan**:\n- Week 1-2: Practice with easy material (fiction)\n- Week 3-4: Increase speed by 20%\n- Week 5-6: Apply to professional reading\n- Ongoing: Track your words per minute", tags: ["reading", "learning", "speed"], readTime: "8 min" },
  { id: "learning-2", title: "Effective Note-Taking Systems", description: "Compare and choose the best note-taking method for your learning style and goals.", category: "Learning", type: "guide", difficulty: "beginner", content: "**5 Note-Taking Systems Compared**\n\n**1. Cornell Method**\nDivide page into 3 sections: cues (left), notes (right), summary (bottom)\nBest for: Lectures, structured learning\n\n**2. Mind Mapping**\nStart with central idea, branch out with related concepts\nBest for: Brainstorming, creative projects, visual learners\n\n**3. Outline Method**\nHierarchical bullet points with main topics and subtopics\nBest for: Organized note-takers, technical material\n\n**4. Zettelkasten (Slip Box)**\nEach idea on its own card, linked to related ideas\nBest for: Researchers, writers, long-term knowledge building\n\n**5. Progressive Summarization**\nTake notes, then progressively highlight and distill key points\nBest for: Digital note-takers, content creators\n\n**Choosing Your System**:\n- Student? Cornell or Outline\n- Creative? Mind Mapping\n- Researcher? Zettelkasten\n- Knowledge worker? Progressive Summarization\n\n**The Key**: The best system is the one you actually use consistently.", tags: ["learning", "notes", "productivity"], readTime: "7 min" },
  { id: "productivity-1", title: "The Two-Minute Rule", description: "David Allen's simple rule that eliminates procrastination and builds momentum for your most important tasks.", category: "Productivity", type: "framework", difficulty: "beginner", content: "**The Two-Minute Rule** (from Getting Things Done)\n\n**Rule 1**: If it takes less than 2 minutes, do it NOW.\n- Responding to a quick email\n- Filing a document\n- Making a quick phone call\n- Putting something away\n\n**Rule 2**: When starting a new habit, it should take less than 2 minutes.\n- 'Read before bed' becomes 'read one page'\n- 'Run 3 miles' becomes 'put on running shoes'\n- 'Study for exam' becomes 'open notebook'\n\n**Why It Works**:\n- Eliminates the buildup of small tasks\n- Creates momentum for bigger tasks\n- Builds the habit of starting\n- Reduces mental clutter\n\n**The Insight**: The habit of starting is more important than the habit of finishing. Once you start, continuing becomes natural.\n\n**Apply to Intenteo**: When you open the app, what is the 2-minute action that moves you forward? Check one task. Log one habit. Write one sentence in your journal.", tags: ["productivity", "habits", "efficiency"], readTime: "4 min" },
  { id: "productivity-2", title: "Planning Techniques That Actually Work", description: "Master the weekly, daily, and monthly planning rituals that top performers use to stay focused and effective.", category: "Productivity", type: "guide", difficulty: "beginner", content: "**The Planning Ritual**\n\n**Weekly Review (Sunday, 30 min)**:\n1. Review last week: What was accomplished? What was not?\n2. Check calendar for upcoming commitments\n3. Identify top 3 goals for the week\n4. Schedule deep work blocks\n5. Plan meals and exercise\n6. Set intentions\n\n**Daily Planning (Evening, 5 min)**:\n1. Review tomorrow's calendar\n2. Choose top 3 priorities\n3. Time-block your day\n4. Prepare anything needed (clothes, documents, meals)\n\n**Monthly Review (First of month, 60 min)**:\n1. Review goals and milestones\n2. Assess progress on projects\n3. Check finances\n4. Plan major commitments\n5. Set monthly focus areas\n6. Celebrate wins\n\n**The Golden Rule**: Plan the week, win the day. Do not skip your planning ritual.", tags: ["productivity", "planning", "goals"], readTime: "7 min" },
  { id: "leadership-1", title: "The Art of Influence Without Authority", description: "Learn how to lead, inspire, and create change even when you do not have formal power or position.", category: "Leadership", type: "article", difficulty: "intermediate", content: "**Leading Without Authority**\n\nMost leadership happens without a title. Here is how to influence effectively:\n\n**1. Build Trust First**\n- Be consistent in your words and actions\n- Follow through on small commitments\n- Be honest, even when it is uncomfortable\n- Show genuine interest in others\n\n**2. Understand Others' Goals**\n- Ask: What does this person care about?\n- Find alignment between their goals and yours\n- Frame your ideas in terms of their benefits\n- Listen more than you speak\n\n**3. Create Quick Wins**\n- Start with small, achievable changes\n- Build momentum through early success\n- Use success to gain support for bigger changes\n\n**4. Be the Solution**\n- Identify problems others are ignoring\n- Propose solutions, not just complaints\n- Take initiative without being asked\n- Make your leader's job easier\n\n**5. Develop Your Network**\n- Help others without expecting anything in return\n- Connect people who would benefit from knowing each other\n- Be known as someone who adds value", tags: ["leadership", "influence", "communication"], readTime: "8 min" },
  { id: "finance-1", title: "Budgeting for Beginners", description: "A simple, practical guide to creating and maintaining a budget that actually works for your lifestyle.", category: "Finance", type: "guide", difficulty: "beginner", content: "**The Simple Budget Framework**\n\n**Step 1: Calculate Income**\n- All sources of regular income\n- Use your take-home (after-tax) amount\n\n**Step 2: Track Spending**\n- Review last 2 months of bank statements\n- Categorize every expense\n\n**Step 3: Apply the 50/30/20 Rule**\n- 50% Needs: Rent, food, transport, utilities, insurance\n- 30% Wants: Entertainment, dining out, hobbies, shopping\n- 20% Savings & Debt: Emergency fund, investments, debt payoff\n\n**Step 4: Automate**\n- Set up automatic transfers for savings\n- Pay bills automatically\n- Use separate accounts for spending and savings\n\n**Step 5: Review Weekly**\n- 10-minute check every Sunday\n- Compare actual vs planned spending\n- Adjust for the coming week\n\n**The Key Insight**: A budget is not about restricting yourself. It is about being intentional with your money so it goes toward what matters most.", tags: ["finance", "budgeting", "money"], readTime: "8 min" },
  { id: "finance-2", title: "Building an Emergency Fund", description: "Why every person needs an emergency fund and the step-by-step plan to build one from zero.", category: "Finance", type: "guide", difficulty: "beginner", content: "**Your Emergency Fund Roadmap**\n\n**Why It Matters**:\n- 78% of Americans live paycheck to paycheck\n- Unexpected expenses are the #1 cause of debt\n- An emergency fund prevents financial spirals\n\n**The Target**: 3-6 months of essential expenses\n\n**How to Calculate**:\n- Monthly rent/mortgage: ___\n- Monthly food: ___\n- Monthly transport: ___\n- Monthly utilities: ___\n- Monthly insurance: ___\n- Total essentials: ___\n- Emergency fund target: ___ x 3-6\n\n**The Build-Up Plan**:\n\n**Phase 1: Starter Fund ($1,000)**\n- Sell unused items\n- Pick up extra work\n- Cut one expense for 3 months\n- Timeline: 1-3 months\n\n**Phase 2: One Month of Expenses**\n- Automate $50-200/month to savings\n- Redirect windfalls (tax refunds, bonuses)\n- Timeline: 3-6 months\n\n**Phase 3: Full Fund (3-6 months)**\n- Continue automating\n- Increase contributions with income growth\n- Timeline: 12-24 months\n\n**Where to Keep It**: High-yield savings account (accessible but separate from daily checking)", tags: ["finance", "savings", "emergency"], readTime: "7 min" },
  { id: "relationships-1", title: "Active Listening: The Most Undervalued Skill", description: "Learn the art of truly hearing others and how it transforms every relationship in your life.", category: "Relationships", type: "guide", difficulty: "beginner", content: "**The 5 Levels of Listening**\n\n**Level 1: Ignoring** - Not listening at all\n**Level 2: Pretend Listening** - 'Uh-huh, yeah, right'\n**Level 3: Selective Listening** - Hearing only parts\n**Level 4: Attentive Listening** - Hearing all words\n**Level 5: Empathic Listening** - Understanding the feeling behind the words\n\n**How to Practice Empathic Listening**:\n\n1. **Be Present**: Put away your phone. Make eye contact. Face the person.\n\n2. **Do Not Interrupt**: Let them finish completely. Count to 3 after they stop.\n\n3. **Reflect Back**: 'It sounds like you are feeling...'\n\n4. **Ask Questions**: 'Can you tell me more about...?'\n\n5. **Validate**: 'That makes sense because...'\n\n6. **Do Not Fix**: Most people want to be heard, not solved.\n\n**The Impact**: People who feel truly listened to trust more deeply, share more openly, and feel more connected. This is the foundation of every strong relationship.", tags: ["relationships", "communication", "listening"], readTime: "7 min" },
  { id: "faith-1", title: "A Guide to Personal Prayer", description: "A practical guide to developing a meaningful, consistent prayer life that deepens your spiritual connection.", category: "Faith", type: "guide", difficulty: "beginner", content: "**Developing Your Prayer Life**\n\n**The ACTS Model**:\n- **A**doration: Praise God for who He is\n- **C**onfession: Acknowledge areas where you fall short\n- **T**hanksgiving: Express gratitude for what He has done\n- **S**upplication: Present your requests and needs\n\n**Practical Tips**:\n\n1. **Set a Time**: Morning prayer sets the tone for the day\n2. **Find a Quiet Place**: Minimize distractions\n3. **Start Small**: 5 minutes is enough to begin\n4. **Use a Journal**: Write your prayers to stay focused\n5. **Be Honest**: God already knows your heart\n6. **Listen**: Prayer is a conversation, not a monologue\n\n**When You Do Not Know What to Pray**:\n- Pray Scripture\n- Pray for others\n- Simply sit in God's presence\n- Say: 'Lord, I do not know what to pray, but you know what I need'\n\n**The Goal**: Not perfect words, but authentic connection.", tags: ["faith", "prayer", "spiritual"], readTime: "6 min" },
  { id: "faith-2", title: "Bible Study Methods for Beginners", description: "Simple, effective methods for studying Scripture that lead to understanding and application.", category: "Faith", type: "guide", difficulty: "beginner", content: "**4 Bible Study Methods**\n\n**1. SOAP Method**\n- **S**cripture: Write the verse that stands out\n- **O**bservation: What do you notice? Context, meaning, key words\n- **A**pplication: How does this apply to your life today?\n- **P**rayer: Pray about what you learned\n\n**2. Chapter Summary Method**\n- Read the chapter through once\n- Summarize each paragraph in one sentence\n- Identify the main theme\n- Note any commands, promises, or warnings\n\n**3. Word Study**\n- Choose a key word from the passage\n- Look up its meaning in a concordance\n- See how it is used elsewhere in Scripture\n- Reflect on its significance\n\n**4. Compare and Contrast**\n- Read two passages on the same topic\n- Note similarities and differences\n- Ask: What is God teaching through both?\n\n**Getting Started**:\n- Start with the Gospel of John\n- Read one chapter per day\n- Use one method per week\n- Journal what you learn", tags: ["faith", "bible", "study"], readTime: "8 min" },
  { id: "growth-1", title: "The Growth Mindset: Embracing Challenges", description: "Understand the difference between fixed and growth mindsets and how it shapes your potential.", category: "Personal Growth", type: "article", difficulty: "beginner", content: "**Fixed vs Growth Mindset**\n\n**Fixed Mindset** (Carol Dweck):\n- 'I am either good at this or I am not'\n- Avoids challenges\n- Gives up easily\n- Sees effort as pointless\n- Ignores useful criticism\n\n**Growth Mindset**:\n- 'I can improve with effort and strategy'\n- Embraces challenges\n- Persists through setbacks\n- Sees effort as the path to mastery\n- Learns from criticism\n\n**How to Develop a Growth Mindset**:\n\n1. **Add 'yet'**: 'I cannot do this... yet'\n\n2. **Celebrate effort, not just results**: 'You worked really hard on that'\n\n3. **Reframe failure**: 'What did I learn?' instead of 'I failed'\n\n4. **Ask for feedback**: Seek constructive criticism\n\n5. **Study how experts began**: Everyone started as a beginner\n\n**The Key Insight**: Your abilities are not fixed. Your brain is like a muscle that grows stronger with use. Every challenge is an opportunity to grow.", tags: ["growth", "mindset", "personal"], readTime: "6 min" },
  { id: "growth-2", title: "Breaking Bad Habits: The Evidence-Based Approach", description: "Science-backed strategies for eliminating unwanted behaviors and replacing them with positive ones.", category: "Personal Growth", type: "guide", difficulty: "beginner", content: "**How to Break a Bad Habit**\n\n**Understanding the Habit Loop**:\n- **Cue**: The trigger that starts the behavior\n- **Routine**: The behavior itself\n- **Reward**: The benefit you get from the behavior\n\n**The Strategy**: Do NOT try to eliminate a habit. REPLACE it.\n\n**Step 1: Identify the Cue**\n- Where are you? What time is it? Who is around?\n- What emotion are you feeling?\n- What immediately preceded the behavior?\n\n**Step 2: Understand the Reward**\n- What need is this habit meeting?\n- Boredom? Stress? Loneliness? Hunger?\n\n**Step 3: Find a Better Routine**\n- Boredom: Read, go for a walk, call a friend\n- Stress: Deep breathing, stretching, journaling\n- Loneliness: Reach out to someone, visit a community\n- Hunger: Healthy snack, water, tea\n\n**Step 4: Change Your Environment**\n- Remove cues for the bad habit\n- Add cues for the good habit\n- Make the bad habit difficult and the good habit easy\n\n**The 21-Day Myth**: Habits do not form in 21 days. Research shows 66 days on average. Be patient.", tags: ["habits", "behavior", "growth"], readTime: "8 min" },
]

export const MODULE_RESOURCES: Record<ModuleKey, { title: string; resources: Resource[] }> = {
  today: {
    title: "Living Intentionally",
    resources: [
      { id: "today-1", title: "Living with Purpose Every Day", description: "How to align your daily actions with your deeper purpose and values.", category: "Purpose", type: "guide", difficulty: "beginner", content: "", tags: ["intentional", "daily"], readTime: "5 min" },
      { id: "today-2", title: "Morning Routines That Set You Up for Success", description: "Design a morning routine that energizes and focuses you for the day ahead.", category: "Productivity", type: "guide", difficulty: "beginner", content: "", tags: ["morning", "routine"], readTime: "6 min" },
      { id: "today-3", title: "The Power of Daily Intentions", description: "Why setting a daily intention transforms how you show up in every area of life.", category: "Purpose", type: "article", difficulty: "beginner", content: "", tags: ["intention", "purpose"], readTime: "4 min" },
      { id: "today-4", title: "Evening Reviews: Closing Your Day with Clarity", description: "A simple evening practice to reflect, learn, and prepare for tomorrow.", category: "Journal", type: "exercise", difficulty: "beginner", content: "", tags: ["evening", "reflection"], readTime: "5 min" },
      { id: "today-5", title: "Daily Planning with Intention", description: "Move beyond to-do lists. Plan your day around what truly matters.", category: "Productivity", type: "guide", difficulty: "beginner", content: "", tags: ["planning", "daily"], readTime: "5 min" },
    ],
  },
  goals: {
    title: "Goal Setting & Achievement",
    resources: [
      { id: "goals-r1", title: "The Science of Goal Achievement", description: "Research-backed strategies for setting and achieving meaningful goals.", category: "Goals", type: "guide", difficulty: "beginner", content: "", tags: ["goals", "achievement"], readTime: "8 min" },
      { id: "goals-r2", title: "Overcoming Goal Obstacles", description: "Common reasons goals fail and how to overcome each one.", category: "Goals", type: "article", difficulty: "beginner", content: "", tags: ["goals", "obstacles"], readTime: "6 min" },
    ],
  },
  habits: {
    title: "Building Lasting Habits",
    resources: [
      { id: "habits-r1", title: "The Habit Loop Explained", description: "Understanding the science behind why habits form and how to hack the system.", category: "Habits", type: "guide", difficulty: "beginner", content: "", tags: ["habits", "science"], readTime: "7 min" },
      { id: "habits-r2", title: "30-Day Habit Challenge", description: "A structured challenge to build one new habit in 30 days.", category: "Habits", type: "exercise", difficulty: "beginner", content: "", tags: ["habits", "challenge"], readTime: "5 min" },
    ],
  },
  journal: {
    title: "Journaling for Growth",
    resources: [
      { id: "journal-r1", title: "Journaling for Self-Discovery", description: "Use journaling as a tool for deeper self-understanding.", category: "Journal", type: "guide", difficulty: "beginner", content: "", tags: ["journaling", "self-discovery"], readTime: "6 min" },
      { id: "journal-r2", title: "5 Journaling Prompts for Clarity", description: "Quick prompts to help you gain clarity on any situation.", category: "Journal", type: "prompt", difficulty: "beginner", content: "", tags: ["journaling", "prompts"], readTime: "4 min" },
    ],
  },
  visions: {
    title: "Creating Your Life Vision",
    resources: [
      { id: "visions-r1", title: "The Power of Vision", description: "Why having a clear life vision is the foundation of intentional living.", category: "Vision", type: "guide", difficulty: "beginner", content: "", tags: ["vision", "purpose"], readTime: "7 min" },
      { id: "visions-r2", title: "Vision Board Workshop", description: "A step-by-step workshop for creating your digital vision board.", category: "Vision", type: "exercise", difficulty: "beginner", content: "", tags: ["vision", "workshop"], readTime: "10 min" },
    ],
  },
  tasks: {
    title: "Productive Task Management",
    resources: [
      { id: "tasks-r1", title: "Mastering Your To-Do List", description: "Transform your task management from chaotic to strategic.", category: "Tasks", type: "guide", difficulty: "beginner", content: "", tags: ["tasks", "productivity"], readTime: "5 min" },
      { id: "tasks-r2", title: "The Art of Prioritization", description: "Learn to identify and focus on what truly matters.", category: "Tasks", type: "framework", difficulty: "beginner", content: "", tags: ["tasks", "priorities"], readTime: "6 min" },
    ],
  },
}

// ══════════════════════════════════════════════════════════════
// REMINDER SOUNDS (lib/reminder-sounds.ts)
// ══════════════════════════════════════════════════════════════

export interface ReminderSound {
  id: string
  name: string
  description: string
  category: "chime" | "nature" | "digital" | "instrument"
  frequency?: string
}

export const REMINDER_SOUNDS: ReminderSound[] = [
  { id: "default", name: "Default Intenteo", description: "The classic Intenteo notification sound", category: "digital" },
  { id: "soft-chime", name: "Soft Chime", description: "A gentle, warm chime that is pleasant without being disruptive", category: "chime" },
  { id: "gentle-bell", name: "Gentle Bell", description: "A soft bell tone perfect for mindfulness reminders", category: "chime" },
  { id: "morning-birds", name: "Morning Birds", description: "Peaceful birdsong to start your day with calm energy", category: "nature" },
  { id: "wind-chimes", name: "Wind Chimes", description: "Delicate wind chimes that create a serene atmosphere", category: "chime" },
  { id: "rain-drop", name: "Rain Drop", description: "The gentle sound of rain falling on leaves", category: "nature" },
  { id: "ocean-wave", name: "Ocean Wave", description: "A calming wave that washes over you with tranquility", category: "nature" },
  { id: "forest", name: "Forest", description: "Ambient forest sounds with birds and rustling leaves", category: "nature" },
  { id: "piano", name: "Piano", description: "A soft piano note that is elegant and refined", category: "instrument" },
  { id: "minimal-digital", name: "Minimal Digital", description: "A clean, modern digital tone that is subtle and professional", category: "digital" },
  { id: "classic-notification", name: "Classic Notification", description: "A familiar, reliable notification sound", category: "digital" },
  { id: "soft-gong", name: "Soft Gong", description: "A resonant gong that gently draws your attention", category: "instrument" },
]

export const SOUND_CATEGORIES = [
  { id: "all" as const, label: "All Sounds" },
  { id: "chime" as const, label: "Chimes" },
  { id: "nature" as const, label: "Nature" },
  { id: "digital" as const, label: "Digital" },
  { id: "instrument" as const, label: "Instruments" },
]

// ══════════════════════════════════════════════════════════════
// TRACKER TEMPLATES (components/trackers/tracker-templates.ts)
// ══════════════════════════════════════════════════════════════

export type TrackerCategory = "All" | "Mental Wellness" | "Health" | "Fitness" | "Lifestyle" | "Finance" | "Content Creation" | "Education" | "Business" | "Mindfulness" | "Custom"

export type ChartType = "line" | "bar" | "calendar_heatmap" | "pie" | "progress_ring" | "streak_counter"

export type MeasurementUnit = "hours" | "minutes" | "seconds" | "days" | "weeks" | "months" | "years" | "km" | "m" | "steps" | "calories" | "litres" | "ml" | "pages" | "books" | "reps" | "kg" | "lbs" | "naira" | "dollar" | "euro" | "percent" | "points" | "custom"

export type TrackerFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "yearly"

export interface TrackerMetric {
  id: string
  name: string
  unit: MeasurementUnit
  customUnit?: string
}

export interface TrackerTemplate {
  id: string
  name: string
  description: string
  category: TrackerCategory
  icon: string
  color: string
  colorHex: string
  features: string[]
  targetAudience: string
  whatItAchieves: string
  metrics: TrackerMetric[]
  supportedCharts: ChartType[]
  defaultFrequency: TrackerFrequency
  defaultTarget?: number
  previewSections: string[]
  benefits: string[]
}

export interface PinnedTracker {
  trackerId: string
  pinnedAt: string
  customName?: string
}

export interface CustomTrackerConfig {
  name: string
  category: TrackerCategory
  icon: string
  colorHex: string
  unit: MeasurementUnit
  customUnit?: string
  frequency: TrackerFrequency
  targetValue?: number
  reminderEnabled: boolean
  notes: string
  preferredCharts: ChartType[]
  showOnDashboard: boolean
  enableNotifications: boolean
}

export const TRACKER_CATEGORIES: TrackerCategory[] = [
  "All", "Mental Wellness", "Health", "Fitness", "Mindfulness", "Lifestyle", "Business", "Finance", "Education", "Content Creation", "Custom"
]

export const MEASUREMENT_UNITS: { value: MeasurementUnit; label: string }[] = [
  { value: "hours", label: "Hours" },
  { value: "minutes", label: "Minutes" },
  { value: "seconds", label: "Seconds" },
  { value: "days", label: "Days" },
  { value: "weeks", label: "Weeks" },
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
  { value: "km", label: "Kilometers" },
  { value: "m", label: "Meters" },
  { value: "steps", label: "Steps" },
  { value: "calories", label: "Calories" },
  { value: "litres", label: "Litres" },
  { value: "ml", label: "Millilitres" },
  { value: "pages", label: "Pages" },
  { value: "books", label: "Books" },
  { value: "reps", label: "Repetitions" },
  { value: "kg", label: "Kilograms" },
  { value: "lbs", label: "Pounds" },
  { value: "naira", label: "₦ (Naira)" },
  { value: "dollar", label: "$ (Dollar)" },
  { value: "euro", label: "€ (Euro)" },
  { value: "percent", label: "%" },
  { value: "points", label: "Points" },
  { value: "custom", label: "Custom..." },
]

export const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "line", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "calendar_heatmap", label: "Calendar Heatmap" },
  { value: "pie", label: "Pie Chart" },
  { value: "progress_ring", label: "Progress Ring" },
  { value: "streak_counter", label: "Streak Counter" },
]

export const TRACKER_TEMPLATES: TrackerTemplate[] = [
  {
    id: "mood",
    name: "Mood Tracker",
    description: "Track your emotions, identify patterns, and improve your emotional well-being over time.",
    category: "Mental Wellness",
    icon: "😊",
    color: "purple",
    colorHex: "#8B5CF6",
    features: ["Daily mood logging", "Emotion tagging", "Pattern recognition", "Mood trends over time", "Journal integration", "Weekly insights"],
    targetAudience: "Anyone who wants to understand their emotional patterns and improve mental health",
    whatItAchieves: "Build emotional awareness, identify triggers, and develop healthier coping strategies through consistent tracking.",
    metrics: [
      { id: "mood_score", name: "Mood Score", unit: "points" },
      { id: "energy_level", name: "Energy Level", unit: "points" },
    ],
    supportedCharts: ["line", "calendar_heatmap", "pie"],
    defaultFrequency: "daily",
    previewSections: ["Mood calendar", "Emotion breakdown chart", "Weekly trend line", "Streak counter"],
    benefits: ["Understand emotional triggers", "Track mood over weeks and months", "Identify patterns and correlations", "Improve self-awareness"],
  },
  {
    id: "period",
    name: "Period Tracker",
    description: "Track menstrual cycles, symptoms, moods, ovulation, and important health insights.",
    category: "Health",
    icon: "🌸",
    color: "pink",
    colorHex: "#EC4899",
    features: ["Cycle tracking", "Symptom logging", "Ovulation prediction", "Period calendar", "Flow intensity", "Health insights"],
    targetAudience: "People who want to track their menstrual cycle and reproductive health",
    whatItAchieves: "Gain insights into cycle patterns, predict upcoming periods, and track symptoms for better health management.",
    metrics: [
      { id: "cycle_day", name: "Cycle Day", unit: "days" },
      { id: "symptoms", name: "Symptoms", unit: "points" },
    ],
    supportedCharts: ["calendar_heatmap", "line", "bar"],
    defaultFrequency: "daily",
    previewSections: ["Cycle calendar", "Symptom frequency chart", "Cycle length history", "Ovulation predictor"],
    benefits: ["Understand your cycle patterns", "Predict upcoming periods", "Track symptoms and mood changes", "Plan activities around your cycle"],
  },
  {
    id: "weight",
    name: "Weight Tracker",
    description: "Monitor weight changes, BMI, body measurements, and long-term health progress.",
    category: "Fitness",
    icon: "⚖️",
    color: "blue",
    colorHex: "#3B82F6",
    features: ["Daily weight logging", "BMI calculation", "Body measurements", "Progress photos", "Goal setting", "Trend analysis"],
    targetAudience: "Anyone looking to manage their weight, build healthier habits, or achieve fitness goals",
    whatItAchieves: "Track weight changes over time, visualize progress toward goals, and maintain accountability.",
    metrics: [
      { id: "weight", name: "Weight", unit: "kg" },
      { id: "body_fat", name: "Body Fat", unit: "percent" },
    ],
    supportedCharts: ["line", "bar", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 70,
    previewSections: ["Weight trend line", "BMI indicator", "Goal progress ring", "Weekly comparison"],
    benefits: ["Visualize weight trends over time", "Set and track realistic goals", "Maintain accountability", "Identify patterns in progress"],
  },
  {
    id: "exercise",
    name: "Exercise Tracker",
    description: "Track workouts, exercise routines, cardio sessions, strength training, and activity streaks.",
    category: "Fitness",
    icon: "🏃",
    color: "green",
    colorHex: "#22C55E",
    features: ["Workout logging", "Exercise library", "Duration tracking", "Calorie burn", "Streak tracking", "Progress photos"],
    targetAudience: "Fitness enthusiasts, athletes, and anyone building an exercise routine",
    whatItAchieves: "Stay consistent with workouts, track improvements, and build lasting exercise habits.",
    metrics: [
      { id: "duration", name: "Duration", unit: "minutes" },
      { id: "calories", name: "Calories Burned", unit: "calories" },
    ],
    supportedCharts: ["bar", "line", "streak_counter", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 30,
    previewSections: ["Workout calendar", "Duration bar chart", "Streak counter", "Weekly summary"],
    benefits: ["Build consistent exercise habits", "Track workout progress over time", "Stay motivated with streaks", "Measure fitness improvements"],
  },
  {
    id: "lifestyle",
    name: "Lifestyle Tracker",
    description: "Build healthy routines by tracking sleep, water intake, meditation, reading, screen time, and other daily habits.",
    category: "Lifestyle",
    icon: "🌱",
    color: "emerald",
    colorHex: "#10B981",
    features: ["Sleep tracking", "Water intake", "Meditation time", "Reading habits", "Screen time", "Custom habits"],
    targetAudience: "Anyone who wants to build healthier daily routines and track lifestyle habits",
    whatItAchieves: "Develop balanced daily routines, improve sleep quality, increase water intake, and reduce screen time.",
    metrics: [
      { id: "sleep_hours", name: "Sleep Hours", unit: "hours" },
      { id: "water", name: "Water Intake", unit: "litres" },
    ],
    supportedCharts: ["bar", "line", "calendar_heatmap", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 8,
    previewSections: ["Sleep trend chart", "Water intake tracker", "Habit completion heatmap", "Weekly averages"],
    benefits: ["Build healthier daily routines", "Improve sleep quality", "Stay hydrated", "Reduce screen time"],
  },
  {
    id: "finance",
    name: "Finance Tracker",
    description: "Track income, expenses, savings, investments, budgets, and financial goals.",
    category: "Finance",
    icon: "💰",
    color: "yellow",
    colorHex: "#EAB308",
    features: ["Income tracking", "Expense logging", "Budget management", "Savings goals", "Investment tracking", "Financial reports"],
    targetAudience: "Anyone who wants to take control of their finances and build wealth",
    whatItAchieves: "Gain clarity on spending habits, build savings, and work toward financial goals.",
    metrics: [
      { id: "income", name: "Income", unit: "naira" },
      { id: "expenses", name: "Expenses", unit: "naira" },
    ],
    supportedCharts: ["bar", "pie", "line", "progress_ring"],
    defaultFrequency: "monthly",
    previewSections: ["Income vs Expenses chart", "Expense breakdown pie", "Savings progress ring", "Monthly trend"],
    benefits: ["Understand spending patterns", "Build savings habits", "Track financial goals", "Make informed financial decisions"],
  },
  {
    id: "content",
    name: "Content Calendar",
    description: "Plan, organize, schedule, and monitor content across social media, blogs, podcasts, YouTube, and newsletters.",
    category: "Content Creation",
    icon: "📅",
    color: "orange",
    colorHex: "#F97316",
    features: ["Content scheduling", "Platform management", "Analytics tracking", "Idea bank", "Draft pipeline", "Performance metrics"],
    targetAudience: "Content creators, social media managers, bloggers, and marketers",
    whatItAchieves: "Stay organized with content publishing, track performance, and maintain a consistent posting schedule.",
    metrics: [
      { id: "posts", name: "Posts Published", unit: "points" },
      { id: "engagement", name: "Engagement Rate", unit: "percent" },
    ],
    supportedCharts: ["bar", "line", "calendar_heatmap", "pie"],
    defaultFrequency: "weekly",
    previewSections: ["Content calendar", "Platform performance chart", "Engagement trends", "Publishing streak"],
    benefits: ["Stay organized with content planning", "Track publishing consistency", "Measure content performance", "Plan ahead with calendar view"],
  },
  {
    id: "student",
    name: "Student Tracker",
    description: "Stay on top of classes, assignments, exams, study sessions, GPA, attendance, and academic goals.",
    category: "Education",
    icon: "🎓",
    color: "indigo",
    colorHex: "#6366F1",
    features: ["Class schedule", "Assignment tracking", "Exam preparation", "Study time logging", "GPA calculator", "Attendance tracking"],
    targetAudience: "Students at all levels who want to stay organized and improve academic performance",
    whatItAchieves: "Manage coursework effectively, stay on top of deadlines, and improve academic performance.",
    metrics: [
      { id: "study_hours", name: "Study Hours", unit: "hours" },
      { id: "gpa", name: "GPA", unit: "points" },
    ],
    supportedCharts: ["bar", "line", "progress_ring", "calendar_heatmap"],
    defaultFrequency: "weekly",
    previewSections: ["Study hours chart", "Assignment deadlines", "GPA trend", "Attendance heatmap"],
    benefits: ["Stay organized with coursework", "Track study habits", "Monitor academic progress", "Never miss a deadline"],
  },
  {
    id: "business",
    name: "Business Tracker",
    description: "Track business growth, revenue, leads, customers, projects, sales, and operational performance.",
    category: "Business",
    icon: "🏢",
    color: "teal",
    colorHex: "#14B8A6",
    features: ["Revenue tracking", "Lead management", "Customer analytics", "Project progress", "Sales pipeline", "KPI dashboards"],
    targetAudience: "Entrepreneurs, small business owners, and managers",
    whatItAchieves: "Monitor business health, track growth metrics, and make data-driven decisions.",
    metrics: [
      { id: "revenue", name: "Revenue", unit: "naira" },
      { id: "leads", name: "Leads Generated", unit: "points" },
    ],
    supportedCharts: ["line", "bar", "pie", "progress_ring"],
    defaultFrequency: "monthly",
    previewSections: ["Revenue trend line", "Lead conversion chart", "Project progress cards", "Sales pipeline"],
    benefits: ["Track business growth", "Monitor key metrics", "Make informed decisions", "Identify growth opportunities"],
  },
  {
    id: "mindfulness",
    name: "Mindfulness Tracker",
    description: "Track meditation, breathwork, prayer, and mindful practices to build inner peace and emotional resilience.",
    category: "Mindfulness",
    icon: "🧘",
    color: "violet",
    colorHex: "#7C3AED",
    features: ["Session logging", "Multiple practice types", "Mood before/after", "Streak tracking", "Weekly summaries", "Guided practice links", "Duration tracking", "Reflection prompts"],
    targetAudience: "Anyone seeking mental clarity, stress reduction, spiritual growth, or emotional balance through mindfulness practice",
    whatItAchieves: "Build a consistent mindfulness practice, reduce stress, increase self-awareness, and develop emotional resilience through tracked, intentional stillness.",
    metrics: [
      { id: "duration", name: "Duration", unit: "minutes" },
      { id: "sessions", name: "Sessions", unit: "points" },
    ],
    supportedCharts: ["bar", "line", "streak_counter", "calendar_heatmap", "progress_ring"],
    defaultFrequency: "daily",
    defaultTarget: 20,
    previewSections: ["Session calendar", "Duration trends", "Practice type breakdown", "Streak counter", "Mood comparison", "Weekly summary"],
    benefits: ["Reduce stress and anxiety", "Build emotional resilience", "Improve focus and clarity", "Deepen spiritual practice", "Track mood improvements", "Develop consistent stillness habits"],
  },
  {
    id: "custom",
    name: "Custom Tracker",
    description: "Create your own tracker from scratch for anything you want to monitor.",
    category: "Custom",
    icon: "⚙️",
    color: "gray",
    colorHex: "#6B7280",
    features: ["Fully customizable", "Choose your metrics", "Pick your charts", "Set your frequency", "Custom reminders", "Flexible dashboard"],
    targetAudience: "Anyone with unique tracking needs not covered by existing templates",
    whatItAchieves: "Build a personalized tracker tailored to your specific goals and lifestyle.",
    metrics: [],
    supportedCharts: ["line", "bar", "calendar_heatmap", "pie", "progress_ring", "streak_counter"],
    defaultFrequency: "daily",
    previewSections: ["Custom dashboard", "Flexible charts", "Personalized metrics", "Configurable reminders"],
    benefits: ["Track anything you want", "Fully personalized experience", "Choose your own metrics", "Flexible and extensible"],
  },
]

// ══════════════════════════════════════════════════════════════
// DATABASE SCHEMA TYPES (types/database.ts)
// ══════════════════════════════════════════════════════════════

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

export interface DBNotification {
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

export interface DBTask {
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

export interface DBGoal {
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
  milestones: DBMilestone[]
  createdAt: Date
  updatedAt: Date
}

export interface DBMilestone {
  id: string
  title: string
  completed: boolean
  completedAt?: Date
}

export interface DBHabit {
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

// ══════════════════════════════════════════════════════════════
// API RESPONSE TYPES (types/database.ts)
// ══════════════════════════════════════════════════════════════

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
