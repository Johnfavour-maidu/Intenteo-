"use client"

import React, { useState } from "react"
import { CheckCircle2, Flame, Target } from "lucide-react"

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

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#22C55E"
  if (score >= 60) return "#EAB308"
  if (score >= 40) return "#F97316"
  return "#EF4444"
}

export const VerticalView: React.FC<VerticalViewProps> = ({
  habits,
  selectedDate,
  onToggleCell,
  onEdit,
  linkedGoals,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; date: string } | null>(null)

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayISO = new Date().toISOString().split("T")[0]

  const monthLabel = selectedDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const formatDayISO = (day: number): string => {
    const d = new Date(year, month, day)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${dd}`
  }

  const getLinkedGoal = (habit: Habit) => {
    if (!habit.goal) return null
    return linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal) || null
  }

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-foreground">{monthLabel} — Vertical Tracker</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 text-left text-sm font-medium text-muted-foreground min-w-[56px] border-r border-white/10">
                Day
              </th>
              {habits.map((habit) => {
                const goal = getLinkedGoal(habit)
                return (
                  <th key={habit.id} className="p-3 text-left min-w-[120px] border-r border-white/10">
                    <button onClick={() => onEdit(habit)} className="flex flex-col gap-1 hover:opacity-70 transition-opacity text-left w-full">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: habit.colorHex }} />
                        {habit.icon && <span className="text-base shrink-0">{habit.icon}</span>}
                        <span className="font-medium text-sm text-[#1E0E6B] truncate">{habit.name}</span>
                      </div>
                      <div className="flex items-center gap-2 pl-4">
                        <span className="flex items-center gap-0.5 text-[10px] text-orange-500">
                          <Flame className="h-2.5 w-2.5" />
                          {habit.streak}
                        </span>
                        <span className="text-[10px] font-medium" style={{ color: getScoreColor(habit.habitScore) }}>
                          {habit.habitScore}
                        </span>
                      </div>
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dateISO = formatDayISO(day)
              const date = new Date(year, month, day)
              const isToday = dateISO === todayISO
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              return (
                <tr key={day} className={`border-b border-white/5 ${isToday ? "bg-[#1E0E6B]/5" : "hover:bg-white/30"}`}>
                  <td className={`sticky left-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 border-r border-white/10 ${
                    isToday ? "bg-[#1E0E6B]/10" : ""
                  }`}>
                    <div className="flex flex-col items-center">
                      <span className={`text-sm font-medium ${isToday ? "text-[#1E0E6B]" : isWeekend ? "text-muted-foreground/60" : "text-foreground"}`}>
                        {day}
                      </span>
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {date.toLocaleDateString("en-GB", { weekday: "short" })}
                      </span>
                    </div>
                  </td>
                  {habits.map((habit) => {
                    const completion = habit.completions[dateISO]
                    const isCompleted = completion?.completed || false
                    const isFuture = dateISO > todayISO
                    const isPaused = habit.paused
                    const isHovered = hoveredCell?.habitId === habit.id && hoveredCell?.date === dateISO
                    return (
                      <td key={habit.id} className="p-1.5 text-center border-r border-white/5">
                        <button
                          onClick={() => !isFuture && !isPaused && onToggleCell(habit.id, dateISO)}
                          onMouseEnter={() => setHoveredCell({ habitId: habit.id, date: dateISO })}
                          onMouseLeave={() => setHoveredCell(null)}
                          disabled={isFuture || isPaused}
                          className={`w-7 h-7 rounded-md transition-all mx-auto flex items-center justify-center ${
                            isFuture || isPaused
                              ? "cursor-not-allowed opacity-30"
                              : isCompleted
                              ? "cursor-pointer hover:scale-110"
                              : "cursor-pointer hover:bg-white/50 border border-dashed border-gray-300"
                          }`}
                          style={isCompleted ? { backgroundColor: habit.colorHex } : undefined}
                        >
                          {isCompleted && <CheckCircle2 className="h-4 w-4 text-white" />}
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
          <p className="text-muted-foreground mt-1">Add habits to see the vertical tracker</p>
        </div>
      )}
    </div>
  )
}
