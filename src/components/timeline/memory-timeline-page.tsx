"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  Search,
  Filter,
  Camera,
  BookOpen,
  Target,
  Trophy,
  MapPin,
  Star,
  Calendar,
  Heart,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface Memory {
  id: string
  title: string
  description: string
  date: string
  category: "journal" | "achievement" | "photo" | "trip" | "project" | "milestone" | "goal" | "decision" | "reflection"
  icon: React.ReactNode
  color: string
  gradient: string
  tags: string[]
  mood?: number
  photo?: string
}

const sampleMemories: Memory[] = [
  {
    id: "1",
    title: "Intenteo MVP Launched",
    description: "Successfully launched the first version of Intenteo to beta users. 500 signups in the first week!",
    date: "2026-06-15",
    category: "milestone",
    icon: <Trophy className="h-5 w-5" />,
    color: "text-amber-500",
    gradient: "from-amber-400 to-orange-500",
    tags: ["Business", "Launch", "Milestone"],
    mood: 5,
  },
  {
    id: "2",
    title: "First Marathon Completed",
    description: "Finished my first marathon in 4 hours 15 minutes. A dream come true after 6 months of training.",
    date: "2026-05-20",
    category: "achievement",
    icon: <Zap className="h-5 w-5" />,
    color: "text-emerald-500",
    gradient: "from-emerald-400 to-green-500",
    tags: ["Health", "Achievement", "Running"],
    mood: 5,
  },
  {
    id: "3",
    title: "Morning Journal Streak: 30 Days",
    description: "Reached 30 consecutive days of morning journaling. This habit has transformed my clarity.",
    date: "2026-04-10",
    category: "achievement",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-indigo-500",
    gradient: "from-indigo-400 to-purple-500",
    tags: ["Habit", "Journal", "Streak"],
    mood: 4,
  },
  {
    id: "4",
    title: "Trip to Kyoto",
    description: "Explored ancient temples, beautiful gardens, and experienced Japanese culture at its finest.",
    date: "2026-03-05",
    category: "trip",
    icon: <MapPin className="h-5 w-5" />,
    color: "text-rose-500",
    gradient: "from-rose-400 to-pink-500",
    tags: ["Travel", "Japan", "Culture"],
    mood: 5,
  },
  {
    id: "5",
    title: "Decision: Invest in Index Funds",
    description: "Made the decision to start investing in index funds for long-term wealth building.",
    date: "2026-02-15",
    category: "decision",
    icon: <Brain className="h-5 w-5" />,
    color: "text-purple-500",
    gradient: "from-purple-400 to-indigo-500",
    tags: ["Finance", "Decision", "Investing"],
    mood: 4,
  },
  {
    id: "6",
    title: "Book: Atomic Habits",
    description: "Finished reading Atomic Habits by James Clear. Key insight: Small habits compound over time.",
    date: "2026-01-20",
    category: "reflection",
    icon: <BookOpen className="h-5 w-5" />,
    color: "text-cyan-500",
    gradient: "from-cyan-400 to-blue-500",
    tags: ["Learning", "Books", "Habits"],
    mood: 4,
  },
  {
    id: "7",
    title: "Saved First $10,000",
    description: "Reached my first savings milestone! Built an emergency fund for peace of mind.",
    date: "2025-12-01",
    category: "goal",
    icon: <Target className="h-5 w-5" />,
    color: "text-emerald-500",
    gradient: "from-emerald-400 to-green-500",
    tags: ["Finance", "Goal", "Savings"],
    mood: 5,
  },
  {
    id: "8",
    title: "New Year Reflection",
    description: "Reflected on 2025 and set intentions for 2026. Focus: Health, Wealth, Relationships.",
    date: "2025-12-31",
    category: "journal",
    icon: <Calendar className="h-5 w-5" />,
    color: "text-violet-500",
    gradient: "from-violet-400 to-purple-500",
    tags: ["Reflection", "New Year", "Intentions"],
    mood: 5,
  },
  {
    id: "9",
    title: "Completed 21-Day Meditation",
    description: "Finished the 21-day meditation challenge. Mind feels clearer and more focused.",
    date: "2025-11-15",
    category: "achievement",
    icon: <Heart className="h-5 w-5" />,
    color: "text-pink-500",
    gradient: "from-pink-400 to-rose-500",
    tags: ["Meditation", "Challenge", "Mental Health"],
    mood: 4,
  },
  {
    id: "10",
    title: "Promoted to Senior Developer",
    description: "After 2 years of hard work, got promoted to Senior Developer. Grateful for the journey.",
    date: "2025-10-01",
    category: "milestone",
    icon: <Star className="h-5 w-5" />,
    color: "text-amber-500",
    gradient: "from-amber-400 to-yellow-500",
    tags: ["Career", "Promotion", "Growth"],
    mood: 5,
  },
]

const categoryColors: Record<string, string> = {
  journal: "bg-violet-500/10 text-violet-600",
  achievement: "bg-amber-500/10 text-amber-600",
  photo: "bg-rose-500/10 text-rose-600",
  trip: "bg-pink-500/10 text-pink-600",
  project: "bg-blue-500/10 text-blue-600",
  milestone: "bg-emerald-500/10 text-emerald-600",
  goal: "bg-indigo-500/10 text-indigo-600",
  decision: "bg-purple-500/10 text-purple-600",
  reflection: "bg-cyan-500/10 text-cyan-600",
}

export function MemoryTimelinePage() {
  const [memories] = useState(sampleMemories)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedMemory, setExpandedMemory] = useState<string | null>(null)

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || m.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedByYear = filteredMemories.reduce((acc, memory) => {
    const year = new Date(memory.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(memory)
    return acc
  }, {} as Record<string, Memory[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memory Timeline</h1>
          <p className="text-muted-foreground">Your life story, beautifully captured</p>
        </div>
        <Button className="glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Memory
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold">{memories.length}</p>
          <p className="text-sm text-muted-foreground">Total Memories</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold">{memories.filter((m) => m.category === "achievement").length}</p>
          <p className="text-sm text-muted-foreground">Achievements</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold">{memories.filter((m) => m.mood === 5).length}</p>
          <p className="text-sm text-muted-foreground">Peak Moments</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-3xl font-bold">{new Set(memories.flatMap((m) => m.tags)).size}</p>
          <p className="text-sm text-muted-foreground">Unique Tags</p>
        </GlassCard>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Object.entries(categoryColors).map(([category, colors]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? `${colors} ring-2 ring-offset-2 ring-current`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-purple-500 to-orange-500 hidden md:block" />

        {Object.entries(groupedByYear)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, yearMemories]) => (
            <div key={year} className="mb-8">
              {/* Year Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg z-10">
                  {year.slice(2)}
                </div>
                <h2 className="text-2xl font-bold">{year}</h2>
              </div>

              {/* Memories */}
              <div className="space-y-4 ml-0 md:ml-16">
                {yearMemories.map((memory, index) => (
                  <div key={memory.id} className="relative">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[73px] top-4 h-4 w-4 rounded-full bg-gradient-to-r ${memory.gradient} border-4 border-background hidden md:block`} />

                    <Card className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${memory.gradient} text-white shrink-0`}>
                            {memory.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{memory.title}</h3>
                              <Badge className={categoryColors[memory.category]}>
                                {memory.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {memory.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-muted-foreground">{memory.date}</span>
                              {memory.mood && (
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                      key={i}
                                      className={`h-2 w-2 rounded-full ${
                                        i <= memory.mood! ? "bg-primary" : "bg-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memory.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedMemory(expandedMemory === memory.id ? null : memory.id)}
                          >
                            {expandedMemory === memory.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {expandedMemory === memory.id && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">{memory.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
