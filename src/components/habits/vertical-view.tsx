"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Flame, Target, TrendingUp, Edit3, Clock } from "lucide-react"

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

interface VerticalViewProps {
  habits: Habit[]
  selectedDate: Date
  onToggleCell: (habitId: string, date: string) => void
  onEdit: (habit: Habit) => void
  linkedGoals: { id: string; title: string; linkedHabits: string[]; colorHex: string }[]
}

export const VerticalView: React.FC<VerticalViewProps> = ({
  habits,
  selectedDate,
  onToggleCell,
  onEdit,
  linkedGoals,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; day: number } | null>(null)

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const monthLabel = selectedDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const formatDayISO = (day: number): string => {
    const d = new Date(year, month, day)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${dd}`
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#22C55E"
    if (score >= 60) return "#EAB308"
    if (score >= 40) return "#F97316"
    return "#EF4444"
  }

  const getLinkedGoalColor = (habit: Habit): string | undefined => {
    if (!habit.goal) return undefined
    const goal = linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal)
    return goal?.colorHex
  }

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-foreground">{monthLabel} — Monthly Tracker</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground min-w-[180px]">Habit</th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const date = new Date(year, month, day)
                const dayName = date.toLocaleDateString("en-GB", { weekday: "short" })
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                return (
                  <th
                    key={i}
                    className={`p-2 text-center text-xs font-medium min-w-[32px] ${
                      isWeekend ? "text-muted-foreground/60" : "text-muted-foreground"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] uppercase">{dayName}</span>
                      <span className="text-sm">{day}</span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const goalColor = getLinkedGoalColor(habit)
              return (
                <tr key={habit.id} className="border-b border-white/5 hover:bg-white/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {habit.icon && <span className="text-lg">{habit.icon}</span>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{habit.name}</span>
                          {goalColor && (
                            <div
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: goalColor }}
                              title={`Linked to: ${habit.goal}`}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {habit.category}
                          </Badge>
                          {habit.streak > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-orange-500">
                              <Flame className="h-3 w-3" />
                              {habit.streak}
                            </span>
                          )}
                          <span className="text-[10px] font-medium" style={{ color: getScoreColor(habit.habitScore) }}>
                            {habit.habitScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const dateISO = formatDayISO(day)
                    const completion = habit.completions[dateISO]
                    const isCompleted = completion?.completed || false
                    const isToday = dateISO === new Date().toISOString().split("T")[0]
                    const isFuture = new Date(year, month, day) > new Date()
                    const isHovered = hoveredCell?.habitId === habit.id && hoveredCell?.day === day

                    return (
                      <td key={i} className="p-1 text-center">
                        <button
                          onClick={() => !isFuture && onToggleCell(habit.id, dateISO)}
                          onMouseEnter={() => setHoveredCell({ habitId: habit.id, day })}
                          onMouseLeave={() => setHoveredCell(null)}
                          disabled={isFuture}
                          className={`relative w-7 h-7 rounded-lg transition-all flex items-center justify-center text-xs ${
                            isFuture
                              ? "cursor-not-allowed opacity-30"
                              : isCompleted
                              ? "text-white font-medium shadow-sm"
                              : "text-muted-foreground hover:bg-white/60"
                          } ${isToday ? "ring-2 ring-[#1E0E6B]/40" : ""}`}
                          style={
                            isCompleted
                              ? { backgroundColor: habit.colorHex }
                              : isToday
                              ? { backgroundColor: `${habit.colorHex}15` }
                              : undefined
                          }
                        >
                          {day}
                          {isCompleted && completion?.time && (
                            <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-green-400" />
                          )}
                        </button>
                        {isHovered && completion && (
                          <div className="absolute z-50 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-white/20 text-xs whitespace-nowrap">
                            <div className="font-medium">{completion.completed ? "Completed" : "Missed"}</div>
                            {completion.time && <div className="text-muted-foreground">at {completion.time}</div>}
                            {completion.notes && <div className="text-muted-foreground mt-1 max-w-[150px] truncate">{completion.notes}</div>}
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {habits.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No habits to display</h3>
          <p className="text-muted-foreground mt-1">Add habits to see the monthly tracker view</p>
        </div>
      )}
    </div>
  )
}
