const fs = require('fs');
const path = require('path');

const content = `"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProgressRing } from "@/components/ui/progress-ring"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  X,
  Search,
  ChevronDown,
  Edit3,
  Trash2,
  Link,
  Paperclip,
  Bell,
  FileText,
  GripVertical,
  Star,
  Zap,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  DollarSign,
  Home,
  Dumbbell,
  Brain,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react"

interface Milestone {
  id: string
  title: string
  completed: boolean
}

interface Goal {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high"
  progress: number
  deadline: string
  startDate: string
  type: "annual" | "quarterly" | "monthly" | "weekly"
  intentScore: number
  futureSelfAlignment: string
  whyItMatters: string
  milestones: Milestone[]
  linkedHabits: string[]
  linkedProjects: string[]
  notes: string
  color: string
  colorHex: string
  icon: string
  trackingMethod: "manual" | "milestone" | "auto"
  createdAt: string
  updatedAt: string
}

interface LifeVision {
  vision: string
  image: string
  notes: string
  whyItMatters: string
  values: string[]
  lifeAreas: string[]
  milestones: string[]
  reviewFrequency: string
}

type SortMode = "deadline" | "progress" | "updated" | "priority" | "name" | "newest" | "oldest"
type FilterMode = "all" | "annual" | "quarterly" | "monthly" | "weekly"

const getTodayISO = () => new Date().toISOString().split("T")[0]

const formatDateISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return \`\${year}-\${month}-\${day}\`
}

const GOAL_CATEGORIES = [
  { name: "Health", color: "#22C55E", icon: "💪" },
  { name: "Faith", color: "#8B5CF6", icon: "🙏" },
  { name: "Finance", color: "#EAB308", icon: "💰" },
  { name: "Career", color: "#3B82F6", icon: "💼" },
  { name: "Learning", color: "#F97316", icon: "📚" },
  { name: "Relationships", color: "#EC4899", icon: "❤️" },
  { name: "Business", color: "#14B8A6", icon: "🚀" },
  { name: "Personal Growth", color: "#6366F1", icon: "🌱" },
  { name: "Family", color: "#EF4444", icon: "👨‍👩‍👧" },
  { name: "Custom", color: "#6B7280", icon: "⭐" },
]

const GOAL_COLORS = [
  { name: "Indigo", hex: "#1E0E6B" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Orange", hex: "#F97316" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Red", hex: "#EF4444" },
]

const GOAL_ICONS = ["🎯", "⭐", "🚀", "💡", "🔥", "💎", "🏆", "📈", "💪", "📚", "💰", "❤️", "🙏", "🎓", "💼", "🌱"]

const createSampleGoals = (): Goal[] => [
  { id: "1", title: "Launch Intenteo MVP", description: "Ship the first version of the platform to beta users", category: "Career", priority: "high", progress: 65, deadline: "2026-09-30", startDate: "2026-01-01", type: "quarterly", intentScore: 90, futureSelfAlignment: "Become a successful entrepreneur", whyItMatters: "Building something that helps millions", milestones: [{ id: "m1", title: "Complete UI design", completed: true }, { id: "m2", title: "Backend API ready", completed: true }, { id: "m3", title: "Beta testing", completed: false }, { id: "m4", title: "Launch to public", completed: false }], linkedHabits: [], linkedProjects: [], notes: "", color: "Indigo", colorHex: "#1E0E6B", icon: "🚀", trackingMethod: "milestone", createdAt: "2026-01-01", updatedAt: "2026-06-01" },
  { id: "2", title: "Run a Half Marathon", description: "Complete a 21km race in under 2 hours", category: "Health", priority: "medium", progress: 40, deadline: "2026-12-31", startDate: "2026-01-01", type: "annual", intentScore: 85, futureSelfAlignment: "Become physically fit and disciplined", whyItMatters: "Health is wealth", milestones: [{ id: "m5", title: "Run 5km", completed: true }, { id: "m6", title: "Run 10km", completed: true }, { id: "m7", title: "Run 15km", completed: false }, { id: "m8", title: "Run 21km", completed: false }], linkedHabits: ["Exercise"], linkedProjects: [], notes: "", color: "Green", colorHex: "#22C55E", icon: "💪", trackingMethod: "milestone", createdAt: "2026-01-01", updatedAt: "2026-05-15" },
  { id: "3", title: "Read 24 Books", description: "Read 2 books per month on leadership and growth", category: "Learning", priority: "medium", progress: 50, deadline: "2026-12-31", startDate: "2026-01-01", type: "annual", intentScore: 80, futureSelfAlignment: "Become a lifelong learner", whyItMatters: "Knowledge is power", milestones: [{ id: "m9", title: "January", completed: true }, { id: "m10", title: "February", completed: true }, { id: "m11", title: "March", completed: true }, { id: "m12", title: "April", completed: true }, { id: "m13", title: "May", completed: true }, { id: "m14", title: "June", completed: false }], linkedHabits: ["Read 30 Minutes"], linkedProjects: [], notes: "", color: "Orange", colorHex: "#F97316", icon: "📚", trackingMethod: "milestone", createdAt: "2026-01-01", updatedAt: "2026-06-01" },
  { id: "4", title: "Save $10,000", description: "Build emergency fund and investment capital", category: "Finance", priority: "high", progress: 35, deadline: "2026-12-31", startDate: "2026-01-01", type: "annual", intentScore: 75, futureSelfAlignment: "Achieve financial freedom", whyItMatters: "Financial security for family", milestones: [{ id: "m15", title: "Save $2,500", completed: true }, { id: "m16", title: "Save $5,000", completed: false }, { id: "m17", title: "Save $7,500", completed: false }, { id: "m18", title: "Save $10,000", completed: false }], linkedHabits: [], linkedProjects: [], notes: "", color: "Teal", colorHex: "#14B8A6", icon: "💰", trackingMethod: "milestone", createdAt: "2026-01-01", updatedAt: "2026-04-01" },
  { id: "5", title: "Weekly Date Night", description: "Spend quality time with partner every week", category: "Relationships", priority: "medium", progress: 70, deadline: "2026-12-31", startDate: "2026-01-01", type: "weekly", intentScore: 95, futureSelfAlignment: "Nurture meaningful relationships", whyItMatters: "Love is the foundation", milestones: [{ id: "m19", title: "Week 1", completed: true }, { id: "m20", title: "Week 2", completed: true }, { id: "m21", title: "Week 3", completed: true }, { id: "m22", title: "Week 4", completed: false }], linkedHabits: [], linkedProjects: [], notes: "", color: "Pink", colorHex: "#EC4899", icon: "❤️", trackingMethod: "manual", createdAt: "2026-01-01", updatedAt: "2026-06-01" },
]

const createDefaultVision = (): LifeVision => ({
  vision: "Become a successful entrepreneur who helps millions live with intentionality",
  image: "",
  notes: "Focus on building products that matter. Stay consistent and authentic.",
  whyItMatters: "Because everyone deserves to live with purpose and clarity",
  values: ["Integrity", "Innovation", "Impact", "Growth"],
  lifeAreas: ["Career", "Health", "Relationships", "Finance"],
  milestones: ["Launch MVP", "1000 Users", "Revenue Positive", "Team of 10"],
  reviewFrequency: "Monthly",
})

const getDaysRemaining = (deadline: string): number => {
  const today = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

const getDaysCompleted = (startDate: string): number => {
  const today = new Date()
  const start = new Date(startDate)
  const diff = Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

const getPriorityColor = (p: string) => {
  switch (p) {
    case "high": return "text-red-500 bg-red-50"
    case "medium": return "text-amber-500 bg-amber-50"
    case "low": return "text-emerald-500 bg-emerald-50"
    default: return "text-gray-500 bg-gray-50"
  }
}

/* ─── Life Vision Drawer ─── */

const LifeVisionDrawer = ({
  isOpen,
  onClose,
  vision,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  vision: LifeVision
  onSave: (v: LifeVision) => void
}) => {
  const [data, setData] = useState(vision)
  const [newValue, setNewValue] = useState("")

  useEffect(() => { setData(vision) }, [vision])

  if (!isOpen) return null

  const addToArray = (field: "values" | "lifeAreas" | "milestones") => {
    if (newValue.trim()) {
      setData({ ...data, [field]: [...data[field], newValue.trim()] })
      setNewValue("")
    }
  }

  const removeFromArray = (field: "values" | "lifeAreas" | "milestones", idx: number) => {
    setData({ ...data, [field]: data[field].filter((_, i) => i !== idx) })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-white/20 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Life Vision</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium">Vision Statement</label>
            <textarea value={data.vision} onChange={(e) => setData({ ...data, vision: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[80px]" placeholder="Your life vision..." />
          </div>
          <div>
            <label className="text-sm font-medium">Why This Vision Matters</label>
            <textarea value={data.whyItMatters} onChange={(e) => setData({ ...data, whyItMatters: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="Why does this matter to you?" />
          </div>
          <div>
            <label className="text-sm font-medium">Supporting Notes</label>
            <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="Additional notes..." />
          </div>
          <div>
            <label className="text-sm font-medium">Review Frequency</label>
            <select value={data.reviewFrequency} onChange={(e) => setData({ ...data, reviewFrequency: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
              {["Weekly", "Monthly", "Quarterly", "Yearly"].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          {(["values", "lifeAreas", "milestones"] as const).map(field => (
            <div key={field}>
              <label className="text-sm font-medium capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {data[field].map((item, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {item}
                    <button onClick={() => removeFromArray(field, i)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input value={newValue} onChange={(e) => setNewValue(e.target.value)}
                  placeholder={\`Add \${field.replace(/([A-Z])/g, " $1").toLowerCase()}...\`}
                  onKeyDown={(e) => e.key === "Enter" && addToArray(field)} className="text-sm" />
                <Button size="sm" onClick={() => addToArray(field)}>Add</Button>
              </div>
            </div>
          ))}
          <Button onClick={() => { onSave(data); onClose() }} className="w-full bg-[#1E0E6B] text-white">Save Vision</Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Goal Detail Drawer ─── */

const GoalDetailDrawer = ({
  isOpen,
  onClose,
  goal,
  onSave,
  onDelete,
}: {
  isOpen: boolean
  onClose: () => void
  goal: Goal | null
  onSave: (g: Goal) => void
  onDelete: (id: string) => void
}) => {
  const [data, setData] = useState<Goal | null>(goal)
  const [newMilestone, setNewMilestone] = useState("")

  useEffect(() => { setData(goal) }, [goal])

  if (!isOpen || !data) return null

  const updateProgress = () => {
    if (data.trackingMethod === "milestone" && data.milestones.length > 0) {
      const completed = data.milestones.filter(m => m.completed).length
      return Math.round((completed / data.milestones.length) * 100)
    }
    return data.progress
  }

  const toggleMilestone = (id: string) => {
    const updated = { ...data, milestones: data.milestones.map(m => m.id === id ? { ...m, completed: !m.completed } : m), updatedAt: getTodayISO() }
    updated.progress = updateProgress()
    setData(updated)
  }

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setData({ ...data, milestones: [...data.milestones, { id: Date.now().toString(), title: newMilestone.trim(), completed: false }], updatedAt: getTodayISO() })
      setNewMilestone("")
    }
  }

  const removeMilestone = (id: string) => {
    setData({ ...data, milestones: data.milestones.filter(m => m.id !== id), updatedAt: getTodayISO() })
  }

  const daysRemaining = getDaysRemaining(data.deadline)
  const daysCompleted = getDaysCompleted(data.startDate)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{data.icon}</span>
            <h2 className="text-xl font-bold">{data.title}</h2>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => { onDelete(data.id); onClose() }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4">
            <ProgressRing value={data.progress} size={80} strokeWidth={5} />
            <div>
              <p className="text-3xl font-bold">{data.progress}%</p>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 text-center">
              <p className="text-lg font-bold text-emerald-500">{daysCompleted}</p>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 text-center">
              <p className="text-lg font-bold text-amber-500">{daysRemaining}</p>
              <p className="text-xs text-muted-foreground">Days Left</p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 text-center">
              <p className="text-lg font-bold text-[#1E0E6B]">{data.milestones.filter(m => m.completed).length}/{data.milestones.length}</p>
              <p className="text-xs text-muted-foreground">Milestones</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Goal Title</label>
            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value, updatedAt: getTodayISO() })} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value, updatedAt: getTodayISO() })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" />
          </div>
          <div>
            <label className="text-sm font-medium">Why It Matters</label>
            <textarea value={data.whyItMatters} onChange={(e) => setData({ ...data, whyItMatters: e.target.value, updatedAt: getTodayISO() })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={data.category} onChange={(e) => setData({ ...data, category: e.target.value, updatedAt: getTodayISO() })}
                className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
                {GOAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select value={data.priority} onChange={(e) => setData({ ...data, priority: e.target.value as Goal["priority"], updatedAt: getTodayISO() })}
                className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={data.startDate} onChange={(e) => setData({ ...data, startDate: e.target.value, updatedAt: getTodayISO() })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Target Date</label>
              <Input type="date" value={data.deadline} onChange={(e) => setData({ ...data, deadline: e.target.value, updatedAt: getTodayISO() })} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tracking Method</label>
            <div className="flex gap-2 mt-1">
              {(["manual", "milestone", "auto"] as const).map(m => (
                <Button key={m} variant={data.trackingMethod === m ? "default" : "outline"} size="sm"
                  onClick={() => setData({ ...data, trackingMethod: m, updatedAt: getTodayISO() })}
                  className={data.trackingMethod === m ? "bg-[#1E0E6B] text-white" : ""}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {data.trackingMethod === "manual" && (
            <div>
              <label className="text-sm font-medium">Progress ({data.progress}%)</label>
              <input type="range" min="0" max="100" value={data.progress}
                onChange={(e) => setData({ ...data, progress: parseInt(e.target.value), updatedAt: getTodayISO() })}
                className="mt-1 w-full accent-[#1E0E6B]" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {GOAL_ICONS.map(ic => (
                <button key={ic} onClick={() => setData({ ...data, icon: ic, updatedAt: getTodayISO() })}
                  className={\`text-lg p-1.5 rounded-lg transition-all \${data.icon === ic ? "bg-[#EB9E5B]/20 scale-110 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}\`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Colour</label>
            <div className="flex gap-2 mt-1">
              {GOAL_COLORS.map(c => (
                <button key={c.name} onClick={() => setData({ ...data, color: c.name, colorHex: c.hex, updatedAt: getTodayISO() })}
                  className={\`w-7 h-7 rounded-full transition-all \${data.color === c.name ? "ring-2 ring-offset-2 ring-[#1E0E6B] scale-110" : "hover:scale-105"}\`}
                  style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Milestones</label>
            <div className="space-y-2 mt-2">
              {data.milestones.map(m => (
                <div key={m.id} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-white/5 rounded-lg border border-white/10">
                  <button onClick={() => toggleMilestone(m.id)}>
                    {m.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}
                  </button>
                  <span className={\`flex-1 text-sm \${m.completed ? "line-through text-muted-foreground" : ""}\`}>{m.title}</span>
                  <button onClick={() => removeMilestone(m.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} placeholder="Add milestone..."
                onKeyDown={(e) => e.key === "Enter" && addMilestone()} className="text-sm" />
              <Button size="sm" onClick={addMilestone}>Add</Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Linked Habits</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {data.linkedHabits.map((h, i) => (
                <Badge key={i} variant="secondary" className="gap-1">{h}<button onClick={() => setData({ ...data, linkedHabits: data.linkedHabits.filter((_, j) => j !== i) })}><X className="h-3 w-3" /></button></Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea value={data.notes} onChange={(e) => setData({ ...data, notes: e.target.value, updatedAt: getTodayISO() })}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="Additional notes..." />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={() => { data.progress = updateProgress(); onSave(data); onClose() }} className="flex-1 bg-[#1E0E6B] text-white">Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Add Goal Modal ─── */

const AddGoalModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (g: Omit<Goal, "id" | "createdAt" | "updatedAt">) => void
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Personal Growth")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [type, setType] = useState<Goal["type"]>("annual")
  const [deadline, setDeadline] = useState("")
  const [startDate, setStartDate] = useState(getTodayISO())
  const [whyItMatters, setWhyItMatters] = useState("")
  const [trackingMethod, setTrackingMethod] = useState<"manual" | "milestone" | "auto">("manual")
  const [progress, setProgress] = useState(0)
  const [icon, setIcon] = useState("🎯")
  const [colorIdx, setColorIdx] = useState(0)
  const [notes, setNotes] = useState("")

  if (!isOpen) return null

  const reset = () => {
    setTitle(""); setDescription(""); setCategory("Personal Growth"); setPriority("medium")
    setType("annual"); setDeadline(""); setStartDate(getTodayISO()); setWhyItMatters("")
    setTrackingMethod("manual"); setProgress(0); setIcon("🎯"); setColorIdx(0); setNotes("")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Add New Goal</h2>
          <Button variant="ghost" size="icon" onClick={() => { reset(); onClose() }}><X className="h-5 w-5" /></Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Goal Name</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Read 24 Books" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="What does this goal involve?" />
          </div>
          <div>
            <label className="text-sm font-medium">Why It Matters</label>
            <textarea value={whyItMatters} onChange={(e) => setWhyItMatters(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="Why is this important to you?" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
                {GOAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Goal Type</label>
            <div className="flex gap-2 mt-1">
              {(["annual", "quarterly", "monthly", "weekly"] as const).map(t => (
                <Button key={t} variant={type === t ? "default" : "outline"} size="sm" onClick={() => setType(t)}
                  className={type === t ? "bg-[#1E0E6B] text-white" : ""}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Target Date</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Tracking Method</label>
            <div className="flex gap-2 mt-1">
              {(["manual", "milestone", "auto"] as const).map(m => (
                <Button key={m} variant={trackingMethod === m ? "default" : "outline"} size="sm" onClick={() => setTrackingMethod(m)}
                  className={trackingMethod === m ? "bg-[#1E0E6B] text-white" : ""}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          {trackingMethod === "manual" && (
            <div>
              <label className="text-sm font-medium">Initial Progress ({progress}%)</label>
              <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value))} className="mt-1 w-full accent-[#1E0E6B]" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Icon</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {GOAL_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className={\`text-lg p-1.5 rounded-lg transition-all \${icon === ic ? "bg-[#EB9E5B]/20 scale-110 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}\`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Colour</label>
              <div className="flex gap-2 mt-1">
                {GOAL_COLORS.map((c, i) => (
                  <button key={c.name} onClick={() => setColorIdx(i)}
                    className={\`w-7 h-7 rounded-full transition-all \${colorIdx === i ? "ring-2 ring-offset-2 ring-[#1E0E6B] scale-110" : "hover:scale-105"}\`}
                    style={{ backgroundColor: c.hex }} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px]" placeholder="Any additional notes..." />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={() => { reset(); onClose() }} className="flex-1">Cancel</Button>
          <Button onClick={() => {
            if (title.trim() && deadline) {
              const c = GOAL_COLORS[colorIdx]
              onSave({
                title, description, category, priority, progress, deadline, startDate, type,
                intentScore: 50, futureSelfAlignment: "", whyItMatters, milestones: [],
                linkedHabits: [], linkedProjects: [], notes, color: c.name, colorHex: c.hex,
                icon, trackingMethod,
              })
              reset()
              onClose()
            }
          }} className="flex-1 bg-gradient-to-r from-[#EB9E5B] to-[#EB9E5B]/80 text-white hover:from-[#EB9E5B]/90 hover:to-[#EB9E5B]/70">
            Add Goal
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Goal Card ─── */

function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const daysRemaining = getDaysRemaining(goal.deadline)
  const cat = GOAL_CATEGORIES.find(c => c.name === goal.category)

  return (
    <div onClick={onClick}
      className="group p-5 bg-white dark:bg-gray-950 rounded-2xl border border-white/20 hover:shadow-lg hover:shadow-black/5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{goal.icon}</span>
          <div>
            <Badge variant="outline" className="text-[10px] mb-1" style={{ borderColor: goal.colorHex + "40", color: goal.colorHex }}>
              {goal.category}
            </Badge>
            <h3 className="font-semibold text-sm leading-tight">{goal.title}</h3>
          </div>
        </div>
        <ProgressRing value={goal.progress} size={52} strokeWidth={4} />
      </div>
      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: \`\${goal.progress}%\`, backgroundColor: goal.colorHex }} />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{daysRemaining}d left</span>
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{goal.milestones.filter(m => m.completed).length}/{goal.milestones.length}</span>
        </div>
        <Badge variant="secondary" className={\`text-[10px] \${getPriorityColor(goal.priority)}\`}>{goal.priority}</Badge>
      </div>
      {goal.milestones.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
          {goal.milestones.slice(0, 2).map(m => (
            <div key={m.id} className="flex items-center gap-1.5 text-xs">
              {m.completed ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <div className="h-3 w-3 rounded-full border border-muted-foreground" />}
              <span className={m.completed ? "line-through text-muted-foreground" : ""}>{m.title}</span>
            </div>
          ))}
          {goal.milestones.length > 2 && <p className="text-[10px] text-muted-foreground">+{goal.milestones.length - 2} more</p>}
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [vision, setVision] = useState<LifeVision>(createDefaultVision())
  const [filter, setFilter] = useState<FilterMode>("all")
  const [sortBy, setSortBy] = useState<SortMode>("deadline")
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isVisionDrawerOpen, setIsVisionDrawerOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedGoals = localStorage.getItem("intenteo-goals")
    const savedVision = localStorage.getItem("intenteo-vision")
    const savedFilter = localStorage.getItem("intenteo-goals-filter")
    const savedSort = localStorage.getItem("intenteo-goals-sort")
    if (savedGoals) { try { setGoals(JSON.parse(savedGoals)) } catch { setGoals(createSampleGoals()) } }
    else { setGoals(createSampleGoals()) }
    if (savedVision) { try { setVision(JSON.parse(savedVision)) } catch {} }
    if (savedFilter) setFilter(savedFilter as FilterMode)
    if (savedSort) setSortBy(savedSort as SortMode)
    setIsLoading(false)
  }, [])

  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-goals", JSON.stringify(goals)) }, [goals, isLoading])
  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-vision", JSON.stringify(vision)) }, [vision, isLoading])
  useEffect(() => { localStorage.setItem("intenteo-goals-filter", filter) }, [filter])
  useEffect(() => { localStorage.setItem("intenteo-goals-sort", sortBy) }, [sortBy])

  const saveGoal = useCallback((goalData: Omit<Goal, "id" | "createdAt" | "updatedAt">) => {
    const now = getTodayISO()
    setGoals(prev => [...prev, { ...goalData, id: Date.now().toString(), createdAt: now, updatedAt: now }])
  }, [])

  const updateGoal = useCallback((updated: Goal) => {
    setGoals(prev => prev.map(g => g.id === updated.id ? { ...updated, updatedAt: getTodayISO() } : g))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    if (confirm("Delete this goal?")) setGoals(prev => prev.filter(g => g.id !== id))
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = goals.filter(g => {
      if (filter !== "all" && g.type !== filter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!g.title.toLowerCase().includes(q) && !g.description.toLowerCase().includes(q) && !g.category.toLowerCase().includes(q) && !g.notes.toLowerCase().includes(q)) return false
      }
      return true
    })
    result.sort((a, b) => {
      switch (sortBy) {
        case "deadline": return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "progress": return b.progress - a.progress
        case "updated": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "priority": { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority] }
        case "name": return a.title.localeCompare(b.title)
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default: return 0
      }
    })
    return result
  }, [goals, filter, searchQuery, sortBy])

  const annualCount = goals.filter(g => g.type === "annual").length
  const quarterlyCount = goals.filter(g => g.type === "quarterly").length
  const monthlyCount = goals.filter(g => g.type === "monthly").length

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading goals...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Your life vision in action</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-[#EB9E5B] to-[#EB9E5B]/80 text-white hover:from-[#EB9E5B]/90 hover:to-[#EB9E5B]/70">
          <Plus className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </div>

      <div onClick={() => setIsVisionDrawerOpen(true)} className="cursor-pointer group">
        <GlassCard variant="primary" className="p-6 hover:shadow-lg transition-all duration-200 group-hover:shadow-black/10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E0E6B] to-purple-600 shrink-0">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">Life Vision</h2>
              <p className="text-muted-foreground text-sm line-clamp-2">{vision.vision}</p>
              {vision.values.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {vision.values.slice(0, 4).map((v, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px]">{v}</Badge>
                  ))}
                </div>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#1E0E6B] transition-colors shrink-0" />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "10-Year Vision", count: 1, icon: <Sparkles className="h-5 w-5" />, color: "from-purple-400 to-pink-500" },
          { label: "Annual Goals", count: annualCount, icon: <Calendar className="h-5 w-5" />, color: "from-blue-400 to-cyan-500" },
          { label: "Quarterly Goals", count: quarterlyCount, icon: <TrendingUp className="h-5 w-5" />, color: "from-emerald-400 to-green-500" },
          { label: "Monthly Goals", count: monthlyCount, icon: <Target className="h-5 w-5" />, color: "from-orange-400 to-amber-500" },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-[#1E0E6B]/15 bg-white dark:bg-gray-950 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className={\`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br \${item.color}\`}>
                <span className="text-white">{item.icon}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search goals..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-white/5 border-white/20" />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "annual", "quarterly", "monthly", "weekly"] as FilterMode[]).map(f => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
              className={filter === f ? "bg-[#1E0E6B] text-white" : ""}>
              {f === "all" ? "All Goals" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortMode)}
          className="px-3 py-2 text-sm border border-white/20 rounded-lg bg-white/50 dark:bg-white/5">
          <option value="deadline">Sort: Deadline</option>
          <option value="progress">Sort: Progress</option>
          <option value="updated">Sort: Recently Updated</option>
          <option value="priority">Sort: Priority</option>
          <option value="name">Sort: Alphabetical</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredAndSorted.map(goal => (
          <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoal(goal)} />
        ))}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No goals found</h3>
          <p className="text-muted-foreground mt-1">{searchQuery ? "Try a different search" : "Add your first goal to get started"}</p>
          {!searchQuery && (
            <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 bg-gradient-to-r from-[#EB9E5B] to-[#EB9E5B]/80 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Goal
            </Button>
          )}
        </div>
      )}

      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={saveGoal} />
      <LifeVisionDrawer isOpen={isVisionDrawerOpen} onClose={() => setIsVisionDrawerOpen(false)} vision={vision} onSave={setVision} />
      <GoalDetailDrawer isOpen={!!selectedGoal} onClose={() => setSelectedGoal(null)} goal={selectedGoal} onSave={updateGoal} onDelete={deleteGoal} />
    </div>
  )
}`;

const filePath = path.join(__dirname, '..', 'src', 'components', 'goals', 'goals-page.tsx');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Goals page written successfully!');
console.log('File size:', content.length, 'bytes');
