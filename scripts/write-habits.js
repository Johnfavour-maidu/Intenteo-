// Helper script to write the new Habits page
const fs = require('fs');
const path = require('path');

const content = `"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  MoreHorizontal,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Edit3,
  Trash2,
  X,
  Check,
  Star,
  Clock,
  BarChart3,
  Zap,
  Heart,
  Brain,
  Dumbbell,
  BookOpen,
  Coffee,
  Moon,
  Sun,
  ArrowUpRight,
  GripVertical,
  RotateCcw,
  TrendingDown,
  AlertCircle,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

interface Habit {
  id: string
  name: string
  description: string
  category: string
  frequency: "daily" | "weekly"
  streak: number
  bestStreak: number
  completedToday: boolean
  completionRate: number
  intentScore: number
  futureSelfAlignment: string
  color: string
  icon: string
  completions: Record<string, boolean>
  createdAt: string
  targetCount?: number
  currentCount?: number
}

type ViewMode = "today" | "weekly" | "monthly"
type FilterMode = "all" | "active" | "completed" | "missed"

const getTodayISO = () => new Date().toISOString().split("T")[0]

const getWeekDates = (startDate: Date): Date[] => {
  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

const formatDateISO = (date: Date): string => date.toISOString().split("T")[0]

const formatDayName = (date: Date): string => date.toLocaleDateString("en-US", { weekday: "short" })

const formatDayNumber = (date: Date): string => date.getDate().toString()

const createSampleHabits = (): Habit[] => {
  const today = new Date()
  const completions: Record<string, boolean> = {}
  
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = formatDateISO(d)
    completions[dateStr] = Math.random() > 0.3
  }

  return [
    {
      id: "1",
      name: "Morning Journal",
      description: "Write for 10 minutes about intentions and gratitude",
      category: "Mindfulness",
      frequency: "daily",
      streak: 12,
      bestStreak: 21,
      completedToday: true,
      completionRate: 85,
      intentScore: 95,
      futureSelfAlignment: "Stay mindful and intentional",
      color: "from-amber-400 to-orange-500",
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
      streak: 8,
      bestStreak: 15,
      completedToday: true,
      completionRate: 70,
      intentScore: 90,
      futureSelfAlignment: "Cultivate inner peace",
      color: "from-purple-400 to-pink-500",
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
      streak: 5,
      bestStreak: 10,
      completedToday: true,
      completionRate: 65,
      intentScore: 85,
      futureSelfAlignment: "Become physically fit",
      color: "from-emerald-400 to-green-500",
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
      streak: 15,
      bestStreak: 30,
      completedToday: true,
      completionRate: 80,
      intentScore: 80,
      futureSelfAlignment: "Become a lifelong learner",
      color: "from-blue-400 to-cyan-500",
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
      streak: 3,
      bestStreak: 7,
      completedToday: false,
      completionRate: 55,
      intentScore: 70,
      futureSelfAlignment: "Take care of my body",
      color: "from-cyan-400 to-blue-500",
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
      streak: 0,
      bestStreak: 5,
      completedToday: false,
      completionRate: 40,
      intentScore: 75,
      futureSelfAlignment: "Master my attention",
      color: "from-rose-400 to-red-500",
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
      streak: 7,
      bestStreak: 14,
      completedToday: false,
      completionRate: 75,
      intentScore: 90,
      futureSelfAlignment: "End each day with purpose",
      color: "from-violet-400 to-purple-500",
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
      streak: 4,
      bestStreak: 8,
      completedToday: true,
      completionRate: 85,
      intentScore: 85,
      futureSelfAlignment: "Stay organized and intentional",
      color: "from-indigo-400 to-blue-500",
      icon: "📅",
      completions,
      createdAt: "2025-01-02",
    },
  ]
}

const SummaryBar = ({ habits }: { habits: Habit[] }) => {
  const completedCount = habits.filter(h => h.completedToday).length
  const totalCount = habits.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const bestStreak = Math.max(...habits.map(h => h.bestStreak), 0)
  const avgIntent = Math.round(habits.reduce((sum, h) => sum + h.intentScore, 0) / totalCount)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
            <p className="text-xs text-muted-foreground">Completed Today</p>
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{avgIntent}</p>
            <p className="text-xs text-muted-foreground">Avg Intent Score</p>
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
}: {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  habits: Habit[]
}) => {
  const weekDates = useMemo(() => {
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - start.getDay())
    return getWeekDates(start)
  }, [selectedDate])

  const today = getTodayISO()

  return (
    <div className="flex items-center justify-between gap-2 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          const newDate = new Date(selectedDate)
          newDate.setDate(newDate.getDate() - 7)
          onDateSelect(newDate)
        }}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex gap-1">
        {weekDates.map((date) => {
          const dateStr = formatDateISO(date)
          const isToday = dateStr === today
          const isSelected = dateStr === formatDateISO(selectedDate)
          const completedCount = habits.filter(h => h.completions[dateStr]).length
          const hasCompletions = completedCount > 0

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
              {hasCompletions && (
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

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          const newDate = new Date(selectedDate)
          newDate.setDate(newDate.getDate() + 7)
          onDateSelect(newDate)
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

const QuickFilters = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: {
  filter: FilterMode
  onFilterChange: (filter: FilterMode) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}) => {
  const filters: { mode: FilterMode; label: string; icon: React.ReactNode }[] = [
    { mode: "all", label: "All", icon: <Target className="h-4 w-4" /> },
    { mode: "active", label: "Active", icon: <Zap className="h-4 w-4" /> },
    { mode: "completed", label: "Completed", icon: <CheckCircle2 className="h-4 w-4" /> },
    { mode: "missed", label: "Missed", icon: <AlertCircle className="h-4 w-4" /> },
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
      <div className="flex gap-2">
        {filters.map(({ mode, label, icon }) => (
          <Button
            key={mode}
            variant={filter === mode ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(mode)}
            className={filter === mode ? "bg-[#1E0E6B] text-white" : ""}
          >
            {icon}
            <span className="ml-1 hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>
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
  const isCompleted = habit.completions[dateStr] || false

  return (
    <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20 hover:shadow-md transition-all">
      <button
        onClick={() => onToggle(habit.id)}
        className="shrink-0"
      >
        {isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
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
          <Badge variant="secondary" className="text-xs">
            {habit.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium">{habit.streak}</span>
            <span className="text-muted-foreground">day streak</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>{habit.intentScore}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{habit.completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(habit)}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={() => onDelete(habit.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
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
  const [icon, setIcon] = useState(habit?.icon || "⭐")
  const [color, setColor] = useState(habit?.color || "from-amber-400 to-orange-500")

  useEffect(() => {
    if (habit) {
      setName(habit.name)
      setDescription(habit.description)
      setCategory(habit.category)
      setFrequency(habit.frequency)
      setIcon(habit.icon)
      setColor(habit.color)
    } else {
      setName("")
      setDescription("")
      setCategory("Mindfulness")
      setFrequency("daily")
      setIcon("⭐")
      setColor("from-amber-400 to-orange-500")
    }
  }, [habit])

  const categories = ["Mindfulness", "Health", "Learning", "Productivity", "Mental Health", "Social"]
  const icons = ["⭐", "📝", "🧘", "💪", "📚", "💧", "📵", "🌙", "📅", "🎯", "🚀", "💡"]
  const colors = [
    "from-amber-400 to-orange-500",
    "from-purple-400 to-pink-500",
    "from-emerald-400 to-green-500",
    "from-blue-400 to-cyan-500",
    "from-rose-400 to-red-500",
    "from-violet-400 to-purple-500",
    "from-indigo-400 to-blue-500",
    "from-cyan-400 to-blue-500",
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{habit ? "Edit Habit" : "Add New Habit"}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Journal"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Write for 10 minutes"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className={category === cat ? "bg-[#1E0E6B] text-white" : ""}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Frequency</label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={frequency === "daily" ? "default" : "outline"}
                onClick={() => setFrequency("daily")}
                className={frequency === "daily" ? "bg-[#1E0E6B] text-white" : ""}
              >
                Daily
              </Button>
              <Button
                variant={frequency === "weekly" ? "default" : "outline"}
                onClick={() => setFrequency("weekly")}
                className={frequency === "weekly" ? "bg-[#1E0E6B] text-white" : ""}
              >
                Weekly
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Icon</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {icons.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={\`text-2xl p-2 rounded-lg transition-all \${
                    icon === ic ? "bg-[#EB9E5B]/20 scale-110" : "hover:bg-gray-100"
                  }\`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={\`w-8 h-8 rounded-full bg-gradient-to-br \${c} \${
                    color === c ? "ring-2 ring-offset-2 ring-[#1E0E6B]" : ""
                  }\`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (name.trim()) {
                onSave({
                  name,
                  description,
                  category,
                  frequency,
                  streak: habit?.streak || 0,
                  bestStreak: habit?.bestStreak || 0,
                  completedToday: habit?.completedToday || false,
                  completionRate: habit?.completionRate || 0,
                  intentScore: habit?.intentScore || 50,
                  futureSelfAlignment: habit?.futureSelfAlignment || "",
                  color,
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
  const [filter, setFilter] = useState<FilterMode>("all")
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

  const toggleHabit = useCallback((id: string) => {
    const dateStr = formatDateISO(selectedDate)
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== id) return habit
        const wasCompleted = habit.completions[dateStr] || false
        const newCompletions = { ...habit.completions, [dateStr]: !wasCompleted }
        
        let streak = 0
        const today = new Date()
        for (let i = 0; i < 365; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          const dStr = formatDateISO(d)
          if (newCompletions[dStr]) {
            streak++
          } else {
            break
          }
        }

        return {
          ...habit,
          completions: newCompletions,
          completedToday: dateStr === getTodayISO() ? !wasCompleted : habit.completedToday,
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

  const filteredHabits = useMemo(() => {
    const dateStr = formatDateISO(selectedDate)
    return habits.filter(habit => {
      if (searchQuery && !habit.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      const isCompleted = habit.completions[dateStr] || false
      switch (filter) {
        case "active":
          return !isCompleted
        case "completed":
          return isCompleted
        case "missed":
          return !isCompleted && habit.streak === 0
        default:
          return true
      }
    })
  }, [habits, filter, searchQuery, selectedDate])

  const dailyHabits = filteredHabits.filter(h => h.frequency === "daily")
  const weeklyHabits = filteredHabits.filter(h => h.frequency === "weekly")

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
          <p className="text-muted-foreground">
            Build your identity through consistent action
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingHabit(null)
            setIsModalOpen(true)
          }}
          className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      <SummaryBar habits={habits} />

      <WeeklyCalendar
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        habits={habits}
      />

      <QuickFilters
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {dailyHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Sun className="h-5 w-5 text-amber-500" />
            Daily Habits
          </h2>
          <div className="space-y-3">
            {dailyHabits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={toggleHabit}
                onEdit={(h) => {
                  setEditingHabit(h)
                  setIsModalOpen(true)
                }}
                onDelete={deleteHabit}
                selectedDate={selectedDate}
              />
            ))}
          </div>
        </div>
      )}

      {weeklyHabits.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Weekly Habits
          </h2>
          <div className="space-y-3">
            {weeklyHabits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                onToggle={toggleHabit}
                onEdit={(h) => {
                  setEditingHabit(h)
                  setIsModalOpen(true)
                }}
                onDelete={deleteHabit}
                selectedDate={selectedDate}
              />
            ))}
          </div>
        </div>
      )}

      {filteredHabits.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No habits found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery
              ? "Try a different search term"
              : filter === "completed"
              ? "No habits completed yet"
              : "Add your first habit to get started"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 bg-[#1E0E6B] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Habit
            </Button>
          )}
        </div>
      )}

      <HabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingHabit(null)
        }}
        onSave={saveHabit}
        habit={editingHabit}
      />
    </div>
  )
}`;

const filePath = path.join(__dirname, '..', 'src', 'components', 'habits', 'habits-page.tsx');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Habits page written successfully!');