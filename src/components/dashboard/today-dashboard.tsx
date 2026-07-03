"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/ui/progress-ring"
import { IntentScoreBadge } from "@/components/ui/intent-score-badge"
import { StreakDisplay } from "@/components/ui/streak-display"
import { MoodSelector } from "@/components/ui/mood-selector"
import { GlassCard } from "@/components/ui/glass-card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Sun,
  Cloud,
  Calendar,
  Clock,
  Target,
  BookOpen,
  Zap,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Heart,
  Coffee,
} from "lucide-react"

export function TodayDashboard() {
  const greeting = getGreeting()
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, <span className="text-gradient">John</span>
          </h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <div className="flex items-center gap-3">
          <IntentScoreBadge score={85} size="lg" />
          <StreakDisplay count={12} />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Intention */}
          <GlassCard variant="primary" className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Today&apos;s Intention</h2>
                </div>
                <p className="text-2xl font-medium">
                  &quot;Be fully present in every conversation and create meaningful connections.&quot;
                </p>
                <p className="text-sm text-muted-foreground">
                  Connected to: <span className="text-primary font-medium">Build deeper relationships</span>
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </GlassCard>

          {/* Top Priorities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Top Priorities</CardTitle>
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorities.map((priority, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <button className="shrink-0">
                      {priority.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${priority.completed ? "line-through text-muted-foreground" : ""}`}>
                        {priority.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{priority.time}</p>
                    </div>
                    <Badge variant={priority.urgency as any}>{priority.urgency}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Schedule</CardTitle>
              <Button variant="ghost" size="sm">
                Full Calendar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors"
                  >
                    <div className="text-sm font-medium text-muted-foreground w-16">{item.time}</div>
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    </div>
                    <Badge variant="outline">{item.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Journal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Quick Journal</CardTitle>
              <Button variant="ghost" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                Full Entry
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="What's on your mind? Capture a quick thought..."
                className="min-h-[100px]"
              />
              <div className="flex justify-end mt-3">
                <Button size="sm">Save Entry</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-6">
          {/* Weather & Quote */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">72°F</p>
                <p className="text-sm text-muted-foreground">Sunny, Perfect for a walk</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30">
              <p className="text-sm italic text-muted-foreground">
                &quot;The secret of getting ahead is getting started.&quot;
              </p>
              <p className="text-xs text-muted-foreground mt-1">— Mark Twain</p>
            </div>
          </GlassCard>

          {/* Progress Rings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center">
                  <ProgressRing value={75} size={80} strokeWidth={6} />
                  <p className="text-sm font-medium mt-2">Tasks</p>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing value={60} size={80} strokeWidth={6} indicatorClassName="text-emerald-500" />
                  <p className="text-sm font-medium mt-2">Habits</p>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing value={90} size={80} strokeWidth={6} indicatorClassName="text-amber-500" />
                  <p className="text-sm font-medium mt-2">Intent</p>
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing value={45} size={80} strokeWidth={6} indicatorClassName="text-purple-500" />
                  <p className="text-sm font-medium mt-2">Energy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mood Check-in */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mood Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodSelector />
            </CardContent>
          </Card>

          {/* Today's Habits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Habits</CardTitle>
              <Badge variant="secondary">4/7 done</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {habits.map((habit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      habit.completed
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {habit.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{habit.streak} day streak</p>
                    </div>
                    <CheckCircle2
                      className={`h-5 w-5 cursor-pointer transition-colors ${
                        habit.completed ? "text-emerald-500" : "text-muted-foreground hover:text-emerald-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Energy Level */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Energy Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="text-sm font-medium">High</span>
                </div>
                <Progress value={78} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Your energy tends to be highest in the morning. Consider doing deep work before 2 PM.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Insight */}
          <GlassCard variant="info" className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-blue-600 dark:text-blue-400">Téo&apos;s Insight</p>
                <p className="text-sm mt-1">
                  You&apos;ve been more productive on days when you complete your morning journal. Try writing a quick entry today!
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Reflection Prompt */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Reflection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                &quot;What is one thing you did today that your future self would be proud of?&quot;
              </p>
              <Button variant="outline" className="w-full mt-4">
                <BookOpen className="mr-2 h-4 w-4" />
                Write Reflection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Add FAB */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg glow md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}

// Helper data
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

const priorities = [
  { title: "Review Q2 strategy document", time: "9:00 AM", urgency: "high", completed: true },
  { title: "Call with design team", time: "11:00 AM", urgency: "medium", completed: false },
  { title: "Write project proposal", time: "2:00 PM", urgency: "high", completed: false },
  { title: "Evening reflection", time: "8:00 PM", urgency: "low", completed: false },
]

const schedule = [
  { time: "9:00 AM", title: "Deep Work Block", location: "Focus mode", type: "Work" },
  { time: "11:00 AM", title: "Team Standup", location: "Zoom", type: "Meeting" },
  { time: "12:30 PM", title: "Lunch Break", location: "Home", type: "Personal" },
  { time: "2:00 PM", title: "Project Planning", location: "Office", type: "Work" },
  { time: "5:30 PM", title: "Gym Session", location: "Fitness Center", type: "Health" },
]

const habits = [
  { name: "Morning Journal", streak: 12, completed: true, icon: <BookOpen className="h-4 w-4" /> },
  { name: "Meditate", streak: 8, completed: true, icon: <Heart className="h-4 w-4" /> },
  { name: "Exercise", streak: 5, completed: true, icon: <Zap className="h-4 w-4" /> },
  { name: "Read 30 mins", streak: 15, completed: true, icon: <BookOpen className="h-4 w-4" /> },
  { name: "Drink 8 glasses", streak: 3, completed: false, icon: <Coffee className="h-4 w-4" /> },
  { name: "No social media", streak: 0, completed: false, icon: <Target className="h-4 w-4" /> },
  { name: "Evening reflection", streak: 7, completed: false, icon: <Sparkles className="h-4 w-4" /> },
]

// @ts-ignore
function Pencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}
