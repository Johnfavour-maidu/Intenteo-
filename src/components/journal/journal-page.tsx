"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  BookOpen,
  PenLine,
  Heart,
  Lightbulb,
  Camera,
  Mic,
  Brain,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Tag,
  MapPin,
  Save,
  ArrowLeft,
  Trash2,
  Copy,
  Share2,
  Download,
  Star,
  MoreHorizontal,
  Eye,
  Zap,
} from "lucide-react"

/* ────────────────────────────────────────────────────── */
/* Types & Data                                          */
/* ────────────────────────────────────────────────────── */

type JournalType =
  | "morning" | "daily" | "reflection" | "gratitude" | "decision"
  | "dream" | "prayer" | "legacy" | "travel" | "photo" | "voice" | "quick"

interface JournalEntry {
  id: string
  title: string
  content: string
  type: JournalType
  date: string
  dateISO: string
  time: string
  mood?: number
  tags: string[]
  favorited: boolean
  createdAt: string
}

const journalTypeConfig: Record<JournalType, { label: string; icon: React.ReactNode; color: string; accent: string }> = {
  morning: { label: "Morning Journal", icon: <PenLine className="h-3.5 w-3.5" />, color: "#F59E0B", accent: "#FEF3C7" },
  daily: { label: "Daily Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "#3B82F6", accent: "#DBEAFE" },
  reflection: { label: "Reflection", icon: <Lightbulb className="h-3.5 w-3.5" />, color: "#8B5CF6", accent: "#EDE9FE" },
  gratitude: { label: "Gratitude", icon: <Heart className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3" },
  decision: { label: "Decision Journal", icon: <Brain className="h-3.5 w-3.5" />, color: "#6366F1", accent: "#E0E7FF" },
  dream: { label: "Dream Journal", icon: <Sparkles className="h-3.5 w-3.5" />, color: "#A855F7", accent: "#F3E8FF" },
  prayer: { label: "Prayer Journal", icon: <Heart className="h-3.5 w-3.5" />, color: "#14B8A6", accent: "#CCFBF1" },
  legacy: { label: "Legacy Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "#10B981", accent: "#D1FAE5" },
  travel: { label: "Travel Journal", icon: <MapPin className="h-3.5 w-3.5" />, color: "#F97316", accent: "#FFEDD5" },
  photo: { label: "Photo Journal", icon: <Camera className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3" },
  voice: { label: "Voice Journal", icon: <Mic className="h-3.5 w-3.5" />, color: "#64748B", accent: "#F1F5F9" },
  quick: { label: "Quick Thoughts", icon: <Zap className="h-3.5 w-3.5" />, color: "#F59E0B", accent: "#FEF3C7" },
}

const writingPrompts = [
  "What made you smile today?",
  "What challenged you today?",
  "What are you grateful for right now?",
  "What lesson did today teach you?",
  "What would you tell your younger self?",
  "What moment today felt most alive?",
  "What are you looking forward to?",
  "What boundary did you honor today?",
  "What surprised you today?",
  "How did you show kindness today?",
]

const moodEmojis = ["😔", "😐", "🙂", "😊", "🤩"]

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function todayISO(): string {
  return toISODate(new Date())
}

const sampleEntries: JournalEntry[] = [
  {
    id: "1", title: "Morning Intention Setting",
    content: "Today I want to focus on being present in every conversation. I will put my phone away during meetings and truly listen to my colleagues.\n\nI noticed that when I'm fully present, conversations become richer and more meaningful.",
    type: "morning", date: "Today", dateISO: todayISO(), time: "7:30 AM", mood: 5,
    tags: ["Intention", "Relationships"], favorited: true, createdAt: new Date().toISOString(),
  },
  {
    id: "2", title: "Gratitude for Small Moments",
    content: "I'm grateful for the beautiful sunrise this morning. It reminded me that every day is a new opportunity to grow.\n\nSometimes the simplest things carry the most meaning.",
    type: "gratitude", date: "Today", dateISO: todayISO(), time: "8:15 AM", mood: 4,
    tags: ["Gratitude", "Mindfulness"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "3", title: "Reflection on Q2 Goals",
    content: "Looking back at Q2, I accomplished 70% of my goals. The main challenge was time management.\n\nKey takeaways:\n- Deep work blocks of 90 minutes are more effective\n- Saying no to non-essential meetings freed up 5+ hours per week\n- Morning routines compound over time",
    type: "reflection", date: "Yesterday", dateISO: toISODate(new Date(Date.now() - 86400000)), time: "9:00 PM", mood: 4,
    tags: ["Reflection", "Goals"], favorited: true, createdAt: new Date().toISOString(),
  },
  {
    id: "4", title: "Decision: Career Move",
    content: "Should I take the new role? Pros: More responsibility, better alignment with long-term vision. Cons: Less work-life balance initially. My gut says yes.",
    type: "decision", date: "Yesterday", dateISO: toISODate(new Date(Date.now() - 86400000)), time: "2:30 PM", mood: 3,
    tags: ["Decision", "Career"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "5", title: "Dream About the Future",
    content: "I dreamed I was standing on a stage, speaking to thousands of people about intentional living. The audience was engaged and inspired.",
    type: "dream", date: "2 days ago", dateISO: toISODate(new Date(Date.now() - 2 * 86400000)), time: "6:00 AM", mood: 5,
    tags: ["Dream", "Vision"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "6", title: "Evening Wind-Down",
    content: "The evening was calm. I spent time reading and reflecting on the day. Tomorrow I have an important presentation, but I feel prepared.",
    type: "daily", date: "2 days ago", dateISO: toISODate(new Date(Date.now() - 2 * 86400000)), time: "8:30 PM", mood: 4,
    tags: ["Daily", "Evening"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "7", title: "Morning Gratitude",
    content: "Woke up feeling refreshed. The weather is beautiful today. I'm grateful for my health and the people in my life.",
    type: "morning", date: "3 days ago", dateISO: toISODate(new Date(Date.now() - 3 * 86400000)), time: "7:00 AM", mood: 5,
    tags: ["Gratitude", "Morning"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "8", title: "Quick Thought on Growth",
    content: "Growth isn't always comfortable. Sometimes the best things happen when we step outside our comfort zone.",
    type: "quick", date: "3 days ago", dateISO: toISODate(new Date(Date.now() - 3 * 86400000)), time: "11:30 AM", mood: 4,
    tags: ["Growth"], favorited: true, createdAt: new Date().toISOString(),
  },
]

/* ────────────────────────────────────────────────────── */
/* Utility Functions                                     */
/* ────────────────────────────────────────────────────── */

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function getWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function getTodayPrompt(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return writingPrompts[dayOfYear % writingPrompts.length]
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

/* ────────────────────────────────────────────────────── */
/* Compact Streak Circle                                 */
/* ────────────────────────────────────────────────────── */

const StreakCircle = memo(function StreakCircle({ streak }: { streak: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(streak / 30, 1)

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative h-11 w-11 shrink-0">
        <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="3"
            className="text-orange-500/15" />
          <motion.circle
            cx="22" cy="22" r={radius} fill="none" stroke="currentColor" strokeWidth="3"
            className="text-orange-500"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Flame className="h-4 w-4 text-orange-500" />
        </div>
      </div>
      <div className="hidden sm:block">
        <p className="text-lg font-bold leading-tight">{streak}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">day streak</p>
      </div>
    </div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Journal Calendar                                      */
/* ────────────────────────────────────────────────────── */

const JournalCalendar = memo(function JournalCalendar({
  entries,
  selectedDate,
  onSelectDate,
}: {
  entries: JournalEntry[]
  selectedDate: string
  onSelectDate: (iso: string) => void
}) {
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  const [showYearPicker, setShowYearPicker] = useState(false)

  const entryDates = useMemo(() => {
    const map: Record<string, number> = {}
    entries.forEach((e) => {
      map[e.dateISO] = (map[e.dateISO] || 0) + 1
    })
    return map
  }, [entries])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const days = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [firstDayOfWeek, daysInMonth])

  const today = todayISO()

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }, [viewMonth])

  const goToToday = useCallback(() => {
    const now = new Date()
    setViewMonth(now.getMonth())
    setViewYear(now.getFullYear())
    onSelectDate(todayISO())
  }, [onSelectDate])

  const handleMonthSelect = useCallback((m: number) => {
    setViewMonth(m)
    setShowMonthPicker(false)
  }, [])

  const handleYearSelect = useCallback((y: number) => {
    setViewYear(y)
    setShowYearPicker(false)
    setShowMonthPicker(true)
  }, [])

  return (
    <div className="rounded-2xl border bg-card p-4">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="text-sm font-semibold hover:text-primary transition-colors"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goToToday}>
            <span className="text-[10px] font-medium">Today</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Month Picker Dropdown */}
      <AnimatePresence>
        {showMonthPicker && !showYearPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-muted/30">
              {MONTH_NAMES.map((name, i) => (
                <button
                  key={i}
                  onClick={() => handleMonthSelect(i)}
                  className={`text-xs py-1.5 rounded-lg transition-colors ${
                    i === viewMonth ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              ))}
              <button
                onClick={() => { setShowYearPicker(true); setShowMonthPicker(false) }}
                className="text-xs py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground col-span-3 mt-1"
              >
                {viewYear} ▾
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Year Picker Dropdown */}
      <AnimatePresence>
        {showYearPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-muted/30 max-h-40 overflow-y-auto">
              {Array.from({ length: 11 }, (_, i) => viewYear - 5 + i).map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className={`text-xs py-1.5 rounded-lg transition-colors ${
                    y === viewYear ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isToday = iso === today
          const isSelected = iso === selectedDate
          const count = entryDates[iso] || 0

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-all duration-150 ${
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : isToday
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted/60"
              }`}
            >
              {day}
              {count > 0 && (
                <div className="absolute bottom-0.5 flex gap-[2px]">
                  {count === 1 ? (
                    <span className="h-1 w-1 rounded-full bg-primary" />
                  ) : count === 2 ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      <span className="h-1 w-1 rounded-full bg-primary" />
                    </>
                  ) : (
                    <span className="h-1 w-1.5 rounded-full bg-primary" />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Day Drawer                                            */
/* ────────────────────────────────────────────────────── */

function DayDrawer({
  date,
  entries,
  onClose,
  onOpenEntry,
  onDeleteEntry,
  onToggleFavorite,
  onDuplicateEntry,
  onNavigateDate,
}: {
  date: string
  entries: JournalEntry[]
  onClose: () => void
  onOpenEntry: (entry: JournalEntry) => void
  onDeleteEntry: (id: string) => void
  onToggleFavorite: (id: string) => void
  onDuplicateEntry: (entry: JournalEntry) => void
  onNavigateDate: (iso: string) => void
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const handler = () => setOpenMenuId(null)
    if (openMenuId) { window.addEventListener("click", handler); return () => window.removeEventListener("click", handler) }
  }, [openMenuId])

  const dayEntries = useMemo(() => {
    return entries.filter((e) => e.dateISO === date).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [entries, date])

  const prevDay = useCallback(() => {
    const d = new Date(date + "T00:00:00")
    d.setDate(d.getDate() - 1)
    onNavigateDate(toISODate(d))
  }, [date, onNavigateDate])

  const nextDay = useCallback(() => {
    const d = new Date(date + "T00:00:00")
    d.setDate(d.getDate() + 1)
    onNavigateDate(toISODate(d))
  }, [date, onNavigateDate])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 bg-background border-l shadow-2xl flex flex-col"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-sm font-semibold">{formatDateLong(date)}</h2>
              <p className="text-[11px] text-muted-foreground">
                {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {dayEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="h-14 w-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
                <BookOpen className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No journal entries for this day.</p>
              <p className="text-xs text-muted-foreground/60 mb-4">Start writing to capture your thoughts.</p>
              <Button size="sm" className="glow" onClick={onClose}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Create Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEntries.map((entry) => {
                const cfg = journalTypeConfig[entry.type]
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group rounded-xl border border-border/50 bg-card hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    {/* Type color bar */}
                    <div className="h-1" style={{ backgroundColor: cfg.color }} />

                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ backgroundColor: cfg.accent, color: cfg.color }}
                        >
                          {cfg.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold truncate">{entry.title}</h3>
                            {entry.favorited && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
                            <span className="font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                            <span>·</span>
                            <span>{entry.time}</span>
                            {entry.mood && (
                              <>
                                <span>·</span>
                                <span>{moodEmojis[entry.mood - 1]}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{estimateReadTime(entry.content)} min read</span>
                          </div>

                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">{entry.content}</p>

                          {entry.tags.length > 0 && (
                            <div className="flex items-center gap-1 mb-3">
                              {entry.tags.map((tag) => (
                                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{tag}</span>
                              ))}
                            </div>
                          )}

                          {/* Actions — always visible */}
                          <div className="flex items-center gap-1 pt-2 border-t border-border/30">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1" onClick={() => onOpenEntry(entry)}>
                              <Eye className="h-3 w-3" /> Open
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1" onClick={() => onOpenEntry(entry)}>
                              <PenLine className="h-3 w-3" /> Edit
                            </Button>
                            <div className="relative">
                              <Button
                                variant="ghost" size="icon" className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === entry.id ? null : entry.id) }}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                              <AnimatePresence>
                                {openMenuId === entry.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                    className="absolute left-0 bottom-full mb-1 w-40 rounded-xl border bg-background shadow-xl p-1 z-20"
                                  >
                                    <button
                                      onClick={() => { onDuplicateEntry(entry); setOpenMenuId(null) }}
                                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                      <Copy className="h-3 w-3" /> Duplicate
                                    </button>
                                    <button
                                      onClick={() => { onToggleFavorite(entry.id); setOpenMenuId(null) }}
                                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                      <Star className="h-3 w-3" /> {entry.favorited ? "Unfavorite" : "Favorite"}
                                    </button>
                                    <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                                      <Download className="h-3 w-3" /> Export
                                    </button>
                                    <div className="h-px bg-border my-1" />
                                    <button
                                      onClick={() => { onDeleteEntry(entry.id); setOpenMenuId(null) }}
                                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                                    >
                                      <Trash2 className="h-3 w-3" /> Delete
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

/* ────────────────────────────────────────────────────── */
/* Writing Area — Always Visible, Auto-Expand            */
/* ────────────────────────────────────────────────────── */

function WritingArea({ onCreated }: { onCreated: (entry: JournalEntry) => void }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<JournalType>("daily")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState<number | undefined>(undefined)
  const [showToolbar, setShowToolbar] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prompt = useMemo(() => getTodayPrompt(), [])

  const autoExpand = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => {
    autoExpand()
  }, [content, autoExpand])

  const handleSave = useCallback(() => {
    if (!content.trim()) return
    const now = new Date()
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: title || "Untitled Entry",
      content,
      type,
      date: "Today",
      dateISO: todayISO(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mood,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      favorited: false,
      createdAt: now.toISOString(),
    }
    onCreated(entry)
    setTitle(""); setContent(""); setTags(""); setMood(undefined); setType("daily")
  }, [title, content, type, tags, mood, onCreated])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  return (
    <motion.div
      layout
      className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="p-5 space-y-3">
        {/* Title */}
        <Input
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-0 text-lg font-semibold px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 h-auto"
        />

        {/* Writing lines — always visible */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); autoExpand() }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowToolbar(true)}
          placeholder={prompt}
          rows={3}
          className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/50 min-h-[72px] transition-[height] duration-200 ease-out"
          style={{ height: "auto" }}
        />

        {/* Toolbar — visible when focused or has content */}
        <AnimatePresence>
          {(showToolbar || content.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Meta Row */}
              <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border/50">
                {/* Type */}
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as JournalType)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.entries(journalTypeConfig).map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>

                {/* Mood */}
                <div className="flex items-center gap-1">
                  {moodEmojis.map((emoji, i) => (
                    <button
                      key={i}
                      onClick={() => setMood(mood === i + 1 ? undefined : i + 1)}
                      className={`text-base transition-all ${mood === i + 1 ? "scale-125" : "opacity-40 hover:opacity-70"}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    className="text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/50 w-40"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Camera className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Mic className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MapPin className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {getWordCount(content)} words · {estimateReadTime(content)} min read
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setContent(""); setTitle(""); setTags(""); setMood(undefined); setShowToolbar(false) }}>
                    Cancel
                  </Button>
                  <Button size="sm" className="h-8 text-xs gap-1.5 glow" onClick={handleSave} disabled={!content.trim()}>
                    <Save className="h-3 w-3" /> Save
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Entry Reader — Full Reading View                      */
/* ────────────────────────────────────────────────────── */

function EntryReader({
  entry,
  onBack,
  onDelete,
  onToggleFavorite,
}: {
  entry: JournalEntry
  onBack: () => void
  onDelete: () => void
  onToggleFavorite: () => void
}) {
  const cfg = journalTypeConfig[entry.type]
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-[60vh]"
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <div className="flex items-center gap-1.5 relative">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleFavorite}>
            <Star className={`h-4 w-4 ${entry.favorited ? "text-amber-500 fill-amber-500" : ""}`} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-background shadow-xl p-1 z-20"
              >
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                  onClick={() => { onDelete(); setMenuOpen(false) }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <article className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: cfg.accent, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3">{entry.title}</h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/50">
          <span>{entry.date} at {entry.time}</span>
          {entry.mood && <span>{moodEmojis[entry.mood - 1]}</span>}
          <span>{estimateReadTime(entry.content)} min read</span>
          <span>{getWordCount(entry.content)} words</span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {entry.content.split("\n").map((paragraph, i) => (
            paragraph ? (
              <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-4">{paragraph}</p>
            ) : <br key={i} />
          ))}
        </div>

        {entry.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-8 pt-6 border-t border-border/50">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {entry.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </article>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Main Journal Page                                     */
/* ────────────────────────────────────────────────────── */

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)

  const streak = useMemo(() => {
    const today = entries.filter((e) => e.dateISO === todayISO()).length
    return today > 0 ? 18 : 17
  }, [entries])

  const handleCreateEntry = useCallback((entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev])
  }, [])

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setSelectedEntry(null)
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorited: !e.favorited } : e)))
    setSelectedEntry((prev) => (prev && prev.id === id ? { ...prev, favorited: !prev.favorited } : prev))
  }, [])

  const handleDuplicateEntry = useCallback((entry: JournalEntry) => {
    const dup: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      title: `${entry.title} (Copy)`,
      createdAt: new Date().toISOString(),
    }
    setEntries((prev) => [dup, ...prev])
  }, [])

  const handleSelectDate = useCallback((iso: string) => {
    setSelectedDate(iso)
    setDrawerOpen(true)
  }, [])

  const handleNavigateDate = useCallback((iso: string) => {
    setSelectedDate(iso)
  }, [])

  // Entry reader view
  if (selectedEntry) {
    const currentEntry = entries.find((e) => e.id === selectedEntry.id) || selectedEntry
    return (
      <div className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <EntryReader
            entry={currentEntry}
            onBack={() => setSelectedEntry(null)}
            onDelete={() => handleDeleteEntry(currentEntry.id)}
            onToggleFavorite={() => handleToggleFavorite(currentEntry.id)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
            <StreakCircle streak={streak} />
          </div>
          <Button className="glow h-9" onClick={() => {
            const el = document.querySelector("[data-writing-area]")
            el?.scrollIntoView({ behavior: "smooth" })
          }}>
            <Plus className="mr-1 h-4 w-4" /> New Entry
          </Button>
        </div>

        {/* Calendar + Writing Area Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Writing Area — Primary Focus */}
          <div data-writing-area>
            <WritingArea onCreated={handleCreateEntry} />
          </div>

          {/* Calendar — Right Side */}
          <div className="order-first lg:order-last">
            <JournalCalendar
              entries={entries}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-muted-foreground/50">
            {entries.length} {entries.length === 1 ? "entry" : "entries"} in your journal
          </p>
        </div>
      </div>

      {/* Day Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <DayDrawer
            date={selectedDate}
            entries={entries}
            onClose={() => setDrawerOpen(false)}
            onOpenEntry={(entry) => { setDrawerOpen(false); setSelectedEntry(entry) }}
            onDeleteEntry={handleDeleteEntry}
            onToggleFavorite={handleToggleFavorite}
            onDuplicateEntry={handleDuplicateEntry}
            onNavigateDate={handleNavigateDate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
