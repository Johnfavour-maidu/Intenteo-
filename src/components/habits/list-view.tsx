"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Target, Edit3, Trash2, CheckCircle2, Clock, Star } from "lucide-react"
import {
  getHealthState, HEALTH_CONFIG,
  calcTrend, TREND_CONFIG,
} from "./habit-utils"

interface Habit {
  id: string
  name: string
  description: string
  category: string
  customCategory?: string
  recurrence: { type: string; customDays?: string[]; interval?: number }
  duration: string
  totalDuration: string
  schedule: { type: string; slot?: string; time?: string }
  reminder: { enabled: boolean; before?: number; after?: number }
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
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
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

interface ListViewProps {
  habits: Habit[]
  selectedDate: Date
  onToggleCell: (habitId: string, date: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  linkedGoals: { id: string; title: string; linkedHabits: string[]; colorHex: string }[]
  onViewAnalytics?: (habit: Habit) => void
  onPin?: (habitId: string) => void
}

const getScheduleLabel = (schedule: { type: string; slot?: string; time?: string }): string => {
  switch (schedule.type) {
    case "anytime": return "Anytime"
    case "preferred": return schedule.slot ? `Prefer ${schedule.slot}` : "Preferred"
    case "fixed": return schedule.time ? `Fixed ${schedule.time}` : "Fixed"
    default: return "Anytime"
  }
}

const getDifficultyLabel = (difficulty?: string): string => {
  switch (difficulty) {
    case "easy": return "Easy"
    case "medium": return "Medium"
    case "hard": return "Hard"
    default: return "Medium"
  }
}

export const ListView: React.FC<ListViewProps> = ({
  habits,
  selectedDate,
  onToggleCell,
  onEdit,
  onDelete,
  linkedGoals,
  onViewAnalytics,
  onPin,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const todayISO = selectedDate.toISOString().split("T")[0]

  const getLinkedGoal = (habit: Habit) => {
    if (!habit.goal) return null
    return linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal) || null
  }

  const handleQuickComplete = (habit: Habit) => {
    onToggleCell(habit.id, todayISO)
  }

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-foreground">Habit Cards</h3>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {habits.map((habit) => {
          const linkedGoal = getLinkedGoal(habit)
          const isCompletedToday = habit.completions[todayISO]?.completed || false
          const health = getHealthState(habit.habitScore, habit.consistency)
          const healthCfg = HEALTH_CONFIG[health]
          const trend = calcTrend(habit)
          const trendCfg = TREND_CONFIG[trend]
          return (
            <div
              key={habit.id}
              className={`relative p-3 rounded-xl border-2 border-[#1E0E6B]/60 transition-all hover:border-[#1E0E6B]/80 ${
                isCompletedToday
                  ? "bg-green-50/30 dark:bg-green-900/10"
                  : "bg-white/40 dark:bg-white/5"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {habit.icon && <span className="text-xl">{habit.icon}</span>}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-foreground">{habit.name}</h4>
                      {habit.pinned && <Star className="h-3 w-3 text-amber-500 fill-amber-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{habit.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {onPin && (
                    <button onClick={() => onPin(habit.id)} className={`p-1 rounded transition-colors ${habit.pinned ? "text-amber-500" : "text-muted-foreground hover:text-amber-400"}`} title={habit.pinned ? "Unpin habit" : "Pin as Focus Habit"}>
                      <Star className={`h-4 w-4 ${habit.pinned ? "fill-amber-400" : ""}`} />
                    </button>
                  )}
                  <button onClick={() => onEdit(habit)} className="p-1 rounded text-muted-foreground hover:text-[#1E0E6B] transition-colors" title="Edit habit">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(showDeleteConfirm === habit.id ? null : habit.id)} className="p-1 rounded text-muted-foreground hover:text-red-500 transition-colors" title="Delete habit">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {habit.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{habit.description}</p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-2 text-xs">
                <div className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="font-medium">{habit.streak}</span>
                  <span className="text-muted-foreground">streak</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{habit.completionRate}%</span>
                  <span className="text-muted-foreground">completion</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{getScheduleLabel(habit.schedule)}</span>
                </div>
                <span className={`text-[10px] ${trendCfg.color}`}>{trendCfg.icon} {trendCfg.label}</span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {getDifficultyLabel(habit.difficulty)}
                </Badge>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {habit.duration}
                </Badge>
                {habit.streakFreeze && habit.streakFreeze > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-blue-500">
                    ❄️ {habit.streakFreeze} freeze{habit.streakFreeze > 1 ? "s" : ""}
                  </Badge>
                )}
                {linkedGoal && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                    style={{ borderColor: linkedGoal.colorHex, color: linkedGoal.colorHex }}
                  >
                    🎯 {linkedGoal.title}
                  </Badge>
                )}
                {habit.archived && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-gray-400">📦 Archived</Badge>
                )}
                {habit.paused && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-amber-500">⏸ Paused</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant={isCompletedToday ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickComplete(habit)}
                  className={`flex-1 h-8 ${
                    isCompletedToday ? "bg-green-500 hover:bg-green-600 text-white" : ""
                  }`}
                >
                  {isCompletedToday ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Complete
                    </>
                  )}
                </Button>
              </div>

              {/* Delete Confirmation Popover */}
              {showDeleteConfirm === habit.id && (
                <div className="absolute right-3 top-12 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-white/20 min-w-[120px]">
                  <p className="text-xs text-muted-foreground mb-2">Delete habit?</p>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-6 text-xs flex-1"
                      onClick={() => {
                        onDelete(habit.id)
                        setShowDeleteConfirm(null)
                      }}
                    >
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {habits.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No habits found</h3>
          <p className="text-muted-foreground mt-1">Add habits to see them in card view</p>
        </div>
      )}
    </div>
  )
}
