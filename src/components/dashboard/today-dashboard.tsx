"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { IntentScoreBadge } from "@/components/ui/intent-score-badge"
import { StreakDisplay } from "@/components/ui/streak-display"
import { MoodSelector } from "@/components/ui/mood-selector"
import { GlassCard } from "@/components/ui/glass-card"
import { formatDateDDMMYYYY } from "@/lib/date-utils"
import { DailyReviewModal } from "@/components/tasks/tasks-page"
import {
  Sun,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Plus,
  PenLine,
  Calendar,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  Mic,
  Timer,
  MapPin,
  Bell,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Types
interface PriorityTask {
  id: string
  title: string
  time: string
  category: string
  priority: "high" | "medium" | "low"
  completed: boolean
  intentScore: number
  duration?: string
  location?: string
}

interface Habit {
  id: string
  name: string
  icon: string
  completed: boolean
  streak: number
  xp: number
}

// Sample Data
const sampleTasks: PriorityTask[] = [
  { id: "1", title: "Review Q2 strategy document", time: "9:00 AM", category: "Deep Work", priority: "high", completed: false, intentScore: 85, duration: "2h", location: "Office" },
  { id: "2", title: "Team standup", time: "11:00 AM", category: "Meeting", priority: "medium", completed: false, intentScore: 70, duration: "30m", location: "Zoom" },
  { id: "3", title: "Write project proposal", time: "2:00 PM", category: "Deep Work", priority: "high", completed: false, intentScore: 90, duration: "1.5h" },
  { id: "4", title: "Evening reflection", time: "8:00 PM", category: "Personal", priority: "low", completed: false, intentScore: 95, duration: "15m" },
]

const sampleHabits: Habit[] = [
  { id: "1", name: "Morning Journal", icon: "\u{1F4DD}", completed: true, streak: 12, xp: 10 },
  { id: "2", name: "Meditate", icon: "\u{1F9D8}", completed: true, streak: 8, xp: 10 },
  { id: "3", name: "Exercise", icon: "\u{1F4AA}", completed: false, streak: 5, xp: 15 },
  { id: "4", name: "Read 30 mins", icon: "\u{1F4DA}", completed: false, streak: 15, xp: 10 },
  { id: "5", name: "Drink 8 glasses", icon: "\u{1F4A7}", completed: false, streak: 3, xp: 5 },
]

export function TodayDashboard() {
  const router = useRouter()
  // State
  const [intention, setIntention] = useState("Be fully present in every conversation and create meaningful connections.")
  const [editingIntention, setEditingIntention] = useState(false)
  const [tasks, setTasks] = useState(sampleTasks)
  const [habits, setHabits] = useState(sampleHabits)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const addToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  // Computed values
  const completedTasks = tasks.filter((t) => t.completed).length
  const completedHabits = habits.filter((h) => h.completed).length
  const totalXP = habits.filter((h) => h.completed).reduce((a, b) => a + b.xp, 0)
  const intentScore = Math.round((completedTasks * 25 + completedHabits * 15) / (tasks.length * 25 + habits.length * 15) * 100)

  // Only active priority tasks for Focus Today
  const focusTasks = tasks.filter((t) => !completedTasks || !t.completed).filter((t) => t.priority === "high" && !t.completed)

  // Handlers
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  const toggleHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    )
  }, [])

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const currentDate = formatDateDDMMYYYY(new Date().toISOString().split("T")[0])

  const quickActions = [
    { icon: <Plus className="h-4 w-4" />, label: "Add New Task", action: () => router.push("/tasks") },
    { icon: <PenLine className="h-4 w-4" />, label: "Write a Quick Thought", action: () => router.push("/journal") },
    { icon: <Calendar className="h-4 w-4" />, label: "Add Reminder", action: () => router.push("/tasks") },
    { icon: <Target className="h-4 w-4" />, label: "Add New Habit", action: () => router.push("/habits") },
    { icon: <Sparkles className="h-4 w-4" />, label: "Ask T\u00e9o", action: () => router.push("/coach") },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold">
                {getGreeting()}, <span className="text-gradient">John</span>
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{currentDate}</span>
                <span className="flex items-center gap-1">
                  <Sun className="h-4 w-4 text-amber-500" />
                  72\u00b0F
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IntentScoreBadge score={intentScore} size="md" />
            <StreakDisplay count={32} />
            <div className="relative">
              <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setQuickActionsOpen(!quickActionsOpen)}>
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Quick Actions</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <AnimatePresence>
                {quickActionsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickActionsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-gray-900 rounded-xl border shadow-xl overflow-hidden"
                    >
                      {quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => { action.action(); setQuickActionsOpen(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left"
                        >
                          <span className="text-muted-foreground">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => setReviewOpen(true)}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Review Today</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-6 max-w-3xl mx-auto space-y-6">
        
        {/* Section 1: Today's Intention - Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard variant="primary" className="p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Today&apos;s Intention</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingIntention(!editingIntention)}
                >
                  <PenLine className="h-4 w-4" />
                </Button>
              </div>
              
              {editingIntention ? (
                <div className="space-y-3">
                  <Textarea
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    className="text-lg min-h-[80px] bg-transparent border-primary/20 focus:border-primary"
                    placeholder="What matters most today?"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditingIntention(false)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingIntention(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed">
                    &quot;{intention}&quot;
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <Badge variant="outline" className="bg-primary/5">
                      <Target className="mr-1 h-3 w-3" />
                      Build deeper relationships
                    </Badge>
                    <span className="text-sm text-muted-foreground">Future Self</span>
                  </div>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Section 2: Focus Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Focus Today
                </h2>
                <Badge variant="secondary">{focusTasks.length} priority</Badge>
              </div>
              
              {focusTasks.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No priority tasks for today. Well done!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {focusTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className={`group rounded-xl transition-all duration-200 ${
                        task.completed ? "opacity-60" : ""
                      } ${expandedTask === task.id ? "bg-muted/50" : "hover:bg-muted/30"}`}
                    >
                      <div className="flex items-center gap-3 p-3">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0">
                          {task.completed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </motion.div>
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                            {task.priority === "high" && (
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.time}
                            </span>
                            {task.duration && (
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {task.duration}
                              </span>
                            )}
                            {task.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {task.location}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          >
                            {expandedTask === task.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedTask === task.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 pt-0 border-t">
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" onClick={() => toggleTask(task.id)}>
                                  {task.completed ? "Undo" : "Complete"}
                                </Button>
                                <Button size="sm" variant="outline">
                                  <PenLine className="mr-1 h-3 w-3" />
                                  Edit
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  Reschedule
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Section 3: Today's Habits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Today&apos;s Habits
                </h2>
                <Badge variant="secondary">{completedHabits}/{habits.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    layout
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                      habit.completed ? "bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <button onClick={() => toggleHabit(habit.id)} className="shrink-0">
                      {habit.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </motion.div>
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <span className="text-lg">{habit.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{habit.streak} day streak</span>
                        <span>+{habit.xp} XP</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Floating Téo Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => router.push("/coach")}
          className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center"
        >
          <Sparkles className="h-6 w-6 text-white" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Talk with T\u00e9o
          </span>
        </button>
      </motion.div>

      {/* Review Today toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-foreground text-background text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Daily Completion Review Modal */}
      {reviewOpen && (
        <DailyReviewModal
          date={new Date().toISOString().split("T")[0]}
          tasksCompleted={completedTasks}
          totalTasks={tasks.length}
          productivity={intentScore}
          completedHabits={completedHabits}
          totalHabits={habits.length}
          habitNames={habits.map(h => ({ name: h.name, completed: h.completed, score: h.completed ? 100 : 0 }))}
          taskList={tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, subtasks: [] }))}
          existingReview={null}
          router={router}
          onClose={() => setReviewOpen(false)}
          onSave={(data) => {
            try {
              const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
              reviews.push({ date: new Date().toISOString().split("T")[0], ...data, productivity: intentScore, tasksCompleted: completedTasks, completedHabits, totalHabits: habits.length, createdAt: new Date().toISOString() })
              localStorage.setItem("intenteo-reviews", JSON.stringify(reviews))
            } catch {}
            addToast("Daily review saved")
            setReviewOpen(false)
          }}
        />
      )}
    </div>
  )
}
