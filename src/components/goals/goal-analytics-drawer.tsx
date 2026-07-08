"use client"

import React, { useRef, useEffect, useMemo } from "react"
import { X, Flame, Target, Clock, TrendingUp, Calendar, Award, Info, ListChecks, Folder, Zap } from "lucide-react"
import type {
  GoalData,
  GoalProject,
  GoalHabit as GoalAnalyticsHabit,
  GoalHealthState,
  GoalLifecycleStage,
  GoalTrendDirection,
} from "./goal-utils"
import {
  calcGoalHealth,
  GOAL_HEALTH_CONFIG,
  getGoalScoreBreakdown,
  calcLifecycleStage,
  GOAL_LIFECYCLE_CONFIG,
  calcTrend,
  GOAL_TREND_CONFIG,
  generateSmartNextAction,
  generateCoaching,
  buildGoalJourney,
  getGoalHealthScore,
} from "./goal-utils"

interface GoalAnalyticsDrawerProps {
  goal: GoalData
  projects: GoalProject[]
  habits: GoalAnalyticsHabit[]
  onClose: () => void
  onEdit: (g: GoalData) => void
}

export const GoalAnalyticsDrawer: React.FC<GoalAnalyticsDrawerProps> = ({
  goal,
  projects,
  habits,
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

  const goalProjects = useMemo(() => projects.filter(p => p.goalId === goal.id), [projects, goal.id])
  const health = useMemo(() => calcGoalHealth(goal, projects, habits), [goal, projects, habits])
  const healthCfg = GOAL_HEALTH_CONFIG[health]
  const lifecycle = useMemo(() => calcLifecycleStage(goal), [goal])
  const lifecycleCfg = GOAL_LIFECYCLE_CONFIG[lifecycle]
  const trend = useMemo(() => calcTrend(goal, projects), [goal, projects])
  const trendCfg = GOAL_TREND_CONFIG[trend]
  const scoreBreakdown = useMemo(() => getGoalScoreBreakdown(goal, projects, habits), [goal, projects, habits])
  const recommendation = useMemo(() => generateSmartNextAction(goal, projects, habits), [goal, projects, habits])
  const coaching = useMemo(() => generateCoaching(goal, projects, habits), [goal, projects, habits])
  const journey = useMemo(() => buildGoalJourney(goal, projects, habits), [goal, projects, habits])
  const healthScore = useMemo(() => getGoalHealthScore(goal, projects, habits), [goal, projects, habits])
  const daysRemaining = useMemo(() => Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)), [goal.deadline])

  const linkedHabitsDetails = useMemo(() => {
    return goal.linkedHabits.map(name => {
      const h = habits.find(x => x.name === name)
      return { name, score: h?.habitScore || 0, active: h ? (h.habitScore || 0) > 0 : false }
    })
  }, [goal.linkedHabits, habits])

  const recentActivity = useMemo(() => {
    const entries: { date: string; label: string; icon: string }[] = []
    if (goal.lastActivity) {
      entries.push({ date: goal.lastActivity, label: "Goal updated", icon: "⚡" })
    }
    goalProjects.forEach(p => {
      if (p.status === "completed") {
        entries.push({ date: "", label: `Project completed: ${p.name}`, icon: "📦" })
      }
    })
    goal.milestones.filter(m => m.completed).slice(-3).forEach(m => {
      entries.push({ date: "", label: `Milestone: ${m.title}`, icon: "🏁" })
    })
    return entries.slice(0, 10)
  }, [goal, goalProjects])

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white dark:bg-gray-900 shadow-2xl border-l border-white/20 overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Header */}
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
        <div className="flex items-center gap-3 flex-wrap">
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

        {/* Score + Deadline */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
            <div className="text-2xl font-bold text-[#1E0E6B]">{healthScore}</div>
            <div className="text-[10px] text-muted-foreground">Health Score</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-amber-600">{daysRemaining}</span>
            </div>
            <div className="text-[10px] text-amber-500">Days Remaining</div>
          </div>
        </div>

        {/* Smart Next Action */}
        <div className="p-3 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Info className="h-3.5 w-3.5 text-[#1E0E6B]" />
            <span className="text-xs font-medium text-[#1E0E6B]">Smart Next Action</span>
          </div>
          <p className="text-sm text-muted-foreground">{recommendation}</p>
        </div>

        {/* Health Score Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Health Score Breakdown</h4>
          <div className="space-y-2">
            {scoreBreakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium">{item.raw}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${(item.points / item.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm font-semibold">TOTAL</span>
            <span className="text-lg font-bold text-[#1E0E6B]">{healthScore} / 100</span>
          </div>
        </div>

        {/* Linked Habits */}
        {linkedHabitsDetails.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Linked Habits</h4>
            <div className="space-y-1.5">
              {linkedHabitsDetails.map(h => (
                <div key={h.name} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-white/50 border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3 w-3 text-orange-400" />
                    <span>{h.name}</span>
                  </div>
                  <span className={h.score >= 70 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>{Math.round(h.score)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Linked Projects */}
        {goalProjects.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Projects</h4>
            <div className="space-y-1.5">
              {goalProjects.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-white/50 border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Folder className="h-3 w-3 text-muted-foreground" />
                    <span>{p.name}</span>
                  </div>
                  <span className="text-muted-foreground">{Math.round(p.progress)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaching */}
        {coaching.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Coaching</h4>
            <ul className="space-y-1">
              {coaching.slice(0, 3).map((tip, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Activity</h4>
          <div className="space-y-1">
            {recentActivity.length > 0 ? recentActivity.slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg hover:bg-gray-50">
                <span className="shrink-0">{entry.icon}</span>
                <span className="text-muted-foreground">{entry.label}</span>
                {entry.date && <span className="text-muted-foreground ml-auto">{entry.date}</span>}
              </div>
            )) : (
              <p className="text-xs text-muted-foreground py-2">No recent activity</p>
            )}
          </div>
        </div>

        {/* Goal Story */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Goal Story</h4>
          <div className="space-y-1.5">
            {journey.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0">{m.icon}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips to Improve */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tips to Improve</h4>
          <ul className="space-y-1">
            {coaching.slice(0, 3).map((tip, i) => (
              <li key={`improve-${i}`} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>{tip}</span>
              </li>
            ))}
            {goal.linkedHabits.length > 0 && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Complete linked habits to boost goal progress</span>
              </li>
            )}
            {daysRemaining < 30 && goal.milestones.filter(m => !m.completed).length > 0 && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Time is short — focus on highest-impact milestones</span>
              </li>
            )}
            {goal.milestones.length === 0 && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Add milestones to track progress clearly</span>
              </li>
            )}
          </ul>
        </div>

        {/* View / Edit */}
        <div className="pt-2">
          <button
            onClick={() => { onEdit(goal); onClose() }}
            className="w-full text-center text-xs font-medium text-[#1E0E6B] py-2 rounded-lg bg-[#1E0E6B]/10 hover:bg-[#1E0E6B]/20 transition-colors"
          >
            Edit Goal
          </button>
        </div>
      </div>
    </div>
  )
}
