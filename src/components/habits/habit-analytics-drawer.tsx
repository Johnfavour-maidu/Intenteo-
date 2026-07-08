"use client"

import React, { useRef, useEffect, useMemo } from "react"
import { X, Flame, Target, Clock, TrendingUp, Calendar, Award, Info, AlertTriangle } from "lucide-react"
import type { Habit } from "./habit-types"
import { formatDateDDMMYYYY } from "@/lib/date-utils"
import {
  getHealthState,
  HEALTH_CONFIG,
  getScoreBreakdown,
  calcLifecycleStage,
  LIFECYCLE_CONFIG,
  calcTrend,
  TREND_CONFIG,
  generateSmartRecommendation,
  generateCoaching,
} from "./habit-utils"

interface HabitAnalyticsDrawerProps {
  habit: Habit
  linkedGoals: { id: string; title: string; linkedHabits: string[]; colorHex: string }[]
  onClose: () => void
  onEdit: (h: Habit) => void
}

export const HabitAnalyticsDrawer: React.FC<HabitAnalyticsDrawerProps> = ({
  habit,
  linkedGoals,
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

  const health = useMemo(() => getHealthState(habit.habitScore, habit.consistency), [habit.habitScore, habit.consistency])
  const healthCfg = HEALTH_CONFIG[health]
  const lifecycle = useMemo(() => calcLifecycleStage(habit), [habit])
  const lifecycleCfg = LIFECYCLE_CONFIG[lifecycle]
  const trend = useMemo(() => calcTrend(habit), [habit])
  const trendCfg = TREND_CONFIG[trend]
  const scoreBreakdown = useMemo(() => getScoreBreakdown(habit), [habit])
  const recommendation = useMemo(() => generateSmartRecommendation(habit), [habit])
  const coaching = useMemo(() => generateCoaching(habit), [habit])

  const linkedGoal = useMemo(() => {
    if (!habit.goal) return null
    return linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal) || null
  }, [habit.goal, linkedGoals])

  const recentActivity = useMemo(() => {
    const entries: { date: string; quality: string; time?: string; score: number }[] = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split("T")[0]
      const c = habit.completions?.[key]
      if (c?.completed) {
        entries.push({
          date: formatDateDDMMYYYY(key),
          quality: c.quality || "good",
          time: c.time,
          score: c.quality === "perfect" ? habit.habitScore : c.quality === "good" ? Math.round(habit.habitScore * 0.8) : c.quality === "partial" ? Math.round(habit.habitScore * 0.5) : 0,
        })
      }
    }
    return entries.slice(0, 10)
  }, [habit.completions, habit.habitScore])

  const milestones = useMemo(() => {
    const ms: { icon: string; text: string }[] = []
    const created = new Date(habit.createdAt)
    ms.push({ icon: "📅", text: `Started ${formatDateDDMMYYYY(habit.createdAt.split("T")[0])}` })
    if (habit.bestStreak >= 7) ms.push({ icon: "🔥", text: `Reached ${habit.bestStreak}-day streak` })
    if (linkedGoal) ms.push({ icon: "🎯", text: `Linked to ${linkedGoal.title}` })
    if (habit.bestStreak >= 365) ms.push({ icon: "🏆", text: "Completed 365-day challenge" })
    if (habit.habitScore >= 80) ms.push({ icon: "⭐", text: "Reached Excellent health" })
    if (habit.streakFreeze && habit.streakFreeze > 0) ms.push({ icon: "❄️", text: `${habit.streakFreeze} streak freeze${habit.streakFreeze > 1 ? "s" : ""} earned` })
    return ms
  }, [habit, linkedGoal])

  return (
    <div ref={ref} className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white dark:bg-gray-900 shadow-2xl border-l border-white/20 overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {habit.icon && <span className="text-2xl">{habit.icon}</span>}
            <div>
              <h3 className="font-semibold text-[#1E0E6B] text-lg">{habit.name}</h3>
              <p className="text-xs text-muted-foreground">{habit.customCategory || habit.category}</p>
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

        {/* Score + Streak */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
            <div className="text-2xl font-bold text-[#1E0E6B]">{habit.habitScore}</div>
            <div className="text-[10px] text-muted-foreground">Intent Score</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{habit.streak}</span>
            </div>
            <div className="text-[10px] text-orange-500">Current Streak</div>
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

        {/* Intent Score Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intent Score Breakdown</h4>
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
            <span className="text-lg font-bold text-[#1E0E6B]">{habit.habitScore} / 100</span>
          </div>
        </div>

        {/* Goal Contribution */}
        {linkedGoal && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Goal Contribution</h4>
            <button onClick={() => onEdit(habit)} className="w-full p-3 rounded-xl bg-white/50 border border-white/20 hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: linkedGoal.colorHex }} />
                <span className="text-sm font-medium text-[#1E0E6B]">{linkedGoal.title}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">Contribution</span>
                  <span className="font-medium">{Math.round(habit.habitScore * 0.3)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="h-1 rounded-full bg-[#1E0E6B]" style={{ width: `${Math.round(habit.habitScore * 0.3)}%` }} />
                </div>
              </div>
            </button>
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
            {recentActivity.length > 0 ? recentActivity.map((entry, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{entry.date}</span>
                  <span className="font-medium capitalize">{entry.quality}</span>
                </div>
                <div className="flex items-center gap-2">
                  {entry.time && <span className="text-muted-foreground">{entry.time}</span>}
                  <span className="font-medium text-emerald-600">+{entry.score}</span>
                </div>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground py-2">No recent activity</p>
            )}
          </div>
        </div>

        {/* Habit Story */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Habit Story</h4>
          <div className="space-y-1.5">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0">{m.icon}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {lifecycle !== "planning" && lifecycle !== "paused" && lifecycle !== "archived" && (
              <span>Consistency: {Math.round(habit.consistency)}%</span>
            )}
            {(habit.streakFreeze || 0) > 0 && <span>❄️ {habit.streakFreeze} freeze{(habit.streakFreeze || 0) > 1 ? "s" : ""}</span>}
            {lifecycle === "paused" && <span className="text-amber-500">⏸ Paused</span>}
            {lifecycle === "archived" && <span className="text-gray-400">📦 Archived</span>}
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
            {habit.consistency < 80 && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Complete before 8 AM to maximise your score</span>
              </li>
            )}
            {habit.streak > 0 && habit.streak < 30 && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Don't skip two consecutive days</span>
              </li>
            )}
            {habit.difficulty === "hard" && habit.consistency < 60 && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Reduce duration if consistency drops below 60%</span>
              </li>
            )}
            {linkedGoal && (
              <li className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
                <span>Complete alongside {linkedGoal.title}</span>
              </li>
            )}
          </ul>
        </div>

        {/* View / Edit */}
        <div className="pt-2">
          <button
            onClick={() => { onEdit(habit); onClose() }}
            className="w-full text-center text-xs font-medium text-[#1E0E6B] py-2 rounded-lg bg-[#1E0E6B]/10 hover:bg-[#1E0E6B]/20 transition-colors"
          >
            Edit Habit
          </button>
        </div>
      </div>
    </div>
  )
}
