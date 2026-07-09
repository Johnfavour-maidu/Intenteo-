"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus, Target, TrendingUp, Calendar, ChevronRight, ChevronDown,
  CheckCircle2, Clock, X, Search, Trash2, Zap, Folder, ListChecks,
  Link2, AlertTriangle, Info, Map,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { formatDateDDMMYYYY } from "@/lib/date-utils"
import type { GoalData, GoalProject, GoalHabit } from "./goal-utils"
import {
  calcGoalHealth, GOAL_HEALTH_CONFIG, calcLifecycleStage, GOAL_LIFECYCLE_CONFIG,
  calcTrend, GOAL_TREND_CONFIG, generateSmartNextAction, generateCoaching,
  getGoalHealthScore, detectCelebration, getGoalScoreBreakdown,
} from "./goal-utils"
import { GoalAnalyticsDrawer } from "./goal-analytics-drawer"
import { DateInput } from "@/components/ui/date-input"

interface Milestone { id: string; title: string; completed: boolean }

interface GoalProjectTimeline {
  id: string; projectName: string; description: string; startDate: string; endDate: string
  status: "not-started" | "in-progress" | "completed" | "on-hold"; progress: number; notes: string
  milestones?: string[]
}

interface ProjectTask {
  id: string; title: string; completed: boolean
  subtasks: { id: string; title: string; completed: boolean }[]
}

interface Project {
  id: string; name: string; description: string; status: "planning" | "active" | "completed" | "on-hold"
  progress: number; priority: "low" | "medium" | "high"; startDate: string; dueDate: string
  tasks: ProjectTask[]; notes: string; color: string; colorHex: string; icon: string
  tags: string[]; goalId: string; createdAt: string; updatedAt: string
}

interface LinkedHabitWeight { habitId: string; habitName: string; weight: number }

interface Goal {
  id: string; title: string; description: string; category: string; customCategory?: string
  priority: "none" | "low" | "medium" | "high"; progress: number; deadline: string; startDate: string
  type: "annual" | "quarterly" | "monthly" | "weekly" | "custom"; whyItMatters: string
  milestones: Milestone[]; linkedHabits: string[]; linkedHabitWeights?: LinkedHabitWeight[]
  notes: string; color: string; colorHex: string
  icon: string; trackingMethod: "manual" | "milestone" | "auto"
  weighting: { projects: number; habits: number; milestones: number; manual: number }
  projectTimelines?: GoalProjectTimeline[]
  timeline?: string; status?: "not-started" | "in-progress" | "completed" | "overdue" | "archived"
  habitCompletionRate?: number; lastActivity?: string
  createdAt: string; updatedAt: string
}

interface Habit {
  id: string; name: string; color: string; colorHex: string; icon: string
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
  streak: number; habitScore: number; createdAt?: string
}

interface LifeVision {
  vision: string; notes: string; whyItMatters: string; values: string[]
  lifeAreas: string[]; reviewFrequency: string; reminderEnabled: boolean
  startDate: string; targetDate: string
}

type GoalFilterMode = "all" | "life-vision" | "10-year" | "5-year" | "annual" | "quarterly" | "monthly" | "weekly" | "daily" | "projects" | "completed" | "in-progress" | "not-started" | "overdue" | "archived"
type SortMode = "deadline" | "progress" | "updated" | "priority" | "name" | "newest" | "oldest"

const getTodayISO = () => new Date().toISOString().split("T")[0]
const getDaysRemaining = (dl: string) => Math.max(0, Math.ceil((new Date(dl).getTime() - Date.now()) / 86400000))
const getDaysCompleted = (sd: string) => Math.max(0, Math.ceil((Date.now() - new Date(sd).getTime()) / 86400000))

const GOAL_CATEGORIES = [
  { name: "Personal Growth", color: "#6366F1" },
  { name: "Health", color: "#22C55E" },
  { name: "Career", color: "#3B82F6" },
  { name: "Finance", color: "#EAB308" },
  { name: "Learning", color: "#F97316" },
  { name: "Relationships", color: "#EC4899" },
  { name: "Faith", color: "#8B5CF6" },
  { name: "Business", color: "#14B8A6" },
  { name: "Family", color: "#EF4444" },
  { name: "Custom", color: "#6B7280" },
]

const GOAL_COLORS = [
  { name: "Purple", hex: "#8B5CF6" }, { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" }, { name: "Orange", hex: "#F97316" },
  { name: "Red", hex: "#EF4444" }, { name: "Pink", hex: "#EC4899" },
  { name: "Teal", hex: "#14B8A6" }, { name: "Black", hex: "#000000" },
]

const GOAL_ICONS = ["\u{1F3AF}","\u2B50","\u{1F680}","\u{1F4A1}","\u{1F525}","\u{1F48E}","\u{1F3C6}","\u{1F4C8}","\u{1F4AA}","\u{1F4DA}","\u{1F4B0}","\u2764\uFE0F","\u{1F64F}","\u{1F393}","\u{1F4BC}","\u{1F331}"]

const PROJECT_TEMPLATES = [
  { name: "Book Writing", icon: "\u{1F4DA}", tasks: ["Outline chapters", "Write first draft", "Edit & revise", "Publish"] },
  { name: "Website Launch", icon: "\u{1F310}", tasks: ["Design mockups", "Build frontend", "Build backend", "Test & launch"] },
  { name: "Fitness Challenge", icon: "\u{1F4AA}", tasks: ["Set goals", "Create plan", "Start training", "Track progress"] },
  { name: "Business Launch", icon: "\u{1F680}", tasks: ["Market research", "Business plan", "Build MVP", "Launch"] },
  { name: "Research", icon: "\u{1F52C}", tasks: ["Define scope", "Gather data", "Analyze", "Write report"] },
  { name: "Course Creation", icon: "\u{1F393}", tasks: ["Plan curriculum", "Create content", "Record lessons", "Publish"] },
]

const createSampleGoals = (): Goal[] => [
  { id:"1", title:"Launch Intenteo MVP", description:"Ship the first version to beta", category:"Career", priority:"high", progress:0, deadline:"2026-09-30", startDate:"2026-01-01", type:"quarterly", whyItMatters:"Build something meaningful", milestones:[{id:"m1",title:"UI design",completed:true},{id:"m2",title:"API ready",completed:true},{id:"m3",title:"Beta test",completed:false},{id:"m4",title:"Launch",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Purple", colorHex:"#8B5CF6", icon:"\u{1F680}", trackingMethod:"milestone", weighting:{projects:50,habits:20,milestones:20,manual:10}, timeline:"Quarterly", status:"in-progress", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
  { id:"2", title:"Run a Half Marathon", description:"Complete 21km under 2 hours", category:"Health", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Health is wealth", milestones:[{id:"m5",title:"Run 5km",completed:true},{id:"m6",title:"Run 10km",completed:true},{id:"m7",title:"Run 15km",completed:false},{id:"m8",title:"Run 21km",completed:false}], linkedHabits:["Exercise"], linkedHabitWeights:[{habitId:"h2",habitName:"Exercise",weight:100}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F4AA}", trackingMethod:"milestone", weighting:{projects:40,habits:30,milestones:20,manual:10}, timeline:"Annual", status:"in-progress", createdAt:"2026-01-01", updatedAt:"2026-05-15" },
  { id:"3", title:"Read 24 Books", description:"2 books per month on leadership", category:"Learning", priority:"none", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Knowledge is power", milestones:[], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4DA}", trackingMethod:"milestone", weighting:{projects:30,habits:40,milestones:20,manual:10}, timeline:"Annual", status:"in-progress", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
  { id:"4", title:"Save $10,000", description:"Build emergency fund", category:"Finance", priority:"high", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Financial security", milestones:[{id:"m9",title:"Save $2,500",completed:true},{id:"m10",title:"Save $5,000",completed:false},{id:"m11",title:"Save $7,500",completed:false},{id:"m12",title:"Save $10,000",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Teal", colorHex:"#14B8A6", icon:"\u{1F4B0}", trackingMethod:"milestone", weighting:{projects:50,habits:10,milestones:30,manual:10}, timeline:"Annual", status:"in-progress", createdAt:"2026-01-01", updatedAt:"2026-04-01" },
  { id:"5", title:"Deepen Faith Walk", description:"Build a consistent devotional and prayer life", category:"Faith", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Spiritual growth anchors everything", milestones:[{id:"m13",title:"Daily devotion habit",completed:true},{id:"m14",title:"Complete Bible reading plan",completed:false},{id:"m15",title:"Join small group",completed:false}], linkedHabits:["Morning Devotion"], linkedHabitWeights:[{habitId:"h5",habitName:"Morning Devotion",weight:100}], notes:"", color:"Purple", colorHex:"#8B5CF6", icon:"\u{1F64F}", trackingMethod:"milestone", weighting:{projects:30,habits:40,milestones:20,manual:10}, timeline:"Annual", status:"in-progress", createdAt:"2026-02-01", updatedAt:"2026-06-01" },
  { id:"6", title:"Strengthen Relationships", description:"Be more intentional with family and friends", category:"Relationships", priority:"medium", progress:0, deadline:"2026-12-31", startDate:"2026-01-01", type:"annual", whyItMatters:"Relationships are life's greatest treasure", milestones:[{id:"m16",title:"Weekly family dinner",completed:true},{id:"m17",title:"Monthly friend hangout",completed:false},{id:"m18",title:"Plan family trip",completed:false}], linkedHabits:["Call a Friend"], linkedHabitWeights:[{habitId:"h6",habitName:"Call a Friend",weight:100}], notes:"", color:"Pink", colorHex:"#EC4899", icon:"\u2764\uFE0F", trackingMethod:"milestone", weighting:{projects:30,habits:30,milestones:20,manual:20}, timeline:"Annual", status:"in-progress", createdAt:"2026-01-15", updatedAt:"2026-05-20" },
  { id:"7", title:"Master TypeScript", description:"Become an expert in TypeScript and advanced patterns", category:"Learning", priority:"low", progress:0, deadline:"2026-09-30", startDate:"2026-04-01", type:"quarterly", whyItMatters:"Better code quality and career growth", milestones:[{id:"m19",title:"Complete advanced course",completed:false},{id:"m20",title:"Build 3 practice projects",completed:false},{id:"m21",title:"Contribute to open source",completed:false}], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Blue", colorHex:"#3B82F6", icon:"\u{1F4BB}", trackingMethod:"milestone", weighting:{projects:40,habits:30,milestones:20,manual:10}, timeline:"Quarterly", status:"not-started", createdAt:"2026-04-01", updatedAt:"2026-04-01" },
  { id:"8", title:"Launch Side Project", description:"Build and ship a profitable SaaS product", category:"Business", priority:"high", progress:0, deadline:"2026-10-31", startDate:"2026-03-01", type:"quarterly", whyItMatters:"Create additional income and impact", milestones:[{id:"m22",title:"Validate idea",completed:true},{id:"m23",title:"Build MVP",completed:false},{id:"m24",title:"Get first 10 paying users",completed:false},{id:"m25",title:"Reach $1k MRR",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Teal", colorHex:"#14B8A6", icon:"\u{1F680}", trackingMethod:"milestone", weighting:{projects:50,habits:10,milestones:30,manual:10}, timeline:"Quarterly", status:"in-progress", createdAt:"2026-03-01", updatedAt:"2026-06-15" },
  { id:"9", title:"Learn French", description:"Reach conversational fluency in French", category:"Learning", priority:"low", progress:0, deadline:"2027-06-30", startDate:"2026-07-01", type:"annual", whyItMatters:"Connecting with culture and opening travel opportunities", milestones:[{id:"m26",title:"Complete Duolingo streak 30 days",completed:true},{id:"m27",title:"Watch 5 French films",completed:false},{id:"m28",title:"Hold 10-min conversation",completed:false},{id:"m29",title:"Read a French book",completed:false}], linkedHabits:["Read 30 Minutes"], linkedHabitWeights:[{habitId:"h4",habitName:"Read 30 Minutes",weight:100}], notes:"", color:"Blue", colorHex:"#3B82F6", icon:"\u{1F30D}", trackingMethod:"milestone", weighting:{projects:30,habits:30,milestones:20,manual:20}, timeline:"Annual", status:"in-progress", createdAt:"2026-07-01", updatedAt:"2026-07-01" },
  { id:"10", title:"Launch YouTube Channel", description:"Create and grow a personal development channel", category:"Business", priority:"medium", progress:0, deadline:"2027-03-31", startDate:"2026-08-01", type:"annual", whyItMatters:"Share knowledge and build a personal brand", milestones:[{id:"m30",title:"Plan 10 video topics",completed:false},{id:"m31",title:"Record first 3 videos",completed:false},{id:"m32",title:"Reach 100 subscribers",completed:false},{id:"m33",title:"Reach 1,000 subscribers",completed:false}], linkedHabits:[], linkedHabitWeights:[], notes:"", color:"Pink", colorHex:"#EC4899", icon:"\u{1F3AC}", trackingMethod:"milestone", weighting:{projects:40,habits:10,milestones:30,manual:20}, timeline:"Annual", status:"not-started", createdAt:"2026-08-01", updatedAt:"2026-08-01" },
  { id:"11", title:"Run a Marathon", description:"Complete a full 42km marathon", category:"Health", priority:"high", progress:0, deadline:"2027-04-30", startDate:"2026-09-01", type:"annual", whyItMatters:"Push physical limits and prove discipline", milestones:[{id:"m34",title:"Run 15km non-stop",completed:false},{id:"m35",title:"Run 21km half marathon",completed:false},{id:"m36",title:"Run 30km training run",completed:false},{id:"m37",title:"Complete marathon",completed:false}], linkedHabits:["Exercise"], linkedHabitWeights:[{habitId:"h2",habitName:"Exercise",weight:100}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F3C3}", trackingMethod:"milestone", weighting:{projects:30,habits:40,milestones:20,manual:10}, timeline:"Annual", status:"not-started", createdAt:"2026-09-01", updatedAt:"2026-09-01" },
]

const createSampleProjects = (): Project[] => [
  { id:"p1", name:"Build Habit Tracker", description:"Design and build the habit tracking feature", status:"active", progress:72, priority:"high", startDate:"2026-03-01", dueDate:"2026-07-31", tasks:[{id:"t1",title:"Design UI",completed:true,subtasks:[]},{id:"t2",title:"Build components",completed:true,subtasks:[]},{id:"t3",title:"Add persistence",completed:false,subtasks:[]},{id:"t4",title:"Test & deploy",completed:false,subtasks:[]}], notes:"", color:"Indigo", colorHex:"#1E0E6B", icon:"\u{1F4CA}", tags:["dev","ui"], goalId:"1", createdAt:"2026-03-01", updatedAt:"2026-06-01" },
  { id:"p2", name:"Launch Website", description:"Deploy intenteo.vercel.app to production", status:"active", progress:100, priority:"high", startDate:"2026-01-01", dueDate:"2026-06-30", tasks:[{id:"t5",title:"Setup domain",completed:true,subtasks:[]},{id:"t6",title:"Configure DNS",completed:true,subtasks:[]},{id:"t7",title:"Deploy",completed:true,subtasks:[]}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F310}", tags:["dev"], goalId:"1", createdAt:"2026-01-01", updatedAt:"2026-06-15" },
  { id:"p3", name:"Marketing Campaign", description:"Social media and content marketing", status:"active", progress:30, priority:"medium", startDate:"2026-04-01", dueDate:"2026-08-31", tasks:[{id:"t8",title:"Content calendar",completed:true,subtasks:[]},{id:"t9",title:"Create posts",completed:false,subtasks:[]},{id:"t10",title:"Analytics",completed:false,subtasks:[]}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4E2}", tags:["marketing"], goalId:"1", createdAt:"2026-04-01", updatedAt:"2026-05-01" },
  { id:"p4", name:"Training Plan", description:"12-week half marathon training", status:"active", progress:40, priority:"medium", startDate:"2026-03-01", dueDate:"2026-06-30", tasks:[{id:"t11",title:"Week 1-4: Base",completed:true,subtasks:[]},{id:"t12",title:"Week 5-8: Build",completed:false,subtasks:[]},{id:"t13",title:"Week 9-12: Peak",completed:false,subtasks:[]}], notes:"", color:"Green", colorHex:"#22C55E", icon:"\u{1F3C3}", tags:["fitness"], goalId:"2", createdAt:"2026-03-01", updatedAt:"2026-05-15" },
  { id:"p5", name:"Reading List", description:"Curate and track 24 books", status:"active", progress:50, priority:"low", startDate:"2026-01-01", dueDate:"2026-12-31", tasks:[{id:"t14",title:"Jan-Mar books",completed:true,subtasks:[]},{id:"t15",title:"Apr-Jun books",completed:true,subtasks:[]},{id:"t16",title:"Jul-Sep books",completed:false,subtasks:[]}], notes:"", color:"Orange", colorHex:"#F97316", icon:"\u{1F4D6}", tags:["learning"], goalId:"3", createdAt:"2026-01-01", updatedAt:"2026-06-01" },
]

function calcProjectProgress(p: Project): number {
  if (p.tasks.length === 0) return p.progress
  return Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100)
}

function calcHabitScoreForGoal(habit: Habit): number {
  const today = getTodayISO()
  const completions = habit.completions || {}
  const completedDays = Object.keys(completions).filter(k => completions[k]?.completed).length
  const created = new Date(habit.createdAt || Date.now())
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / 86400000))
  return Math.min(100, Math.round((completedDays / totalDays) * 100))
}

function calcGoalProgress(g: Goal, projects: Project[], habits: Habit[]): number {
  const w = g.weighting
  const totalWeight = w.projects + w.habits + w.milestones + w.manual
  if (totalWeight === 0) return g.progress
  const goalProjects = projects.filter(p => p.goalId === g.id)
  const projectScore = goalProjects.length > 0
    ? goalProjects.reduce((sum, p) => sum + calcProjectProgress(p), 0) / goalProjects.length
    : 0
  const milestoneScore = g.milestones.length > 0
    ? (g.milestones.filter(m => m.completed).length / g.milestones.length) * 100
    : 0
  let habitScore = 0
  if (g.linkedHabitWeights && g.linkedHabitWeights.length > 0) {
    const totalHabitWeight = g.linkedHabitWeights.reduce((s, h) => s + h.weight, 0)
    if (totalHabitWeight > 0) {
      habitScore = g.linkedHabitWeights.reduce((sum, lh) => {
        const habit = habits.find(h => h.id === lh.habitId || h.name === lh.habitName)
        const score = habit ? calcHabitScoreForGoal(habit) : 0
        return sum + (score * lh.weight / totalHabitWeight)
      }, 0)
    }
  } else if (g.linkedHabits.length > 0) {
    const linked = habits.filter(h => g.linkedHabits.includes(h.name))
    if (linked.length > 0) {
      habitScore = linked.reduce((sum, h) => sum + calcHabitScoreForGoal(h), 0) / linked.length
    }
  }
  const manualScore = g.progress
  return Math.round(
    (projectScore * w.projects + habitScore * w.habits + milestoneScore * w.milestones + manualScore * w.manual) / totalWeight
  )
}

function getGoalBreakdown(g: Goal, projects: Project[], habits: Habit[]) {
  const w = g.weighting
  const goalProjects = projects.filter(p => p.goalId === g.id)
  const projectScore = goalProjects.length > 0
    ? goalProjects.reduce((sum, p) => sum + calcProjectProgress(p), 0) / goalProjects.length
    : 0
  const milestoneScore = g.milestones.length > 0
    ? (g.milestones.filter(m => m.completed).length / g.milestones.length) * 100
    : 0
  const sources: { name: string; score: number; type: "project" | "milestone" | "habit" | "manual" }[] = []
  goalProjects.forEach(p => sources.push({ name: p.name, score: calcProjectProgress(p), type: "project" }))
  g.milestones.forEach(m => { if (m.completed) sources.push({ name: m.title, score: 100, type: "milestone" }) })
  if (g.linkedHabitWeights && g.linkedHabitWeights.length > 0) {
    g.linkedHabitWeights.forEach(lh => {
      const habit = habits.find(h => h.id === lh.habitId || h.name === lh.habitName)
      sources.push({ name: lh.habitName, score: habit ? calcHabitScoreForGoal(habit) : 0, type: "habit" })
    })
  } else {
    g.linkedHabits.forEach(name => {
      const habit = habits.find(h => h.name === name)
      sources.push({ name, score: habit ? calcHabitScoreForGoal(habit) : 0, type: "habit" })
    })
  }
  if (g.progress > 0) sources.push({ name: "Manual", score: g.progress, type: "manual" })
  return sources
}

const LifeVisionDrawer = ({ isOpen, onClose, vision, onSave }: {
  isOpen: boolean; onClose: () => void; vision: LifeVision; onSave: (v: LifeVision) => void
}) => {
  const [data, setData] = useState(vision)
  const [newValue, setNewValue] = useState("")
  const [newLifeArea, setNewLifeArea] = useState("")
  useEffect(() => { setData(vision) }, [vision])
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])
  if (!isOpen) return null

  const addValue = () => {
    if (newValue.trim()) { setData({ ...data, values: [...data.values, newValue.trim()] }); setNewValue("") }
  }
  const addLifeArea = () => {
    if (newLifeArea.trim()) { setData({ ...data, lifeAreas: [...data.lifeAreas, newLifeArea.trim()] }); setNewLifeArea("") }
  }

  const inputCls = "mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Life Vision</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        <div><label className="text-sm font-medium">Vision Statement</label>
          <textarea value={data.vision} onChange={e => setData({...data, vision: e.target.value})} className={inputCls + " min-h-[80px]"} /></div>

        <div><label className="text-sm font-medium">Why It Matters</label>
          <textarea value={data.whyItMatters} onChange={e => setData({...data, whyItMatters: e.target.value})} className={inputCls} /></div>

        <div><label className="text-sm font-medium">Notes</label>
          <textarea value={data.notes} onChange={e => setData({...data, notes: e.target.value})} className={inputCls} /></div>

        <div><label className="text-sm font-medium">Review Frequency</label>
          <div className="relative">
            <select value={data.reviewFrequency} onChange={e => setData({...data, reviewFrequency: e.target.value})} className={inputCls + " cursor-pointer appearance-none pr-8"}>
              {["Weekly","Monthly","Quarterly","Yearly"].map(f => <option key={f} value={f}>{f}</option>)}</select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
          </div></div>

        <div>
          <label className="text-sm font-medium">Reminder</label>
          <div className="flex items-center gap-3 mt-2">
            <Switch checked={data.reminderEnabled} onCheckedChange={(checked) => setData({...data, reminderEnabled: checked})} />
            <span className="text-sm text-muted-foreground">{data.reminderEnabled ? "Reminder Enabled" : "Reminder Disabled"}</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Timeline</label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div><DateInput label="Start Date" value={data.startDate} onChange={(v) => setData({...data, startDate: v})} /></div>
            <div><DateInput label="Target Date" value={data.targetDate} onChange={(v) => setData({...data, targetDate: v})} /></div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Values</label>
          <div className="flex flex-wrap gap-2 mt-2">{data.values.map((item,i) => (
            <Badge key={i} variant="secondary" className="gap-1">{item}<button onClick={() => setData({...data, values: data.values.filter((_,j) => j !== i)})}><X className="h-3 w-3" /></button></Badge>
          ))}</div>
          <div className="flex gap-2 mt-2">
            <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Add value..." onKeyDown={e => e.key === "Enter" && addValue()} className="text-sm" />
            <Button size="sm" onClick={addValue}>Add</Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Life Areas</label>
          <div className="flex flex-wrap gap-2 mt-2">{data.lifeAreas.map((item,i) => (
            <Badge key={i} variant="secondary" className="gap-1">{item}<button onClick={() => setData({...data, lifeAreas: data.lifeAreas.filter((_,j) => j !== i)})}><X className="h-3 w-3" /></button></Badge>
          ))}</div>
          <div className="flex gap-2 mt-2">
            <Input value={newLifeArea} onChange={e => setNewLifeArea(e.target.value)} placeholder="Add life area..." onKeyDown={e => e.key === "Enter" && addLifeArea()} className="text-sm" />
            <Button size="sm" onClick={addLifeArea}>Add</Button>
          </div>
        </div>

        <Button onClick={() => { onSave(data); onClose() }} className="w-full bg-[#1E0E6B] text-white">Save Vision</Button>
      </div>
    </div>
  )
}

const GOAL_TIMELINES = ["Life Vision", "10-Year", "5-Year", "Annual", "Quarterly", "Monthly", "Weekly", "Daily"]

const getTimelineDefault = (type: Goal["type"]): string => {
  switch (type) {
    case "annual": return "Annual"
    case "quarterly": return "Quarterly"
    case "monthly": return "Monthly"
    case "weekly": return "Weekly"
    case "custom": return "Annual"
    default: return "Annual"
  }
}

const getMinDeadline = (startDate: string, type: Goal["type"]): string => {
  if (!startDate) return ""
  const d = new Date(startDate)
  switch (type) {
    case "annual": d.setDate(d.getDate() + 365); break
    case "quarterly": d.setDate(d.getDate() + 90); break
    case "monthly": d.setDate(d.getDate() + 30); break
    case "weekly": d.setDate(d.getDate() + 7); break
    default: return ""
  }
  return d.toISOString().split("T")[0]
}

const getAutoDeadline = (startDate: string, type: Goal["type"]): string => {
  if (!startDate) return ""
  const d = new Date(startDate)
  switch (type) {
    case "annual": d.setDate(d.getDate() + 365); break
    case "quarterly": d.setDate(d.getDate() + 90); break
    case "monthly": d.setDate(d.getDate() + 30); break
    case "weekly": d.setDate(d.getDate() + 7); break
    default: return ""
  }
  return d.toISOString().split("T")[0]
}

const AddGoalModal = ({ isOpen, onClose, onSave, habits }: {
  isOpen: boolean; onClose: () => void; onSave: (g: Omit<Goal,"id"|"createdAt"|"updatedAt">) => void; habits: Habit[]
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Personal Growth")
  const [customCategory, setCustomCategory] = useState("")
  const [priority, setPriority] = useState<"none"|"low"|"medium"|"high">("none")
  const [type, setType] = useState<Goal["type"]>("annual")
  const [deadline, setDeadline] = useState("")
  const [startDate, setStartDate] = useState(getTodayISO())
  const [whyItMatters, setWhyItMatters] = useState("")
  const [icon, setIcon] = useState("")
  const [colorIdx, setColorIdx] = useState(0)
  const [customDuration, setCustomDuration] = useState("")
  const [showIconDropdown, setShowIconDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [habitWeights, setHabitWeights] = useState<Record<string, number>>({})
  const [customizeContributions, setCustomizeContributions] = useState(false)
  const [projectTimelines, setProjectTimelines] = useState<GoalProjectTimeline[]>([])
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null)
  const [showTimelineForm, setShowTimelineForm] = useState(false)
  const [newTimelineProjectName, setNewTimelineProjectName] = useState("")
  const [newTimelineDesc, setNewTimelineDesc] = useState("")
  const [newTimelineStart, setNewTimelineStart] = useState(getTodayISO())
  const [newTimelineEnd, setNewTimelineEnd] = useState("")
  const [newTimelineStatus, setNewTimelineStatus] = useState<"not-started"|"in-progress"|"completed"|"on-hold">("not-started")
  const [newTimelineProgress, setNewTimelineProgress] = useState("0")
  const [newTimelineNotes, setNewTimelineNotes] = useState("")
  const [newTimelineMilestones, setNewTimelineMilestones] = useState<string[]>([])

  useEffect(() => {
    if (type !== "custom") {
      const auto = getAutoDeadline(startDate, type)
      if (auto) setDeadline(auto)
    }
  }, [type, startDate])

  // Auto-distribute contributions equally when not in customize mode
  useEffect(() => {
    if (!customizeContributions && selectedHabits.length > 0) {
      const equalWeight = Math.floor(100 / selectedHabits.length)
      const remainder = 100 - (equalWeight * selectedHabits.length)
      const newWeights: Record<string, number> = {}
      selectedHabits.forEach((name, i) => {
        newWeights[name] = equalWeight + (i === 0 ? remainder : 0)
      })
      setHabitWeights(newWeights)
    }
  }, [selectedHabits, customizeContributions])

  if (!isOpen) return null

  const minDeadline = getMinDeadline(startDate, type)

  const toggleHabit = (name: string) => {
    setSelectedHabits(prev => prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name])
  }

  const redistributeEvenly = () => {
    if (selectedHabits.length === 0) return
    const equalWeight = Math.floor(100 / selectedHabits.length)
    const remainder = 100 - (equalWeight * selectedHabits.length)
    const newWeights: Record<string, number> = {}
    selectedHabits.forEach((name, i) => {
      newWeights[name] = equalWeight + (i === 0 ? remainder : 0)
    })
    setHabitWeights(newWeights)
  }

  const totalContribution = Object.values(habitWeights).reduce((sum, w) => sum + (w || 0), 0)
  const isValidContribution = totalContribution === 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Add New Goal</h2><Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button></div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Goal Name</label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Read 24 Books" className="mt-1" /></div>
          <div><label className="text-sm font-medium">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all" /></div>
          <div><label className="text-sm font-medium">Why It Matters</label><textarea value={whyItMatters} onChange={e => setWhyItMatters(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all" /></div>
          <div>
            <label className="text-sm font-medium">Project Timelines</label>
            <p className="text-xs text-muted-foreground mb-2">Add project timelines for this goal</p>
            {projectTimelines.length > 0 && (
              <div className="space-y-2 mb-3">
                {projectTimelines.map(pt => (
                  <div key={pt.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-white/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{pt.projectName || "Untitled Project"}</p>
                      <p className="text-[10px] text-muted-foreground">{pt.startDate || "No start"} → {pt.endDate || "No end"} · {pt.status.replace("-"," ")}{pt.milestones && pt.milestones.length > 0 ? ` · ${pt.milestones.length} milestone${pt.milestones.length !== 1 ? "s" : ""}` : ""}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                      const ptToEdit = projectTimelines.find(p => p.id === pt.id)
                      if (ptToEdit) { setEditingTimelineId(pt.id); setNewTimelineProjectName(ptToEdit.projectName); setNewTimelineDesc(ptToEdit.description); setNewTimelineStart(ptToEdit.startDate); setNewTimelineEnd(ptToEdit.endDate); setNewTimelineStatus(ptToEdit.status); setNewTimelineProgress(ptToEdit.progress.toString()); setNewTimelineNotes(ptToEdit.notes); setNewTimelineMilestones(ptToEdit.milestones || []); setShowTimelineForm(true) }
                    }}><span className="text-xs">✎</span></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => setProjectTimelines(prev => prev.filter(p => p.id !== pt.id))}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => { setEditingTimelineId(null); setNewTimelineProjectName(""); setNewTimelineDesc(""); setNewTimelineStart(getTodayISO()); setNewTimelineEnd(""); setNewTimelineStatus("not-started"); setNewTimelineProgress("0"); setNewTimelineNotes(""); setNewTimelineMilestones([]); setShowTimelineForm(true) }} className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Project Timeline
            </Button>
            {showTimelineForm && (
              <div className="mt-3 p-3 rounded-lg border border-[#1E0E6B]/20 bg-[#1E0E6B]/5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Project Name</label><Input value={newTimelineProjectName} onChange={e => setNewTimelineProjectName(e.target.value)} placeholder="Project name" className="mt-1 text-xs h-8" /></div>
                  <div><label className="text-xs font-medium">Status</label>
                    <div className="relative">
                      <select value={newTimelineStatus} onChange={e => setNewTimelineStatus(e.target.value as any)} className="mt-1 w-full px-2 py-1 text-xs border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 appearance-none pr-6">
                        <option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="on-hold">On Hold</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div><label className="text-xs font-medium">Description</label><textarea value={newTimelineDesc} onChange={e => setNewTimelineDesc(e.target.value)} className="mt-1 w-full px-2 py-1 text-xs border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 min-h-[40px]" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Start Date</label><DateInput value={newTimelineStart} onChange={setNewTimelineStart} /></div>
                  <div><label className="text-xs font-medium">End Date</label><DateInput value={newTimelineEnd} onChange={setNewTimelineEnd} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-xs font-medium">Milestones</label>
                    <div className="mt-1 space-y-1">
                      {(editingTimelineId ? projectTimelines.find(p => p.id === editingTimelineId)?.milestones || [] : newTimelineMilestones).map((ms, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px]">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span className="flex-1 truncate">{ms}</span>
                          <button type="button" onClick={() => {
                            if (editingTimelineId) {
                              setProjectTimelines(prev => prev.map(p => p.id === editingTimelineId ? {...p, milestones: (p.milestones || []).filter((_, j) => j !== i)} : p))
                            } else {
                              setNewTimelineMilestones(prev => prev.filter((_, j) => j !== i))
                            }
                          }} className="text-red-400 hover:text-red-600"><X className="h-2.5 w-2.5" /></button>
                        </div>
                      ))}
                      <Input value="" placeholder="Add milestone and press Enter" onKeyDown={e => {
                        if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                          const val = (e.target as HTMLInputElement).value.trim()
                          if (editingTimelineId) {
                            setProjectTimelines(prev => prev.map(p => p.id === editingTimelineId ? {...p, milestones: [...(p.milestones || []), val]} : p))
                          } else {
                            setNewTimelineMilestones(prev => [...prev, val])
                          }
                          ;(e.target as HTMLInputElement).value = ""
                        }
                      }} className="text-xs h-7" />
                    </div>
                  </div>
                  <div><label className="text-xs font-medium">Notes</label><Input value={newTimelineNotes} onChange={e => setNewTimelineNotes(e.target.value)} placeholder="Notes" className="mt-1 text-xs h-8" /></div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => setShowTimelineForm(false)} className="text-xs h-7">Cancel</Button>
                  <Button size="sm" onClick={() => {
                    if (newTimelineProjectName.trim()) {
                      if (editingTimelineId) {
                        const existing = projectTimelines.find(pt => pt.id === editingTimelineId)
                        setProjectTimelines(prev => prev.map(pt => pt.id === editingTimelineId ? {...pt, projectName: newTimelineProjectName, description: newTimelineDesc, startDate: newTimelineStart, endDate: newTimelineEnd, status: newTimelineStatus, progress: parseInt(newTimelineProgress) || 0, notes: newTimelineNotes, milestones: existing?.milestones || []} : pt))
                      } else {
                        setProjectTimelines(prev => [...prev, {id: Date.now().toString(), projectName: newTimelineProjectName, description: newTimelineDesc, startDate: newTimelineStart, endDate: newTimelineEnd, status: newTimelineStatus, progress: parseInt(newTimelineProgress) || 0, notes: newTimelineNotes, milestones: newTimelineMilestones}])
                      }
                      setShowTimelineForm(false)
                    }
                  }} className="text-xs h-7 bg-[#1E0E6B] text-white">{editingTimelineId ? "Update" : "Add"} Timeline</Button>
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Category</label>
              <div className="relative">
                <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm hover:border-[#1E0E6B]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer appearance-none pr-8">
                  {GOAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>
              {category === "Custom" && <Input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="Custom category" className="mt-2" />}
            </div>
            <div><label className="text-sm font-medium">Priority</label>
              <div className="relative">
                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm hover:border-[#1E0E6B]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer appearance-none pr-8">
                  <option value="none">None</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div></div>
          </div>
          <div><label className="text-sm font-medium">Goal Type</label><div className="flex gap-2 mt-1">
            {(["annual","quarterly","monthly","weekly","custom"] as const).map(t => (
              <Button key={t} variant={type === t ? "default" : "outline"} size="sm" onClick={() => setType(t)} className={type === t ? "bg-[#1E0E6B] text-white" : ""}>{t[0].toUpperCase()+t.slice(1)}</Button>
            ))}</div></div>
          {type === "custom" && (
            <div><label className="text-sm font-medium">Custom Duration (days)</label>
              <Input type="number" min="1" value={customDuration} onChange={e => {
                setCustomDuration(e.target.value)
                const num = parseInt(e.target.value)
                if (num && startDate) {
                  const d = new Date(startDate)
                  d.setDate(d.getDate() + num)
                  setDeadline(d.toISOString().split("T")[0])
                }
              }} placeholder="Enter number of days..." className="mt-1" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><DateInput label="Start Date" value={startDate} onChange={setStartDate} /></div>
            <div><DateInput label="Target Date" value={deadline} onChange={setDeadline} min={minDeadline || undefined} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative"><label className="text-sm font-medium">Icon</label>
              <button type="button" onClick={() => { setShowIconDropdown(!showIconDropdown); setShowColorDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer text-sm">
                <div className="flex items-center gap-2">
                  {icon ? <span className="text-lg">{icon}</span> : <span className="text-muted-foreground">None</span>}
                  <span>Icon</span>
                </div>
                <svg className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showIconDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => { setIcon(""); setShowIconDropdown(false) }}
                      className={`text-sm p-2 rounded-lg transition-all text-center ${icon === "" ? "bg-[#EB9E5B]/20 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>None</button>
                    {GOAL_ICONS.map(ic => (
                      <button key={ic} onClick={() => { setIcon(ic); setShowIconDropdown(false) }}
                        className={`text-lg p-2 rounded-lg transition-all text-center ${icon === ic ? "bg-[#EB9E5B]/20 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>{ic}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative"><label className="text-sm font-medium">Colour</label>
              <button type="button" onClick={() => { setShowColorDropdown(!showColorDropdown); setShowIconDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-300" style={{backgroundColor: GOAL_COLORS[colorIdx].hex}} />
                  <span>{GOAL_COLORS[colorIdx].name}</span>
                </div>
                <svg className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showColorDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 space-y-1">
                  {GOAL_COLORS.map((c, i) => (
                    <button key={c.name} onClick={() => { setColorIdx(i); setShowColorDropdown(false) }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${colorIdx === i ? "bg-[#1E0E6B]/10" : "hover:bg-muted"}`}>
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: c.hex}} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Linked Habits</label>
            <p className="text-xs text-muted-foreground mb-2">Select habits that support this goal</p>
            {habits.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No habits created yet</p>
            ) : (
              <div className="space-y-1 max-h-[150px] overflow-y-auto border border-white/20 rounded-lg p-2">
                {habits.map(h => (
                  <label key={h.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer text-sm">
                    <input type="checkbox" checked={selectedHabits.includes(h.name)} onChange={() => toggleHabit(h.name)} className="accent-[#1E0E6B]" />
                    <span>{h.icon}</span>
                    <span className="flex-1">{h.name}</span>
                    {selectedHabits.includes(h.name) && (
                      <span className="text-[10px] text-muted-foreground font-medium">{habitWeights[h.name] || 0}%</span>
                    )}
                  </label>
                ))}
              </div>
            )}
            {selectedHabits.length > 0 && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={customizeContributions} onChange={(e) => setCustomizeContributions(e.target.checked)} className="accent-[#1E0E6B]" />
                    Customize Goal Contributions
                  </label>
                  <button type="button" onClick={redistributeEvenly} className="text-[10px] text-[#1E0E6B] hover:underline">Redistribute Evenly</button>
                </div>
                {customizeContributions ? (
                  <div className="space-y-2">
                    {selectedHabits.map(name => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-xs flex-1">{name}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" min="1" max="100" value={habitWeights[name] || 0}
                            onChange={(e) => setHabitWeights(prev => ({...prev, [name]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))}))}
                            className="w-16 text-xs text-center border border-[#1E0E6B]/30 rounded px-1 py-1" />
                          <span className="text-[10px] text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedHabits.map(name => (
                      <div key={name} className="flex items-center gap-2 text-xs">
                        <span className="flex-1">{name}</span>
                        <span className="font-medium text-muted-foreground">Goal Contribution: {habitWeights[name] || 0}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`flex items-center gap-1.5 text-xs ${isValidContribution ? "text-emerald-600" : "text-amber-600"}`}>
                  {isValidContribution ? (
                    <><span className="font-medium">✓ Total = 100%</span><span className="text-muted-foreground ml-1">Automatically Distributed</span></>
                  ) : (
                    <><span>⚠ Total Goal Contribution must equal 100%.</span><span className="ml-1">Current Total: {totalContribution}%</span></>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => {
            if (title.trim() && deadline && (selectedHabits.length === 0 || isValidContribution)) {
              const c = GOAL_COLORS[colorIdx]
              const lhw: LinkedHabitWeight[] = selectedHabits.map(name => ({ habitId: name, habitName: name, weight: habitWeights[name] || 0 }))
              onSave({ title, description, category: category === "Custom" ? "Custom" : category, customCategory: category === "Custom" ? customCategory : undefined, priority, progress: 0, deadline, startDate, type, whyItMatters, milestones: [], linkedHabits: selectedHabits, linkedHabitWeights: lhw, projectTimelines, notes: "", color: c.name, colorHex: c.hex, icon, trackingMethod: "milestone", weighting: { projects: 50, habits: 20, milestones: 20, manual: 10 }, status: "not-started" })
              onClose()
            }
          }} disabled={selectedHabits.length > 0 && !isValidContribution} className="flex-1 glow text-white disabled:opacity-50 disabled:cursor-not-allowed">Add Goal</Button>
        </div>
      </div>
    </div>
  )
}

const AddProjectModal = ({ isOpen, onClose, onSave, goalId }: {
  isOpen: boolean; onClose: () => void; onSave: (p: Omit<Project,"id"|"createdAt"|"updatedAt">) => void; goalId: string
}) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low"|"medium"|"high">("medium")
  const [dueDate, setDueDate] = useState("")
  const [startDate, setStartDate] = useState(getTodayISO())
  const [template, setTemplate] = useState("")
  const [icon, setIcon] = useState("\u{1F4CB}")
  const [colorIdx, setColorIdx] = useState(0)
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Add Project</h2><Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button></div>
        <div className="space-y-4">
          <div><label className="text-sm font-medium">Project Template</label><div className="flex flex-wrap gap-2 mt-1">
            <Button variant={template === "" ? "default" : "outline"} size="sm" onClick={() => setTemplate("")} className={template === "" ? "bg-[#1E0E6B] text-white" : ""}>Custom</Button>
            {PROJECT_TEMPLATES.map(t => <Button key={t.name} variant={template === t.name ? "default" : "outline"} size="sm" onClick={() => { setTemplate(t.name); setName(t.name); setIcon(t.icon) }} className={template === t.name ? "bg-[#1E0E6B] text-white" : ""}>{t.icon} {t.name}</Button>)}
          </div></div>
          <div><label className="text-sm font-medium">Project Name</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Build Feature X" className="mt-1" /></div>
          <div><label className="text-sm font-medium">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Priority</label>
              <div className="relative">
                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer appearance-none pr-8">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div></div>
            <div><DateInput label="Due Date" value={dueDate} onChange={setDueDate} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Icon</label><div className="flex flex-wrap gap-1 mt-1">{GOAL_ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)} className={`text-lg p-1.5 rounded-lg ${icon === ic ? "bg-[#EB9E5B]/20 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>{ic}</button>
            ))}</div></div>
            <div><label className="text-sm font-medium">Colour</label><div className="flex gap-2 mt-1">{GOAL_COLORS.map((c,i) => (
              <button key={c.name} onClick={() => setColorIdx(i)} className={`w-7 h-7 rounded-full ${colorIdx === i ? "ring-2 ring-offset-2 ring-[#1E0E6B]" : "hover:scale-105"}`} style={{backgroundColor:c.hex}} />
            ))}</div></div>
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={() => {
            if (name.trim()) {
              const c = GOAL_COLORS[colorIdx]
              const tmpl = PROJECT_TEMPLATES.find(t => t.name === template)
              const tasks = tmpl ? tmpl.tasks.map((t,i) => ({ id: `pt${Date.now()}${i}`, title: t, completed: false, subtasks: [] })) : []
              onSave({ name, description, status: "planning", progress: 0, priority, startDate, dueDate, tasks, notes: "", color: c.name, colorHex: c.hex, icon, tags: [], goalId })
              onClose()
            }
          }} className="flex-1 glow text-white">Add Project</Button>
        </div>
      </div>
    </div>
  )
}

const GoalDetailDrawer = ({ isOpen, onClose, goal, projects, habits, onSaveGoal, onSaveProject, onDeleteGoal }: {
  isOpen: boolean; onClose: () => void; goal: Goal | null; projects: Project[]; habits: Habit[]
  onSaveGoal: (g: Goal) => void; onSaveProject: (p: Project) => void; onDeleteGoal: (id: string) => void
}) => {
  const [data, setData] = useState<Goal | null>(goal)
  const [showAddProject, setShowAddProject] = useState(false)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [newMilestone, setNewMilestone] = useState("")
  useEffect(() => { if (goal) { const gp = calcGoalProgress(goal, projects, habits); setData({ ...goal, progress: gp }) } }, [goal, projects, habits])
  if (!isOpen || !data) return null
  const goalProjects = projects.filter(p => p.goalId === data.id)
  const daysRemaining = getDaysRemaining(data.deadline)
  const daysCompleted = getDaysCompleted(data.startDate)
  const completedMilestones = data.milestones.filter(m => m.completed).length
  const totalTasks = goalProjects.reduce((s, p) => s + p.tasks.length, 0)
  const completedTasks = goalProjects.reduce((s, p) => s + p.tasks.filter(t => t.completed).length, 0)
  const breakdown = getGoalBreakdown(data, projects, habits)

  const toggleMilestone = (id: string) => {
    const updated = { ...data, milestones: data.milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m), updatedAt: getTodayISO() }
    updated.progress = calcGoalProgress(updated, projects, habits)
    setData(updated)
  }
  const addMilestone = () => {
    if (newMilestone.trim()) {
      setData({ ...data, milestones: [...data.milestones, { id: Date.now().toString(), title: newMilestone.trim(), completed: false }], updatedAt: getTodayISO() })
      setNewMilestone("")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><span className="text-2xl">{data.icon}</span><h2 className="text-xl font-bold">{data.title}</h2></div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => { onDeleteGoal(data.id); onClose() }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => { data.progress = calcGoalProgress(data, projects, habits); onSaveGoal(data); onClose() }}><CheckCircle2 className="h-4 w-4 text-emerald-500" /></Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <ProgressRing value={data.progress} size={90} strokeWidth={6} />
            <div className="flex-1">
              <p className="text-3xl font-bold">{data.progress}%</p>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{daysCompleted}d active</span><span>{daysRemaining}d left</span><span>{completedMilestones}/{data.milestones.length} milestones</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Projects", value: goalProjects.length, icon: <Folder className="h-4 w-4" /> },
              { label: "Tasks", value: `${completedTasks}/${totalTasks}`, icon: <ListChecks className="h-4 w-4" /> },
              { label: "Milestones", value: `${completedMilestones}/${data.milestones.length}`, icon: <Target className="h-4 w-4" /> },
              { label: "Habits", value: data.linkedHabits.length, icon: <Zap className="h-4 w-4" /> },
              { label: "Days Left", value: daysRemaining, icon: <Clock className="h-4 w-4" /> },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 text-center">
                <div className="flex justify-center text-muted-foreground mb-1">{s.icon}</div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {breakdown.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Progress Sources</label>
              <div className="space-y-1.5">
                {breakdown.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-white/5 rounded-lg border border-white/10 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="flex-1">{s.name}</span>
                    <Badge variant="secondary" className={`text-[10px] ${s.type === "habit" ? "bg-blue-50 text-blue-600" : s.type === "project" ? "bg-purple-50 text-purple-600" : s.type === "milestone" ? "bg-emerald-50 text-emerald-600" : "bg-muted"}`}>{s.type}</Badge>
                    <span className="font-medium text-xs">{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.linkedHabits.length === 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Suggestions</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">This goal has no supporting habits. Create or link habits to increase your chances of success.</p>
                </div>
              </div>
            </div>
          )}

          {data.linkedHabits.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Linked Habits ({data.linkedHabits.length})</label>
              <div className="space-y-1">
                {data.linkedHabits.map(name => {
                  const weight = data.linkedHabitWeights?.find(w => w.habitName === name)
                  return (
                    <div key={name} className="flex items-center justify-between p-2 bg-white/50 dark:bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3 w-3 text-amber-500" />
                        <span className="text-sm">{name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">Goal Contribution: {weight?.weight || 0}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Goal Title</label><Input value={data.title} onChange={e => setData({...data, title: e.target.value})} className="mt-1" /></div>
            <div><label className="text-sm font-medium">Category</label>
              <div className="relative">
                <select value={data.category} onChange={e => setData({...data, category: e.target.value})} className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm appearance-none pr-8">
                  {GOAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div></div>
          </div>
          <div><label className="text-sm font-medium">Description</label><textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" /></div>
          <div><label className="text-sm font-medium">Why It Matters</label><textarea value={data.whyItMatters} onChange={e => setData({...data, whyItMatters: e.target.value})} className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><DateInput label="Start Date" value={data.startDate} onChange={(v) => setData({...data, startDate: v})} /></div>
            <div><DateInput label="Target Date" value={data.deadline} onChange={(v) => setData({...data, deadline: v})} /></div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Goal Progress Weighting</label>
            <div className="grid grid-cols-4 gap-2">
              {(["projects","habits","milestones","manual"] as const).map(k => (
                <div key={k} className="text-center">
                  <p className="text-xs text-muted-foreground capitalize mb-1">{k}</p>
                  <Input type="number" min="0" max="100" value={data.weighting[k]} onChange={e => setData({...data, weighting: {...data.weighting, [k]: parseInt(e.target.value) || 0 }})} className="text-center text-sm h-8" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Milestones</label>
            <div className="space-y-2 mt-2">
              {data.milestones.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-white/5 rounded-lg border border-white/10">
                  <button onClick={() => toggleMilestone(m.id)}>{m.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}</button>
                  <span className={`flex-1 text-sm ${m.completed ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
                  <button onClick={() => setData({...data, milestones: data.milestones.filter(x => x.id !== m.id)})} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2"><Input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="Add milestone..." onKeyDown={e => e.key === "Enter" && addMilestone()} className="text-sm" /><Button size="sm" onClick={addMilestone}>Add</Button></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Projects ({goalProjects.length})</label>
              <Button size="sm" variant="outline" onClick={() => setShowAddProject(true)}><Plus className="h-3 w-3 mr-1" /> Add Project</Button>
            </div>
            <div className="space-y-2">
              {goalProjects.map(p => (
                <div key={p.id} className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 hover:shadow-md transition-all cursor-pointer" onClick={() => setExpandedProject(expandedProject === p.id ? null : p.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.tasks.filter(t => t.completed).length}/{p.tasks.length} tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] ${p.status === "completed" ? "bg-emerald-50 text-emerald-600" : p.status === "active" ? "bg-blue-50 text-blue-600" : "bg-muted"}`}>{p.status}</Badge>
                      <ProgressRing value={calcProjectProgress(p)} size={36} strokeWidth={3} />
                    </div>
                  </div>
                  {expandedProject === p.id && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-1" onClick={e => e.stopPropagation()}>
                      {p.tasks.map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs">
                          <button onClick={() => {
                            const updated = { ...p, tasks: p.tasks.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x), updatedAt: getTodayISO() }
                            onSaveProject(updated)
                          }}>{t.completed ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground" />}</button>
                          <span className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {goalProjects.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No projects yet. Add one to get started.</p>}
            </div>
          </div>

          <div><label className="text-sm font-medium">Notes</label><textarea value={data.notes} onChange={e => setData({...data, notes: e.target.value})} className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="Notes..." /></div>
        </div>
      </div>
      <AddProjectModal isOpen={showAddProject} onClose={() => setShowAddProject(false)} onSave={(p) => { onSaveProject({ ...p, id: Date.now().toString(), createdAt: getTodayISO(), updatedAt: getTodayISO() }) }} goalId={data.id} />
    </div>
  )
}

function GoalCard({ goal, projects, habits, onClick }: { goal: Goal; projects: Project[]; habits: Habit[]; onClick: () => void }) {
  const goalProjects = projects.filter(p => p.goalId === goal.id)
  const progress = calcGoalProgress(goal, projects, habits)
  const daysRemaining = getDaysRemaining(goal.deadline)
  const completedProjects = goalProjects.filter(p => p.status === "completed").length
  const totalTasks = goalProjects.reduce((s, p) => s + p.tasks.length, 0)
  const completedTasks = goalProjects.reduce((s, p) => s + p.tasks.filter(t => t.completed).length, 0)
  const health = calcGoalHealth(goal as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[])
  const healthCfg = GOAL_HEALTH_CONFIG[health]
  const trend = calcTrend(goal as unknown as GoalData, projects as unknown as GoalProject[])
  const trendCfg = GOAL_TREND_CONFIG[trend]
  const nextAction = generateSmartNextAction(goal as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[])

  return (
    <div onClick={onClick} className="group p-5 bg-white dark:bg-gray-950 rounded-2xl hover:shadow-lg hover:shadow-black/5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5" style={{ border: `2px solid ${goal.colorHex}40` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.icon}</span>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Badge variant="outline" className="text-[10px]" style={{borderColor: goal.colorHex+"40", color: goal.colorHex}}>{goal.customCategory || goal.category}</Badge>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${healthCfg.bg} ${healthCfg.color}`}>{healthCfg.icon} {healthCfg.label}</span>
              <span className={`text-[10px] font-medium ${trendCfg.color}`}>{trendCfg.icon}</span>
            </div>
            <h3 className="font-semibold text-sm leading-tight">{goal.title}</h3>
          </div>
        </div>
        <ProgressRing value={progress} size={52} strokeWidth={4} showLabel={false} />
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>

      {/* Smart Next Action */}
      <div className="mb-3 p-2 rounded-lg bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
        <div className="flex items-center gap-1 mb-0.5">
          <Info className="h-3 w-3 text-[#1E0E6B]" />
          <span className="text-[10px] font-medium text-[#1E0E6B]">Next Action</span>
        </div>
        <p className="text-[11px] text-muted-foreground">{nextAction}</p>
      </div>

      {/* Projects */}
      {goalProjects.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {goalProjects.slice(0, 3).map(p => (
            <div key={p.id} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full shrink-0" style={{backgroundColor: p.colorHex}} />
              <span className="flex-1 truncate">{p.name}</span>
              <span className="text-muted-foreground">{calcProjectProgress(p)}%</span>
            </div>
          ))}
          {goalProjects.length > 3 && <p className="text-[10px] text-muted-foreground">+{goalProjects.length - 3} more projects</p>}
        </div>
      )}

      {/* Linked Habits */}
      {goal.linkedHabits.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {goal.linkedHabits.slice(0, 3).map(name => (
            <Badge key={name} variant="secondary" className="text-[10px] gap-0.5"><Zap className="h-2.5 w-2.5" />{name}</Badge>
          ))}
          {goal.linkedHabits.length > 3 && <Badge variant="secondary" className="text-[10px]">+{goal.linkedHabits.length - 3}</Badge>}
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-medium">{progress}%</span></div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500" style={{width: `${progress}%`, backgroundColor: goal.colorHex}} /></div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{daysRemaining}d</span>
          <span className="flex items-center gap-1"><Folder className="h-3 w-3" />{completedProjects}/{goalProjects.length}</span>
          <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" />{completedTasks}/{totalTasks}</span>
        </div>
        <Badge variant="secondary" className={`text-[10px] ${goal.priority === "high" ? "text-red-500 bg-red-50" : goal.priority === "medium" ? "text-amber-500 bg-amber-50" : goal.priority === "low" ? "text-emerald-500 bg-emerald-50" : "text-muted-foreground bg-muted"}`}>{goal.priority === "none" ? "No priority" : goal.priority}</Badge>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color, infoText }: { label: string; value: string | number; color: string; infoText: string }) {
  const [showInfo, setShowInfo] = useState(false)
  const infoRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showInfo) return
    const handleClick = (e: MouseEvent) => { if (infoRef.current && !infoRef.current.contains(e.target as Node)) setShowInfo(false) }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showInfo])
  return (
    <div className="relative rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-white dark:bg-gray-950 px-4 py-2.5" style={{ border: `2px solid ${color}80` }}>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <button onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo) }} className="absolute bottom-2 right-2 text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        <ChevronDown className="h-3 w-3" />
      </button>
      {showInfo && (
        <div className="absolute z-50 bottom-full mb-2 right-2 w-64 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-white/20 text-xs text-muted-foreground leading-relaxed" ref={infoRef}>
          {infoText}
        </div>
      )}
    </div>
  )
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [vision, setVision] = useState<LifeVision>({ vision: "Become a successful entrepreneur who helps millions live with intentionality", notes: "", whyItMatters: "Everyone deserves purpose", values: ["Integrity","Innovation","Impact"], lifeAreas: ["Career","Health","Relationships"], reviewFrequency: "Monthly", reminderEnabled: true, startDate: "", targetDate: "" })
  const [filter, setFilter] = useState<GoalFilterMode>("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [healthFilter, setHealthFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortMode>("deadline")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isVisionOpen, setIsVisionOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [analyticsGoal, setAnalyticsGoal] = useState<Goal | null>(null)
  const [celebration, setCelebration] = useState<{ show: boolean; milestone: string; progress: number; goalId: string } | null>(null)
  const [viewMode, setViewMode] = useState<"board" | "list">("list")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const sg = localStorage.getItem("intenteo-goals")
      const sp = localStorage.getItem("intenteo-projects")
      const sh = localStorage.getItem("intenteo-habits")
      const sv = localStorage.getItem("intenteo-vision")
      if (sg) { try { setGoals(JSON.parse(sg)) } catch { setGoals(createSampleGoals()) } } else setGoals(createSampleGoals())
      if (sp) { try { setProjects(JSON.parse(sp)) } catch { setProjects(createSampleProjects()) } } else setProjects(createSampleProjects())
      if (sh) { try { setHabits(JSON.parse(sh)) } catch { /* keep empty */ } }
      if (sv) { try { const parsed = JSON.parse(sv); setVision({ ...{ reminderEnabled: true, startDate: "", targetDate: "" }, ...parsed }) } catch { /* keep default */ } }
    } catch {
      setGoals(createSampleGoals())
      setProjects(createSampleProjects())
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-goals", JSON.stringify(goals)) }, [goals, isLoading])
  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-projects", JSON.stringify(projects)) }, [projects, isLoading])
  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-vision", JSON.stringify(vision)) }, [vision, isLoading])

  const saveGoal = useCallback((g: Omit<Goal,"id"|"createdAt"|"updatedAt">) => {
    const now = getTodayISO()
    setGoals(prev => [...prev, { ...g, id: Date.now().toString(), createdAt: now, updatedAt: now, lastActivity: now }])
  }, [])
  const updateGoal = useCallback((g: Goal) => {
    setGoals(prev => prev.map(x => x.id === g.id ? { ...g, updatedAt: getTodayISO(), lastActivity: getTodayISO() } : x))
    const progress = calcGoalProgress(g, projects, habits)
    const det = detectCelebration(g as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[])
    if (det?.show) {
      setCelebration({ show: true, milestone: det.milestone, progress: det.progress, goalId: g.id })
      setTimeout(() => setCelebration(null), 3000)
    }
  }, [projects, habits])
  const deleteGoal = useCallback((id: string) => { if (confirm("Delete this goal?")) setGoals(prev => prev.filter(g => g.id !== id)) }, [])
  const saveProject = useCallback((p: Project) => {
    setProjects(prev => {
      const exists = prev.find(x => x.id === p.id)
      if (exists) return prev.map(x => x.id === p.id ? { ...p, updatedAt: getTodayISO() } : x)
      return [...prev, p]
    })
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = goals.filter(g => {
      if (categoryFilter !== "all" && (g.customCategory || g.category) !== categoryFilter) return false
      if (healthFilter !== "all") {
        const h = calcGoalHealth(g as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[])
        if (h !== healthFilter) return false
      }
      switch (filter) {
        case "all": break
        case "life-vision": if (g.timeline !== "Life Vision") return false; break
        case "10-year": if (g.timeline !== "10-Year") return false; break
        case "5-year": if (g.timeline !== "5-Year") return false; break
        case "annual": if (g.type !== "annual") return false; break
        case "quarterly": if (g.type !== "quarterly") return false; break
        case "monthly": if (g.type !== "monthly") return false; break
        case "weekly": if (g.type !== "weekly") return false; break
        case "daily": if (g.timeline !== "Daily") return false; break
        case "projects": { const gp = projects.filter(p => p.goalId === g.id); if (gp.length === 0) return false; break }
        case "completed": { const p = calcGoalProgress(g, projects, habits); if (p < 100) return false; break }
        case "in-progress": { const p = calcGoalProgress(g, projects, habits); if (p === 0 || p >= 100) return false; break }
        case "not-started": { const p = calcGoalProgress(g, projects, habits); if (p > 0) return false; break }
        case "overdue": { if (new Date(g.deadline) < new Date() && calcGoalProgress(g, projects, habits) < 100) break; return false }
        case "archived": if (g.status !== "archived") return false; break
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const goalProjects = projects.filter(p => p.goalId === g.id)
        if (!g.title.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q) && !g.category.toLowerCase().includes(q) && !goalProjects.some(p => p.name.toLowerCase().includes(q))) return false
      }
      return true
    })
    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline": return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "progress": return calcGoalProgress(b, projects, habits) - calcGoalProgress(a, projects, habits)
        case "updated": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "priority": { const p: any = { high: 0, medium: 1, low: 2, none: 3 }; return p[a.priority] - p[b.priority] }
        case "name": return a.title.localeCompare(b.title)
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default: return 0
      }
    })
    return result
  }, [goals, filter, categoryFilter, searchQuery, sortBy, projects, habits])

  const totalLinkedHabits = goals.reduce((s, g) => s + g.linkedHabits.length, 0)
  const activeProjects = projects.filter(p => p.status === "active").length
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + calcGoalProgress(g, projects, habits), 0) / goals.length) : 0
  const avgHealth = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + getGoalHealthScore(g as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[]), 0) / goals.length) : 0
  const excellentCount = goals.filter(g => calcGoalHealth(g as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[]) === "excellent").length
  const atRiskCount = goals.filter(g => calcGoalHealth(g as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[]) === "at_risk").length
  const overdueCount = goals.filter(g => new Date(g.deadline) < new Date() && calcGoalProgress(g, projects, habits) < 100).length
  const nearestDeadline = goals.length > 0 ? goals.reduce((a, b) => new Date(a.deadline).getTime() < new Date(b.deadline).getTime() ? a : b).title : "—"

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading goals...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Goals</h1><p className="text-muted-foreground">Your life vision in action</p></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-[#1E0E6B]/60 rounded-lg overflow-hidden">
            <Button variant={viewMode === "board" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("board")} className={viewMode === "board" ? "bg-[#1E0E6B] text-white rounded-none" : "rounded-none"}>Board</Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-[#1E0E6B] text-white rounded-none" : "rounded-none"}>List</Button>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className="glow h-9"><Plus className="mr-1 h-4 w-4" /> Add Goal</Button>
        </div>
      </div>

      <>
        <div onClick={() => setIsVisionOpen(true)} className="cursor-pointer group">
            <GlassCard variant="primary" className="p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E0E6B] to-purple-600 shrink-0"><Target className="h-8 w-8 text-white" /></div>
                <div className="flex-1 min-w-0"><h2 className="text-xl font-bold">Life Vision</h2><p className="text-muted-foreground text-sm line-clamp-2">{vision.vision}</p>
                  {vision.values.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{vision.values.slice(0,4).map((v,i) => <Badge key={i} variant="secondary" className="text-[10px]">{v}</Badge>)}</div>}</div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#1E0E6B] transition-colors shrink-0" />
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {[
              { label: "Total Goals", value: goals.length, color: "#1E0E6B", info: `Total number of goals you've created. Currently tracking ${goals.length} goal${goals.length !== 1 ? "s" : ""} across all categories.` },
              { label: "Avg Health", value: `${avgHealth}`, color: avgHealth >= 80 ? "#22C55E" : avgHealth >= 60 ? "#3B82F6" : avgHealth >= 35 ? "#F97316" : "#EF4444", info: `Average health score of all goals (0-100). Based on progress, deadline proximity, habit completion, and project progress. ${avgHealth >= 80 ? "Excellent — keep it up!" : avgHealth >= 60 ? "On track — room to improve." : "Needs attention — review your goals."}` },
              { label: "Avg Progress", value: `${avgProgress}%`, color: "#F97316", info: `Average completion percentage across all goals. Calculated from project progress, milestone completion, and manual tracking. ${avgProgress}% overall progress.` },
              { label: "Excellent", value: excellentCount, color: "#22C55E", info: `Goals with health score ≥ 80. These goals are on track with good progress, deadline management, and consistent habits. ${excellentCount} goal${excellentCount !== 1 ? "s" : ""} performing excellently.` },
              { label: "Overdue", value: overdueCount, color: "#EF4444", info: `Goals past their deadline with less than 100% progress. These need immediate attention. ${overdueCount > 0 ? "Review and update deadlines or accelerate progress." : "No overdue goals — great job!"}` },
            ].map((s, i) => (
              <SummaryCard key={i} label={s.label} value={s.value} color={s.color} infoText={s.info} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search goals, projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-white/50 dark:bg-white/5 border-2 border-[#1E0E6B]/60 focus:border-[#1E0E6B] max-w-md" /></div>
            <select value={filter} onChange={e => setFilter(e.target.value as GoalFilterMode)} className="appearance-none pl-8 pr-8 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer">
              <optgroup label="Goal Types">
                <option value="all">All Goals</option>
                <option value="life-vision">Life Vision</option>
                <option value="10-year">10-Year</option>
                <option value="5-year">5-Year</option>
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="projects">Projects</option>
              </optgroup>
              <optgroup label="Status">
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
                <option value="overdue">Overdue</option>
                <option value="archived">Archived</option>
              </optgroup>
            </select>
            <select value={healthFilter !== "all" ? `health:${healthFilter}` : categoryFilter} onChange={e => {
              const v = e.target.value
              if (v.startsWith("health:")) { setHealthFilter(v.replace("health:", "")); setCategoryFilter("all") }
              else { setCategoryFilter(v); setHealthFilter("all") }
            }} className="appearance-none pl-8 pr-8 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer">
              <option value="all">All Categories</option>
              {GOAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              <option disabled>── Health ──</option>
              <option value="health:excellent">🟢 Excellent</option>
              <option value="health:on_track">🔵 On Track</option>
              <option value="health:needs_attention">🟡 Needs Attention</option>
              <option value="health:at_risk">🔴 At Risk</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortMode)} className="appearance-none pl-8 pr-8 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer">
              <option value="deadline">Deadline</option><option value="progress">Progress</option><option value="updated">Recently Updated</option>
              <option value="priority">Priority</option><option value="name">Alphabetical</option><option value="newest">Newest</option><option value="oldest">Oldest</option>
            </select>
          </div>

          {viewMode === "board" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredAndSorted.map(goal => <GoalCard key={goal.id} goal={goal} projects={projects} habits={habits} onClick={() => setAnalyticsGoal(goal)} />)}
            </div>
          ) : (
            <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Goal</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Health</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Progress</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Projects</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due Date</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSorted.map(goal => {
                    const gp = projects.filter(p => p.goalId === goal.id)
                    const progress = calcGoalProgress(goal, projects, habits)
                    const health = calcGoalHealth(goal as unknown as GoalData, projects as unknown as GoalProject[], habits as unknown as GoalHabit[])
                    const healthCfg = GOAL_HEALTH_CONFIG[health]
                    const daysRemaining = getDaysRemaining(goal.deadline)
                    return (
                      <tr key={goal.id} onClick={() => setAnalyticsGoal(goal)} className="border-b border-[#1E0E6B]/10 hover:bg-white/30 dark:hover:bg-white/5 cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{goal.icon}</span>
                            <span className="font-medium">{goal.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]" style={{borderColor: goal.colorHex+"40", color: goal.colorHex}}>{goal.customCategory || goal.category}</Badge></td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${healthCfg.bg} ${healthCfg.color}`}>{healthCfg.icon} {healthCfg.label}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2"><div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width: `${progress}%`, backgroundColor: goal.colorHex}} /></div><span className="text-xs font-medium w-8">{progress}%</span></div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{gp.length}</td>
                        <td className="px-4 py-3 text-xs">{daysRemaining}d</td>
                        <td className="px-4 py-3"><Badge variant="secondary" className={`text-[10px] ${goal.priority === "high" ? "text-red-500 bg-red-50" : goal.priority === "medium" ? "text-amber-500 bg-amber-50" : goal.priority === "low" ? "text-emerald-500 bg-emerald-50" : "text-muted-foreground bg-muted"}`}>{goal.priority === "none" ? "No priority" : goal.priority}</Badge></td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setAnalyticsGoal(goal) }}><Info className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {filteredAndSorted.length > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/journey"} className="gap-1.5">
                <Map className="h-3.5 w-3.5" /> View My Journey
              </Button>
            </div>
          )}
          {filteredAndSorted.length === 0 && (
            <div className="text-center py-12"><Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">No goals found</h3>
              <p className="text-muted-foreground mt-1">{searchQuery ? "Try a different search" : "Add your first goal"}</p>
              {!searchQuery && <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 glow text-white"><Plus className="mr-2 h-4 w-4" /> Add Goal</Button>}
            </div>
          )}
      </>

      {/* Celebration Overlay */}
      {celebration && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center">
          <div className="text-center animate-bounce">
            <div className="text-6xl mb-2">🎉</div>
            <div className="text-3xl font-bold text-[#1E0E6B]">{celebration.milestone} Complete!</div>
            <div className="text-sm text-muted-foreground mt-1">Keep the momentum going</div>
          </div>
        </div>
      )}

      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={saveGoal} habits={habits} />
      <LifeVisionDrawer isOpen={isVisionOpen} onClose={() => setIsVisionOpen(false)} vision={vision} onSave={setVision} />
      <GoalDetailDrawer isOpen={!!selectedGoal} onClose={() => setSelectedGoal(null)} goal={selectedGoal} projects={projects} habits={habits} onSaveGoal={updateGoal} onSaveProject={saveProject} onDeleteGoal={deleteGoal} />

      {/* Analytics Drawer */}
      {analyticsGoal && (
        <GoalAnalyticsDrawer
          goal={analyticsGoal as unknown as GoalData}
          projects={projects as unknown as GoalProject[]}
          habits={habits as unknown as GoalHabit[]}
          onClose={() => setAnalyticsGoal(null)}
          onEdit={(g) => {
            setAnalyticsGoal(null)
            setSelectedGoal(analyticsGoal)
          }}
        />
      )}
    </div>
  )
}