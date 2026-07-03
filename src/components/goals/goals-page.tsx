"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "@/components/ui/progress-ring"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from "lucide-react"

interface Goal {
  id: string
  title: string
  description: string
  category: string
  progress: number
  deadline: string
  type: "annual" | "quarterly" | "monthly" | "weekly"
  intentScore: number
  futureSelfAlignment: string
  milestones: { title: string; completed: boolean }[]
}

const sampleGoals: Goal[] = [
  {
    id: "1",
    title: "Launch Intenteo MVP",
    description: "Ship the first version of the platform to beta users",
    category: "Career",
    progress: 65,
    deadline: "Q3 2026",
    type: "quarterly",
    intentScore: 90,
    futureSelfAlignment: "Become a successful entrepreneur",
    milestones: [
      { title: "Complete UI design", completed: true },
      { title: "Backend API ready", completed: true },
      { title: "Beta testing", completed: false },
      { title: "Launch to public", completed: false },
    ],
  },
  {
    id: "2",
    title: "Run a Half Marathon",
    description: "Complete a 21km race in under 2 hours",
    category: "Health",
    progress: 40,
    deadline: "December 2026",
    type: "annual",
    intentScore: 85,
    futureSelfAlignment: "Become physically fit and disciplined",
    milestones: [
      { title: "Run 5km", completed: true },
      { title: "Run 10km", completed: true },
      { title: "Run 15km", completed: false },
      { title: "Run 21km", completed: false },
    ],
  },
  {
    id: "3",
    title: "Read 24 Books",
    description: "Read 2 books per month on leadership and growth",
    category: "Learning",
    progress: 50,
    deadline: "December 2026",
    type: "annual",
    intentScore: 80,
    futureSelfAlignment: "Become a lifelong learner",
    milestones: [
      { title: "January", completed: true },
      { title: "February", completed: true },
      { title: "March", completed: true },
      { title: "April", completed: true },
      { title: "May", completed: true },
      { title: "June", completed: false },
    ],
  },
  {
    id: "4",
    title: "Save $10,000",
    description: "Build emergency fund and investment capital",
    category: "Finance",
    progress: 35,
    deadline: "December 2026",
    type: "annual",
    intentScore: 75,
    futureSelfAlignment: "Achieve financial freedom",
    milestones: [
      { title: "Save $2,500", completed: true },
      { title: "Save $5,000", completed: false },
      { title: "Save $7,500", completed: false },
      { title: "Save $10,000", completed: false },
    ],
  },
  {
    id: "5",
    title: "Weekly Date Night",
    description: "Spend quality time with partner every week",
    category: "Relationships",
    progress: 70,
    deadline: "Ongoing",
    type: "weekly",
    intentScore: 95,
    futureSelfAlignment: "Nurture meaningful relationships",
    milestones: [
      { title: "Week 1", completed: true },
      { title: "Week 2", completed: true },
      { title: "Week 3", completed: true },
      { title: "Week 4", completed: false },
    ],
  },
]

export function GoalsPage() {
  const [goals] = useState(sampleGoals)

  const annualGoals = goals.filter(g => g.type === "annual")
  const quarterlyGoals = goals.filter(g => g.type === "quarterly")
  const monthlyGoals = goals.filter(g => g.type === "monthly")
  const weeklyGoals = goals.filter(g => g.type === "weekly")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Your life vision in action</p>
        </div>
        <Button className="glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Life Vision Banner */}
      <GlassCard variant="primary" className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600">
            <Target className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Life Vision</h2>
            <p className="text-muted-foreground">
              Become a successful entrepreneur who helps millions live with intentionality
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </GlassCard>

      {/* Planning Hierarchy */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "10-Year Vision", count: 3, icon: <Sparkles className="h-5 w-5" /> },
          { label: "Annual Goals", count: annualGoals.length, icon: <Calendar className="h-5 w-5" /> },
          { label: "Quarterly Goals", count: quarterlyGoals.length, icon: <TrendingUp className="h-5 w-5" /> },
          { label: "Monthly Goals", count: monthlyGoals.length, icon: <Target className="h-5 w-5" /> },
        ].map((item, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold">{item.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goals Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Goals</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annual" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {annualGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quarterly" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {quarterlyGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {monthlyGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {weeklyGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function GoalCard({ goal }: { goal: Goal }) {
  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Badge variant="outline">{goal.category}</Badge>
            <CardTitle className="text-lg">{goal.title}</CardTitle>
          </div>
          <ProgressRing value={goal.progress} size={60} strokeWidth={4} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {goal.deadline}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Intent: {goal.intentScore}
            </span>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Milestones</p>
            <div className="space-y-1">
              {goal.milestones.slice(0, 3).map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`h-3 w-3 ${milestone.completed ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                    {milestone.title}
                  </span>
                </div>
              ))}
              {goal.milestones.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{goal.milestones.length - 3} more milestones
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <ArrowUpRight className="h-4 w-4 text-primary" />
          <p className="text-xs text-primary">{goal.futureSelfAlignment}</p>
        </div>
      </CardContent>
    </Card>
  )
}
