"use client"

import React, { useRef, useEffect, useMemo } from "react"
import { X, Clock, TrendingUp, Calendar, CheckCircle2, Circle, Sparkles, Edit3, Target, Heart } from "lucide-react"
import type {
  GoalData,
  GoalProject,
  GoalHabit as GoalAnalyticsHabit,
  GoalHealthState,
  GoalTrendDirection,
} from "./goal-utils"
import {
  calcGoalHealth,
  GOAL_HEALTH_CONFIG,
  calcLifecycleStage,
  GOAL_LIFECYCLE_CONFIG,
  calcTrend,
  GOAL_TREND_CONFIG,
  generateCoaching,
  getGoalHealthScore,
} from "./goal-utils"

interface LinkedVision {
  id: string
  title: string
  icon: string
  description: string
  purposeAlignment?: string
  relatedValueIds?: string[]
}

interface LinkedValue {
  id: string
  name: string
  icon: string
  purposeConnection?: string
}

interface LinkedCommitment {
  id: string
  title: string
  description: string
}

interface LinkedPurpose {
  statement: string
  notes: string
}

interface GoalAnalyticsDrawerProps {
  goal: GoalData
  projects: GoalProject[]
  habits: GoalAnalyticsHabit[]
  vision?: LinkedVision | null
  purpose?: LinkedPurpose | null
  values?: LinkedValue[]
  commitments?: LinkedCommitment[]
  onClose: () => void
  onEdit: (g: GoalData) => void
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

function getRelativeLabel(dateStr: string): string {
  if (!dateStr) return ""
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return formatDateShort(dateStr)
  } catch {
    return dateStr
  }
}

export const GoalAnalyticsDrawer: React.FC<GoalAnalyticsDrawerProps> = ({
  goal,
  projects,
  habits,
  vision,
  purpose,
  values,
  commitments,
  onClose,
  onEdit,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const health = useMemo(() => calcGoalHealth(goal, projects, habits), [goal, projects, habits])
  const healthCfg = GOAL_HEALTH_CONFIG[health]
  const lifecycle = useMemo(() => calcLifecycleStage(goal), [goal])
  const lifecycleCfg = GOAL_LIFECYCLE_CONFIG[lifecycle]
  const trend = useMemo(() => calcTrend(goal, projects), [goal, projects])
  const trendCfg = GOAL_TREND_CONFIG[trend]
  const healthScore = useMemo(() => getGoalHealthScore(goal, projects, habits), [goal, projects, habits])
  const daysRemaining = useMemo(() => Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)), [goal.deadline])
  const coaching = useMemo(() => generateCoaching(goal, projects, habits), [goal, projects, habits])

  const linkedVision = useMemo(() => {
    if (vision) return vision
    return null
  }, [vision])

  const linkedValues = useMemo(() => {
    if (!values || !linkedVision?.relatedValueIds?.length) return []
    return values.filter(v => (linkedVision.relatedValueIds || []).includes(v.id))
  }, [values, linkedVision])

  const linkedCommitments = useMemo(() => {
    if (!commitments || !linkedVision?.id) return []
    return commitments.filter(c => (c as any).relatedVisionIds?.includes(linkedVision.id))
  }, [commitments, linkedVision])

  const purposeConnection = useMemo(() => {
    if (purpose?.statement) return purpose.statement
    return null
  }, [purpose])

  const focusItems = useMemo(() => {
    const items: { label: string; done: boolean }[] = []
    const incompleteMilestones = goal.milestones.filter(m => !m.completed)
    const goalProjects = projects.filter(p => p.goalId === goal.id)
    const incompleteProjects = goalProjects.filter(p => p.status !== "completed")

    if (incompleteMilestones.length > 0) {
      items.push({ label: `Complete "${incompleteMilestones[0].title}"`, done: false })
    }
    if (incompleteProjects.length > 0) {
      items.push({ label: `Work on ${incompleteProjects[0].name}`, done: false })
    }
    if (goal.linkedHabits.length > 0) {
      items.push({ label: `Keep up "${goal.linkedHabits[0]}" habit`, done: false })
    }
    if (daysRemaining <= 30 && goal.milestones.filter(m => !m.completed).length > 1) {
      items.push({ label: "Review your deadline this week", done: false })
    }
    const completedMilestones = goal.milestones.filter(m => m.completed)
    if (completedMilestones.length > 0) {
      items.push({ label: `Completed "${completedMilestones[completedMilestones.length - 1].title}"`, done: true })
    }
    return items.slice(0, 4)
  }, [goal, projects, daysRemaining])

  const coachInsight = useMemo(() => {
    const progress = goal.progress
    const overdue = new Date(goal.deadline) < new Date()
    const linkedHabitCount = goal.linkedHabits.length
    const incompleteMilestones = goal.milestones.filter(m => !m.completed)

    if (health === "excellent") {
      return "You're making excellent progress. Keep the momentum and consider setting stretch milestones to push further."
    }
    if (health === "on_track") {
      return "Your goal is progressing well. Stay consistent with your linked habits and review milestones regularly."
    }
    if (health === "needs_attention") {
      if (linkedHabitCount > 0) {
        return "Your goal is progressing slowly. Focus on building consistency with your linked habits before extending your deadline."
      }
      return "Your goal needs more attention. Break down remaining milestones into smaller weekly actions to build momentum."
    }
    if (health === "at_risk") {
      if (overdue) {
        return "This goal is overdue. Consider whether the deadline needs adjustment or if the scope should be reduced to something achievable."
      }
      return "Your goal is at risk. Reassess the scope and timeline — reducing scope is better than abandoning the goal."
    }
    return coaching[0] || "Stay steady — consistent effort compounds over time."
  }, [goal, health, coaching])

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white dark:bg-gray-900 shadow-2xl border-l border-white/20 overflow-y-auto">
      <div className="p-5 space-y-5">

        {/* 1. Goal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {goal.icon && <span className="text-2xl">{goal.icon}</span>}
            <div>
              <h3 className="font-semibold text-[#1E0E6B] text-lg">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">{goal.customCategory || goal.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${healthCfg.bg} ${healthCfg.color}`}>
            {healthCfg.icon} {healthCfg.label}
          </span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${lifecycleCfg.bg} ${lifecycleCfg.color}`}>
            {lifecycleCfg.label}
          </span>
          <span className={`text-[11px] font-medium ${trendCfg.color}`}>
            {trendCfg.icon} {trendCfg.label}
          </span>
        </div>

        {/* 2. Goal Progress Summary */}
        <div className="p-4 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E0E6B] uppercase tracking-wider">Goal Progress</span>
            <span className="text-lg font-bold text-[#1E0E6B]">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${goal.progress >= 75 ? "bg-emerald-500" : goal.progress >= 40 ? "bg-amber-400" : "bg-[#1E0E6B]"}`}
              style={{ width: `${Math.min(100, goal.progress)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {healthCfg.icon} Health: {healthScore}%
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Past deadline"}
            </span>
          </div>
        </div>

        {/* 3. Today's Focus */}
        {focusItems.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today&apos;s Focus</h4>
            <div className="space-y-1.5">
              {focusItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm py-1">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Why This Goal Matters */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why This Goal Matters</h4>

          {/* Linked Vision */}
          {linkedVision && (
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">{linkedVision.icon}</span>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Supports Vision</p>
                <p className="text-sm font-medium text-[#1E0E6B]">{linkedVision.title}</p>
                {linkedVision.purposeAlignment && (
                  <p className="text-xs text-muted-foreground mt-0.5">{linkedVision.purposeAlignment}</p>
                )}
              </div>
            </div>
          )}

          {/* Purpose */}
          {purposeConnection && (
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-[#EB9E5B] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Supports Purpose</p>
                <p className="text-sm text-muted-foreground">{purposeConnection}</p>
              </div>
            </div>
          )}

          {/* Values */}
          {linkedValues.length > 0 && (
            <div className="flex items-start gap-2.5">
              <Heart className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Guided By Values</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {linkedValues.map(v => (
                    <span key={v.id} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
                      {v.icon} {v.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Commitments */}
          {linkedCommitments.length > 0 && (
            <div className="flex items-start gap-2.5">
              <Target className="h-4 w-4 text-[#1E0E6B] shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Supports Commitments</p>
                {linkedCommitments.map(c => (
                  <p key={c.id} className="text-sm text-muted-foreground italic">&ldquo;{c.title}&rdquo;</p>
                ))}
              </div>
            </div>
          )}

          {!linkedVision && !purposeConnection && linkedValues.length === 0 && linkedCommitments.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Connect this goal to a vision to see why it matters.</p>
          )}
        </div>

        {/* 5. Timeline */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2.5 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Created</p>
              <p className="text-xs font-medium mt-0.5">{formatDateShort(goal.createdAt)}</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Target</p>
              <p className="text-xs font-medium mt-0.5">{formatDateShort(goal.deadline)}</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Last Review</p>
              <p className="text-xs font-medium mt-0.5">{goal.lastActivity ? getRelativeLabel(goal.lastActivity) : "Never"}</p>
            </div>
            <div className="text-center p-2.5 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Time Left</p>
              <p className="text-xs font-medium mt-0.5">{daysRemaining > 0 ? `${daysRemaining} days` : "Overdue"}</p>
            </div>
          </div>
        </div>

        {/* 6. Coach's Insight */}
        <div className="p-3 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#EB9E5B]" />
            <span className="text-xs font-medium text-[#1E0E6B]">Coach&apos;s Insight</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{coachInsight}</p>
        </div>

        {/* 7. Edit Goal */}
        <div className="pt-1">
          <button
            onClick={() => { onEdit(goal); onClose() }}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white py-2.5 rounded-xl bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            Edit Goal
          </button>
        </div>
      </div>
    </div>
  )
}
