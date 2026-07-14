"use client"

import React, { useRef, useEffect, useMemo, useState } from "react"
import { X, Clock, Calendar, Sparkles, Edit3, Target, Heart, Image as ImageIcon } from "lucide-react"
import type {
  GoalData,
  GoalProject,
  GoalHabit as GoalAnalyticsHabit,
  GoalHealthState,
} from "./goal-utils"
import {
  calcGoalHealth,
  calcTrend,
  calcGoalProgress,
  GOAL_TREND_CONFIG,
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
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  } catch {
    return dateStr
  }
}

const REFLECTION_QUESTIONS = [
  "What is one small action you can take today toward this goal?",
  "Does this goal still align with your vision?",
  "Is your current deadline still realistic?",
  "What obstacle is slowing your progress?",
  "What would achieving this goal make possible?",
  "Are your daily habits supporting this goal?",
  "What's the most important milestone to focus on right now?",
]

const CONTEXTUAL_SUGGESTIONS = [
  "Breaking this goal into smaller milestones may improve consistency.",
  "Consider strengthening the habits linked to this goal.",
  "Review this goal to ensure it still supports your life vision.",
  "A weekly check-in could help you stay on track.",
  "Celebrating small wins builds momentum toward the big outcome.",
  "Connecting this goal to a deeper purpose can boost motivation.",
]

function getStatusFromHealth(health: GoalHealthState, progress: number): { label: string; color: string; bg: string; icon: string } {
  if (progress >= 100) return { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", icon: "\u{1F7E2}" }
  if (health === "excellent" || health === "on_track") return { label: "On Track", color: "text-blue-600", bg: "bg-blue-50", icon: "\u{1F7E2}" }
  if (health === "needs_attention") return { label: "Needs Attention", color: "text-amber-600", bg: "bg-amber-50", icon: "\u{1F7E0}" }
  return { label: "At Risk", color: "text-red-600", bg: "bg-red-50", icon: "\u{1F534}" }
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
  const trend = useMemo(() => calcTrend(goal, projects), [goal, projects])
  const trendCfg = GOAL_TREND_CONFIG[trend]
  const progress = useMemo(() => calcGoalProgress(goal, projects, habits), [goal, projects, habits])
  const status = useMemo(() => getStatusFromHealth(health, progress), [health, progress])
  const daysRemaining = useMemo(() => Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)), [goal.deadline])

  const linkedVision = useMemo(() => vision || null, [vision])

  const linkedValues = useMemo(() => {
    if (!values || !linkedVision?.relatedValueIds?.length) return []
    return values.filter(v => (linkedVision.relatedValueIds || []).includes(v.id))
  }, [values, linkedVision])

  const purposeConnection = useMemo(() => {
    if (purpose?.statement) return purpose.statement
    return null
  }, [purpose])

  const nextAction = useMemo(() => {
    const incompleteMilestones = goal.milestones.filter(m => !m.completed)
    const goalProjects = projects.filter(p => p.goalId === goal.id)
    const incompleteProjects = goalProjects.filter(p => p.status !== "completed")

    if (incompleteMilestones.length > 0) return `Complete "${incompleteMilestones[0].title}"`
    if (incompleteProjects.length > 0) return `Work on ${incompleteProjects[0].name}`
    if (goal.linkedHabits.length > 0) return `Keep up "${goal.linkedHabits[0]}" habit`
    if (daysRemaining <= 30 && incompleteMilestones.length > 1) return "Review your deadline this week"
    return "Define your next milestone"
  }, [goal, projects, daysRemaining])

  const insight = useMemo(() => {
    const seed = goal.id.charCodeAt(0) + goal.title.length
    if (progress >= 100) return "You've achieved this goal! Take a moment to celebrate and reflect on what you've learned."
    if (health === "excellent") {
      return REFLECTION_QUESTIONS[seed % REFLECTION_QUESTIONS.length]
    }
    if (health === "on_track") {
      return seed % 2 === 0
        ? REFLECTION_QUESTIONS[seed % REFLECTION_QUESTIONS.length]
        : CONTEXTUAL_SUGGESTIONS[seed % CONTEXTUAL_SUGGESTIONS.length]
    }
    if (health === "needs_attention") {
      return CONTEXTUAL_SUGGESTIONS[seed % CONTEXTUAL_SUGGESTIONS.length]
    }
    if (new Date(goal.deadline) < new Date()) {
      return "This goal is past its deadline. Consider whether the deadline needs adjustment or if the scope should be reduced."
    }
    return CONTEXTUAL_SUGGESTIONS[seed % CONTEXTUAL_SUGGESTIONS.length]
  }, [goal, health])

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white dark:bg-gray-900 shadow-2xl border-l border-white/20 overflow-y-auto">
      <div className="p-4 space-y-4">

        {/* 1. Goal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {goal.icon && <span className="text-2xl">{goal.icon}</span>}
            <div>
              <h3 className="font-semibold text-[#1E0E6B] text-lg leading-tight">{goal.title}</h3>
              <p className="text-xs text-muted-foreground">{goal.customCategory || goal.category}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 2. Vision Image */}
        {goal.heroImage ? (
          <div className="rounded-xl overflow-hidden aspect-video">
            <img src={goal.heroImage} alt="Goal vision" className="w-full h-full object-cover" />
          </div>
        ) : (
          <button className="w-full aspect-video rounded-xl border-2 border-dashed border-[#1E0E6B]/15 bg-[#1E0E6B]/3 flex flex-col items-center justify-center gap-2 hover:border-[#1E0E6B]/30 hover:bg-[#1E0E6B]/5 transition-colors">
            <ImageIcon className="h-8 w-8 text-[#1E0E6B]/30" />
            <span className="text-sm font-medium text-[#1E0E6B]/50">Add a Vision Image</span>
            <span className="text-[11px] text-muted-foreground">Visualize what success looks like.</span>
          </button>
        )}

        {/* 3. Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1E0E6B] uppercase tracking-wider">Progress</span>
            <span className="text-lg font-bold text-[#1E0E6B]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progress >= 75 ? "bg-emerald-500" : progress >= 40 ? "bg-amber-400" : "bg-[#1E0E6B]"}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* 4. Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            {status.icon} {status.label}
          </span>
          <span className={`text-[11px] font-medium ${trendCfg.color}`}>
            {trendCfg.icon} {trendCfg.label}
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysRemaining > 0 ? `${daysRemaining}d left` : "Overdue"}
          </span>
        </div>

        {/* 5. Next Action */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Action</h4>
          <p className="text-sm text-foreground">{nextAction}</p>
        </div>

        {/* 6. Purpose Alignment */}
        {(linkedVision || purposeConnection || linkedValues.length > 0) && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Why This Goal Matters</h4>
            {linkedVision && (
              <div className="flex items-start gap-2.5">
                <span className="text-base shrink-0 mt-0.5">{linkedVision.icon}</span>
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Supports Vision</p>
                  <p className="text-sm font-medium text-[#1E0E6B]">{linkedVision.title}</p>
                </div>
              </div>
            )}
            {purposeConnection && (
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-[#EB9E5B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Supports Purpose</p>
                  <p className="text-sm text-muted-foreground">{purposeConnection}</p>
                </div>
              </div>
            )}
            {linkedValues.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Heart className="h-4 w-4 text-pink-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase text-muted-foreground font-medium tracking-wider">Guided By</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {linkedValues.map(v => (
                      <span key={v.id} className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">
                         {v.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. Timeline */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Timeline</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Created</p>
              <p className="text-xs font-medium mt-0.5">{formatDateShort(goal.createdAt)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Target</p>
              <p className="text-xs font-medium mt-0.5">{formatDateShort(goal.deadline)}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/50 border border-white/10">
              <p className="text-[10px] text-muted-foreground uppercase">Time Left</p>
              <p className="text-xs font-medium mt-0.5">{daysRemaining > 0 ? `${daysRemaining}d` : "Overdue"}</p>
            </div>
          </div>
        </div>

        {/* 8. Intenteó Insight */}
        <div className="p-3 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#EB9E5B]" />
            <span className="text-xs font-medium text-[#1E0E6B]">Intente&oacute; Insight</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight}</p>
        </div>

        {/* 9. Edit Goal */}
        <button
          onClick={() => { onEdit(goal); onClose() }}
          className="w-full flex items-center justify-center gap-2 text-sm font-medium text-white py-2.5 rounded-xl bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 transition-colors"
        >
          <Edit3 className="h-4 w-4" />
          Edit Goal
        </button>
      </div>
    </div>
  )
}
