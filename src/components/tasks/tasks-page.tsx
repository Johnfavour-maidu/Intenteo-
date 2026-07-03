"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  Target,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

interface Task {
  id: string
  title: string
  purpose: string
  deadline: string
  priority: "high" | "medium" | "low"
  completed: boolean
  intentScore: number
  futureSelfAlignment: string
  tags: string[]
}

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Review Q2 strategy document",
    purpose: "Ensure alignment with long-term vision",
    deadline: "Today, 5:00 PM",
    priority: "high",
    completed: false,
    intentScore: 85,
    futureSelfAlignment: "Become a strategic leader",
    tags: ["Strategy", "Leadership"],
  },
  {
    id: "2",
    title: "Call with design team",
    purpose: "Collaborate on product improvements",
    deadline: "Today, 11:00 AM",
    priority: "medium",
    completed: false,
    intentScore: 70,
    futureSelfAlignment: "Build better products",
    tags: ["Design", "Collaboration"],
  },
  {
    id: "3",
    title: "Morning journal entry",
    purpose: "Reflect on goals and intentions",
    deadline: "Today, 8:00 AM",
    priority: "low",
    completed: true,
    intentScore: 95,
    futureSelfAlignment: "Stay mindful and intentional",
    tags: ["Journal", "Reflection"],
  },
  {
    id: "4",
    title: "Prepare presentation slides",
    purpose: "Share insights with the team",
    deadline: "Tomorrow, 10:00 AM",
    priority: "high",
    completed: false,
    intentScore: 80,
    futureSelfAlignment: "Become a better communicator",
    tags: ["Presentation", "Communication"],
  },
  {
    id: "5",
    title: "Read 30 minutes",
    purpose: "Continuous learning and growth",
    deadline: "Today, 9:00 PM",
    priority: "medium",
    completed: false,
    intentScore: 75,
    futureSelfAlignment: "Become a lifelong learner",
    tags: ["Learning", "Growth"],
  },
]

export function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [tasks, setTasks] = useState(sampleTasks)

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            {completedCount} of {totalCount} completed • Intentions before tasks
          </p>
        </div>
        <Button className="glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="group hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleTask(task.id)} className="mt-1 shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h3>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "warning" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{task.purpose}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.deadline}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3" />
                          Intent: {task.intentScore}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3 w-3" />
                          {task.futureSelfAlignment}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today" className="mt-6">
          <div className="space-y-3">
            {filteredTasks.filter(t => t.deadline.includes("Today")).map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleTask(task.id)} className="mt-1">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.purpose}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-3">
            {filteredTasks.filter(t => !t.deadline.includes("Today")).map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleTask(task.id)} className="mt-1">
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.purpose}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="space-y-3">
            {filteredTasks.filter(t => t.completed).map((task) => (
              <Card key={task.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button onClick={() => toggleTask(task.id)} className="mt-1">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-medium line-through text-muted-foreground">
                        {task.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.purpose}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
