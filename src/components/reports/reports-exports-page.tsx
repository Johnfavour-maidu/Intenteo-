"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { GlassCard } from "@/components/ui/glass-card"
import {
  BarChart3, FileText, Download, TrendingUp, Target, Repeat, BookOpen,
  CheckSquare, Star, Award, ChevronDown, ChevronRight, Calendar,
  PieChart, FileSpreadsheet, File, Zap, ArrowUp, ArrowDown,
  Clock, Flame, AlertTriangle, CheckCircle2, Map, Eye,
} from "lucide-react"
import { formatDateDDMMYYYY } from "@/lib/date-utils"
import {
  loadVisions, loadPurpose, loadCoreValues, loadCommitments,
  loadRoadmapMilestones, loadPurposeReviews,
  type Vision, type Purpose, type CoreValue, type Commitment, type RoadmapMilestone, type PurposeReview,
} from "@/lib/vision-framework"

/* ─── Local Storage Loaders ─── */

function loadGoals(): any[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("intenteo-goals")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadHabits(): any[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("intenteo-habits")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadTasks(): any[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("intenteo-tasks")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadJournal(): any[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("intenteo-journal-entries")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadReviews(): any[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("intenteo-reviews")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function loadProjects(): any[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("intenteo-projects")
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

/* ─── Helpers ─── */

const todayISO = () => new Date().toISOString().split("T")[0]

function daysBetween(a: string, b: string): number {
  const d1 = new Date(a), d2 = new Date(b)
  return Math.round(Math.abs(d2.getTime() - d1.getTime()) / 86400000)
}

function getStreakDays(completions: Record<string, boolean>): number {
  if (!completions || Object.keys(completions).length === 0) return 0
  const sorted = Object.keys(completions).filter(k => completions[k]).sort().reverse()
  if (sorted.length === 0) return 0
  let streak = 0
  const today = todayISO()
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today)
    expected.setDate(expected.getDate() - i)
    const expectedISO = expected.toISOString().split("T")[0]
    if (sorted[i] === expectedISO) streak++
    else break
  }
  return streak
}

/* ─── Expandable Section ─── */

function Section({ title, icon: Icon, count, children, defaultOpen = false }: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-[#1E0E6B]/10 rounded-xl overflow-hidden bg-white dark:bg-gray-950">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#1E0E6B]/3 transition-colors"
      >
        <Icon className="h-5 w-5 text-[#1E0E6B]" />
        <span className="font-semibold text-foreground flex-1 text-left">{title}</span>
        {count !== undefined && (
          <Badge variant="secondary" className="text-xs bg-[#1E0E6B]/10 text-[#1E0E6B] border-0">{count}</Badge>
        )}
        {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 border-t border-[#1E0E6B]/5">{children}</div>}
    </div>
  )
}

/* ─── Report Card ─── */

function ReportCard({ title, description, icon: Icon, onClick }: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl border border-[#1E0E6B]/10 hover:border-[#1E0E6B]/25 hover:bg-[#1E0E6B]/3 transition-all text-left group"
    >
      <div className="p-2 rounded-lg bg-[#1E0E6B]/5 group-hover:bg-[#1E0E6B]/10 transition-colors">
        <Icon className="h-4 w-4 text-[#1E0E6B]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  )
}

/* ─── Export Card ─── */

function ExportCard({ title, description, icon: Icon, format }: {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  format: string
}) {
  return (
    <button className="flex items-start gap-3 p-4 rounded-xl border border-[#1E0E6B]/10 hover:border-[#EB9E5B]/40 hover:bg-[#EB9E5B]/5 transition-all text-left group">
      <div className="p-2 rounded-lg bg-[#EB9E5B]/10 group-hover:bg-[#EB9E5B]/20 transition-colors">
        <Icon className="h-4 w-4 text-[#EB9E5B]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        <Badge variant="secondary" className="mt-2 text-[10px] bg-[#EB9E5B]/10 text-[#EB9E5B] border-0">{format}</Badge>
      </div>
    </button>
  )
}

/* ─── Stat Card ─── */

function StatCard({ label, value, icon: Icon }: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="p-4 rounded-xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[#1E0E6B]/5">
          <Icon className="h-4 w-4 text-[#1E0E6B]" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ─── */

export function ReportsExportsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [journal, setJournal] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [visions, setVisions] = useState<Vision[]>([])
  const [purpose, setPurpose] = useState<Purpose | null>(null)
  const [coreValues, setCoreValues] = useState<CoreValue[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([])
  const [purposeReviews, setPurposeReviews] = useState<PurposeReview[]>([])
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    setGoals(loadGoals())
    setHabits(loadHabits())
    setTasks(loadTasks())
    setJournal(loadJournal())
    setReviews(loadReviews())
    setVisions(loadVisions())
    setPurpose(loadPurpose())
    setCoreValues(loadCoreValues())
    setCommitments(loadCommitments())
    setMilestones(loadRoadmapMilestones())
    setPurposeReviews(loadPurposeReviews())
    setProjects(loadProjects())
  }, [])

  useEffect(() => {
    const refresh = () => {
      setGoals(loadGoals())
      setHabits(loadHabits())
      setTasks(loadTasks())
      setJournal(loadJournal())
      setReviews(loadReviews())
      setVisions(loadVisions())
      setPurpose(loadPurpose())
      setCoreValues(loadCoreValues())
      setCommitments(loadCommitments())
      setMilestones(loadRoadmapMilestones())
      setPurposeReviews(loadPurposeReviews())
      setProjects(loadProjects())
    }
    window.addEventListener("focus", refresh)
    return () => window.removeEventListener("focus", refresh)
  }, [])

  /* ─── Computed Stats ─── */

  const stats = useMemo(() => {
    const activeGoals = goals.filter((g: any) => g.status !== "archived")
    const completedGoals = goals.filter((g: any) => g.status === "completed")
    const activeHabits = habits.filter((h: any) => !h.paused)
    const completedTasks = tasks.filter((t: any) => t.completed)
    const pendingTasks = tasks.filter((t: any) => !t.completed)
    const completedMilestones = milestones.filter(m => m.status === "completed")
    const avgProgress = activeGoals.length > 0
      ? Math.round(activeGoals.reduce((s: number, g: any) => s + (g.progress || 0), 0) / activeGoals.length)
      : 0

    const today = todayISO()
    const thisWeek = tasks.filter((t: any) => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 86400000)
      return d >= weekAgo && d <= now
    })
    const tasksCompletedThisWeek = thisWeek.filter((t: any) => t.completed).length

    const habitsCompletedToday = activeHabits.filter((h: any) => {
      if (h.frequency === "daily") return (h.dailyCompletions || {})[today]
      if (h.frequency === "weekly") return (h.weeklyCompletions || {})[today]
      return false
    }).length

    const bestStreak = activeHabits.reduce((best: number, h: any) => {
      const s = getStreakDays(h.completions || h.dailyCompletions || {})
      return s > best ? s : best
    }, 0)

    const overdueTasks = pendingTasks.filter((t: any) => {
      if (!t.dueDate) return false
      return t.dueDate < today
    })

    const goalCompletionRate = goals.length > 0
      ? Math.round((completedGoals.length / goals.length) * 100)
      : 0

    const lifeAreas = new Set<string>()
    goals.forEach((g: any) => { if (g.lifeArea) lifeAreas.add(g.lifeArea) })
    habits.forEach((h: any) => { if (h.lifeArea) lifeAreas.add(h.lifeArea) })

    const mostActiveArea = lifeAreas.size > 0 ? Array.from(lifeAreas)[0] : "—"

    const reviewsCompleted = reviews.length
    const purposeReviewsCompleted = purposeReviews.length

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      goalCompletionRate,
      avgProgress,
      totalHabits: habits.length,
      activeHabits: activeHabits.length,
      habitsCompletedToday,
      bestStreak,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      overdueTasks: overdueTasks.length,
      tasksCompletedThisWeek,
      totalJournal: journal.length,
      totalVisions: visions.length,
      totalMilestones: milestones.length,
      completedMilestones: completedMilestones.length,
      totalCommitments: commitments.length,
      totalProjects: projects.length,
      totalCoreValues: coreValues.length,
      totalPurposeReviews: purposeReviewsCompleted,
      reviewsCompleted,
      lifeAreasCount: lifeAreas.size,
      mostActiveArea,
    }
  }, [goals, habits, tasks, journal, reviews, visions, milestones, commitments, projects, coreValues, purposeReviews])

  const hasData = goals.length > 0 || habits.length > 0 || tasks.length > 0 || journal.length > 0 || visions.length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1E0E6B] to-[#2A1A8A]">
          <BarChart3 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Exports</h1>
          <p className="text-muted-foreground mt-1">Your reflection and analytics workspace</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Goals" value={stats.totalGoals} icon={Target} />
        <StatCard label="Active Habits" value={stats.activeHabits} icon={Repeat} />
        <StatCard label="Tasks Done" value={`${stats.completedTasks}/${stats.totalTasks}`} icon={CheckSquare} />
        <StatCard label="Journal Entries" value={stats.totalJournal} icon={BookOpen} />
        <StatCard label="Goal Completion" value={`${stats.goalCompletionRate}%`} icon={Award} />
        <StatCard label="Best Streak" value={`${stats.bestStreak}d`} icon={Flame} />
        <StatCard label="Reviews" value={stats.reviewsCompleted} icon={FileText} />
        <StatCard label="Life Areas" value={stats.lifeAreasCount} icon={PieChart} />
      </div>

      {/* Reports Section */}
      <Section title="Reports" icon={FileText} defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <ReportCard
            title="Goal Progress Report"
            description={`Track progress across ${stats.activeGoals} active goals with ${stats.avgProgress}% average completion`}
            icon={Target}
          />
          <ReportCard
            title="Habit Consistency Report"
            description={`Review consistency for ${stats.activeHabits} active habits, best streak: ${stats.bestStreak} days`}
            icon={Repeat}
          />
          <ReportCard
            title="Vision Report"
            description={`See how ${stats.totalVisions} visions and ${stats.totalMilestones} milestones are progressing`}
            icon={Star}
          />
          <ReportCard
            title="Purpose Alignment Report"
            description={`Evaluate alignment across ${stats.totalCoreValues} core values and ${stats.totalCommitments} commitments`}
            icon={Award}
          />
          <ReportCard
            title="Annual Reflection"
            description="Review your year of intentional living — goals achieved, habits built, lessons learned"
            icon={Calendar}
          />
          <ReportCard
            title="Quarterly Review"
            description="Deep dive into the last 90 days — what worked, what needs adjustment"
            icon={BarChart3}
          />
          <ReportCard
            title="Monthly Summary"
            description="A snapshot of this month's progress across all areas"
            icon={PieChart}
          />
          <ReportCard
            title="Task Productivity Report"
            description={`${stats.tasksCompletedThisWeek} tasks completed this week, ${stats.overdueTasks} overdue`}
            icon={CheckSquare}
          />
        </div>
      </Section>

      {/* Insights Section */}
      <Section title="Insights" icon={Zap} count={6}>
        <div className="space-y-3 mt-4">
          <InsightRow
            icon={Target}
            label="Goal Completion Rate"
            value={`${stats.goalCompletionRate}%`}
            detail={`${stats.completedGoals} of ${stats.totalGoals} goals completed`}
            trend={stats.goalCompletionRate >= 50 ? "up" : stats.goalCompletionRate > 0 ? "down" : "neutral"}
          />
          <InsightRow
            icon={Repeat}
            label="Habit Completion Today"
            value={`${stats.habitsCompletedToday}/${stats.activeHabits}`}
            detail={`${stats.habitsCompletedToday} of ${stats.activeHabits} habits done today`}
            trend={stats.activeHabits > 0 && stats.habitsCompletedToday === stats.activeHabits ? "up" : "neutral"}
          />
          <InsightRow
            icon={CheckSquare}
            label="Task Completion Rate"
            value={stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : "—"}
            detail={`${stats.completedTasks} completed, ${stats.overdueTasks} overdue`}
            trend={stats.overdueTasks === 0 ? "up" : "down"}
          />
          <InsightRow
            icon={Flame}
            label="Best Habit Streak"
            value={`${stats.bestStreak} days`}
            detail={stats.bestStreak >= 7 ? "Strong consistency!" : stats.bestStreak > 0 ? "Keep building momentum" : "Start a streak today"}
            trend={stats.bestStreak >= 7 ? "up" : "neutral"}
          />
          <InsightRow
            icon={Star}
            label="Vision Progress"
            value={`${stats.totalMilestones > 0 ? Math.round((stats.completedMilestones / stats.totalMilestones) * 100) : 0}%`}
            detail={`${stats.completedMilestones} of ${stats.totalMilestones} milestones completed`}
            trend={stats.completedMilestones > 0 ? "up" : "neutral"}
          />
          <InsightRow
            icon={BookOpen}
            label="Review Compliance"
            value={stats.reviewsCompleted > 0 ? `${stats.reviewsCompleted} reviews` : "—"}
            detail={stats.reviewsCompleted > 0 ? `${stats.totalPurposeReviews} purpose reviews completed` : "Complete reviews to build insights"}
            trend={stats.reviewsCompleted >= 5 ? "up" : "neutral"}
          />
        </div>
      </Section>

      {/* Exports Section */}
      <Section title="Exports" icon={Download}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <ExportCard
            title="Excel Workbook"
            description="Export all data — goals, habits, tasks, visions, reviews — into a structured workbook"
            icon={FileSpreadsheet}
            format=".xlsx"
          />
          <ExportCard
            title="PDF Report"
            description="Generate a beautifully formatted report of your intentional living progress"
            icon={FileText}
            format=".pdf"
          />
          <ExportCard
            title="CSV Export"
            description="Raw data export for custom analysis in spreadsheets or data tools"
            icon={File}
            format=".csv"
          />
          <ExportCard
            title="JSON Backup"
            description="Complete data backup of your entire Intenteo workspace"
            icon={File}
            format=".json"
          />
        </div>
      </Section>

      {/* Export History Section */}
      <Section title="Export History" icon={Clock}>
        {hasData ? (
          <div className="mt-4 text-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No exports yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Your export history will appear here</p>
          </div>
        ) : (
          <div className="mt-4 text-center py-8">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Start using Intenteo to generate reports</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add goals, habits, and tasks to see your analytics</p>
          </div>
        )}
      </Section>

      {/* Empty State */}
      {!hasData && (
        <GlassCard className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-[#1E0E6B]/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Your Reports Await</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start adding goals, habits, tasks, and journal entries to unlock powerful reports and insights about your intentional living journey.
          </p>
        </GlassCard>
      )}
    </div>
  )
}

/* ─── Insight Row ─── */

function InsightRow({ icon: Icon, label, value, detail, trend }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  detail: string
  trend: "up" | "down" | "neutral"
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#1E0E6B]/3 transition-colors">
      <div className="p-2 rounded-lg bg-[#1E0E6B]/5">
        <Icon className="h-4 w-4 text-[#1E0E6B]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-foreground">{value}</span>
        {trend === "up" && <ArrowUp className="h-3.5 w-3.5 text-green-500" />}
        {trend === "down" && <ArrowDown className="h-3.5 w-3.5 text-red-500" />}
      </div>
    </div>
  )
}
