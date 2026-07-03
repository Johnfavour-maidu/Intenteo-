"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus,
  BookOpen,
  PenLine,
  Heart,
  Lightbulb,
  Camera,
  Mic,
  Brain,
  Clock,
  Calendar,
  Sparkles,
  MoreHorizontal,
  Search,
} from "lucide-react"

interface JournalEntry {
  id: string
  title: string
  content: string
  type: "morning" | "daily" | "reflection" | "gratitude" | "decision" | "dream" | "legacy"
  date: string
  time: string
  mood?: number
  tags: string[]
}

const journalTypes = [
  { id: "morning", label: "Morning", icon: <PenLine className="h-4 w-4" />, color: "from-amber-400 to-orange-500" },
  { id: "daily", label: "Daily", icon: <BookOpen className="h-4 w-4" />, color: "from-blue-400 to-cyan-500" },
  { id: "reflection", label: "Reflection", icon: <Lightbulb className="h-4 w-4" />, color: "from-purple-400 to-pink-500" },
  { id: "gratitude", label: "Gratitude", icon: <Heart className="h-4 w-4" />, color: "from-rose-400 to-red-500" },
  { id: "decision", label: "Decision", icon: <Brain className="h-4 w-4" />, color: "from-indigo-400 to-blue-500" },
  { id: "dream", label: "Dream", icon: <Sparkles className="h-4 w-4" />, color: "from-violet-400 to-purple-500" },
  { id: "legacy", label: "Legacy", icon: <BookOpen className="h-4 w-4" />, color: "from-emerald-400 to-green-500" },
]

const sampleEntries: JournalEntry[] = [
  {
    id: "1",
    title: "Morning Intention Setting",
    content: "Today I want to focus on being present in every conversation. I will put my phone away during meetings and truly listen to my colleagues. This aligns with my goal of building deeper relationships.",
    type: "morning",
    date: "Today",
    time: "7:30 AM",
    mood: 5,
    tags: ["Intention", "Relationships"],
  },
  {
    id: "2",
    title: "Gratitude for Small Moments",
    content: "I'm grateful for the beautiful sunrise this morning. It reminded me that every day is a new opportunity to grow. I'm also thankful for my health and the ability to pursue my dreams.",
    type: "gratitude",
    date: "Today",
    time: "8:15 AM",
    mood: 4,
    tags: ["Gratitude", "Mindfulness"],
  },
  {
    id: "3",
    title: "Reflection on Q2 Goals",
    content: "Looking back at Q2, I accomplished 70% of my goals. The main challenge was time management. I need to be more intentional about prioritizing deep work over shallow tasks.",
    type: "reflection",
    date: "Yesterday",
    time: "9:00 PM",
    mood: 4,
    tags: ["Reflection", "Goals"],
  },
  {
    id: "4",
    title: "Decision: Career Move",
    content: "Should I take the new role? Pros: More responsibility, better alignment with long-term vision. Cons: Less work-life balance initially. My gut says yes - this moves me closer to who I want to become.",
    type: "decision",
    date: "Yesterday",
    time: "2:30 PM",
    mood: 3,
    tags: ["Decision", "Career"],
  },
  {
    id: "5",
    title: "Dream About the Future",
    content: "I dreamed I was standing on a stage, speaking to thousands of people about intentional living. The audience was engaged and inspired. It felt like a glimpse of my future self.",
    type: "dream",
    date: "2 days ago",
    time: "6:00 AM",
    mood: 5,
    tags: ["Dream", "Vision"],
  },
]

export function JournalPage() {
  const [entries, setEntries] = useState(sampleEntries)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState({ title: "", content: "" })

  const filteredEntries = selectedType
    ? entries.filter(e => e.type === selectedType)
    : entries

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">Capture your thoughts, reflections, and memories</p>
        </div>
        <Button className="glow">
          <Plus className="mr-2 h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Journal Types */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {journalTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
              selectedType === type.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {type.icon}
            <span className="text-sm font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Quick Entry */}
      <GlassCard className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Entry</h2>
          </div>
          <Input
            placeholder="Give your thought a title..."
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
          />
          <Textarea
            placeholder="What's on your mind? Write freely..."
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            className="min-h-[120px]"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Camera className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
            <Button>Save Entry</Button>
          </div>
        </div>
      </GlassCard>

      {/* Entries Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="group hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge variant="outline" className="capitalize">{entry.type}</Badge>
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{entry.content}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{entry.date}, {entry.time}</span>
                </div>
                {entry.mood && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${
                          i <= entry.mood! ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
