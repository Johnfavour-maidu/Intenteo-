"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "@/components/ui/progress-ring"
import { GlassCard } from "@/components/ui/glass-card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  Target,
  Calendar,
  Brain,
  Zap,
  BookOpen,
  Heart,
  ArrowUp,
  ArrowDown,
  Sparkles,
} from "lucide-react"

const weeklyData = [
  { name: "Mon", tasks: 8, habits: 6, intent: 85 },
  { name: "Tue", tasks: 10, habits: 7, intent: 88 },
  { name: "Wed", tasks: 7, habits: 5, intent: 78 },
  { name: "Thu", tasks: 9, habits: 7, intent: 90 },
  { name: "Fri", tasks: 11, habits: 6, intent: 82 },
  { name: "Sat", tasks: 5, habits: 4, intent: 75 },
  { name: "Sun", tasks: 3, habits: 3, intent: 70 },
]

const moodData = [
  { name: "Mon", mood: 4 },
  { name: "Tue", mood: 5 },
  { name: "Wed", mood: 3 },
  { name: "Thu", mood: 4 },
  { name: "Fri", mood: 4 },
  { name: "Sat", mood: 5 },
  { name: "Sun", mood: 4 },
]

const categoryData = [
  { name: "Health", value: 35, color: "var(--color-success)" },
  { name: "Career", value: 30, color: "var(--brand-primary)" },
  { name: "Learning", value: 20, color: "#8B5CF6" },
  { name: "Relationships", value: 15, color: "var(--brand-secondary)" },
]

const insights = [
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Productivity Up 15%",
    description: "Your task completion rate increased by 15% compared to last week.",
    trend: "up",
    color: "text-emerald-500",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "Mood Pattern",
    description: "Your mood is 23% higher on days you complete morning journal.",
    trend: "up",
    color: "text-blue-500",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Energy Insight",
    description: "You're most productive between 9-11 AM. Schedule deep work then.",
    trend: "neutral",
    color: "text-amber-500",
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Intent Score",
    description: "Your Intent Score is consistently above 80. Great alignment!",
    trend: "up",
    color: "text-purple-500",
  },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Understanding your patterns for intentional growth</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 days
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <ProgressRing value={82} size={60} strokeWidth={4} />
            <div>
              <p className="text-2xl font-bold">82%</p>
              <p className="text-xs text-muted-foreground">Intent Score</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">53</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">4.2</p>
              <p className="text-xs text-muted-foreground">Avg Mood</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="habits" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[1, 5]} className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Intent Score Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intent Score Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="intent"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Goal Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI-Generated Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-muted ${insight.color}`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{insight.title}</p>
                    {insight.trend === "up" && <ArrowUp className="h-4 w-4 text-emerald-500" />}
                    {insight.trend === "down" && <ArrowDown className="h-4 w-4 text-red-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
