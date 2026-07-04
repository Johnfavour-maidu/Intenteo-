"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Clock,
  Sparkles,
  Search,
  X,
  ChevronDown,
  LayoutGrid,
  List,
  Flame,
  Calendar,
  Tag,
  Smile,
  MapPin,
  Save,
  ArrowLeft,
  Trash2,
  Copy,
  Share2,
  Download,
  Printer,
  Star,
  MoreHorizontal,
  Eye,
  FileText,
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

const sampleEntries: JournalEntry[] = [
  {
    id: "1", title: "Morning Intention Setting",
    content: "Today I want to focus on being present in every conversation. I will put my phone away during meetings and truly listen to my colleagues. This aligns with my goal of building deeper relationships.\n\nI noticed that when I'm fully present, conversations become richer and more meaningful. The small act of putting away my phone has a profound impact on how people respond to me.",
    type: "morning", date: "Today", time: "7:30 AM", mood: 5,
    tags: ["Intention", "Relationships"], favorited: true, createdAt: new Date().toISOString(),
  },
  {
    id: "2", title: "Gratitude for Small Moments",
    content: "I'm grateful for the beautiful sunrise this morning. It reminded me that every day is a new opportunity to grow. I'm also thankful for my health and the ability to pursue my dreams.\n\nSometimes the simplest things carry the most meaning. A warm cup of coffee, a quiet moment, a kind word from a stranger.",
    type: "gratitude", date: "Today", time: "8:15 AM", mood: 4,
    tags: ["Gratitude", "Mindfulness"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "3", title: "Reflection on Q2 Goals",
    content: "Looking back at Q2, I accomplished 70% of my goals. The main challenge was time management. I need to be more intentional about prioritizing deep work over shallow tasks.\n\nKey takeaways:\n- Deep work blocks of 90 minutes are more effective than scattered 30-minute sessions\n- Saying no to non-essential meetings freed up 5+ hours per week\n- Morning routines compound over time",
    type: "reflection", date: "Yesterday", time: "9:00 PM", mood: 4,
    tags: ["Reflection", "Goals"], favorited: true, createdAt: new Date().toISOString(),
  },
  {
    id: "4", title: "Decision: Career Move",
    content: "Should I take the new role? Pros: More responsibility, better alignment with long-term vision. Cons: Less work-life balance initially. My gut says yes \u2014 this moves me closer to who I want to become.\n\nAfter much deliberation, I realize that growth requires discomfort. The fear I feel is a signal that this matters.",
    type: "decision", date: "Yesterday", time: "2:30 PM", mood: 3,
    tags: ["Decision", "Career"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "5", title: "Dream About the Future",
    content: "I dreamed I was standing on a stage, speaking to thousands of people about intentional living. The audience was engaged and inspired. It felt like a glimpse of my future self.\n\nThe dream felt so real that I woke up with a sense of clarity about my direction.",
    type: "dream", date: "2 days ago", time: "6:00 AM", mood: 5,
    tags: ["Dream", "Vision"], favorited: false, createdAt: new Date().toISOString(),
  },
  {
    id: "6", title: "Evening Wind-Down",
    content: "The evening was calm. I spent time reading and reflecting on the day. Tomorrow I have an important presentation, but I feel prepared.\n\nI've learned that preparation breeds confidence. The work I do today shapes the opportunities of tomorrow.",
    type: "daily", date: "2 days ago", time: "8:30 PM", mood: 4,
    tags: ["Daily", "Evening"], favorited: false, createdAt: new Date().toISOString(),
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

/* ────────────────────────────────────────────────────── */
/* Writing Streak Card                                   */
/* ────────────────────────────────────────────────────── */

const WritingStreak = memo(function WritingStreak({ streak }: { streak: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20"
    >
      <div className="h-9 w-9 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
        <Flame className="h-4.5 w-4.5 text-orange-500" />
      </div>
      <div>
        <p className="text-sm font-semibold">
          <span className="text-orange-600 dark:text-orange-400">{streak}-Day</span> Writing Streak
        </p>
        <p className="text-[11px] text-muted-foreground">Keep capturing your journey.</p>
      </div>
    </motion.div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Quick Entry Hero                                      */
/* ────────────────────────────────────────────────────── */

function QuickEntryHero({ onCreated }: { onCreated: (entry: JournalEntry) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [type, setType] = useState<JournalType>("daily")
  const [tags, setTags] = useState("")
  const [mood, setMood] = useState<number | undefined>(undefined)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prompt = useMemo(() => getTodayPrompt(), [])

  useEffect(() => {
    if (expanded) setTimeout(() => textareaRef.current?.focus(), 300)
  }, [expanded])

  const handleSave = useCallback(() => {
    if (!content.trim()) return
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: title || "Untitled Entry",
      content,
      type,
      date: "Today",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mood,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      favorited: false,
      createdAt: new Date().toISOString(),
    }
    onCreated(entry)
    setTitle(""); setContent(""); setTags(""); setMood(undefined); setType("daily"); setExpanded(false)
  }, [title, content, type, tags, mood, onCreated])

  return (
    <motion.div
      layout
      className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      transition={{ layout: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
    >
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <PenLine className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground/70 flex-1">{prompt}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 space-y-4">
              {/* Title */}
              <Input
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-0 text-lg font-semibold px-0 focus-visible:ring-0 placeholder:text-muted-foreground/40 h-auto"
              />

              {/* Writing Area */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={prompt}
                className="w-full min-h-[180px] bg-transparent text-sm leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/50"
              />

              {/* Meta Row */}
              <div className="flex items-center gap-3 flex-wrap">
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
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Camera className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Mic className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MapPin className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {getWordCount(content)} words · {estimateReadTime(content)} min read
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setExpanded(false)}>Cancel</Button>
                  <Button size="sm" className="h-8 text-xs gap-1.5 glow" onClick={handleSave} disabled={!content.trim()}>
                    <Save className="h-3 w-3" /> Save
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Entry Card — Timeline View                            */
/* ────────────────────────────────────────────────────── */

const EntryCardTimeline = memo(function EntryCardTimeline({
  entry,
  onClick,
}: {
  entry: JournalEntry
  onClick: () => void
}) {
  const cfg = journalTypeConfig[entry.type]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group cursor-pointer rounded-xl border border-border/50 bg-card hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Type indicator */}
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: cfg.accent, color: cfg.color }}
          >
            {cfg.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold truncate">{entry.title}</h3>
              {entry.favorited && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-2">
              <span className="font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
              <span>\u00B7</span>
              <span>{entry.date}</span>
              <span>\u00B7</span>
              <span>{entry.time}</span>
              {entry.mood && (
                <>
                  <span>\u00B7</span>
                  <span>{moodEmojis[entry.mood - 1]}</span>
                </>
              )}
            </div>

            {/* Content preview */}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{entry.content}</p>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                {entry.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{tag}</span>
                ))}
              </div>
              <span className="text-[10px] text-muted-foreground">{estimateReadTime(entry.content)} min read</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Entry Card — Grid View                                */
/* ────────────────────────────────────────────────────── */

const EntryCardGrid = memo(function EntryCardGrid({
  entry,
  onClick,
}: {
  entry: JournalEntry
  onClick: () => void
}) {
  const cfg = journalTypeConfig[entry.type]
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group cursor-pointer rounded-2xl border border-border/50 bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
      onClick={onClick}
    >
      {/* Accent top bar */}
      <div className="h-1.5" style={{ backgroundColor: cfg.color }} />

      <div className="p-4">
        {/* Type badge */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: cfg.accent, color: cfg.color }}
          >
            {cfg.label}
          </span>
          {entry.favorited && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold mb-2 line-clamp-2">{entry.title}</h3>

        {/* Content */}
        <p className="text-xs text-muted-foreground line-clamp-4 leading-relaxed mb-4">{entry.content}</p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{entry.date}, {entry.time}</span>
          </div>
          {entry.mood && <span className="text-sm">{moodEmojis[entry.mood - 1]}</span>}
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2.5">
            {entry.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
})

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
      {/* Top bar */}
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

      {/* Entry content */}
      <article className="max-w-2xl mx-auto">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ backgroundColor: cfg.accent, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight mb-3">{entry.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6 pb-6 border-b border-border/50">
          <span>{entry.date} at {entry.time}</span>
          {entry.mood && <span>{moodEmojis[entry.mood - 1]}</span>}
          <span>{estimateReadTime(entry.content)} min read</span>
          <span>{getWordCount(entry.content)} words</span>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {entry.content.split("\n").map((paragraph, i) => (
            paragraph ? (
              <p key={i} className="text-sm leading-relaxed text-foreground/90 mb-4">{paragraph}</p>
            ) : <br key={i} />
          ))}
        </div>

        {/* Tags */}
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
  const [view, setView] = useState<"timeline" | "grid">("timeline")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<JournalType | "all">("all")
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Close dropdowns on outside click
  useEffect(() => {
    const h = () => { setShowTypeDropdown(false); setShowMobileMenu(false) }
    if (showTypeDropdown || showMobileMenu) { window.addEventListener("click", h); return () => window.removeEventListener("click", h) }
  }, [showTypeDropdown, showMobileMenu])

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = entries

    if (typeFilter !== "all") {
      result = result.filter((e) => e.type === typeFilter)
    }

    if (activeFilter === "today") {
      result = result.filter((e) => e.date === "Today")
    } else if (activeFilter === "week") {
      result = result.filter((e) => e.date === "Today" || e.date === "Yesterday" || e.date.includes("day"))
    } else if (activeFilter === "favorites") {
      result = result.filter((e) => e.favorited)
    } else if (activeFilter === "photos") {
      result = result.filter((e) => e.type === "photo")
    } else if (activeFilter === "voice") {
      result = result.filter((e) => e.type === "voice")
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)) ||
          journalTypeConfig[e.type].label.toLowerCase().includes(q)
      )
    }

    return result
  }, [entries, typeFilter, activeFilter, searchQuery])

  // Stats
  const streak = useMemo(() => {
    const today = entries.filter((e) => e.date === "Today").length
    return today > 0 ? 14 : 13 // Simulated streak
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Capture your thoughts, reflections and memories.</p>
          </div>
          <Button className="glow h-9" onClick={() => {
            const el = document.querySelector("[data-quick-entry]")
            el?.scrollIntoView({ behavior: "smooth" })
          }}>
            <Plus className="mr-1 h-4 w-4" /> New Entry
          </Button>
        </div>

        {/* Writing Streak */}
        <div className="mb-6">
          <WritingStreak streak={streak} />
        </div>

        {/* Quick Entry Hero */}
        <div className="mb-6" data-quick-entry>
          <QuickEntryHero onCreated={handleCreateEntry} />
        </div>

        {/* Search + Filters */}
        <div className="mb-5 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/30 border-transparent focus:bg-background h-9"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-foreground transition-colors" />
              </button>
            )}
          </div>

          {/* Quick filter chips + Type dropdown + View toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter chips */}
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "favorites", label: "Favorites" },
              { id: "photos", label: "Photos" },
              { id: "voice", label: "Voice" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
              </button>
            ))}

            {/* Type filter dropdown */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowTypeDropdown(!showTypeDropdown) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter !== "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                {typeFilter !== "all" ? journalTypeConfig[typeFilter].label : "Type"}
                <ChevronDown className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {showTypeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 top-full mt-1 w-52 rounded-xl border bg-background shadow-xl p-1 z-20 max-h-64 overflow-y-auto"
                  >
                    <button
                      onClick={() => { setTypeFilter("all"); setShowTypeDropdown(false) }}
                      className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg transition-colors text-left ${
                        typeFilter === "all" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      All Entries
                    </button>
                    {Object.entries(journalTypeConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => { setTypeFilter(key as JournalType); setShowTypeDropdown(false) }}
                        className={`flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg transition-colors text-left ${
                          typeFilter === key ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        }`}
                      >
                        <span style={{ color: cfg.color }}>{cfg.icon}</span>
                        {cfg.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* View toggle */}
            <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-lg">
              <Button
                variant={view === "timeline" ? "default" : "ghost"}
                size="sm" className="h-7 px-2"
                onClick={() => setView("timeline")}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm" className="h-7 px-2"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Entries */}
        <AnimatePresence mode="wait">
          {filteredEntries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center"
            >
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No entries found</h3>
              <p className="text-sm text-muted-foreground mb-5">
                {searchQuery ? "Try a different search term." : "Start writing to capture your thoughts."}
              </p>
            </motion.div>
          ) : view === "timeline" ? (
            <motion.div
              key="timeline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredEntries.map((entry) => (
                <EntryCardTimeline
                  key={entry.id}
                  entry={entry}
                  onClick={() => setSelectedEntry(entry)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {filteredEntries.map((entry) => (
                <EntryCardGrid
                  key={entry.id}
                  entry={entry}
                  onClick={() => setSelectedEntry(entry)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-muted-foreground/50">{filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}</p>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Zap Icon (missing import)                             */
/* ────────────────────────────────────────────────────── */

function Zap(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}
