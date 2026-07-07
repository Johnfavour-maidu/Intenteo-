"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Target, TrendingUp, Edit3 } from "lucide-react"

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

interface CircularViewProps {
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

const getRingPath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string => {
  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    }
  }
  const start = polarToCartesian(startAngle)
  const end = polarToCartesian(endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

export const CircularView: React.FC<CircularViewProps> = ({
  habits,
  selectedDate,
  onToggleCell,
  onEdit,
  linkedGoals,
}) => {
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)
  const [hoveredHabit, setHoveredHabit] = useState<string | null>(null)

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthLabel = selectedDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const formatDayISO = (day: number): string => {
    const d = new Date(year, month, day)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${dd}`
  }

  const svgSize = 500
  const centerX = svgSize / 2
  const centerY = svgSize / 2
  const ringWidth = 24
  const ringGap = 8
  const maxRings = Math.min(habits.length, 8)
  const baseRadius = 60

  const getLinkedGoalColor = (habit: Habit): string | undefined => {
    if (!habit.goal) return undefined
    const goal = linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal)
    return goal?.colorHex
  }

  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const completedDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const dateISO = formatDayISO(day)
        return habit.completions[dateISO]?.completed || false
      }).filter(Boolean).length
      return {
        habit,
        completedDays,
        completionRate: daysInMonth > 0 ? (completedDays / daysInMonth) * 100 : 0,
      }
    })
  }, [habits, daysInMonth, year, month])

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 text-center">{monthLabel} — Circular View</h3>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Central SVG */}
        <div className="relative">
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {/* Background circle */}
            <circle cx={centerX} cy={centerY} r={baseRadius - 20} fill="none" stroke="rgba(30,14,107,0.05)" strokeWidth={40} />

            {/* Habit rings */}
            {habitStats.slice(0, maxRings).map((stat, idx) => {
              const radius = baseRadius + idx * (ringWidth + ringGap)
              const completion = stat.completionRate / 100
              const isSelected = selectedHabit === stat.habit.id
              const isHovered = hoveredHabit === stat.habit.id
              const goalColor = getLinkedGoalColor(stat.habit)

              return (
                <g
                  key={stat.habit.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedHabit(isSelected ? null : stat.habit.id)}
                  onMouseEnter={() => setHoveredHabit(stat.habit.id)}
                  onMouseLeave={() => setHoveredHabit(null)}
                >
                  {/* Background ring */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill="none"
                    stroke={isSelected || isHovered ? `${stat.habit.colorHex}40` : "rgba(30,14,107,0.08)"}
                    strokeWidth={ringWidth}
                    strokeLinecap="round"
                  />

                  {/* Completion arc */}
                  {completion > 0 && (
                    <path
                      d={getRingPath(centerX, centerY, radius, 0, 360 * completion)}
                      fill="none"
                      stroke={stat.habit.colorHex}
                      strokeWidth={ringWidth - 4}
                      strokeLinecap="round"
                      style={{
                        filter: isSelected ? `drop-shadow(0 0 6px ${stat.habit.colorHex})` : undefined,
                        transition: "all 0.3s ease",
                      }}
                    />
                  )}

                  {/* Goal indicator dot */}
                  {goalColor && (
                    <circle
                      cx={centerX + radius + ringWidth / 2 + 4}
                      cy={centerY}
                      r={3}
                      fill={goalColor}
                    />
                  )}
                </g>
              )
            })}

            {/* Center text */}
            <text x={centerX} y={centerY - 8} textAnchor="middle" className="fill-foreground text-sm font-medium">
              {monthLabel.split(" ")[0]}
            </text>
            <text x={centerX} y={centerY + 12} textAnchor="middle" className="fill-muted-foreground text-xs">
              {year}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 min-w-[200px]">
          <h4 className="text-sm font-medium text-foreground mb-2">Habits</h4>
          {habitStats.slice(0, maxRings).map((stat, idx) => {
            const goalColor = getLinkedGoalColor(stat.habit)
            const isSelected = selectedHabit === stat.habit.id
            return (
              <div
                key={stat.habit.id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? "bg-white/60 shadow-sm" : "hover:bg-white/30"
                }`}
                onClick={() => setSelectedHabit(isSelected ? null : stat.habit.id)}
                onMouseEnter={() => setHoveredHabit(stat.habit.id)}
                onMouseLeave={() => setHoveredHabit(null)}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: stat.habit.colorHex }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{stat.habit.name}</span>
                    {goalColor && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: goalColor }}
                        title={`Linked to: ${stat.habit.goal}`}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{stat.completedDays} days</span>
                    <span className="text-xs font-medium" style={{ color: getScoreColor(stat.habit.habitScore) }}>
                      {stat.habit.habitScore}%
                    </span>
                    {stat.habit.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-orange-500">
                        <Flame className="h-3 w-3" />
                        {stat.habit.streak}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          {habits.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No habits to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected habit details */}
      {selectedHabit && (
        <div className="mt-6 p-4 bg-white/60 rounded-xl border border-white/20">
          {(() => {
            const stat = habitStats.find((s) => s.habit.id === selectedHabit)
            if (!stat) return null
            const habit = stat.habit
            return (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  {habit.icon && <span className="text-2xl">{habit.icon}</span>}
                  <div>
                    <h4 className="font-medium">{habit.name}</h4>
                    <p className="text-sm text-muted-foreground">{habit.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium" style={{ color: getScoreColor(habit.habitScore) }}>
                      {habit.habitScore}%
                    </span>
                    <span className="text-muted-foreground">score</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{habit.streak}</span>
                    <span className="text-muted-foreground">streak</span>
                  </div>
                  <div className="text-muted-foreground">
                    {stat.completedDays} / {daysInMonth} days
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(habit)}
                  className="ml-auto"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
