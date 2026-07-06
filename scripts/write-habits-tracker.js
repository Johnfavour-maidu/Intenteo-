const fs = require('fs');
const path = require('path');

const content = `"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit3,
  Trash2,
  X,
  Check,
  Clock,
  Zap,
  Sun,
  Moon,
  BarChart3,
  List,
  Grid3X3,
  ChevronDown,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

interface Habit {
  id: string
  name: string
  description: string
  category: string
  frequency: "daily" | "weekly"
  duration: string
  reminderTime: string
  goal: string
  streak: number
  bestStreak: number
  completedToday: boolean
  completionRate: number
  color: string
  colorHex: string
  icon: string
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
  createdAt: string
}

type ViewType = "list" | "tracker"
type TrackerPeriod = "week" | "month" | "year"
type FilterMode = "all" | "completed" | "incomplete" | "morning" | "afternoon" | "evening" | string
type SortMode = "name" | "streak" | "bestStreak" | "completion" | "color" | "category" | "duration"

const getTodayISO = () => new Date().toISOString().split("T")[0]

const formatDateISO = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return \`\${year}-\${month}-\${day}\`
}

const formatDayName = (date: Date): string => date.toLocaleDateString("en-US", { weekday: "short" })

const formatDayNumber = (date: Date): string => date.getDate().toString()

const formatMonthYear = (date: Date): string => date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

const getMonthDates = (year: number, month: number): Date[] => {
  const dates: Date[] = []
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()
  for (let i = -startOffset; i < 42 - startOffset; i++) {
    const d = new Date(year, month, 1 + i)
    dates.push(d)
  }
  return dates
}

const HABIT_COLORS: { name: string; hex: string; gradient: string }[] = [
  { name: "Purple", hex: "#8B5CF6", gradient: "from-purple-400 to-purple-600" },
  { name: "Blue", hex: "#3B82F6", gradient: "from-blue-400 to-blue-600" },
  { name: "Orange", hex: "#F97316", gradient: "from-orange-400 to-orange-600" },
  { name: "Green", hex: "#22C55E", gradient: "from-green-400 to-green-600" },
  { name: "Pink", hex: "#EC4899", gradient: "from-pink-400 to-pink-600" },
  { name: "Yellow", hex: "#EAB308", gradient: "from-yellow-400 to-yellow-600" },
  { name: "Red", hex: "#EF4444", gradient: "from-red-400 to-red-600" },
  { name: "Teal", hex: "#14B8A6", gradient: "from-teal-400 to-teal-600" },
]

const CATEGORIES = ["Mindfulness", "Health", "Learning", "Productivity", "Mental Health", "Social", "Faith", "Custom"]

const ICONS = ["⭐", "📝", "🧘", "💪", "📚", "💧", "📵", "🌙", "📅", "🎯", "🚀", "💡", "🙏", "❤️", "🏃", "🎓"]

const DURATIONS = ["5 mins", "10 mins", "15 mins", "30 mins", "45 mins", "1 hour", "2 hours"]

const createSampleHabits = (): Habit[] => {
  const today = new Date()
  const completions: Record<string, { completed: boolean; time?: string; notes?: string }> = {}
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateISO(d)
    if (Math.random() > 0.3) {
      completions[dateStr] = { completed: true, time: "08:00" }
    }
  }

  return [
    {
      id: "1",
      name: "Morning Journal",
      description: "Write for 10 minutes about intentions and gratitude",
      category: "Mindfulness",
      frequency: "daily",
      duration: "10 mins",
      reminderTime: "07:00",
      goal: "Write daily",
      streak: 12,
      bestStreak: 21,
      completedToday: true,
      completionRate: 85,
      color: "Purple",
      colorHex: "#8B5CF6",
      icon: "📝",
      completions,
      createdAt: "2025-01-01",
    },
    {
      id: "2",
      name: "Meditate",
      description: "10 minutes of guided meditation",
      category: "Mental Health",
      frequency: "daily",
      duration: "10 mins",
      reminderTime: "06:30",
      goal: "Daily practice",
      streak: 8,
      bestStreak: 15,
      completedToday: true,
      completionRate: 70,
      color: "Blue",
      colorHex: "#3B82F6",
      icon: "🧘",
      completions,
      createdAt: "2025-01-05",
    },
    {
      id: "3",
      name: "Exercise",
      description: "30 minutes of physical activity",
      category: "Health",
      frequency: "daily",
      duration: "30 mins",
      reminderTime: "17:00",
      goal: "Stay fit",
      streak: 5,
      bestStreak: 10,
      completedToday: true,
      completionRate: 65,
      color: "Green",
      colorHex: "#22C55E",
      icon: "💪",
      completions,
      createdAt: "2025-01-10",
    },
    {
      id: "4",
      name: "Read 30 Minutes",
      description: "Read books on personal growth",
      category: "Learning",
      frequency: "daily",
      duration: "30 mins",
      reminderTime: "20:00",
      goal: "Read more",
      streak: 15,
      bestStreak: 30,
      completedToday: true,
      completionRate: 80,
      color: "Orange",
      colorHex: "#F97316",
      icon: "📚",
      completions,
      createdAt: "2025-01-03",
    },
    {
      id: "5",
      name: "Drink 8 Glasses",
      description: "Stay hydrated throughout the day",
      category: "Health",
      frequency: "daily",
      duration: "5 mins",
      reminderTime: "09:00",
      goal: "Stay hydrated",
      streak: 3,
      bestStreak: 7,
      completedToday: false,
      completionRate: 55,
      color: "Teal",
      colorHex: "#14B8A6",
      icon: "💧",
      completions,
      createdAt: "2025-01-15",
    },
    {
      id: "6",
      name: "No Social Media Before Noon",
      description: "Protect morning focus time",
      category: "Productivity",
      frequency: "daily",
      duration: "5 mins",
      reminderTime: "08:00",
      goal: "Focus better",
      streak: 0,
      bestStreak: 5,
      completedToday: false,
      completionRate: 40,
      color: "Red",
      colorHex: "#EF4444",
      icon: "📵",
      completions,
      createdAt: "2025-01-20",
    },
    {
      id: "7",
      name: "Evening Reflection",
      description: "Review the day and set intentions for tomorrow",
      category: "Mindfulness",
      frequency: "daily",
      duration: "15 mins",
      reminderTime: "21:00",
      goal: "Reflect daily",
      streak: 7,
      bestStreak: 14,
      completedToday: false,
      completionRate: 75,
      color: "Pink",
      colorHex: "#EC4899",
      icon: "🌙",
      completions,
      createdAt: "2025-01-08",
    },
    {
      id: "8",
      name: "Weekly Planning",
      description: "Review and plan the upcoming week",
      category: "Productivity",
      frequency: "weekly",
      duration: "45 mins",
      reminderTime: "09:00",
      goal: "Stay organized",
      streak: 4,
      bestStreak: 8,
      completedToday: true,
      completionRate: 85,
      color: "Yellow",
      colorHex: "#EAB308",
      icon: "📅",
      completions,
      createdAt: "2025-01-02",
    },
  ]
}

const SummaryBar = ({ habits, selectedDate }: { habits: Habit[]; selectedDate: Date }) => {
  const today = getTodayISO()
  const dateStr = formatDateISO(selectedDate)
  const completedToday = habits.filter(h => h.completions[dateStr]?.completed).length
  const totalCount = habits.length
  const weeklyRate = totalCount > 0 ? Math.round((completedToday / totalCount) * 100) : 0
  
  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0)
  
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
  let monthlyCompleted = 0
  let monthlyTotal = 0
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const dStr = formatDateISO(d)
    habits.forEach(h => {
      if (h.completions[dStr]) {
        monthlyCompleted++
      }
      monthlyTotal++
    })
  }
  const monthlyRate = monthlyTotal > 0 ? Math.round((monthlyCompleted / monthlyTotal) * 100) : 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedToday}/{totalCount}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{weeklyRate}%</p>
            <p className="text-xs text-muted-foreground">Weekly %</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{monthlyRate}%</p>
            <p className="text-xs text-muted-foreground">Monthly %</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{bestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-500">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-muted-foreground">Total Habits</p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

const WeeklyCalendar = ({
  selectedDate,
  onDateSelect,
  habits,
  onToday,
  onPrev,
  onNext,
}: {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  habits: Habit[]
  onToday: () => void
  onPrev: () => void
  onNext: () => void
}) => {
  const weekDates = useMemo(() => {
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - start.getDay())
    return getWeekDates(start)
  }, [selectedDate])

  const today = getTodayISO()

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-1">
        {weekDates.map((date) => {
          const dateStr = formatDateISO(date)
          const isToday = dateStr === today
          const isSelected = dateStr === formatDateISO(selectedDate)
          const completedCount = habits.filter(h => h.completions[dateStr]?.completed).length

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(date)}
              className={\`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all \${
                isSelected
                  ? "bg-[#1E0E6B] text-white"
                  : isToday
                  ? "bg-[#EB9E5B]/20 text-[#1E0E6B] font-semibold"
                  : "hover:bg-white/50"
              }\`}
            >
              <span className="text-xs font-medium">{formatDayName(date)}</span>
              <span className="text-lg font-bold">{formatDayNumber(date)}</span>
              {completedCount > 0 && (
                <div className="flex gap-0.5">
                  {[...Array(Math.min(completedCount, 3))].map((_, i) => (
                    <div
                      key={i}
                      className={\`w-1.5 h-1.5 rounded-full \${
                        isSelected ? "bg-white" : "bg-emerald-500"
                      }\`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex gap-1">
        <Button variant="outline" size="sm" onClick={onToday} className="text-xs">
          Today
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const TrackerCalendar = ({
  selectedDate,
  onDateSelect,
  period,
  onPeriodChange,
  habits,
}: {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  period: TrackerPeriod
  onPeriodChange: (p: TrackerPeriod) => void
  habits: Habit[]
}) => {
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const dates = useMemo(() => {
    if (period === "week") {
      const start = new Date(selectedDate)
      start.setDate(start.getDate() - start.getDay())
      return getWeekDates(start)
    } else if (period === "month") {
      return getMonthDates(year, month)
    } else {
      const allDates: Date[] = []
      for (let m = 0; m < 12; m++) {
        const monthDates = getMonthDates(year, m)
        allDates.push(...monthDates)
      }
      return allDates
    }
  }, [selectedDate, period, year, month])

  const today = getTodayISO()

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
        const newDate = new Date(selectedDate)
        if (period === "week") newDate.setDate(newDate.getDate() - 7)
        else if (period === "month") newDate.setMonth(newDate.getMonth() - 1)
        else newDate.setFullYear(newDate.getFullYear() - 1)
        onDateSelect(newDate)
      }}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1">
          {(["week", "month", "year"] as TrackerPeriod[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(p)}
              className={period === p ? "bg-[#1E0E6B] text-white" : ""}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
        <span className="text-sm font-medium">{formatMonthYear(selectedDate)}</span>
      </div>

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
        const newDate = new Date(selectedDate)
        if (period === "week") newDate.setDate(newDate.getDate() + 7)
        else if (period === "month") newDate.setMonth(newDate.getMonth() + 1)
        else newDate.setFullYear(newDate.getFullYear() + 1)
        onDateSelect(newDate)
      }}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

const TrackerFilters = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: {
  filter: FilterMode
  onFilterChange: (f: FilterMode) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: SortMode
  onSortChange: (s: SortMode) => void
}) => {
  const filters: { mode: FilterMode; label: string }[] = [
    { mode: "all", label: "All" },
    { mode: "completed", label: "Completed" },
    { mode: "incomplete", label: "Incomplete" },
    { mode: "morning", label: "Morning" },
    { mode: "afternoon", label: "Afternoon" },
    { mode: "evening", label: "Evening" },
  ]

  const sorts: { mode: SortMode; label: string }[] = [
    { mode: "name", label: "Name" },
    { mode: "streak", label: "Streak" },
    { mode: "bestStreak", label: "Best Streak" },
    { mode: "completion", label: "Completion %" },
    { mode: "category", label: "Category" },
    { mode: "duration", label: "Duration" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white/50 dark:bg-white/5 border-white/20"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map(({ mode, label }) => (
          <Button
            key={mode}
            variant={filter === mode ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(mode)}
            className={filter === mode ? "bg-[#1E0E6B] text-white" : ""}
          >
            {label}
          </Button>
        ))}
      </div>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortMode)}
        className="px-3 py-2 text-sm border border-white/20 rounded-lg bg-white/50 dark:bg-white/5"
      >
        {sorts.map(({ mode, label }) => (
          <option key={mode} value={mode}>{label}</option>
        ))}
      </select>
    </div>
  )
}

const HabitRow = ({
  habit,
  onToggle,
  onEdit,
  onDelete,
  selectedDate,
}: {
  habit: Habit
  onToggle: (id: string) => void
  onEdit: (habit: Habit) => void
  onDelete: (id: string) => void
  selectedDate: Date
}) => {
  const dateStr = formatDateISO(selectedDate)
  const isCompleted = habit.completions[dateStr]?.completed || false

  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 hover:shadow-md transition-all">
      <button onClick={() => onToggle(habit.id)} className="shrink-0">
        {isCompleted ? (
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: habit.colorHex }}>
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground hover:text-[#1E0E6B]" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">{habit.icon}</span>
          <h3 className={\`font-medium \${isCompleted ? "line-through text-muted-foreground" : ""}\`}>
            {habit.name}
          </h3>
          <Badge variant="secondary" className="text-xs">{habit.category}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />{habit.duration}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4" style={{ color: habit.colorHex }} />
            <span className="font-medium">{habit.streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{habit.completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(habit)}>
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(habit.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const TrackerView = ({
  habits,
  selectedDate,
  period,
  onToggleCell,
  onEdit,
}: {
  habits: Habit[]
  selectedDate: Date
  period: TrackerPeriod
  onToggleCell: (habitId: string, dateStr: string) => void
  onEdit: (habit: Habit) => void
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ habitId: string; date: string } | null>(null)

  const dates = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    if (period === "week") {
      const start = new Date(selectedDate)
      start.setDate(start.getDate() - start.getDay())
      return getWeekDates(start)
    } else if (period === "month") {
      return getMonthDates(year, month)
    } else {
      const allDates: Date[] = []
      for (let m = 0; m < 12; m++) {
        const monthDates = getMonthDates(year, m)
        allDates.push(...monthDates)
      }
      return allDates
    }
  }, [selectedDate, period])

  const today = getTodayISO()

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-white/20">
            <th className="sticky left-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 text-left font-medium text-sm min-w-[180px]">
              Habit
            </th>
            <th className="p-3 text-left font-medium text-sm min-w-[100px]">Category</th>
            <th className="p-3 text-left font-medium text-sm min-w-[60px]">Color</th>
            <th className="p-3 text-left font-medium text-sm min-w-[80px]">Duration</th>
            {dates.map((date) => {
              const dateStr = formatDateISO(date)
              const isToday = dateStr === today
              return (
                <th key={dateStr} className={\`p-2 text-center font-medium text-xs min-w-[48px] \${
                  isToday ? "text-[#1E0E6B] font-bold" : "text-muted-foreground"
                }\`}>
                  <div className="flex flex-col items-center gap-0.5">
                    <span>{formatDayName(date)}</span>
                    <span className="text-lg">{formatDayNumber(date)}</span>
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => {
            const currentStreak = habit.streak
            return (
              <tr key={habit.id} className="border-b border-white/10 hover:bg-white/30 dark:hover:bg-white/5">
                <td className="sticky left-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{habit.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="h-3 w-3" style={{ color: habit.colorHex }} />
                        {currentStreak} day streak
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="secondary" className="text-xs">{habit.category}</Badge>
                </td>
                <td className="p-3">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: habit.colorHex }} />
                </td>
                <td className="p-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />{habit.duration}
                  </span>
                </td>
                {dates.map((date) => {
                  const dateStr = formatDateISO(date)
                  const isCompleted = habit.completions[dateStr]?.completed || false
                  const isFuture = dateStr > today
                  const completion = habit.completions[dateStr]

                  return (
                    <td key={dateStr} className="p-2 text-center">
                      <button
                        onClick={() => !isFuture && onToggleCell(habit.id, dateStr)}
                        onMouseEnter={() => setHoveredCell({ habitId: habit.id, date: dateStr })}
                        onMouseLeave={() => setHoveredCell(null)}
                        disabled={isFuture}
                        className={\`relative w-8 h-8 rounded-lg transition-all \${
                          isFuture
                            ? "cursor-not-allowed"
                            : isCompleted
                            ? "cursor-pointer hover:scale-110"
                            : "cursor-pointer hover:bg-white/50 border border-dashed border-gray-300"
                        }\`}
                        style={
                          isCompleted
                            ? { backgroundColor: habit.colorHex }
                            : undefined
                        }
                        title={hoveredCell?.habitId === habit.id && hoveredCell?.date === dateStr
                          ? \`\${dateStr}\n\${isCompleted ? "Completed" : "Missed"}\n\${completion?.time ? "Time: " + completion.time : ""}\n\${completion?.notes ? "Notes: " + completion.notes : ""}\`
                          : undefined
                        }
                      >
                        {isCompleted && <CheckCircle2 className="h-5 w-5 text-white" />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const HabitModal = ({
  isOpen,
  onClose,
  onSave,
  habit,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: Omit<Habit, "id" | "completions" | "createdAt">) => void
  habit?: Habit | null
}) => {
  const [name, setName] = useState(habit?.name || "")
  const [description, setDescription] = useState(habit?.description || "")
  const [category, setCategory] = useState(habit?.category || "Mindfulness")
  const [frequency, setFrequency] = useState<"daily" | "weekly">(habit?.frequency || "daily")
  const [duration, setDuration] = useState(habit?.duration || "10 mins")
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || "08:00")
  const [goal, setGoal] = useState(habit?.goal || "")
  const [icon, setIcon] = useState(habit?.icon || "⭐")
  const [colorIdx, setColorIdx] = useState(
    HABIT_COLORS.findIndex(c => c.name === habit?.color) >= 0
      ? HABIT_COLORS.findIndex(c => c.name === habit?.color)
      : 0
  )

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description)
      setCategory(habit.category)
      setFrequency(habit.frequency)
      setDuration(habit.duration)
      setReminderTime(habit.reminderTime)
      setGoal(habit.goal)
      setIcon(habit.icon)
      const idx = HABIT_COLORS.findIndex(c => c.name === habit.color)
      if (idx >= 0) setColorIdx(idx)
    } else {
      setName("")
      setDescription("")
      setCategory("Mindfulness")
      setFrequency("daily")
      setDuration("10 mins")
      setReminderTime("08:00")
      setGoal("")
      setIcon("⭐")
      setColorIdx(0)
    }
  }, [habit])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{habit ? "Edit Habit" : "Add New Habit"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Habit Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Morning Journal" className="mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Write for 10 minutes" className="mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {CATEGORIES.map((cat) => (
                <Button key={cat} variant={category === cat ? "default" : "outline"} size="sm" onClick={() => setCategory(cat)} className={category === cat ? "bg-[#1E0E6B] text-white" : ""}>
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Duration</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DURATIONS.map((d) => (
                  <Button key={d} variant={duration === d ? "default" : "outline"} size="sm" onClick={() => setDuration(d)} className={duration === d ? "bg-[#1E0E6B] text-white" : ""}>
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Reminder Time</label>
              <Input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Recurrence</label>
            <div className="flex gap-2 mt-1">
              <Button variant={frequency === "daily" ? "default" : "outline"} onClick={() => setFrequency("daily")} className={frequency === "daily" ? "bg-[#1E0E6B] text-white" : ""}>
                Daily
              </Button>
              <Button variant={frequency === "weekly" ? "default" : "outline"} onClick={() => setFrequency("weekly")} className={frequency === "weekly" ? "bg-[#1E0E6B] text-white" : ""}>
                Weekly
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Colour</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {HABIT_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  className={\`w-10 h-10 rounded-full transition-all flex items-center justify-center \${
                    colorIdx === i ? "ring-2 ring-offset-2 ring-[#1E0E6B] scale-110" : "hover:scale-105"
                  }\`}
                  style={{ backgroundColor: c.hex }}
                >
                  {colorIdx === i && <Check className="h-5 w-5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ICONS.map((ic) => (
                <button key={ic} onClick={() => setIcon(ic)} className={\`text-2xl p-2 rounded-lg transition-all \${
                  icon === ic ? "bg-[#EB9E5B]/20 scale-110" : "hover:bg-gray-100"
                }\`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Goal</label>
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., Write daily" className="mt-1" />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            onClick={() => {
              if (name.trim()) {
                const selectedColor = HABIT_COLORS[colorIdx]
                onSave({
                  name,
                  description,
                  category,
                  frequency,
                  duration,
                  reminderTime,
                  goal,
                  streak: habit?.streak || 0,
                  bestStreak: habit?.bestStreak || 0,
                  completedToday: habit?.completedToday || false,
                  completionRate: habit?.completionRate || 0,
                  color: selectedColor.name,
                  colorHex: selectedColor.hex,
                  icon,
                })
                onClose()
              }
            }}
            className="flex-1 bg-[#1E0E6B] text-white"
          >
            {habit ? "Save Changes" : "Add Habit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("list")
  const [trackerPeriod, setTrackerPeriod] = useState<TrackerPeriod>("week")
  const [filter, setFilter] = useState<FilterMode>("all")
  const [sortBy, setSortBy] = useState<SortMode>("name")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("intenteo-habits")
    if (saved) {
      try {
        setHabits(JSON.parse(saved))
      } catch {
        setHabits(createSampleHabits())
      }
    } else {
      setHabits(createSampleHabits())
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("intenteo-habits", JSON.stringify(habits))
    }
  }, [habits, isLoading])

  useEffect(() => {
    localStorage.setItem("intenteo-habits-view", viewType)
  }, [viewType])

  useEffect(() => {
    localStorage.setItem("intenteo-habits-period", trackerPeriod)
  }, [trackerPeriod])

  useEffect(() => {
    localStorage.setItem("intenteo-habits-sort", sortBy)
  }, [sortBy])

  const toggleHabit = useCallback((id: string, dateStr?: string) => {
    const targetDate = dateStr || formatDateISO(selectedDate)
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== id) return habit
        const existing = habit.completions[targetDate]
        const wasCompleted = existing?.completed || false
        const newCompletion = wasCompleted
          ? undefined
          : { completed: true, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }
        const newCompletions = { ...habit.completions }
        if (newCompletion) {
          newCompletions[targetDate] = newCompletion
        } else {
          delete newCompletions[targetDate]
        }

        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dStr = formatDateISO(d)
          if (newCompletions[dStr]?.completed) {
            streak++
          } else {
            break
          }
        }

        return {
          ...habit,
          completions: newCompletions,
          completedToday: targetDate === getTodayISO() ? !wasCompleted : habit.completedToday,
          streak,
          bestStreak: Math.max(habit.bestStreak, streak),
        }
      })
    )
  }, [selectedDate])

  const saveHabit = useCallback((habitData: Omit<Habit, "id" | "completions" | "createdAt">) => {
    if (editingHabit) {
      setHabits(prev =>
        prev.map(h =>
          h.id === editingHabit.id ? { ...h, ...habitData } : h
        )
      )
    } else {
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        completions: {},
        createdAt: getTodayISO(),
      }
      setHabits(prev => [...prev, newHabit])
    }
    setEditingHabit(null)
  }, [editingHabit])

  const deleteHabit = useCallback((id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      setHabits(prev => prev.filter(h => h.id !== id))
    }
  }, [])

  const filteredAndSortedHabits = useMemo(() => {
    const dateStr = formatDateISO(selectedDate)
    let result = habits.filter(habit => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !habit.name.toLowerCase().includes(q) &&
          !habit.category.toLowerCase().includes(q) &&
          !habit.color.toLowerCase().includes(q) &&
          !habit.duration.toLowerCase().includes(q)
        ) {
          return false
        }
      }

      const isCompleted = habit.completions[dateStr]?.completed || false
      const reminderHour = habit.reminderTime ? parseInt(habit.reminderTime.split(":")[0]) : 12
      const timeOfDay = reminderHour < 12 ? "morning" : reminderHour < 17 ? "afternoon" : "evening"

      switch (filter) {
        case "completed": return isCompleted
        case "incomplete": return !isCompleted
        case "morning": return timeOfDay === "morning"
        case "afternoon": return timeOfDay === "afternoon"
        case "evening": return timeOfDay === "evening"
        default:
          if (CATEGORIES.includes(filter) && filter !== "all") {
            return habit.category === filter
          }
          return true
      }
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name)
        case "streak": return b.streak - a.streak
        case "bestStreak": return b.bestStreak - a.bestStreak
        case "completion": return b.completionRate - a.completionRate
        case "category": return a.category.localeCompare(b.category)
        case "duration": return a.duration.localeCompare(b.duration)
        default: return 0
      }
    })

    return result
  }, [habits, filter, searchQuery, sortBy, selectedDate])

  const handleToday = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  const handlePrev = useCallback(() => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 7)
    setSelectedDate(newDate)
  }, [selectedDate])

  const handleNext = useCallback(() => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 7)
    setSelectedDate(newDate)
  }, [selectedDate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading habits...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">Build your identity through consistent action</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white/50 dark:bg-white/5 rounded-lg border border-white/20 p-1">
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className={viewType === "list" ? "bg-[#1E0E6B] text-white" : ""}
            >
              <List className="h-4 w-4 mr-1" /> List
            </Button>
            <Button
              variant={viewType === "tracker" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("tracker")}
              className={viewType === "tracker" ? "bg-[#1E0E6B] text-white" : ""}
            >
              <Grid3X3 className="h-4 w-4 mr-1" /> Tracker
            </Button>
          </div>
          <Button onClick={() => { setEditingHabit(null); setIsModalOpen(true) }} className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90">
            <Plus className="mr-2 h-4 w-4" /> Add Habit
          </Button>
        </div>
      </div>

      <SummaryBar habits={habits} selectedDate={selectedDate} />

      {viewType === "list" ? (
        <>
          <WeeklyCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            habits={habits}
            onToday={handleToday}
            onPrev={handlePrev}
            onNext={handleNext}
          />

          <TrackerFilters
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="space-y-3">
            {filteredAndSortedHabits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={(id) => toggleHabit(id)}
                onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }}
                onDelete={deleteHabit}
                selectedDate={selectedDate}
              />
            ))}
          </div>

          {filteredAndSortedHabits.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No habits found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Add your first habit to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={() => setIsModalOpen(true)} className="mt-4 bg-[#1E0E6B] text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Habit
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <TrackerCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            period={trackerPeriod}
            onPeriodChange={setTrackerPeriod}
            habits={habits}
          />

          <TrackerFilters
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <div className="bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 overflow-hidden">
            {filteredAndSortedHabits.length > 0 ? (
              <TrackerView
                habits={filteredAndSortedHabits}
                selectedDate={selectedDate}
                period={trackerPeriod}
                onToggleCell={toggleHabit}
                onEdit={(h) => { setEditingHabit(h); setIsModalOpen(true) }}
              />
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No habits found</h3>
                <p className="text-muted-foreground mt-1">
                  {searchQuery ? "Try a different search term" : "Add your first habit to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsModalOpen(true)} className="mt-4 bg-[#1E0E6B] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Habit
                  </Button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingHabit(null) }}
        onSave={saveHabit}
        habit={editingHabit}
      />
    </div>
  )
}`;

const filePath = path.join(__dirname, '..', 'src', 'components', 'habits', 'habits-page.tsx');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Habits page with Tracker View written successfully!');
console.log('File size:', content.length, 'bytes');
