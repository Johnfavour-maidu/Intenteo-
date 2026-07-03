"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Task, TaskView } from "./types"
import { sampleTasks, getTaskStats } from "./task-data"
import { TaskCard } from "./task-card"
import { TaskDetailsDrawer } from "./task-details-drawer"
import { CreateTaskPanel } from "./create-task-panel"
import { FocusMode } from "./focus-mode"
import { AnalyticsPanel } from "./analytics-panel"
import { ListView } from "./views/list-view"
import { KanbanView } from "./views/kanban-view"
import { TimelineView } from "./views/timeline-view"
import { TableView } from "./views/table-view"
import { MatrixView } from "./views/matrix-view"
import { CalendarView } from "./views/calendar-view"
import { CompactView } from "./views/compact-view"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "@/components/ui/progress-ring"
import { IntentScoreBadge } from "@/components/ui/intent-score-badge"
import { GlassCard } from "@/components/ui/glass-card"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  Filter,
  List,
  LayoutGrid,
  Clock,
  Calendar,
  Target,
  Table,
  Minimize2,
  ChevronDown,
  Sparkles,
  Zap,
  Brain,
  Upload,
  CheckCircle2,
  Circle,
  Flame,
  TrendingUp,
  BarChart3,
  X,
  ArrowUpRight,
} from "lucide-react"

const viewOptions: { id: TaskView; label: string; icon: React.ReactNode }[] = [
  { id: "list", label: "List", icon: <List className="h-4 w-4" /> },
  { id: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "timeline", label: "Timeline", icon: <Clock className="h-4 w-4" /> },
  { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
  { id: "matrix", label: "Matrix", icon: <Target className="h-4 w-4" /> },
  { id: "table", label: "Table", icon: <Table className="h-4 w-4" /> },
  { id: "compact", label: "Compact", icon: <Minimize2 className="h-4 w-4" /> },
]

const filterChips = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
  { id: "high-priority", label: "High Priority" },
  { id: "low-energy", label: "Low Energy" },
  { id: "deep-work", label: "Deep Work" },
  { id: "personal", label: "Personal" },
  { id: "work", label: "Work" },
  { id: "health", label: "Health" },
  { id: "learning", label: "Learning" },
]

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState<TaskView>("list")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [focusTask, setFocusTask] = useState<Task | null>(null)
  const [focusOpen, setFocusOpen] = useState(false)
  const [analyticsOpen, setAnalyticsOpen] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const stats = useMemo(() => getTaskStats(tasks), [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.purpose.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.projectName.toLowerCase().includes(q) ||
          t.connectedGoal.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q)
      )
    }

    // Filters
    if (activeFilters.includes("today")) {
      const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
      result = result.filter((t) => t.deadline === today)
    }
    if (activeFilters.includes("upcoming")) {
      result = result.filter((t) => !t.completed && t.status !== "archived")
    }
    if (activeFilters.includes("overdue")) {
      result = result.filter((t) => !t.completed && t.deadline < "Today")
    }
    if (activeFilters.includes("completed")) {
      result = result.filter((t) => t.completed)
    }
    if (activeFilters.includes("high-priority")) {
      result = result.filter((t) => t.priority === "high")
    }
    if (activeFilters.includes("low-energy")) {
      result = result.filter((t) => t.energyRequired === "low")
    }
    if (activeFilters.includes("deep-work")) {
      result = result.filter((t) => t.category === "Deep Work")
    }
    if (activeFilters.includes("personal")) {
      result = result.filter((t) => t.category === "Personal")
    }
    if (activeFilters.includes("work")) {
      result = result.filter((t) => ["Meeting", "Deep Work", "Work"].includes(t.category))
    }
    if (activeFilters.includes("health")) {
      result = result.filter((t) => t.category === "Health")
    }
    if (activeFilters.includes("learning")) {
      result = result.filter((t) => t.category === "Learning")
    }

    return result
  }, [tasks, searchQuery, activeFilters])

  // Handlers
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completionPercent: t.completed ? t.completionPercent : 100 }
          : t
      )
    )
  }, [])

  const openDrawer = useCallback((task: Task) => {
    setSelectedTask(task)
    setDrawerOpen(true)
  }, [])

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setCreateOpen(true)
  }, [])

  const completeTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true, completionPercent: 100, status: "completed" as const } : t))
    )
  }, [])

  const duplicateTask = useCallback((task: Task) => {
    const newTask: Task = {
      ...task,
      id: `dup-${Date.now()}`,
      title: `${task.title} (Copy)`,
      completed: false,
      completionPercent: 0,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  const archiveTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "archived" as const } : t))
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const rescheduleTask = useCallback((task: Task) => {
    // In a real app, this would open a date picker
    alert(`Reschedule: ${task.title}`)
  }, [])

  const openFocus = useCallback((task: Task) => {
    setFocusTask(task)
    setFocusOpen(true)
  }, [])

  const handleCreateTask = useCallback((partial: Partial<Task>) => {
    const newTask: Task = {
      id: `new-${Date.now()}`,
      title: partial.title || "Untitled",
      purpose: partial.purpose || "",
      whyItMatters: partial.whyItMatters || "",
      futureSelfAlignment: partial.futureSelfAlignment || "",
      futureSelfBadge: partial.futureSelfBadge || "",
      connectedGoal: partial.connectedGoal || "",
      projectName: partial.projectName || "",
      category: "Personal",
      priority: partial.priority || "medium",
      intentScore: partial.intentScore || 50,
      deadline: partial.deadline || "Today",
      dueTime: partial.dueTime || "Anytime",
      estimatedDuration: partial.estimatedDuration || 30,
      energyRequired: partial.energyRequired || "medium",
      tags: partial.tags || [],
      subtasks: partial.subtasks || [],
      attachments: partial.attachments || [],
      comments: partial.comments || [],
      activity: partial.activity || [{ id: "ac-new", action: "Created task", timestamp: new Date().toISOString() }],
      dependencies: partial.dependencies || [],
      status: partial.status || "pending",
      completed: partial.completed || false,
      completionPercent: partial.completionPercent || 0,
      isRecurring: partial.isRecurring || false,
      recurrence: partial.recurrence || "none",
      location: partial.location,
      notes: partial.notes || "",
      voiceNotes: partial.voiceNotes || [],
      calendarSync: partial.calendarSync || false,
      reminder: partial.reminder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      xp: partial.xp || 10,
      aiSuggestion: partial.aiSuggestion,
    }
    setTasks((prev) => [newTask, ...prev])
  }, [])

  const toggleFilter = useCallback((id: string) => {
    setActiveFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }, [])

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-6 p-4 md:p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tasks
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Intentions before tasks. Live with intentionality.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-1 h-4 w-4" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Brain className="mr-1 h-4 w-4" />
                AI Plan
              </Button>
              <Button className="glow" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Quick Add
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold">{stats.remaining}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-emerald-500">{stats.completed}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Intent Score</p>
                    <p className="text-2xl font-bold text-primary">{stats.avgIntentScore}%</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                    <p className="text-2xl font-bold text-amber-500">{stats.totalXP}</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard variant="primary" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Today&apos;s Focus</span>
                    <p className="text-sm text-muted-foreground">{stats.highEnergyTasks} deep work tasks remaining</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <span className="text-xs text-muted-foreground">Deep Work</span>
                    <p className="text-sm font-medium">{stats.deepWorkMinutes}m planned</p>
                  </div>
                  <IntentScoreBadge score={stats.avgIntentScore} size="lg" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by task, project, goal, tag, category, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </motion.div>

          {/* Filter Chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          >
            {filterChips.map((chip) => (
              <Button
                key={chip.id}
                variant={activeFilters.includes(chip.id) ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap rounded-full text-xs"
                onClick={() => toggleFilter(chip.id)}
              >
                {chip.label}
                {activeFilters.includes(chip.id) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Button>
            ))}
          </motion.div>

          {/* View Switcher + Bulk Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              {viewOptions.map((view) => (
                <Button
                  key={view.id}
                  variant={activeView === view.id ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setActiveView(view.id)}
                >
                  {view.icon}
                  <span className="ml-1.5 hidden md:inline">{view.label}</span>
                </Button>
              ))}
            </div>
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedIds.length} selected</Badge>
                <Button variant="outline" size="sm">Move</Button>
                <Button variant="outline" size="sm">Archive</Button>
                <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
              </div>
            )}
          </motion.div>

          {/* Task Views */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            {activeView === "list" && (
              <ListView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
                onEdit={openEdit}
                onComplete={completeTask}
                onDuplicate={duplicateTask}
                onArchive={archiveTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
                onFocus={openFocus}
              />
            )}
            {activeView === "kanban" && (
              <KanbanView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
                onEdit={openEdit}
                onComplete={completeTask}
                onDuplicate={duplicateTask}
                onArchive={archiveTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
                onFocus={openFocus}
              />
            )}
            {activeView === "timeline" && (
              <TimelineView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
                onEdit={openEdit}
                onComplete={completeTask}
                onDuplicate={duplicateTask}
                onArchive={archiveTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
                onFocus={openFocus}
              />
            )}
            {activeView === "calendar" && (
              <CalendarView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
                onEdit={openEdit}
                onComplete={completeTask}
                onDuplicate={duplicateTask}
                onArchive={archiveTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
                onFocus={openFocus}
              />
            )}
            {activeView === "matrix" && (
              <MatrixView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
                onEdit={openEdit}
                onComplete={completeTask}
                onDuplicate={duplicateTask}
                onArchive={archiveTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
                onFocus={openFocus}
              />
            )}
            {activeView === "table" && (
              <TableView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
              />
            )}
            {activeView === "compact" && (
              <CompactView
                tasks={filteredTasks}
                onToggle={toggleTask}
                onExpand={openDrawer}
                onEdit={openEdit}
                onComplete={completeTask}
                onDuplicate={duplicateTask}
                onArchive={archiveTask}
                onDelete={deleteTask}
                onReschedule={rescheduleTask}
                onFocus={openFocus}
              />
            )}
          </motion.div>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? "Try a different search term" : "You're all caught up. Enjoy the rest of your day."}
              </p>
              {!searchQuery && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Create Task
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Analytics Panel (Right Side) */}
      <div className="hidden lg:block border-l">
        <AnalyticsPanel tasks={tasks} open={analyticsOpen} onToggle={() => setAnalyticsOpen(!analyticsOpen)} />
      </div>

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        task={selectedTask}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onToggle={toggleTask}
        onEdit={openEdit}
        onComplete={completeTask}
        onDuplicate={duplicateTask}
        onArchive={archiveTask}
        onDelete={deleteTask}
        onReschedule={rescheduleTask}
        onFocus={openFocus}
      />

      {/* Create Task Panel */}
      <CreateTaskPanel
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditingTask(null) }}
        onSave={handleCreateTask}
      />

      {/* Focus Mode */}
      <FocusMode
        task={focusTask}
        open={focusOpen}
        onClose={() => setFocusOpen(false)}
        onComplete={(id) => { completeTask(id); setFocusOpen(false) }}
      />
    </div>
  )
}
