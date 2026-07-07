"use client"

import React, { useState, useMemo } from "react"
import { Flame, Target } from "lucide-react"

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

const polarToCartesian = (cx: number, cy: number, radius: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
}

const getSegmentPath = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export const CircularView: React.FC<CircularViewProps> = ({
  habits,
  selectedDate,
  onToggleCell,
  onEdit,
  linkedGoals,
}) => {
  const [hovered, setHovered] = useState<{ habitId: string; day: number } | null>(null)
  const [highlightedRing, setHighlightedRing] = useState<string | null>(null)

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayISO = new Date().toISOString().split("T")[0]
  const monthName = selectedDate.toLocaleDateString("en-GB", { month: "long" })

  const formatDayISO = (day: number): string => {
    const d = new Date(year, month, day)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${dd}`
  }

  const svgSize = 460
  const centerX = svgSize / 2
  const centerY = svgSize / 2
  const ringWidth = 26
  const ringGap = 6
  const baseRadius = 50
  const segments = daysInMonth

  const getLinkedGoal = (habit: Habit) => {
    if (!habit.goal) return null
    return linkedGoals.find((g) => g.title === habit.goal || g.id === habit.goal) || null
  }

  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const completedDays = Array.from({ length: daysInMonth }, (_, i) => {
        const dateISO = formatDayISO(i + 1)
        return habit.completions[dateISO]?.completed || false
      }).filter(Boolean).length
      return { habit, completedDays }
    })
  }, [habits, daysInMonth, year, month])

  return (
    <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 text-center">{monthName} {year} — Monthly Radial Tracker</h3>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        <div className="relative" style={{ width: svgSize, height: svgSize }}>
          <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
            {habitStats.map((stat, ringIdx) => {
              const radius = baseRadius + ringIdx * (ringWidth + ringGap)
              const isHighlighted = highlightedRing === stat.habit.id
              const dimOthers = highlightedRing !== null && !isHighlighted
              const goal = getLinkedGoal(stat.habit)
              return (
                <g key={stat.habit.id} style={{ opacity: dimOthers ? 0.25 : 1, transition: "opacity 0.3s ease" }}>
                  {/* Background segments (incomplete / future) */}
                  {Array.from({ length: segments }, (_, i) => {
                    const day = i + 1
                    const dateISO = formatDayISO(day)
                    const completion = stat.habit.completions[dateISO]
                    const isCompleted = completion?.completed || false
                    const isFuture = dateISO > todayISO
                    const segmentAngle = 360 / segments
                    const startAngle = i * segmentAngle
                    const endAngle = (i + 1) * segmentAngle
                    const midAngle = (startAngle + endAngle) / 2
                    const isHovered = hovered?.habitId === stat.habit.id && hovered?.day === day
                    if (isCompleted) {
                      return (
                        <path
                          key={i}
                          d={getSegmentPath(centerX, centerY, radius, startAngle, endAngle)}
                          fill={stat.habit.colorHex}
                          className="cursor-pointer transition-opacity"
                          style={{ opacity: isHovered ? 0.8 : 1 }}
                          onMouseEnter={() => setHovered({ habitId: stat.habit.id, day })}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => !isFuture && onToggleCell(stat.habit.id, dateISO)}
                        />
                      )
                    }
                    return (
                      <path
                        key={i}
                        d={getSegmentPath(centerX, centerY, radius, startAngle, endAngle)}
                        fill="none"
                        stroke={isFuture ? "#E5E7EB" : "rgba(30,14,107,0.10)"}
                        strokeWidth={ringWidth}
                        className={`cursor-pointer ${isFuture ? "" : "hover:stroke-[#1E0E6B]/20"}`}
                        style={{ transition: "stroke 0.2s ease" }}
                        onMouseEnter={() => setHovered({ habitId: stat.habit.id, day })}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => !isFuture && onToggleCell(stat.habit.id, dateISO)}
                      />
                    )
                  })}
                </g>
              )
            })}

            {/* Center label */}
            <circle cx={centerX} cy={centerY} r={baseRadius - 6} fill="white" className="dark:fill-gray-900" stroke="rgba(30,14,107,0.08)" strokeWidth={2} />
            <text x={centerX} y={centerY - 6} textAnchor="middle" className="fill-foreground text-lg font-semibold">
              {monthName}
            </text>
            <text x={centerX} y={centerY + 16} textAnchor="middle" className="fill-muted-foreground text-sm">
              {year}
            </text>
          </svg>

          {/* Hover tooltip */}
          {hovered && (() => {
            const stat = habitStats.find((s) => s.habit.id === hovered.habitId)
            if (!stat) return null
            const dateISO = formatDayISO(hovered.day)
            const completion = stat.habit.completions[dateISO]
            const dayDate = new Date(year, month, hovered.day)
            return (
              <div className="absolute z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-white/20 text-xs pointer-events-none"
                style={{
                  left: centerX,
                  top: 8,
                  transform: "translateX(-50%)",
                }}>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.habit.colorHex }} />
                  {stat.habit.name}
                </div>
                <div className="text-muted-foreground mt-1">
                  {dayDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </div>
                <div className="text-muted-foreground">
                  {completion?.completed ? `Completed${completion.time ? " at " + completion.time : ""}` : "Not completed"}
                </div>
                <div className="font-medium mt-0.5" style={{ color: getScoreColor(stat.habit.habitScore) }}>
                  Intent Score: {stat.habit.habitScore}%
                </div>
              </div>
            )
          })()}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 min-w-[200px] max-h-[460px] overflow-y-auto">
          <h4 className="text-sm font-medium text-foreground mb-1">Habits</h4>
          {habitStats.map((stat) => {
            const goal = getLinkedGoal(stat.habit)
            const isHighlighted = highlightedRing === stat.habit.id
            return (
              <button
                key={stat.habit.id}
                onClick={() => setHighlightedRing(isHighlighted ? null : stat.habit.id)}
                className={`flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                  isHighlighted ? "bg-[#1E0E6B]/10 ring-1 ring-[#1E0E6B]/30" : "hover:bg-white/40"
                }`}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stat.habit.colorHex }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{stat.habit.name}</span>
                    {goal && (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.colorHex }} title={`Linked to: ${goal.title}`} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{stat.completedDays}/{daysInMonth} days</span>
                    <span className="flex items-center gap-0.5 text-xs text-orange-500">
                      <Flame className="h-3 w-3" />
                      {stat.habit.streak}
                    </span>
                    <span className="text-xs font-medium" style={{ color: getScoreColor(stat.habit.habitScore) }}>
                      {stat.habit.habitScore}%
                    </span>
                  </div>
                </div>
              </button>
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

      {habits.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No habits to display</h3>
          <p className="text-muted-foreground mt-1">Add habits to see the circular tracker</p>
        </div>
      )}
    </div>
  )
}
