"use client"

import React, { useState, useMemo } from "react"
import { CheckCircle2, Flame, Target, GripVertical } from "lucide-react"
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
}

type TrackerPeriod = "week" | "month" | "year"

interface VerticalViewProps {
  habits: Habit[]
  selectedDate: Date
  period: TrackerPeriod
  onToggleCell: (habitId: string, date: string) => void
  onEdit: (habit: Habit) => void
  linkedGoals: { id: string; title: string; linkedHabits: string[]; colorHex: string }[]
  draggedId?: string | null
  dragOverId?: string | null
  onDragStart?: (id: string) => void
  onDragOver?: (e: React.DragEvent, id: string) => void
  onDrop?: (id: string) => void
  onDragEnd?: () => void
  onViewAnalytics?: (habit: Habit) => void
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#22C55E"
  if (score >= 60) return "#EAB308"
  if (score >= 40) return "#F97316"
  return "#EF4444"
}

const formatISO = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${dd}`
}

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

export const VerticalView: React.FC<VerticalViewProps> = ({
  habits,
  selectedDate,
  period,
  onToggleCell,
  onEdit,
  linkedGoals,
  draggedId,
  dragOverId,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onViewAnalytics,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; date: string } | null>(null)
  const todayISO = new Date().toISOString().split("T")[0]

  const getLinkedGoal = (habit: Habit) => {
    if (!habit.goal) return null
    return linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal) || null
  }

  const months = useMemo(() => {
    if (period === "year") {
      return Array.from({ length: 12 }, (_, i) => i)
    }
    return [selectedDate.getMonth()]
  }, [period, selectedDate])

  const year = selectedDate.getFullYear()

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-[#1E0E6B]/10">
              <th className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 text-left text-xs font-medium text-muted-foreground min-w-[52px] border-r border-[#1E0E6B]/10 w-[52px]">
                Day
              </th>
              {habits.map((habit) => {
                const goal = getLinkedGoal(habit)
                const health = getHealthState(habit.habitScore, habit.consistency)
                const healthCfg = HEALTH_CONFIG[health]
                const trend = calcTrend(habit)
                const trendCfg = TREND_CONFIG[trend]
                return (
                  <th key={habit.id} className="p-2 text-left min-w-[140px] border-r border-[#1E0E6B]/10">
                    <button onClick={() => onEdit(habit)} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity text-left w-full">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.colorHex }} />
                      {habit.icon && <span className="text-sm shrink-0">{habit.icon}</span>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs text-[#1E0E6B] truncate">{habit.name}</span>
                          {goal && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: goal.colorHex }} />}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] mt-0.5">
                          <Flame className="h-2.5 w-2.5 text-orange-500" />
                          <span className="text-orange-500">{habit.streak}</span>
                          <span className={`text-[9px] font-medium px-1 py-0 rounded ${healthCfg.bg} ${healthCfg.color}`}>{healthCfg.icon}</span>
                          <span className={`text-[9px] ${trendCfg.color}`}>{trendCfg.icon}</span>
                          <button onClick={(e) => { e.stopPropagation(); onViewAnalytics?.(habit) }} className="font-medium hover:underline" style={{ color: getScoreColor(habit.habitScore) }}>
                            {habit.habitScore}
                          </button>
                        </div>
                      </div>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {months.map((month, mi) => {
              const daysInMonth = new Date(year, month + 1, 0).getDate()
              return (
                <React.Fragment key={`${year}-${month}`}>
                  {period === "year" && mi > 0 && (
                    <tr className="border-b border-[#1E0E6B]/10">
                      <td colSpan={habits.length + 1} className="p-0" />
                    </tr>
                  )}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const dateObj = new Date(year, month, day)
                    const dateISO = formatISO(dateObj)
                    const isToday = dateISO === todayISO
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6
                    return (
                      <tr
                        key={dateISO}
                        className={`border-b border-[#1E0E6B]/5 ${isToday ? "bg-[#1E0E6B]/5" : "hover:bg-white/30"}`}
                      >
                        <td className={`sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 border-r border-[#1E0E6B]/10 ${
                          isToday ? "bg-[#1E0E6B]/10" : ""
                        }`}>
                          <div className="flex flex-col items-center">
                            {period === "year" && day === 1 && (
                              <span className="text-[9px] font-semibold text-[#1E0E6B] uppercase tracking-wider mb-0.5">
                                {monthNames[month]}
                              </span>
                            )}
                            <span className={`text-xs font-medium ${isToday ? "text-[#1E0E6B]" : isWeekend ? "text-muted-foreground/60" : "text-foreground"}`}>
                              {day}
                            </span>
                            <span className="text-[9px] uppercase text-muted-foreground">
                              {dateObj.toLocaleDateString("en-GB", { weekday: "short" })}
                            </span>
                          </div>
                        </td>
                        {habits.map((habit) => {
                          const completion = habit.completions[dateISO]
                          const isCompleted = completion?.completed || false
                          const isFuture = dateISO > todayISO
                          const isPaused = habit.paused
                          const isHovered = hoveredCell?.habitId === habit.id && hoveredCell?.date === dateISO
                          const isDragOver = dragOverId === habit.id && dragOverId !== draggedId
                          return (
                            <td key={habit.id} className={`p-1 text-center border-r border-[#1E0E6B]/5 ${isDragOver ? "bg-[#1E0E6B]/10" : ""}`}>
                              <button
                                draggable
                                onDragStart={() => onDragStart?.(habit.id)}
                                onDragOver={(e) => onDragOver?.(e, habit.id)}
                                onDrop={() => onDrop?.(habit.id)}
                                onDragEnd={onDragEnd}
                                onClick={() => !isFuture && !isPaused && onToggleCell(habit.id, dateISO)}
                                onMouseEnter={() => setHoveredCell({ habitId: habit.id, date: dateISO })}
                                onMouseLeave={() => setHoveredCell(null)}
                                disabled={isFuture || isPaused}
                                className={`w-6 h-6 rounded-md transition-all mx-auto flex items-center justify-center ${
                                  isFuture || isPaused
                                    ? "cursor-not-allowed opacity-30"
                                    : isCompleted
                                    ? "cursor-pointer hover:scale-110"
                                    : "cursor-pointer hover:bg-white/50 border border-dashed border-gray-300"
                                }`}
                                style={isCompleted ? { backgroundColor: habit.colorHex } : undefined}
                              >
                                {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
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
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
      {habits.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No habits to display</h3>
          <p className="text-muted-foreground mt-1">Add habits to see the vertical tracker</p>
        </div>
      )}
    </div>
  )
}
