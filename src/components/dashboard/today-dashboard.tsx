"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { DailyReviewModal } from "@/components/tasks/tasks-page"
import { DailyIntentionModal } from "@/components/intentions/daily-intention-modal"
import { IntentionLibrary } from "@/components/intentions/intention-library"
import { loadTodayIntention, saveTodayIntention, addRecentlyUsed } from "@/lib/intention-library"
import {
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
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  BookOpen,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const CAL_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function calDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function calFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

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
  const [intention, setIntention] = useState("")
  const [showIntentionLibrary, setShowIntentionLibrary] = useState(false)
  const [tasks, setTasks] = useState(sampleTasks)
  const [habits, setHabits] = useState(sampleHabits)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [quickActionsOpen, setQuickActionsOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [quickReminderOpen, setQuickReminderOpen] = useState(false)
  const [reminderText, setReminderText] = useState("")
  const [reminderSaved, setReminderSaved] = useState(false)
  const [reminderCalMonth, setReminderCalMonth] = useState(() => new Date().getMonth())
  const [reminderCalYear, setReminderCalYear] = useState(() => new Date().getFullYear())
  const [reminderCalDay, setReminderCalDay] = useState(() => new Date().getDate())

  useEffect(() => {
    const existing = loadTodayIntention()
    if (existing) setIntention(existing.intention.text)
  }, [])

  const addToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleIntentionSelect = useCallback((text: string, isCustom: boolean) => {
    setIntention(text)
    saveTodayIntention(text, isCustom)
    addRecentlyUsed(text, isCustom)
    setShowIntentionLibrary(false)
    addToast("Intention set for today!")
  }, [addToast])

  const reminderDateKey = `${reminderCalYear}-${String(reminderCalMonth + 1).padStart(2, "0")}-${String(reminderCalDay).padStart(2, "0")}`
  const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` })()
  const isReminderPast = reminderDateKey < todayKey

  const saveQuickReminder = useCallback(() => {
    if (!reminderText.trim() || isReminderPast) return
    const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
    reminders.push({
      id: crypto.randomUUID(),
      title: reminderText.trim(),
      date: reminderDateKey,
      category: "reminder",
      color: "bg-amber-500",
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("intenteo-reminders", JSON.stringify(reminders))
    setReminderSaved(true)
    setTimeout(() => {
      setQuickReminderOpen(false)
      setReminderText("")
      const d = new Date()
      setReminderCalMonth(d.getMonth())
      setReminderCalYear(d.getFullYear())
      setReminderCalDay(d.getDate())
      setReminderSaved(false)
      addToast("Reminder saved!")
    }, 600)
  }, [reminderText, reminderDateKey, isReminderPast, addToast])

  // Computed values
  const completedTasks = tasks.filter((t) => t.completed).length
  const completedHabits = habits.filter((h) => h.completed).length
  const intentScore = Math.round((completedTasks * 25 + completedHabits * 15) / (tasks.length * 25 + habits.length * 15) * 100)

  // Only active priority tasks for Today's Focus
  const focusTasks = tasks.filter((t) => t.priority === "high" && !t.completed)

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

  // Formatted date: "Wednesday, 9 July 2026"
  const getFormattedDate = () => {
    const now = new Date()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  }

  const quickActions = [
    { icon: <Plus className="h-4 w-4" />, label: "Add New Task", action: () => router.push("/tasks") },
    { icon: <PenLine className="h-4 w-4" />, label: "Write a Quick Thought", action: () => router.push("/journal?type=quick") },
    { icon: <Bell className="h-4 w-4" />, label: "Quick Reminder", action: () => setQuickReminderOpen(true) },
    { icon: <Calendar className="h-4 w-4" />, label: "Open Calendar", action: () => router.push("/calendar") },
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
              <p className="text-sm text-muted-foreground">{getFormattedDate()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="outline" size="sm" className="h-9 gap-1.5 border-primary/30 text-primary hover:bg-primary/5" onClick={() => setQuickActionsOpen(!quickActionsOpen)}>
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
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-primary/30 text-primary hover:bg-primary/5" onClick={() => setReviewOpen(true)}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Review Today</span>
            </Button>
            <div className="flex items-center gap-2 px-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/25">
                <span className="text-base">{"\u{1F525}"}</span>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground leading-none">Current Streak</div>
                <div className="text-sm font-bold leading-tight">32 Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">
        
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
                  onClick={() => setShowIntentionLibrary(!showIntentionLibrary)}
                >
                  {showIntentionLibrary ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-1" />
                      Browse Library
                    </>
                  )}
                </Button>
              </div>
              
              {showIntentionLibrary ? (
                <IntentionLibrary onSelect={handleIntentionSelect} />
              ) : intention ? (
                <>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed">
                    &ldquo;{intention}&rdquo;
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowIntentionLibrary(true)}
                      className="border-[#1E0E6B]/20"
                    >
                      <PenLine className="h-3.5 w-3.5 mr-1" />
                      Change
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-lg text-muted-foreground">Choose how you want to show up today.</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setShowIntentionLibrary(true)}
                      className="bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white"
                    >
                      <Target className="h-4 w-4 mr-1" />
                      Set Intention
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowIntentionLibrary(true)}
                      className="border-[#1E0E6B]/20"
                    >
                      <PenLine className="h-4 w-4 mr-1" />
                      Write My Own
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Section 2 & 3: Two-column layout - Today's Focus + Today's Habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Today&apos;s Focus
                  </h2>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" onClick={() => router.push("/tasks")}>
                    View More
                  </Button>
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
                              <span className={`font-medium text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
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
                                <span>{task.duration}</span>
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

          {/* Today's Habits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
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
      </div>

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

      {/* Quick Reminder Dialog */}
      <AnimatePresence>
        {quickReminderOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
              onClick={() => { setQuickReminderOpen(false); setReminderText(""); const d = new Date(); setReminderCalMonth(d.getMonth()); setReminderCalYear(d.getFullYear()); setReminderCalDay(d.getDate()); setReminderSaved(false) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[81] w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-[#EB9E5B]/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-[#EB9E5B]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Quick Reminder</h3>
                  <p className="text-xs text-muted-foreground">Save a reminder in seconds</p>
                </div>
              </div>
              {reminderSaved ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Reminder saved!</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {/* Selected date display */}
                  <p className="text-xs font-medium text-muted-foreground">
                    {new Date(reminderCalYear, reminderCalMonth, reminderCalDay).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>

                  {/* Mini Calendar */}
                  <div className="border border-[#1E0E6B]/10 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => { if (reminderCalMonth === 0) { setReminderCalMonth(11); setReminderCalYear(y => y - 1) } else setReminderCalMonth(m => m - 1) }} className="p-1 rounded hover:bg-muted transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] font-medium">
                        {new Date(reminderCalYear, reminderCalMonth).toLocaleString("default", { month: "short" })} {reminderCalYear}
                      </span>
                      <button onClick={() => { if (reminderCalMonth === 11) { setReminderCalMonth(0); setReminderCalYear(y => y + 1) } else setReminderCalMonth(m => m + 1) }} className="p-1 rounded hover:bg-muted transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {CAL_WEEKDAYS.map((d) => (
                        <div key={d} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">
                          {d}
                        </div>
                      ))}
                      {Array.from({ length: calFirstDayOfMonth(reminderCalYear, reminderCalMonth) }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: calDaysInMonth(reminderCalYear, reminderCalMonth) }).map((_, i) => {
                        const day = i + 1
                        const isToday = day === new Date().getDate() && reminderCalMonth === new Date().getMonth() && reminderCalYear === new Date().getFullYear()
                        const isSelected = day === reminderCalDay
                        return (
                          <button
                            key={day}
                            onClick={() => setReminderCalDay(day)}
                            className={cn(
                              "h-6 w-full text-[10px] rounded-full flex items-center justify-center transition-colors font-medium",
                              isToday && "bg-[#1E0E6B] text-white font-bold",
                              isSelected && !isToday && "bg-[#1E0E6B] text-white",
                              !isSelected && !isToday && "hover:bg-muted text-foreground"
                            )}
                          >
                            {day}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <Input
                    placeholder={isReminderPast ? "Reminders cannot be added to past dates." : "What do you need to remember?"}
                    value={reminderText}
                    onChange={(e) => setReminderText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveQuickReminder() }}
                    autoFocus={!isReminderPast}
                    disabled={isReminderPast}
                    className={cn("border-2 border-[#1E0E6B]/20 focus-visible:border-[#1E0E6B]/40", isReminderPast && "opacity-50 cursor-not-allowed")}
                  />
                  {isReminderPast && (
                    <p className="text-[10px] text-muted-foreground/60 text-center">You can only create reminders for today or future dates.</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={saveQuickReminder}
                      disabled={!reminderText.trim() || isReminderPast}
                      className="bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white"
                    >
                      Save
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Reminders appear in your Calendar
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Daily Intention Morning Modal */}
      <DailyIntentionModal onSelect={(text) => setIntention(text)} />
    </div>
  )
}
