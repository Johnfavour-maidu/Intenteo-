"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  Search,
  Trophy,
  Target,
  Users,
  Clock,
  Star,
  Flame,
  Zap,
  BookOpen,
  Heart,
  Brain,
  Droplets,
  Dumbbell,
  Coffee,
  Calendar,
  Award,
  TrendingUp,
  Crown,
  Medal,
} from "lucide-react"

interface Challenge {
  id: string
  title: string
  description: string
  category: string
  duration: number
  daysCompleted: number
  progress: number
  xpReward: number
  intentScoreReward: number
  participants: number
  status: "active" | "completed" | "suggested" | "community"
  icon: React.ReactNode
  color: string
  gradient: string
  startDate?: string
  endDate?: string
  streak?: number
}

const sampleChallenges: Challenge[] = [
  {
    id: "1",
    title: "21-Day Reading Challenge",
    description: "Read for at least 30 minutes every day for 21 consecutive days.",
    category: "Learning",
    duration: 21,
    daysCompleted: 14,
    progress: 67,
    xpReward: 500,
    intentScoreReward: 15,
    participants: 234,
    status: "active",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-blue-500",
    gradient: "from-blue-400 to-cyan-500",
    startDate: "2026-06-15",
    endDate: "2026-07-06",
    streak: 14,
  },
  {
    id: "2",
    title: "Morning Routine Master",
    description: "Complete your full morning routine every day for 30 days.",
    category: "Habits",
    duration: 30,
    daysCompleted: 30,
    progress: 100,
    xpReward: 750,
    intentScoreReward: 20,
    participants: 156,
    status: "completed",
    icon: <Zap className="h-5 w-5" />,
    color: "text-amber-500",
    gradient: "from-amber-400 to-orange-500",
    startDate: "2026-05-01",
    endDate: "2026-05-30",
  },
  {
    id: "3",
    title: "Hydration Hero",
    description: "Drink 8 glasses of water every day for 14 days.",
    category: "Health",
    duration: 14,
    daysCompleted: 5,
    progress: 36,
    xpReward: 300,
    intentScoreReward: 10,
    participants: 412,
    status: "active",
    icon: <Droplets className="h-5 w-5" />,
    color: "text-cyan-500",
    gradient: "from-cyan-400 to-blue-500",
    startDate: "2026-06-25",
    endDate: "2026-07-09",
    streak: 5,
  },
  {
    id: "4",
    title: "Deep Work Sprint",
    description: "Complete 4 hours of deep work every weekday for 2 weeks.",
    category: "Productivity",
    duration: 10,
    daysCompleted: 7,
    progress: 70,
    xpReward: 400,
    intentScoreReward: 12,
    participants: 89,
    status: "active",
    icon: <Brain className="h-5 w-5" />,
    color: "text-purple-500",
    gradient: "from-purple-400 to-indigo-500",
    startDate: "2026-06-20",
    endDate: "2026-07-04",
    streak: 7,
  },
  {
    id: "5",
    title: "Meditation Journey",
    description: "Meditate for 10 minutes every day for 21 days.",
    category: "Mental Health",
    duration: 21,
    daysCompleted: 21,
    progress: 100,
    xpReward: 500,
    intentScoreReward: 18,
    participants: 312,
    status: "completed",
    icon: <Heart className="h-5 w-5" />,
    color: "text-rose-500",
    gradient: "from-rose-400 to-pink-500",
    startDate: "2026-04-01",
    endDate: "2026-04-21",
  },
  {
    id: "6",
    title: "Exercise Every Day",
    description: "Do at least 30 minutes of exercise every day for 30 days.",
    category: "Fitness",
    duration: 30,
    daysCompleted: 0,
    progress: 0,
    xpReward: 600,
    intentScoreReward: 15,
    participants: 567,
    status: "suggested",
    icon: <Dumbbell className="h-5 w-5" />,
    color: "text-emerald-500",
    gradient: "from-emerald-400 to-green-500",
  },
  {
    id: "7",
    title: "No Sugar Challenge",
    description: "Avoid added sugar for 21 days to reset your taste buds.",
    category: "Health",
    duration: 21,
    daysCompleted: 0,
    progress: 0,
    xpReward: 450,
    intentScoreReward: 12,
    participants: 234,
    status: "suggested",
    icon: <Coffee className="h-5 w-5" />,
    color: "text-orange-500",
    gradient: "from-orange-400 to-amber-500",
  },
  {
    id: "8",
    title: "Financial Discipline",
    description: "Track every expense and stay within budget for 30 days.",
    category: "Finance",
    duration: 30,
    daysCompleted: 0,
    progress: 0,
    xpReward: 550,
    intentScoreReward: 14,
    participants: 178,
    status: "community",
    icon: <Target className="h-5 w-5" />,
    color: "text-indigo-500",
    gradient: "from-indigo-400 to-purple-500",
  },
  {
    id: "9",
    title: "Prayer Challenge",
    description: "Spend 15 minutes in prayer or meditation every day for 21 days.",
    category: "Spiritual",
    duration: 21,
    daysCompleted: 0,
    progress: 0,
    xpReward: 400,
    intentScoreReward: 16,
    participants: 145,
    status: "community",
    icon: <Star className="h-5 w-5" />,
    color: "text-yellow-500",
    gradient: "from-yellow-400 to-amber-500",
  },
]

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-primary/10 text-primary",
  suggested: "bg-amber-500/10 text-amber-600",
  community: "bg-purple-500/10 text-purple-600",
}

export function ChallengesPage() {
  const [challenges] = useState(sampleChallenges)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChallenges = challenges.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeChallenges = filteredChallenges.filter((c) => c.status === "active")
  const completedChallenges = filteredChallenges.filter((c) => c.status === "completed")
  const suggestedChallenges = filteredChallenges.filter((c) => c.status === "suggested")
  const communityChallenges = filteredChallenges.filter((c) => c.status === "community")

  const totalXP = challenges.filter((c) => c.status === "completed").reduce((a, b) => a + b.xpReward, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Challenges</h1>
          <p className="text-muted-foreground">Push your limits, grow stronger</p>
        </div>
        <Button className="glow">
          <Plus className="mr-2 h-4 w-4" />
          Create Challenge
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalXP}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {challenges.reduce((a, b) => a + b.participants, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Participants</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Challenge Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            <Flame className="mr-2 h-4 w-4" />
            Active ({activeChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <Trophy className="mr-2 h-4 w-4" />
            Completed ({completedChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="suggested">
            <Star className="mr-2 h-4 w-4" />
            Suggested ({suggestedChallenges.length})
          </TabsTrigger>
          <TabsTrigger value="community">
            <Users className="mr-2 h-4 w-4" />
            Community ({communityChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {activeChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {completedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suggested" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {suggestedChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {communityChallenges.map((challenge) => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${challenge.gradient} text-white shrink-0`}>
            {challenge.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{challenge.title}</h3>
              <Badge className={statusColors[challenge.status]}>
                {challenge.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {challenge.description}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{challenge.duration} days</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{challenge.participants}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>{challenge.xpReward} XP</span>
              </div>
            </div>
            {challenge.status === "active" && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{challenge.daysCompleted}/{challenge.duration} days</span>
                  <span>{challenge.progress}%</span>
                </div>
                <Progress value={challenge.progress} className="h-2" />
                {challenge.streak && (
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{challenge.streak} day streak</span>
                  </div>
                )}
              </div>
            )}
            {challenge.status === "completed" && (
              <div className="flex items-center gap-2 mt-3">
                <Award className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-amber-600">Challenge Complete!</span>
              </div>
            )}
          </div>
        </div>
        {challenge.status === "suggested" && (
          <div className="mt-4 pt-4 border-t">
            <Button className="w-full" variant="outline">
              <Target className="mr-2 h-4 w-4" />
              Start Challenge
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
