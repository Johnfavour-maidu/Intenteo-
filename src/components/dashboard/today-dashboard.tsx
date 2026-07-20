"use client"

import React, { useState, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { DailyReviewModal } from "@/components/tasks/tasks-page"
import { DailyIntentionModal } from "@/components/intentions/daily-intention-modal"
import { IntentionLibrary } from "@/components/intentions/intention-library"
import { loadTodayIntention, saveTodayIntention, addRecentlyUsed } from "@/lib/intention-library"
import type { Intention } from "@/lib/intention-library"
import { INTENTION_LIBRARY, findLinkedGoals, findLinkedVisions, findLinkedPurpose } from "@/lib/intention-library"
import { ReminderModal } from "@/components/reminders/reminder-modal"
import { ProgressRing } from "@/components/ui/progress-ring"
import {
  calculateIntentScore,
  saveDailyIntentScore,
  type IntentScoreBreakdown,
} from "@/lib/intent-score"
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
  ChevronRight,
  Zap,
  Bell,
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  Eye,
  Repeat,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const REFLECTION_PROMPTS = [
  "What would make today meaningful?",
  "How can you better live your values today?",
  "What kind of person do you want to become today?",
  "What are you most grateful for right now?",
  "What small act of kindness can you offer today?",
  "What would you do if you weren\'t afraid?",
  "How can you show up for someone you love today?",
  "What habit, if practiced today, would compound over time?",
  "What deserves your full attention today?",
  "If today were your last day, what would you prioritize?",
  "What energy do you want to bring into every room today?",
  "What is one thing you can let go of today?",
]

function getTodayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const h = new Date().getHours()
  if (h < 12) return "morning"
  if (h < 17) return "afternoon"
  return "evening"
}

export function TodayDashboard() {
  const router = useRouter()

  // ─── State ───
  const [intention, setIntention] = useState("")
  const [intentionData, setIntentionData] = useState<StoredIntention | null>(null)
  const [showIntentionLibrary, setShowIntentionLibrary] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [streakModalOpen, setStreakModalOpen] = useState(false)
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false)
  const [glanceOpen, setGlanceOpen] = useState(true)
  const [intentScoreExpanded, setIntentScoreExpanded] = useState(false)
  const [intentBreakdown, setIntentBreakdown] = useState<IntentScoreBreakdown | null>(null)

  // ─── Data Loading ───
  const [tasks, setTasks] = useState<any[]>([])
  const [habits, setHabits] = useState<any[]>([])
  const [userName, setUserName] = useState("")

  useEffect(() => {
    try {
      const stored = loadTodayIntention()
      if (stored) {
        setIntention(stored.intention.text)
        setIntentionData(stored.intention)
      }
    } catch {}

    try {
      const storedTasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
      if (Array.isArray(storedTasks)) {
        const today = getTodayISO()
        setTasks(storedTasks.filter((t: any) => t.date === today && !t.completed))
      }
    } catch {}

    try {
      const storedHabits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
      if (Array.isArray(storedHabits)) setHabits(storedHabits.filter((h: any) => !h.archived && !h.paused))
    } catch {}

    try {
      const profile = JSON.parse(localStorage.getItem("intenteo-user-profile") || "{}")
      if (profile?.name) setUserName(profile.name)
    } catch {}
  }, [])

  // ─── Computed Values ───
  const today = getTodayISO()
  const completedHabits = habits.filter((h: any) => h.completedToday).length
  const totalHabits = habits.length
  const habitPercent = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0

  const priorityTasks = useMemo(() => {
    return tasks
      .filter((t: any) => t.priority === "priority" && !t.completed)
      .slice(0, 3)
  }, [tasks])

  const totalTasksToday = tasks.length
  const completedTasksToday = tasks.filter((t: any) => t.completed).length
  const remainingTasks = totalTasksToday - completedTasksToday

  // Calculate Intent Score using the 5-component engine
  const intentScore = useMemo(() => {
    const breakdown = calculateIntentScore()
    setIntentBreakdown(breakdown)
    return breakdown.total
  }, [intention, habitPercent, totalTasksToday, completedTasksToday, habits])

  // Save daily score whenever it changes
  useEffect(() => {
    if (intentBreakdown) {
      saveDailyIntentScore(intentBreakdown)
    }
  }, [intentBreakdown])

  const currentStreak = useMemo(() => {
    let maxStreak = 0
    habits.forEach((h: any) => {
      if ((h.streak || 0) > maxStreak) maxStreak = h.streak || 0
    })
    return maxStreak
  }, [habits])

  const bestStreak = useMemo(() => {
    let best = 0
    habits.forEach((h: any) => {
      if ((h.bestStreak || 0) > best) best = h.bestStreak || 0
    })
    return best || currentStreak
  }, [habits, currentStreak])

  // Upcoming reminders count
  const [reminderCount, setReminderCount] = useState(0)
  useEffect(() => {
    try {
      const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
      if (Array.isArray(reminders)) {
        const todayR = reminders.filter((r: any) => r.date === today && !r.completed)
        setReminderCount(todayR.length)
      }
    } catch {}
  }, [today])

  // Reflection prompt - rotate daily
  const reflectionPrompt = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length]
  }, [])

  // ─── Handlers ───
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

  const toggleHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((h: any) => h.id === id ? { ...h, completedToday: !h.completedToday } : h)
    )
    try {
      const all = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
      const updated = all.map((h: any) => h.id === id ? { ...h, completedToday: !h.completedToday } : h)
      localStorage.setItem("intenteo-habits", JSON.stringify(updated))
    } catch {}
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t: any) => t.id !== id))
    try {
      const all = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
      const updated = all.map((t: any) => t.id === id ? { ...t, completed: true } : t)
      localStorage.setItem("intenteo-tasks", JSON.stringify(updated))
    } catch {}
  }, [])

  // ─── Greeting ───
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getFormattedDate = () => {
    const now = new Date()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  }

  const displayName = userName || "there"

  // Linked data for intention
  const linkedIntention = useMemo(() => {
    if (!intentionData) return null
    const found = INTENTION_LIBRARY.find(i => i.text === intention)
    if (!found) return null
    const linkedGoals = findLinkedGoals(found)
    const linkedVisions = findLinkedVisions(found)
    const linkedPurpose = findLinkedPurpose(found)
    return { goals: linkedGoals, visions: linkedVisions, purpose: linkedPurpose }
  }, [intention, intentionData])

  // Streak stats for modal
  const streakStats = useMemo(() => {
    const streaks = habits
      .filter((h: any) => (h.streak || 0) > 0)
      .sort((a: any, b: any) => (b.streak || 0) - (a.streak || 0))
      .slice(0, 5)
    return {
      current: currentStreak,
      best: bestStreak,
      topHabits: streaks.map((h: any) => ({ name: h.name, icon: h.icon, streak: h.streak })),
      totalHabits: totalHabits,
      completedToday: completedHabits,
    }
  }, [habits, currentStreak, bestStreak, totalHabits, completedHabits])

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div>
            <h1 className="text-xl font-semibold">
              {getGreeting()}, <span className="text-gradient">{displayName}</span>
            </h1>
            <p className="text-sm text-muted-foreground">{getFormattedDate()}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Primary Quick Actions */}
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => router.push("/tasks")}>
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Task</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => router.push("/journal?type=quick")}>
              <PenLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Journal</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => router.push("/habits")}>
              <Target className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Habit</span>
            </Button>

            {/* Secondary actions */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9"
                onClick={() => setQuickActionsExpanded(!quickActionsExpanded)}>
                <ChevronDown className={cn("h-4 w-4 transition-transform", quickActionsExpanded && "rotate-180")} />
              </Button>
              <AnimatePresence>
                {quickActionsExpanded && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setQuickActionsExpanded(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full mt-2 z-50 w-48 bg-white dark:bg-gray-900 rounded-xl border shadow-xl overflow-hidden"
                    >
                      {[
                        { icon: <Calendar className="h-4 w-4" />, label: "Calendar", action: () => router.push("/calendar") },
                        { icon: <Bell className="h-4 w-4" />, label: "Reminders", action: () => { setReminderModalOpen(true); setQuickActionsExpanded(false) } },
                        { icon: <Sparkles className="h-4 w-4" />, label: "Ask Teo", action: () => router.push("/coach") },
                      ].map((action, i) => (
                        <button key={i}
                          onClick={() => { action.action(); setQuickActionsExpanded(false) }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left">
                          <span className="text-muted-foreground">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Streak (clickable) */}
            <button
              onClick={() => setStreakModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/25">
                <Flame className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-muted-foreground leading-none">Streak</div>
                <div className="text-sm font-bold leading-tight">{currentStreak} Days</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="px-4 md:px-6 py-6 max-w-5xl mx-auto space-y-6">

        {/* ─── Section 1: Today's Intention (Hero) ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <GlassCard variant="primary" className="p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#EB9E5B]/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium uppercase tracking-wider">Today&apos;s Intention</span>
              </div>

              {showIntentionLibrary ? (
                <IntentionLibrary onSelect={handleIntentionSelect} />
              ) : intention ? (
                <div className="space-y-4">
                  <p className="text-2xl md:text-3xl font-medium leading-relaxed italic text-primary/90">
                    &ldquo;{intention}&rdquo;
                  </p>
                  {linkedIntention && (linkedIntention.goals.length > 0 || linkedIntention.visions.length > 0 || linkedIntention.purpose) && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {linkedIntention.purpose && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] text-xs font-medium">
                          <span className="text-[10px]">Purpose</span>
                          {linkedIntention.purpose}
                        </span>
                      )}
                      {linkedIntention.visions.slice(0, 1).map((v) => (
                        <span key={v.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
                          <Eye className="h-3 w-3" />
                          {v.title}
                        </span>
                      ))}
                      {linkedIntention.goals.slice(0, 2).map((g) => (
                        <span key={g.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EB9E5B]/10 text-[#EB9E5B] text-xs font-medium">
                          <Target className="h-3 w-3" />
                          {g.title}
                        </span>
                      ))}
                    </div>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setShowIntentionLibrary(true)}
                    className="border-[#1E0E6B]/20 mt-2">
                    <PenLine className="h-3.5 w-3.5 mr-1" />
                    Change Intention
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xl text-muted-foreground">Who do you want to be today?</p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowIntentionLibrary(true)}
                      className="bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white">
                      <PenLine className="h-4 w-4 mr-1.5" />
                      Write My Own
                    </Button>
                    <Button variant="outline" onClick={() => setShowIntentionLibrary(true)}
                      className="border-[#1E0E6B]/20">
                      <BookOpen className="h-4 w-4 mr-1.5" />
                      Choose From Library
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* ─── Section 2: Today at a Glance (Collapsible) ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <Card>
            <button
              onClick={() => setGlanceOpen(!glanceOpen)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors rounded-2xl"
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-4 w-4 transition-transform", glanceOpen ? "rotate-0" : "rotate-0")}>
                  {glanceOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </span>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today at a Glance</h2>
              </div>
            </button>
            <AnimatePresence initial={false}>
              {glanceOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { icon: <CheckCircle2 className="h-4 w-4" />, label: "Tasks Due", value: remainingTasks, color: "text-blue-600 dark:text-blue-400" },
                        { icon: <Repeat className="h-4 w-4" />, label: "Habits Remaining", value: totalHabits - completedHabits, color: "text-orange-500 dark:text-orange-400" },
                        { icon: <Bell className="h-4 w-4" />, label: "Today's Reminders", value: reminderCount, color: "text-purple-600 dark:text-purple-400", onClick: () => setReminderModalOpen(true) },
                      ].map((item, i) => (
                        <div key={i} className={cn("flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30", item.onClick && "cursor-pointer hover:bg-muted/50 transition-colors")} onClick={item.onClick}>
                          <span className={item.color}>{item.icon}</span>
                          <div>
                            <div className="text-lg font-bold leading-none">{item.value}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{item.label}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Intent Score Card - Expandable */}
                    <div className="mt-3">
                      <button
                        onClick={() => setIntentScoreExpanded(!intentScoreExpanded)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#1E0E6B]/5 to-[#1E0E6B]/10 border border-[#1E0E6B]/10 hover:from-[#1E0E6B]/10 hover:to-[#1E0E6B]/15 transition-all"
                      >
                        <ProgressRing
                          value={intentScore}
                          size={48}
                          strokeWidth={4}
                          showLabel={true}
                          indicatorClassName="text-[#1E0E6B]"
                        />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#1E0E6B]">Intent Score</span>
                            <span className="text-xs font-semibold" style={{ color: intentBreakdown?.ratingColor }}>
                              {intentBreakdown?.rating}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">How intentionally you lived today</p>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", intentScoreExpanded && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {intentScoreExpanded && intentBreakdown && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 p-3 rounded-xl border border-border/50 bg-background space-y-3">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Breakdown</p>

                              {intentBreakdown.components.map((comp) => (
                                <div key={comp.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("text-sm", comp.status === "complete" ? "text-emerald-500" : comp.status === "unavailable" ? "text-muted-foreground" : "text-red-400")}>
                                      {comp.status === "complete" ? "✅" : comp.status === "unavailable" ? "—" : "❌"}
                                    </span>
                                    <span className={cn("text-xs", comp.status === "unavailable" ? "text-muted-foreground line-through" : "")}>{comp.label}</span>
                                  </div>
                                  <span className="text-xs font-medium tabular-nums">
                                    {comp.status === "unavailable" ? (
                                      <span className="text-muted-foreground">Not Scheduled</span>
                                    ) : (
                                      <span>{comp.earned} / {comp.max}</span>
                                    )}
                                  </span>
                                </div>
                              ))}

                              {intentBreakdown.redistributionMessage && (
                                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 mt-2">
                                  <span className="text-blue-500 text-xs mt-0.5">ℹ️</span>
                                  <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">{intentBreakdown.redistributionMessage}</p>
                                </div>
                              )}

                              <div className="border-t border-border/50 pt-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Today&apos;s Insight</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{intentBreakdown.insight}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* ─── Section 3: Today's Focus + Habits (Two-Column) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Focus */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Today&apos;s Focus
                  </h2>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary"
                    onClick={() => router.push("/tasks")}>
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                {priorityTasks.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No priority tasks for today. Well done!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {priorityTasks.map((task: any) => (
                      <motion.div key={task.id} layout
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0">
                          <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{task.title}</span>
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          </div>
                          {task.timeRange && task.timeRange !== "Anytime" && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <Clock className="h-3 w-3" />
                              {task.timeRange}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {remainingTasks > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        + {remainingTasks - 3} more task{remainingTasks - 3 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Habits */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
            <Card className="h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Today&apos;s Habits
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {completedHabits} of {totalHabits} completed
                      {totalHabits > 0 && <span className="ml-1.5 text-primary font-medium">({habitPercent}%)</span>}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary"
                    onClick={() => router.push("/habits")}>
                    View All <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                {habits.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No habits yet. Start building consistency!</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {habits.slice(0, 5).map((habit: any) => (
                      <motion.div key={habit.id} layout
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200",
                          habit.completedToday ? "bg-primary/5" : "hover:bg-muted/30"
                        )}>
                        <button onClick={() => toggleHabit(habit.id)} className="shrink-0">
                          {habit.completedToday ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            </motion.div>
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        <span className="text-lg">{habit.icon || "🎯"}</span>
                        <div className="flex-1 min-w-0">
                          <span className={cn("text-sm font-medium", habit.completedToday && "line-through text-muted-foreground")}>
                            {habit.name}
                          </span>
                        </div>
                        {(habit.streak || 0) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Flame className="h-3 w-3 text-orange-400" />
                            {habit.streak}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {habits.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        + {habits.length - 5} more habit{habits.length - 5 !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Section 6: Today's Reflection ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <Card className="bg-gradient-to-br from-[#1E0E6B]/5 to-transparent border-[#1E0E6B]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-primary mb-3">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Today&apos;s Reflection</span>
              </div>
              <p className="text-lg font-medium italic text-primary/80 mb-4">
                &ldquo;{reflectionPrompt}&rdquo;
              </p>
              <Button size="sm" onClick={() => router.push("/journal?type=reflection")}
                className="bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white">
                <PenLine className="h-3.5 w-3.5 mr-1.5" />
                Answer in Journal
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Spacer */}
        <div className="h-4" />
      </div>

      {/* ─── Toast ─── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-foreground text-background text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* ─── Streak Modal ─── */}
      <AnimatePresence>
        {streakModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setStreakModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/25">
                  <Flame className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-lg font-bold">Your Streaks</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{streakStats.current}</div>
                  <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <div className="text-2xl font-bold text-[#EB9E5B]">{streakStats.best}</div>
                  <div className="text-xs text-muted-foreground">Best Streak</div>
                </div>
              </div>

              {streakStats.topHabits.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Top Habits</p>
                  <div className="space-y-1.5">
                    {streakStats.topHabits.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span>{h.icon}</span>
                        <span className="flex-1">{h.name}</span>
                        <span className="font-medium text-primary">{h.streak} days</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Trophy className="h-3.5 w-3.5 text-[#EB9E5B]" />
                  {streakStats.completedToday}/{streakStats.totalHabits} habits today
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={() => setStreakModalOpen(false)}>
                Close
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Reminder Modal ─── */}
      <ReminderModal open={reminderModalOpen} onClose={() => setReminderModalOpen(false)} defaultSource="task" />

      {/* ─── Daily Review Modal ─── */}
      {reviewOpen && (
        <DailyReviewModal
          date={today}
          tasksCompleted={completedTasksToday}
          totalTasks={totalTasksToday}
          productivity={habitPercent}
          completedHabits={completedHabits}
          totalHabits={totalHabits}
          habitNames={habits.map((h: any) => ({ name: h.name, completed: h.completedToday || false, score: h.completedToday ? 100 : 0 }))}
          taskList={tasks.map((t: any) => ({ id: t.id, title: t.title, completed: t.completed, subtasks: [] }))}
          existingReview={null}
          router={router}
          onClose={() => setReviewOpen(false)}
          onSave={(data) => {
            try {
              const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
              reviews.push({ date: today, ...data, productivity: habitPercent, tasksCompleted: completedTasksToday, completedHabits, totalHabits, createdAt: new Date().toISOString() })
              localStorage.setItem("intenteo-reviews", JSON.stringify(reviews))
            } catch {}
            addToast("Daily review saved")
            setReviewOpen(false)
          }}
        />
      )}

      {/* ─── Daily Intention Morning Modal ─── */}
      <DailyIntentionModal onSelect={(text) => setIntention(text)} />
    </div>
  )
}

// Need StoredIntention type for the linked data
type StoredIntention = {
  id: string
  text: string
  isCustom: boolean
  selectedAt: string
}
