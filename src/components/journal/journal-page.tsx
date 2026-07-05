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
  Download,
  Star,
  MoreHorizontal,
  Eye,
  Zap,
  Calendar,
  Pin,
  Printer,
  Check,
  Loader2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Highlighter,
  Link,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Code,
  Type,
  Image as ImageIcon,
  MapPin as MapPinIcon,
  Mic as MicIcon,
  Square,
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
  mood?: string
  tags: string[]
  favorited: boolean
  pinned: boolean
  createdAt: string
  images?: string[]
  audioUrl?: string
  location?: string
}

const journalTypeConfig: Record<JournalType, { label: string; icon: React.ReactNode; color: string; accent: string }> = {
  morning: { label: "Morning Journal", icon: <PenLine className="h-3.5 w-3.5" />, color: "var(--brand-secondary)", accent: "#FEF3C7" },
  daily: { label: "Daily Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "var(--brand-primary)", accent: "#E0E7FF" },
  reflection: { label: "Reflection", icon: <Lightbulb className="h-3.5 w-3.5" />, color: "#7C3AED", accent: "#EDE9FE" },
  gratitude: { label: "Gratitude", icon: <Heart className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3" },
  decision: { label: "Decision Journal", icon: <Brain className="h-3.5 w-3.5" />, color: "var(--brand-primary)", accent: "#E0E7FF" },
  dream: { label: "Dream Journal", icon: <Sparkles className="h-3.5 w-3.5" />, color: "#A855F7", accent: "#F3E8FF" },
  prayer: { label: "Prayer Journal", icon: <Heart className="h-3.5 w-3.5" />, color: "#14B8A6", accent: "#CCFBF1" },
  legacy: { label: "Legacy Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "#16A34A", accent: "#D1FAE5" },
  travel: { label: "Travel Journal", icon: <MapPin className="h-3.5 w-3.5" />, color: "var(--brand-secondary)", accent: "#FFEDD5" },
  photo: { label: "Photo Journal", icon: <Camera className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3" },
  voice: { label: "Voice Journal", icon: <Mic className="h-3.5 w-3.5" />, color: "#64748B", accent: "#F1F5F9" },
  quick: { label: "Quick Thoughts", icon: <Zap className="h-3.5 w-3.5" />, color: "var(--brand-secondary)", accent: "#FEF3C7" },
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

const moodOptions = [
  { emoji: "\uD83D\uDE00", label: "Amazing" },
  { emoji: "\uD83D\uDE04", label: "Happy" },
  { emoji: "\uD83D\uDE0A", label: "Content" },
  { emoji: "\uD83D\uDE42", label: "Good" },
  { emoji: "\uD83D\uDE0C", label: "Peaceful" },
  { emoji: "\uD83E\uDD70", label: "Loved" },
  { emoji: "\uD83E\uDD29", label: "Excited" },
  { emoji: "\uD83D\uDE0E", label: "Confident" },
  { emoji: "\uD83D\uDE4F", label: "Grateful" },
  { emoji: "\uD83D\uDCAA", label: "Motivated" },
  { emoji: "\uD83E\uDD14", label: "Thoughtful" },
  { emoji: "\uD83D\uDE10", label: "Neutral" },
  { emoji: "\uD83D\uDE34", label: "Tired" },
  { emoji: "\uD83E\uDD71", label: "Exhausted" },
  { emoji: "\uD83D\uDE14", label: "Sad" },
  { emoji: "\uD83D\uDE22", label: "Heartbroken" },
  { emoji: "\uD83D\uDE30", label: "Anxious" },
  { emoji: "\uD83D\uDE1F", label: "Worried" },
  { emoji: "\uD83D\uDE21", label: "Angry" },
  { emoji: "\uD83D\uDE24", label: "Frustrated" },
  { emoji: "\uD83D\uDE1E", label: "Disappointed" },
  { emoji: "\uD83E\uDD12", label: "Sick" },
  { emoji: "\uD83E\uDD73", label: "Celebrating" },
  { emoji: "\u2764\uFE0F", label: "Inspired" },
  { emoji: "\uD83C\uDF31", label: "Growing" },
  { emoji: "\u2728", label: "Hopeful" },
]

const teoEncouragements = [
  "Another intentional moment captured.",
  "Your future self will thank you.",
  "Beautiful reflection.",
  "Every word shapes your story.",
  "Writing is a brave act.",
  "Your thoughts matter.",
  "Keep reflecting, keep growing.",
  "This is how wisdom is built.",
]

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
    type: "morning", date: "Today", dateISO: todayISO(), time: "7:30 AM", mood: "\uD83D\uDE0C",
    tags: ["Intention", "Relationships"], favorited: true, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "2", title: "Gratitude for Small Moments",
    content: "I'm grateful for the beautiful sunrise this morning. It reminded me that every day is a new opportunity to grow.\n\nSometimes the simplest things carry the most meaning.",
    type: "gratitude", date: "Today", dateISO: todayISO(), time: "8:15 AM", mood: "\uD83D\uDE4F",
    tags: ["Gratitude", "Mindfulness"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "3", title: "Reflection on Q2 Goals",
    content: "Looking back at Q2, I accomplished 70% of my goals. The main challenge was time management.\n\nKey takeaways:\n- Deep work blocks of 90 minutes are more effective\n- Saying no to non-essential meetings freed up 5+ hours per week\n- Morning routines compound over time",
    type: "reflection", date: "Yesterday", dateISO: toISODate(new Date(Date.now() - 86400000)), time: "9:00 PM", mood: "\uD83E\uDD14",
    tags: ["Reflection", "Goals"], favorited: true, pinned: true, createdAt: new Date().toISOString(),
  },
  {
    id: "4", title: "Decision: Career Move",
    content: "Should I take the new role? Pros: More responsibility, better alignment with long-term vision. Cons: Less work-life balance initially. My gut says yes.",
    type: "decision", date: "Yesterday", dateISO: toISODate(new Date(Date.now() - 86400000)), time: "2:30 PM", mood: "\uD83D\uDE0E",
    tags: ["Decision", "Career"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "5", title: "Dream About the Future",
    content: "I dreamed I was standing on a stage, speaking to thousands of people about intentional living. The audience was engaged and inspired.",
    type: "dream", date: "2 days ago", dateISO: toISODate(new Date(Date.now() - 2 * 86400000)), time: "6:00 AM", mood: "\uD83E\uDD29",
    tags: ["Dream", "Vision"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "6", title: "Evening Wind-Down",
    content: "The evening was calm. I spent time reading and reflecting on the day. Tomorrow I have an important presentation, but I feel prepared.",
    type: "daily", date: "2 days ago", dateISO: toISODate(new Date(Date.now() - 2 * 86400000)), time: "8:30 PM", mood: "\uD83D\uDE42",
    tags: ["Daily", "Evening"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "7", title: "Morning Gratitude",
    content: "Woke up feeling refreshed. The weather is beautiful today. I'm grateful for my health and the people in my life.",
    type: "morning", date: "3 days ago", dateISO: toISODate(new Date(Date.now() - 3 * 86400000)), time: "7:00 AM", mood: "\uD83D\uDE04",
    tags: ["Gratitude", "Morning"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "8", title: "Quick Thought on Growth",
    content: "Growth isn't always comfortable. Sometimes the best things happen when we step outside our comfort zone.",
    type: "quick", date: "3 days ago", dateISO: toISODate(new Date(Date.now() - 3 * 86400000)), time: "11:30 AM", mood: "\uD83C\uDF31",
    tags: ["Growth"], favorited: true, pinned: false, createdAt: new Date().toISOString(),
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
/* Toast System                                          */
/* ────────────────────────────────────────────────────── */

interface Toast {
  id: string
  message: string
  type: "success" | "info"
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border shadow-xl max-w-xs"
          >
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary"
            }`}>
              {toast.type === "success" ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            </div>
            <p className="text-sm text-foreground">{toast.message}</p>
            <button onClick={() => onRemove(toast.id)} className="shrink-0 ml-1">
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Tooltip Component                                     */
/* ────────────────────────────────────────────────────── */

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Autosave Hook                                         */
/* ────────────────────────────────────────────────────── */

function useAutosave(key: string, delay: number = 3000) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback((data: unknown) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsSaving(true)
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        setLastSaved(new Date())
        setIsSaving(false)
      } catch { setIsSaving(false) }
    }, delay)
  }, [key, delay])

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [key])

  const clear = useCallback(() => {
    localStorage.removeItem(key)
  }, [key])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  return { lastSaved, isSaving, save, load, clear }
}

/* ────────────────────────────────────────────────────── */
/* Compact Streak Circle                                 */
/* ────────────────────────────────────────────────────── */

const StreakCircle = memo(function StreakCircle({ streak }: { streak: number }) {
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(streak / 30, 1)

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-10 w-10 shrink-0">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 44 44">
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
        <p className="text-sm font-bold leading-tight">{streak} <span className="text-xs font-medium text-muted-foreground">day streak</span></p>
      </div>
    </div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Popover Calendar                                      */
/* ────────────────────────────────────────────────────── */

const PopoverCalendar = memo(function PopoverCalendar({
  entries,
  selectedDate,
  onSelectDate,
  onClose,
}: {
  entries: JournalEntry[]
  selectedDate: string
  onSelectDate: (iso: string) => void
  onClose: () => void
}) {
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())

  const entryDates = useMemo(() => {
    const map: Record<string, boolean> = {}
    entries.forEach((e) => { map[e.dateISO] = true })
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute right-0 top-full mt-2 w-72 rounded-2xl border bg-card shadow-xl p-4 z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
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

      <div className="grid grid-cols-7 gap-0 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const isToday = iso === today
          const isSelected = iso === selectedDate
          const hasEntry = entryDates[iso]

          return (
            <button
              key={iso}
              onClick={() => { onSelectDate(iso); onClose() }}
              className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-all duration-150 ${
                isSelected
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : isToday
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted/60"
              }`}
            >
              {day}
              {hasEntry && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
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
  onTogglePin,
  onNavigateDate,
}: {
  date: string
  entries: JournalEntry[]
  onClose: () => void
  onOpenEntry: (entry: JournalEntry) => void
  onDeleteEntry: (id: string) => void
  onToggleFavorite: (id: string) => void
  onDuplicateEntry: (entry: JournalEntry) => void
  onTogglePin: (id: string) => void
  onNavigateDate: (iso: string) => void
}) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const handler = () => setOpenMenuId(null)
    if (openMenuId) { window.addEventListener("click", handler); return () => window.removeEventListener("click", handler) }
  }, [openMenuId])

  const dayEntries = useMemo(() => {
    return entries
      .filter((e) => e.dateISO === date)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt.localeCompare(a.createdAt))
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] z-50 bg-background border-l shadow-2xl flex flex-col"
      >
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

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
                            {entry.pinned && <Pin className="h-3 w-3 text-primary fill-primary shrink-0" />}
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
                                <span>{entry.mood}</span>
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
                                    className="absolute left-0 bottom-full mb-1 w-44 rounded-xl border bg-background shadow-xl p-1 z-20"
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
                                    <button
                                      onClick={() => { onTogglePin(entry.id); setOpenMenuId(null) }}
                                      className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                      <Pin className="h-3 w-3" /> {entry.pinned ? "Unpin" : "Pin"}
                                    </button>
                                    <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                                      <Download className="h-3 w-3" /> Export PDF
                                    </button>
                                    <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                                      <Printer className="h-3 w-3" /> Print
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
/* Téo AI Assistant Panel                                */
/* ────────────────────────────────────────────────────── */

function TeoPanel({ onInsert, onClose }: { onInsert: (text: string) => void; onClose: () => void }) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const suggestions = [
    { label: "Improve Writing", icon: "\u270D\uFE0F", action: "improve" },
    { label: "Rewrite", icon: "\uD83D\uDD04", action: "rewrite" },
    { label: "Expand", icon: "\uD83D\uDD17", action: "expand" },
    { label: "Summarise", icon: "\uD83D\uDCCA", action: "summarise" },
    { label: "Brainstorm", icon: "\uD83D\uDCA1", action: "brainstorm" },
    { label: "Reflection Questions", icon: "\uD83E\uDD14", action: "reflect" },
  ]

  const handleSuggestion = useCallback((action: string) => {
    setLoading(true)
    setTimeout(() => {
      const responses: Record<string, string> = {
        improve: "Here's an improved version of your writing with better flow and clarity...",
        rewrite: "I've rewritten your text to be more engaging while preserving your voice...",
        expand: "Let me expand on your ideas with additional depth and detail...",
        summarise: "Here's a concise summary of your key points...",
        brainstorm: "Here are some ideas to explore further in your journal entry...",
        reflect: "Here are some reflection questions to deepen your thinking:\n\n1. What emotions came up while writing this?\n2. How does this connect to your values?\n3. What would you do differently next time?",
      }
      setResponse(responses[action] || "I can help you with that...")
      setLoading(false)
    }, 1500)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="rounded-xl border bg-card shadow-lg p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">T\u00E9o AI Writing Assistant</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {suggestions.map((s) => (
          <button
            key={s.action}
            onClick={() => handleSuggestion(s.action)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs hover:bg-muted transition-colors text-left"
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>T\u00E9o is thinking...</span>
        </div>
      )}

      {response && !loading && (
        <div className="p-3 rounded-lg bg-muted/30 text-sm text-foreground mb-3">
          {response}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask T\u00E0o anything about your writing..."
          className="text-xs h-8"
        />
        <Button size="sm" className="h-8 text-xs" onClick={() => {
          if (prompt.trim()) {
            setLoading(true)
            setTimeout(() => {
              setResponse("Here's my response to your question about your journal entry...")
              setLoading(false)
              setPrompt("")
            }, 1500)
          }
        }}>
          Ask
        </Button>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Focus Mode                                            */
/* ────────────────────────────────────────────────────── */

function FocusModeOverlay({ children, onExit }: { children: React.ReactNode; onExit: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "F11") {
        e.preventDefault()
        onExit()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onExit])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-start justify-center pt-16 overflow-y-auto"
    >
      <div className="w-full max-w-[760px] px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-muted-foreground">Focus Mode \u2022 Press F11 or Escape to exit</span>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={onExit}>
            <Minimize2 className="h-3.5 w-3.5" /> Exit Focus
          </Button>
        </div>
        {children}
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Minimal Formatting Toolbar                            */
/* ────────────────────────────────────────────────────── */

function FormattingToolbar({ onFormat }: { onFormat: (action: string) => void }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler) }
  }, [moreOpen])

  return (
    <div className="flex items-center gap-0.5 flex-wrap py-2 border-t border-border/40">
      {/* Default visible actions */}
      <Tooltip label="Bold"><button onClick={() => onFormat("bold")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Bold className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Italic"><button onClick={() => onFormat("italic")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Italic className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Underline"><button onClick={() => onFormat("underline")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Underline className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Strikethrough"><button onClick={() => onFormat("strikethrough")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Strikethrough className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>

      <div className="w-px h-4 bg-border/40 mx-1" />

      <Tooltip label="Bullet List"><button onClick={() => onFormat("bulletList")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><List className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Checklist"><button onClick={() => onFormat("checklist")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><CheckSquare className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Text Colour"><button onClick={() => onFormat("textColour")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Palette className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Highlight"><button onClick={() => onFormat("highlight")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Highlighter className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>

      <div className="w-px h-4 bg-border/40 mx-1" />

      <Tooltip label="Undo"><button onClick={() => onFormat("undo")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Undo2 className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>
      <Tooltip label="Redo"><button onClick={() => onFormat("redo")} className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors"><Redo2 className="h-3.5 w-3.5 text-muted-foreground" /></button></Tooltip>

      <div className="w-px h-4 bg-border/40 mx-1" />

      {/* More button */}
      <div className="relative" ref={moreRef}>
        <Tooltip label="More">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="h-7 px-2 flex items-center justify-center rounded-md hover:bg-muted transition-colors gap-0.5"
          >
            <span className="text-xs text-muted-foreground font-medium">More</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </Tooltip>
        <AnimatePresence>
          {moreOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute left-0 top-full mt-1 w-52 rounded-xl border bg-background shadow-xl p-1 z-30"
            >
              <button onClick={() => { onFormat("h1"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Heading1 className="h-3.5 w-3.5" /> Heading 1
              </button>
              <button onClick={() => { onFormat("h2"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Heading2 className="h-3.5 w-3.5" /> Heading 2
              </button>
              <button onClick={() => { onFormat("h3"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Heading3 className="h-3.5 w-3.5" /> Heading 3
              </button>
              <button onClick={() => { onFormat("numberedList"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <ListOrdered className="h-3.5 w-3.5" /> Numbered List
              </button>
              <button onClick={() => { onFormat("quote"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Quote className="h-3.5 w-3.5" /> Quote
              </button>
              <button onClick={() => { onFormat("code"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Code className="h-3.5 w-3.5" /> Code Block
              </button>
              <button onClick={() => { onFormat("link"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Link className="h-3.5 w-3.5" /> Hyperlink
              </button>
              <button onClick={() => { onFormat("divider"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Minus className="h-3.5 w-3.5" /> Horizontal Divider
              </button>
              <div className="h-px bg-border my-1" />
              <button onClick={() => { onFormat("alignLeft"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <AlignLeft className="h-3.5 w-3.5" /> Align Left
              </button>
              <button onClick={() => { onFormat("alignCenter"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <AlignCenter className="h-3.5 w-3.5" /> Align Centre
              </button>
              <button onClick={() => { onFormat("alignRight"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <AlignRight className="h-3.5 w-3.5" /> Align Right
              </button>
              <button onClick={() => { onFormat("justify"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <AlignJustify className="h-3.5 w-3.5" /> Justify
              </button>
              <div className="h-px bg-border my-1" />
              <button onClick={() => { onFormat("clearFormatting"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                <Type className="h-3.5 w-3.5" /> Clear Formatting
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Premium Journal Editor                                */
/* ────────────────────────────────────────────────────── */

function WritingArea({
  onCreated,
  autosave,
  onSaveSuccess,
}: {
  onCreated: (entry: JournalEntry) => void
  autosave: { lastSaved: Date | null; isSaving: boolean; save: (data: unknown) => void; load: () => Record<string, unknown> | null; clear: () => void }
  onSaveSuccess: (message: string) => void
}) {
  const draft = useMemo(() => autosave.load(), [autosave])
  const [title, setTitle] = useState((draft?.title as string) || "")
  const [content, setContent] = useState((draft?.content as string) || "")
  const [type, setType] = useState<JournalType>((draft?.type as JournalType) || "daily")
  const [tags, setTags] = useState((draft?.tags as string) || "")
  const [mood, setMood] = useState<string | undefined>(draft?.mood as string | undefined)
  const [isFocused, setIsFocused] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [moodOpen, setMoodOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [teoOpen, setTeoOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [location, setLocation] = useState<string>("")
  const moodRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const prompt = useMemo(() => getTodayPrompt(), [])

  const autoExpand = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useEffect(() => { autoExpand() }, [content, autoExpand])

  useEffect(() => {
    autosave.save({ title, content, type, tags, mood })
  }, [title, content, type, tags, mood, autosave])

  useEffect(() => {
    if (autosave.isSaving) {
      setSaveStatus("saving")
    } else if (autosave.lastSaved) {
      setSaveStatus("saved")
      const timer = setTimeout(() => setSaveStatus("idle"), 2500)
      return () => clearTimeout(timer)
    }
  }, [autosave.isSaving, autosave.lastSaved])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moodRef.current && !moodRef.current.contains(e.target as Node)) {
        setMoodOpen(false)
      }
    }
    if (moodOpen) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler) }
  }, [moodOpen])

  // F11 keyboard shortcut for focus mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        setFocusMode((prev) => !prev)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

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
      pinned: false,
      createdAt: now.toISOString(),
      images,
      audioUrl: audioUrl || undefined,
      location: location || undefined,
    }
    onCreated(entry)
    setTitle(""); setContent(""); setTags(""); setMood(undefined); setType("daily")
    setImages([]); setAudioUrl(null); setLocation("")
    autosave.clear()
    const encouragement = teoEncouragements[Math.floor(Math.random() * teoEncouragements.length)]
    onSaveSuccess(encouragement)
  }, [title, content, type, tags, mood, images, audioUrl, location, onCreated, autosave, onSaveSuccess])

  const handleCancel = useCallback(() => {
    setTitle(""); setContent(""); setTags(""); setMood(undefined); setType("daily")
    setImages([]); setAudioUrl(null); setLocation("")
    autosave.clear()
    setIsFocused(false)
  }, [autosave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleSave() }
  }, [handleSave])

  const handleFormat = useCallback((action: string) => {
    console.log("Format action:", action)
  }, [])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setImages((prev) => [...prev, ev.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }, [])

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        const chunks: Blob[] = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" })
          setAudioUrl(URL.createObjectURL(blob))
          stream.getTracks().forEach((t) => t.stop())
        }
        mediaRecorder.start()
        setIsRecording(true)
      } catch {
        console.log("Microphone access denied")
      }
    }
  }, [isRecording])

  const handleGetLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
        },
        () => {
          setLocation("Location unavailable")
        }
      )
    }
  }, [])

  const wordCount = getWordCount(content)
  const readTime = estimateReadTime(content)
  const selectedMood = moodOptions.find((m) => m.emoji === mood)

  const editorContent = (
    <motion.div
      layout
      className="rounded-2xl bg-card overflow-hidden transition-all duration-300"
      style={{
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: isFocused ? "var(--brand-primary)" : "var(--color-border)",
        boxShadow: isFocused
          ? "0 8px 30px rgba(30,14,107,0.08), 0 2px 8px rgba(30,14,107,0.04)"
          : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}
      onMouseEnter={(e) => { if (!isFocused) e.currentTarget.style.borderColor = "var(--color-border-hover)" }}
      onMouseLeave={(e) => { if (!isFocused) e.currentTarget.style.borderColor = "var(--color-border)" }}
      transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="p-5 md:p-6 space-y-3">
        {/* Title */}
        <Input
          placeholder="Give your thoughts a title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !content && setIsFocused(false)}
          className="border-0 text-xl font-semibold px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto"
        />

        {/* Title/Body Divider */}
        <div className="h-px bg-border/40 w-full" />

        {/* Writing area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { setContent(e.target.value); autoExpand() }}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !title && setIsFocused(false)}
          placeholder={prompt}
          rows={4}
          className="w-full bg-transparent text-[15px] leading-[1.8] resize-none focus:outline-none placeholder:text-muted-foreground/40 min-h-[140px] transition-[height] duration-200 ease-out"
          style={{ height: "auto" }}
        />

        {/* Téo AI Panel */}
        <AnimatePresence>
          {teoOpen && (
            <TeoPanel
              onInsert={(text) => setContent((prev) => prev + "\n\n" + text)}
              onClose={() => setTeoOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Images Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 py-2">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img} alt="" className="h-20 w-20 object-cover rounded-lg border" />
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Audio Preview */}
        {audioUrl && (
          <div className="py-2">
            <audio controls src={audioUrl} className="h-8 w-full" />
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1">
            <MapPinIcon className="h-3 w-3" />
            <span>{location}</span>
            <button onClick={() => setLocation("")} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Formatting Toolbar */}
        <FormattingToolbar onFormat={handleFormat} />

        {/* Row 1: Type, Mood, Tags */}
        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-border/40">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as JournalType)}
            className="text-xs px-2.5 py-1.5 rounded-lg border bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {Object.entries(journalTypeConfig).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          {/* Mood Dropdown */}
          <div className="relative" ref={moodRef}>
            <button
              onClick={() => setMoodOpen(!moodOpen)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border bg-muted/30 text-foreground hover:bg-muted/50 transition-colors"
            >
              {selectedMood ? (
                <span>{selectedMood.emoji} {selectedMood.label}</span>
              ) : (
                <span className="text-muted-foreground">Mood</span>
              )}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {moodOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1 w-48 rounded-xl border bg-background shadow-xl p-1 z-30 max-h-64 overflow-y-auto"
                >
                  {moodOptions.map((m) => (
                    <button
                      key={m.emoji}
                      onClick={() => { setMood(mood === m.emoji ? undefined : m.emoji); setMoodOpen(false) }}
                      className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                        mood === m.emoji ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                      }`}
                    >
                      <span className="text-sm">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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

        {/* Row 2: Action buttons + Stats + Save */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-1">
            <Tooltip label="T\u00E9o AI">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setTeoOpen(!teoOpen)}>
                <Sparkles className="h-3.5 w-3.5 text-primary/70" />
              </Button>
            </Tooltip>
            <Tooltip label="Add Image">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip label={isRecording ? "Stop Recording" : "Voice Recording"}>
              <Button variant="ghost" size="icon" className={`h-7 w-7 ${isRecording ? "text-red-500" : ""}`} onClick={toggleRecording}>
                <Mic className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <Tooltip label="Add Location">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleGetLocation}>
                <MapPinIcon className="h-3.5 w-3.5" />
              </Button>
            </Tooltip>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              <span className="tabular-nums">{wordCount} words</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="tabular-nums">{readTime} min read</span>
              <AnimatePresence>
                {saveStatus === "saving" && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-muted-foreground">
                    Saving...
                  </motion.span>
                )}
                {saveStatus === "saved" && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-emerald-500 font-medium">
                    {"\u2713"} Saved
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1.5 glow" onClick={handleSave} disabled={!content.trim()}>
                <Save className="h-3 w-3" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <>
      {/* Focus Mode Toggle */}
      <div className="flex items-center justify-end mb-2">
        <Tooltip label="Focus Mode (F11)">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFocusMode(true)}>
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </Tooltip>
      </div>

      {focusMode ? (
        <FocusModeOverlay onExit={() => setFocusMode(false)}>
          {editorContent}
        </FocusModeOverlay>
      ) : editorContent}
    </>
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
  onTogglePin,
  onDuplicate,
}: {
  entry: JournalEntry
  onBack: () => void
  onDelete: () => void
  onToggleFavorite: () => void
  onTogglePin: () => void
  onDuplicate: () => void
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onTogglePin}>
            <Pin className={`h-4 w-4 ${entry.pinned ? "text-primary fill-primary" : ""}`} />
          </Button>
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
                <button
                  onClick={() => { onDuplicate(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Printer className="h-3.5 w-3.5" /> Print
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

      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: cfg.accent, color: cfg.color }}
          >
            {cfg.label}
          </span>
          {entry.pinned && (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              Pinned
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3">{entry.title}</h1>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/50">
          <span>{entry.date} at {entry.time}</span>
          {entry.mood && <span>{entry.mood}</span>}
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
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const calendarRef = useRef<HTMLDivElement>(null)

  const draftAutosave = useAutosave("intenteo-journal-draft", 3000)

  const streak = useMemo(() => {
    const today = entries.filter((e) => e.dateISO === todayISO()).length
    return today > 0 ? 18 : 17
  }, [entries])

  const addToast = useCallback((message: string, type: "success" | "info" = "success") => {
    const id = `toast-${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const handleCreateEntry = useCallback((entry: JournalEntry) => {
    setEntries((prev) => [entry, ...prev])
    addToast(`Journal saved successfully. ${teoEncouragements[Math.floor(Math.random() * teoEncouragements.length)]}`, "success")
  }, [addToast])

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    setSelectedEntry(null)
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorited: !e.favorited } : e)))
    setSelectedEntry((prev) => (prev && prev.id === id ? { ...prev, favorited: !prev.favorited } : prev))
  }, [])

  const handleTogglePin = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)))
    setSelectedEntry((prev) => (prev && prev.id === id ? { ...prev, pinned: !prev.pinned } : prev))
  }, [])

  const handleDuplicateEntry = useCallback((entry: JournalEntry) => {
    const dup: JournalEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      title: `${entry.title} (Copy)`,
      pinned: false,
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false)
      }
    }
    if (calendarOpen) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler) }
  }, [calendarOpen])

  if (selectedEntry) {
    const currentEntry = entries.find((e) => e.id === selectedEntry.id) || selectedEntry
    return (
      <div className="min-h-screen">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
          <EntryReader
            entry={currentEntry}
            onBack={() => setSelectedEntry(null)}
            onDelete={() => handleDeleteEntry(currentEntry.id)}
            onToggleFavorite={() => handleToggleFavorite(currentEntry.id)}
            onTogglePin={() => handleTogglePin(currentEntry.id)}
            onDuplicate={() => handleDuplicateEntry(currentEntry)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
          <div className="flex items-center gap-3">
            {/* Calendar Icon */}
            <div className="relative" ref={calendarRef}>
              <button
                className="h-9 w-9 rounded-full text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                style={{ backgroundColor: "var(--brand-primary)" }}
                onClick={() => setCalendarOpen(!calendarOpen)}
              >
                <Calendar className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {calendarOpen && (
                  <PopoverCalendar
                    entries={entries}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                    onClose={() => setCalendarOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Streak */}
            <StreakCircle streak={streak} />

            {/* New Entry Button */}
            <Button className="glow h-9" onClick={() => {
              const el = document.querySelector("[data-writing-area]")
              el?.scrollIntoView({ behavior: "smooth" })
            }}>
              <Plus className="mr-1 h-4 w-4" /> New Entry
            </Button>
          </div>
        </div>

        {/* Writing Area */}
        <div className="mb-8" data-writing-area>
          <WritingArea
            onCreated={handleCreateEntry}
            autosave={draftAutosave}
            onSaveSuccess={(msg) => addToast(msg, "info")}
          />
        </div>

        {/* Entry count footer */}
        <div className="text-center">
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
            onTogglePin={handleTogglePin}
            onNavigateDate={handleNavigateDate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}