"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GlassCard } from "@/components/ui/glass-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import {
  Compass,
  Target,
  Map,
  Navigation,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Sparkles,
  TrendingUp,
  Calendar,
} from "lucide-react"

const lifeDimensions = [
  { name: "Health", score: 75, icon: "💪", color: "from-emerald-400 to-green-500" },
  { name: "Career", score: 85, icon: "💼", color: "from-blue-400 to-cyan-500" },
  { name: "Finance", score: 60, icon: "💰", color: "from-amber-400 to-orange-500" },
  { name: "Relationships", score: 80, icon: "❤️", color: "from-rose-400 to-red-500" },
  { name: "Faith", score: 70, icon: "🙏", color: "from-violet-400 to-purple-500" },
  { name: "Learning", score: 90, icon: "📚", color: "from-indigo-400 to-blue-500" },
  { name: "Mental Wellbeing", score: 75, icon: "🧠", color: "from-cyan-400 to-blue-500" },
  { name: "Fun", score: 65, icon: "🎮", color: "from-pink-400 to-rose-500" },
]

const roadmap = [
  {
    year: "2026",
    title: "Foundation Year",
    goals: ["Launch Intenteo MVP", "Build consistent habits", "Save $10,000"],
    progress: 45,
  },
  {
    year: "2027",
    title: "Growth Year",
    goals: ["Scale Intenteo to 10k users", "Run a half marathon", "Expand to new markets"],
    progress: 0,
  },
  {
    year: "2028",
    title: "Impact Year",
    goals: ["Help 100k people live intentionally", "Publish a book", "Speak at conferences"],
    progress: 0,
  },
]

export function LifeGPSPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life GPS</h1>
          <p className="text-muted-foreground">Your personal navigation system for intentional living</p>
        </div>
        <Button className="glow">
          <Compass className="mr-2 h-4 w-4" />
          Update Vision
        </Button>
      </div>

      {/* Future Self Vision */}
      <GlassCard variant="primary" className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600">
            <Compass className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Future Self Vision</h2>
            <p className="text-muted-foreground mt-2">
              By 2030, I am a successful entrepreneur who has helped millions of people live with intentionality.
              I am physically fit, financially free, and deeply connected with my loved ones.
              I wake up each day with purpose and go to bed with gratitude.
            </p>
            <div className="flex gap-2 mt-4">
              <Badge variant="outline">Entrepreneur</Badge>
              <Badge variant="outline">Healthy</Badge>
              <Badge variant="outline">Financially Free</Badge>
              <Badge variant="outline">Connected</Badge>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Life Dimensions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Life Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {lifeDimensions.map((dimension) => (
              <div
                key={dimension.name}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{dimension.icon}</span>
                  <div>
                    <p className="font-medium">{dimension.name}</p>
                    <p className="text-sm text-muted-foreground">Score: {dimension.score}/100</p>
                  </div>
                </div>
                <Progress value={dimension.score} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard className="p-6 flex flex-col items-center">
          <ProgressRing value={77} size={120} strokeWidth={8} />
          <p className="mt-4 text-lg font-semibold">Overall Life Score</p>
          <p className="text-sm text-muted-foreground">Across all dimensions</p>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center">
          <ProgressRing value={85} size={120} strokeWidth={8} indicatorClassName="text-emerald-500" />
          <p className="mt-4 text-lg font-semibold">Alignment Score</p>
          <p className="text-sm text-muted-foreground">Actions vs. Vision</p>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col items-center">
          <ProgressRing value={65} size={120} strokeWidth={8} indicatorClassName="text-amber-500" />
          <p className="mt-4 text-lg font-semibold">Balance Score</p>
          <p className="text-sm text-muted-foreground">Life dimension balance</p>
        </GlassCard>
      </div>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Life Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roadmap.map((year) => (
              <div key={year.year} className="relative">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      year.progress > 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <span className="text-sm font-bold">{year.year.slice(2)}</span>
                    </div>
                    {year !== roadmap[roadmap.length - 1] && (
                      <div className="w-0.5 h-16 bg-muted" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{year.title}</h3>
                      <span className="text-sm text-muted-foreground">{year.year}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {year.goals.map((goal, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {year.progress > 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={year.progress > 0 ? "" : "text-muted-foreground"}>
                            {goal}
                          </span>
                        </div>
                      ))}
                    </div>
                    {year.progress > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{year.progress}%</span>
                        </div>
                        <Progress value={year.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
            <p className="font-semibold text-blue-600 dark:text-blue-400">Téo&apos;s Navigation Insight</p>
            <p className="text-sm mt-1">
              You&apos;re making great progress on your career and learning dimensions. To improve your overall
              life score, consider focusing more on your finance and fun dimensions. Small consistent
              actions in these areas can create significant balance.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
