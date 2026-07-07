"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Target, TrendingUp, Edit3, Trash2, CheckCircle2, Clock, Calendar } from "lucide-react"

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
}

interface ListViewProps {
  habits: Habit[]
  selectedDate: Date
  onToggleCell: (habitId: string, date: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
  linkedGoals: { id: string; title: string; linkedHabits: string[]; colorHex: string }[]
}

type CardSortMode = "category" | "score" | "streak" | "completion" | "az" | "newest" | "oldest"

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#22C55E"
  if (score >= 60) return "#EAB308"
  if (score >= 40) return "#F97316"
  return "#EF4444"
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
}) => {
  const [cardSortMode, setCardSortMode] = useState<CardSortMode>("category")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const todayISO = selectedDate.toISOString().split("T")[0]

  const getLinkedGoal = (habit: Habit) => {
    if (!habit.goal) return null
    return linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal) || null
  }

  const sortedHabits = useMemo(() => {
    const sorted = [...habits]
    switch (cardSortMode) {
      case "category":
        return sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))
      case "score":
        return sorted.sort((a, b) => b.habitScore - a.habitScore)
      case "streak":
        return sorted.sort((a, b) => b.streak - a.streak)
      case "completion":
        return sorted.sort((a, b) => b.completionRate - a.completionRate)
      case "az":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      default:
        return sorted
    }
  }, [habits, cardSortMode])

  const handleQuickComplete = (habit: Habit) => {
    onToggleCell(habit.id, todayISO)
  }

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Habit Cards</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={cardSortMode}
            onChange={(e) => setCardSortMode(e.target.value as CardSortMode)}
            className="text-sm border border-[#1E0E6B]/60 rounded-lg px-2 py-1 bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B]"
          >
            <option value="category">Category</option>
            <option value="score">Score</option>
            <option value="streak">Streak</option>
            <option value="completion">Completion</option>
            <option value="az">A-Z</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedHabits.map((habit) => {
          const linkedGoal = getLinkedGoal(habit)
          const isCompletedToday = habit.completions[todayISO]?.completed || false
          return (
            <div
              key={habit.id}
              className={`relative p-4 rounded-xl border-2 border-[#1E0E6B]/60 transition-all hover:border-[#1E0E6B]/80 ${
                isCompletedToday
                  ? "bg-green-50/30 dark:bg-green-900/10"
                  : "bg-white/40 dark:bg-white/5"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {habit.icon && <span className="text-xl">{habit.icon}</span>}
                  <div>
                    <h4 className="font-semibold text-foreground">{habit.name}</h4>
                    <p className="text-xs text-muted-foreground">{habit.category}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: getScoreColor(habit.habitScore), color: getScoreColor(habit.habitScore) }}
                >
                  {habit.habitScore}%
                </Badge>
              </div>

              {/* Description */}
              {habit.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{habit.description}</p>
              )}

              {/* Stats row */}
              <div className="flex items-center gap-3 mb-3 text-xs">
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
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(habit)}
                  className="h-8 px-2"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(showDeleteConfirm === habit.id ? null : habit.id)}
                    className="h-8 px-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {showDeleteConfirm === habit.id && (
                    <div className="absolute right-0 top-full mt-1 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-white/20 min-w-[120px]">
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
              </div>
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
