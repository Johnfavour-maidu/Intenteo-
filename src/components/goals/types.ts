"use client"

export const getTodayISO = () => new Date().toISOString().split("T")[0]
export const getDaysRemaining = (dl: string) => Math.max(0, Math.ceil((new Date(dl).getTime() - Date.now()) / 86400000))
export const getDaysCompleted = (sd: string) => Math.max(0, Math.ceil((Date.now() - new Date(sd).getTime()) / 86400000))

export interface Milestone { id: string; title: string; completed: boolean }

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
  weighting: { projects: number; habits: number; milestones: number; manual: number }
  projectTimelines?: GoalProjectTimeline[]
  timeline?: string; status?: "not-started" | "in-progress" | "completed" | "overdue" | "archived"
  timeHorizon?: TimeHorizon
  visionId?: string
  habitCompletionRate?: number; lastActivity?: string
  createdAt: string; updatedAt: string
}

export interface Habit {
  id: string; name: string; color: string; colorHex: string; icon: string
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
  streak: number; habitScore: number; createdAt?: string
}

export interface VisionBoardItem {
  id: string; type: "image" | "quote" | "bible-verse" | "video" | "link"
  content: string; title?: string; url?: string; createdAt: string
}

export interface Vision {
  id: string; title: string; description?: string; lifeAreaId: string
  icon: string; archived: boolean
  boardItems: VisionBoardItem[]
  createdAt: string; updatedAt: string
}

export type GoalFilterMode = "all" | "life-vision" | "10-year" | "5-year" | "annual" | "quarterly" | "monthly" | "weekly" | "daily" | "projects" | "completed" | "in-progress" | "not-started" | "overdue" | "archived"
export type SortMode = "deadline" | "progress" | "updated" | "priority" | "name" | "newest" | "oldest"
export type TimeHorizon = "this-year" | "2-years" | "5-years" | "10-years" | "lifetime"

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
  { id:"1", title:"Launch Intenteo MVP", description:"Ship the first version to beta", category:"Career", priority:"high", progress:0, deadline:"2026-09-30", startDate:"2026-01-01", type:"quarterly", whyItMatters:"Build something meaningful", milestones:[{id:"m1",title:"UI design",completed:true},{id:"m2",title:"API ready",completed:true},{id:"m3",title:"Beta test",completed:false},{id:"m4",title:"Launch",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Purple", colorHex:"#1E0E6B", icon:"\u{1F680}", trackingMethod:"milestone", weighting:{projects:50,habits:20,milestones:20,manual:10}, timeline:"Quarterly", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
  { id:"2", title:"Run a Half Marathon", description:"Complete 21km under 2 hours", category:"Health", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Health is wealth", milestones:[{id:"m5",title:"Run 5km",completed:true},{id:"m6",title:"Run 10km",completed:true},{id:"m7",title:"Run 15km",completed:false},{id:"m8",title:"Run 21km",completed:false}], linkedHabits:["Exercise"], linkedHabitWeights:[{habitId:"h2",habitName:"Exercise",weight:100}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F4AA}", trackingMethod:"milestone", weighting:{projects:40,habits:30,milestones:20,manual:10}, timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-05-15" },
  { id:"3", title:"Read 24 Books", description:"2 books per month on leadership", category:"Learning", priority:"none", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Knowledge is power", milestones:[], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4DA}", trackingMethod:"milestone", weighting:{projects:30,habits:40,milestones:20,manual:10}, timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
  { id:"4", title:"Save $10,000", description:"Build emergency fund", category:"Finance", priority:"high", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Financial security", milestones:[{id:"m9",title:"Save $2,500",completed:true},{id:"m10",title:"Save $5,000",completed:false},{id:"m11",title:"Save $7,500",completed:false},{id:"m12",title:"Save $10,000",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Teal", colorHex:"#14B8A6", icon:"\u{1F4B0}", trackingMethod:"milestone", weighting:{projects:50,habits:10,milestones:30,manual:10}, timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-01", updatedAt:"2026-04-01" },
  { id:"5", title:"Deepen Faith Walk", description:"Build a consistent devotional and prayer life", category:"Faith", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Spiritual growth anchors everything", milestones:[{id:"m13",title:"Daily devotion habit",completed:true},{id:"m14",title:"Complete Bible reading plan",completed:false},{id:"m15",title:"Join small group",completed:false}], linkedHabits:["Morning Devotion"], linkedHabitWeights:[{habitId:"h5",habitName:"Morning Devotion",weight:100}], notes:"", color:"Purple", colorHex:"#1E0E6B", icon:"\u{1F64F}", trackingMethod:"milestone", weighting:{projects:30,habits:40,milestones:20,manual:10}, timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-02-01", updatedAt:"2026-06-01" },
  { id:"6", title:"Strengthen Relationships", description:"Be more intentional with family and friends", category:"Relationships", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Relationships are life's greatest treasure", milestones:[{id:"m16",title:"Weekly family dinner",completed:true},{id:"m17",title:"Monthly friend hangout",completed:false},{id:"m18",title:"Plan family trip",completed:false}], linkedHabits:["Call a Friend"], linkedHabitWeights:[{habitId:"h6",habitName:"Call a Friend",weight:100}], notes:"", color:"Pink", colorHex:"#EC4899", icon:"\u2764\uFE0F", trackingMethod:"milestone", weighting:{projects:30,habits:30,milestones:20,manual:20}, timeline:"Annual", status:"in-progress", timeHorizon:"this-year", createdAt:"2026-01-15", updatedAt:"2026-05-20" },
  { id:"7", title:"Master TypeScript", description:"Become an expert in TypeScript and advanced patterns", category:"Learning", priority:"low", progress:0, deadline:"2026-09-30", startDate:"2026-04-01", type:"quarterly", whyItMatters:"Better code quality and career growth", milestones:[{id:"m19",title:"Complete advanced course",completed:false},{id:"m20",title:"Build 3 practice projects",completed:false},{id:"m21",title:"Contribute to open source",completed:false}], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Blue", colorHex:"#3B82F6", icon:"\u{1F4BB}", trackingMethod:"milestone", weighting:{projects:40,habits:30,milestones:20,manual:10}, timeline:"Quarterly", status:"not-started", timeHorizon:"this-year", createdAt:"2026-04-01", updatedAt:"2026-04-01" },
  { id:"8", title:"Launch Side Project", description:"Build and ship a profitable SaaS product", category:"Business", priority:"high", progress:0, deadline:"2026-10-31", startDate:"2026-03-01", type:"quarterly", whyItMatters:"Create additional income and impact", milestones:[{id:"m22",title:"Validate idea",completed:true},{id:"m23",title:"Build MVP",completed:false},{id:"m24",title:"Get first 10 paying users",completed:false},{id:"m25",title:"Reach $1k MRR",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Teal", colorHex:"#14B8A6", icon:"\u{1F680}", trackingMethod:"milestone", weighting:{projects:50,habits:10,milestones:30,manual:10}, timeline:"Quarterly", status:"in-progress", timeHorizon:"2-years", createdAt:"2026-03-01", updatedAt:"2026-06-15" },
  { id:"9", title:"Learn French", description:"Reach conversational fluency in French", category:"Learning", priority:"low", progress:0, deadline:"2027-06-30", startDate:"2026-07-01", type:"annual", whyItMatters:"Connecting with culture and opening travel opportunities", milestones:[{id:"m26",title:"Complete Duolingo streak 30 days",completed:true},{id:"m27",title:"Watch 5 French films",completed:false},{id:"m28",title:"Hold 10-min conversation",completed:false},{id:"m29",title:"Read a French book",completed:false}], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Blue", colorHex:"#3B82F6", icon:"\u{1F30D}", trackingMethod:"milestone", weighting:{projects:30,habits:30,milestones:20,manual:20}, timeline:"Annual", status:"in-progress", timeHorizon:"2-years", createdAt:"2026-07-01", updatedAt:"2026-07-01" },
  { id:"10", title:"Launch YouTube Channel", description:"Create and grow a personal development channel", category:"Business", priority:"medium", progress:0, deadline:"2027-03-31", startDate:"2026-08-01", type:"annual", whyItMatters:"Share knowledge and build a personal brand", milestones:[{id:"m30",title:"Plan 10 video topics",completed:false},{id:"m31",title:"Record first 3 videos",completed:false},{id:"m32",title:"Reach 100 subscribers",completed:false},{id:"m33",title:"Reach 1,000 subscribers",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Pink", colorHex:"#EC4899", icon:"\u{1F3AC}", trackingMethod:"milestone", weighting:{projects:40,habits:10,milestones:30,manual:20}, timeline:"Annual", status:"not-started", timeHorizon:"2-years", createdAt:"2026-08-01", updatedAt:"2026-08-01" },
  { id:"11", title:"Run a Marathon", description:"Complete a full 42km marathon", category:"Health", priority:"high", progress:0, deadline:"2027-04-30", startDate:"2026-09-01", type:"annual", whyItMatters:"Push physical limits and prove discipline", milestones:[{id:"m34",title:"Run 15km non-stop",completed:false},{id:"m35",title:"Run 21km half marathon",completed:false},{id:"m36",title:"Run 30km training run",completed:false},{id:"m37",title:"Complete marathon",completed:false}], linkedHabits:["Exercise"], linkedHabitWeights:[{habitId:"h2",habitName:"Exercise",weight:100}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F3C3}", trackingMethod:"milestone", weighting:{projects:30,habits:40,milestones:20,manual:10}, timeline:"Annual", status:"not-started", timeHorizon:"5-years", createdAt:"2026-09-01", updatedAt:"2026-09-01" },
]

export const createSampleProjects = (): Project[] => [
  { id:"p1", name:"Build Habit Tracker", description:"Design and build the habit tracking feature", status:"active", progress:72, priority:"high", startDate:"2026-03-01", dueDate:"2026-07-31", tasks:[{id:"t1",title:"Design UI",completed:true,subtasks:[]},{id:"t2",title:"Build components",completed:true,subtasks:[]},{id:"t3",title:"Add persistence",completed:false,subtasks:[]},{id:"t4",title:"Test & deploy",completed:false,subtasks:[]}], notes:"", color:"Indigo", colorHex:"#1E0E6B", icon:"\u{1F4CA}", tags:["dev","ui"], goalId:"1", createdAt:"2026-03-01", updatedAt:"2026-06-01" },
  { id:"p2", name:"Launch Website", description:"Deploy intenteo.vercel.app to production", status:"active", progress:100, priority:"high", startDate:"2026-01-01", dueDate:"2026-06-30", tasks:[{id:"t5",title:"Setup domain",completed:true,subtasks:[]},{id:"t6",title:"Configure DNS",completed:true,subtasks:[]},{id:"t7",title:"Deploy",completed:true,subtasks:[]}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F310}", tags:["dev"], goalId:"1", createdAt:"2026-01-01", updatedAt:"2026-06-15" },
  { id:"p3", name:"Marketing Campaign", description:"Social media and content marketing", status:"active", progress:30, priority:"medium", startDate:"2026-04-01", dueDate:"2026-08-31", tasks:[{id:"t8",title:"Content calendar",completed:true,subtasks:[]},{id:"t9",title:"Create posts",completed:false,subtasks:[]},{id:"t10",title:"Analytics",completed:false,subtasks:[]}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4E2}", tags:["marketing"], goalId:"1", createdAt:"2026-04-01", updatedAt:"2026-05-01" },
  { id:"p4", name:"Training Plan", description:"12-week half marathon training", status:"active", progress:40, priority:"medium", startDate:"2026-03-01", dueDate:"2026-06-30", tasks:[{id:"t11",title:"Week 1-4: Base",completed:true,subtasks:[]},{id:"t12",title:"Week 5-8: Build",completed:false,subtasks:[]},{id:"t13",title:"Week 9-12: Peak",completed:false,subtasks:[]}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F3C3}", tags:["fitness"], goalId:"2", createdAt:"2026-03-01", updatedAt:"2026-05-15" },
  { id:"p5", name:"Reading List", description:"Curate and track 24 books", status:"active", progress:50, priority:"low", startDate:"2026-01-01", dueDate:"2026-12-31", tasks:[{id:"t14",title:"Jan-Mar books",completed:true,subtasks:[]},{id:"t15",title:"Apr-Jun books",completed:true,subtasks:[]},{id:"t16",title:"Jul-Sep books",completed:false,subtasks:[]}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4D6}", tags:["learning"], goalId:"3", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
]
