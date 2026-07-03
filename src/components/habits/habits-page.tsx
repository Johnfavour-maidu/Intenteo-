"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  Repeat,
  CheckCircle2,
  Circle,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"

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
}

const sampleHabits: Habit[] = [
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
  },
]

export function HabitsPage() {
  const [habits, setHabits] = useState(sampleHabits)

  const toggleHabit = (id: string) => {
    setHabits(habits.map(habit =>
      habit.id === id ? { ...habit, completedToday: !habit.completedToday } : habit
    ))
  }

  const completedCount = habits.filter(h => h.completedToday).length
  const totalCount = habits.length
  const completionRate = Math.round((completedCount / totalCount) * 100)

  const dailyHabits = habits.filter(h => h.frequency === "daily")
  const weeklyHabits = habits.filter(h => h.frequency === "weekly")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">
            {completedCount} of {totalCount} completed today • Build your identity
          </p>
        </div>
        <Button className="glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCount}</p>
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
              <p className="text-2xl font-bold">15</p>
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
              <p className="text-2xl font-bold">85</p>
              <p className="text-xs text-muted-foreground">Avg Intent Score</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Daily Habits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Daily Habits</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {dailyHabits.map((habit) => (
            <Card key={habit.id} className="group hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleHabit(habit.id)} className="mt-1 shrink-0">
                    {habit.completedToday ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.icon}</span>
                      <h3 className={`font-medium ${habit.completedToday ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{habit.streak}</span>
                        <span className="text-muted-foreground">day streak</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{habit.intentScore}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Completion rate</span>
                        <span>{habit.completionRate}%</span>
                      </div>
                      <Progress value={habit.completionRate} className="h-1.5" />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Habits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Weekly Habits</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {weeklyHabits.map((habit) => (
            <Card key={habit.id} className="group hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleHabit(habit.id)} className="mt-1 shrink-0">
                    {habit.completedToday ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{habit.icon}</span>
                      <h3 className={`font-medium ${habit.completedToday ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{habit.streak}</span>
                        <span className="text-muted-foreground">week streak</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Target className="h-3 w-3" />
                        <span>{habit.intentScore}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
