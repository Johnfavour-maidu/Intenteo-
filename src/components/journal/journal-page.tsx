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
  Play,
  Pause,
  Square,
  Globe,
  Languages,
  RotateCcw,
  Volume2,
  StopCircle,
  PlusCircle,
  Pencil,
  CheckCircle,
  Search,
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
  customMood?: string
  tags: string[]
  favorited: boolean
  pinned: boolean
  createdAt: string
  images?: string[]
  audioRecordings?: AudioRecording[]
  location?: string
}

interface AudioRecording {
  id: string
  name: string
  url: string
  duration: number
  createdAt: string
}

const journalTypeConfig: Record<JournalType, { label: string; icon: React.ReactNode; color: string; accent: string; prompt: string }> = {
  morning: { label: "Morning Journal", icon: <PenLine className="h-3.5 w-3.5" />, color: "var(--brand-secondary)", accent: "#FEF3C7", prompt: "What are you looking forward to today?" },
  daily: { label: "Daily Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "var(--brand-primary)", accent: "#E0E7FF", prompt: "What have you been up to today?" },
  reflection: { label: "Reflection", icon: <Lightbulb className="h-3.5 w-3.5" />, color: "#7C3AED", accent: "#EDE9FE", prompt: "What did today teach you?" },
  gratitude: { label: "Gratitude", icon: <Heart className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3", prompt: "What are you grateful for today?" },
  decision: { label: "Decision Journal", icon: <Brain className="h-3.5 w-3.5" />, color: "var(--brand-primary)", accent: "#E0E7FF", prompt: "What decision are you facing today?" },
  dream: { label: "Dream Journal", icon: <Sparkles className="h-3.5 w-3.5" />, color: "#A855F7", accent: "#F3E8FF", prompt: "What dreams do you remember?" },
  prayer: { label: "Prayer Journal", icon: <Heart className="h-3.5 w-3.5" />, color: "#14B8A6", accent: "#CCFBF1", prompt: "What have you been praying about?" },
  legacy: { label: "Legacy Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "#16A34A", accent: "#D1FAE5", prompt: "What would you like your future self to remember?" },
  travel: { label: "Travel Journal", icon: <MapPin className="h-3.5 w-3.5" />, color: "var(--brand-secondary)", accent: "#FFEDD5", prompt: "What made today memorable?" },
  photo: { label: "Photo Journal", icon: <Camera className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3", prompt: "What story does this photo tell?" },
  voice: { label: "Voice Journal", icon: <Mic className="h-3.5 w-3.5" />, color: "#64748B", accent: "#F1F5F9", prompt: "What would you like to record today?" },
  quick: { label: "Quick Thoughts", icon: <Zap className="h-3.5 w-3.5" />, color: "var(--brand-secondary)", accent: "#FEF3C7", prompt: "What's on your mind right now?" },
}

const journalGreetings = [
  "Every intentional moment becomes part of your story.",
  "What's worth remembering today?",
  "Your future self will thank you for writing today.",
  "Small reflections create lasting growth.",
  "Every page is a step toward intentional living.",
  "Today's words shape tomorrow's wisdom.",
  "Capture the moment, embrace the journey.",
  "Your thoughts deserve space to breathe.",
  "Writing is an act of self-care.",
  "Every entry is a gift to your future self.",
  "Reflection is the compass of the soul.",
  "Your story matters, one word at a time.",
  "Today is worth remembering.",
  "Let your thoughts flow freely.",
  "Growth begins with self-awareness.",
  "Each day holds a lesson waiting to be learned.",
  "Your words have power, use them wisely.",
  "Mindfulness starts with putting pen to paper.",
  "The present moment is always worth recording.",
  "Your journey is unique, document it beautifully.",
  "Gratitude turns what we have into enough.",
  "Every reflection brings clarity.",
  "Writing illuminates the path forward.",
  "Today's thoughts become tomorrow's insights.",
  "Your voice deserves to be heard, starting here.",
  "Intentional living begins with intentional reflection.",
  "The best time to reflect is always now.",
  "Your story is being written, one entry at a time.",
  "Stillness speaks volumes when we listen.",
  "Every word you write builds your legacy.",
  "What you reflect on, you grow toward.",
  "Today's journal is tomorrow's treasure.",
  "Writing bridges the gap between thought and action.",
  "Your inner world deserves attention.",
  "Reflection transforms experience into wisdom.",
  "The pen is mightier when guided by intention.",
  "Every entry is a step toward self-discovery.",
  "Your thoughts are worth preserving.",
  "Writing is the art of making the invisible visible.",
  "Today's reflections fuel tomorrow's decisions.",
  "Your journal is your personal sanctuary.",
  "Growth happens in the space between events.",
  "Writing clarifies what the mind cannot see.",
  "Every moment of reflection is a moment of growth.",
  "Your story is worth telling, one day at a time.",
  "Intentional writing creates intentional living.",
  "The quiet moments hold the loudest truths.",
  "Your words create your world.",
  "Reflection is the key to self-understanding.",
  "Today's writing is tomorrow's wisdom.",
  "Your journal holds the map to your inner self.",
]

const moods: { emoji: string; label: string; category: string }[] = [
  { emoji: "\uD83D\uDE00", label: "Happy", category: "Joyful" },
  { emoji: "\uD83D\uDE04", label: "Joyful", category: "Joyful" },
  { emoji: "\uD83D\uDE01", label: "Grinning", category: "Joyful" },
  { emoji: "\uD83D\uDE06", label: "Laughing", category: "Joyful" },
  { emoji: "\uD83E\uDD29", label: "Excited", category: "Joyful" },
  { emoji: "\uD83E\uDD73", label: "Celebrating", category: "Joyful" },
  { emoji: "\uD83D\uDCAB", label: "Inspired", category: "Joyful" },
  { emoji: "\uD83D\uDD25", label: "Motivated", category: "Joyful" },
  { emoji: "\uD83C\uDF1F", label: "Hopeful", category: "Joyful" },
  { emoji: "\uD83C\uDF08", label: "Optimistic", category: "Joyful" },
  { emoji: "\u2728", label: "Magical", category: "Joyful" },
  { emoji: "\uD83E\uDD29", label: "Playful", category: "Joyful" },
  { emoji: "\uD83D\uDE0E", label: "Confident", category: "Joyful" },
  { emoji: "\uD83D\uDCAA", label: "Strong", category: "Joyful" },
  { emoji: "\uD83C\uDFAF", label: "Focused", category: "Joyful" },
  { emoji: "\uD83E\uDD7D", label: "Proud", category: "Joyful" },
  { emoji: "\uD83D\uDE0C", label: "Calm", category: "Calm" },
  { emoji: "\uD83E\uDDD8", label: "Zen", category: "Calm" },
  { emoji: "\uD83C\uDF27\uFE0F", label: "Serene", category: "Calm" },
  { emoji: "\uD83D\uDE16", label: "Relieved", category: "Calm" },
  { emoji: "\uD83E\uDDCD", label: "Meditative", category: "Calm" },
  { emoji: "\uD83C\uDF3A", label: "Tranquil", category: "Calm" },
  { emoji: "\uD83E\uDDD9", label: "Mindful", category: "Calm" },
  { emoji: "\uD83C\uDF32", label: "Grounded", category: "Calm" },
  { emoji: "\uD83C\uDF3F", label: "Centered", category: "Calm" },
  { emoji: "\uD83C\uDF3B", label: "Balanced", category: "Calm" },
  { emoji: "\uD83E\uDD72", label: "Grateful", category: "Calm" },
  { emoji: "\uD83D\uDE0A", label: "Content", category: "Calm" },
  { emoji: "\uD83E\uDD70", label: "Loved", category: "Calm" },
  { emoji: "\u2764\uFE0F", label: "In Love", category: "Calm" },
  { emoji: "\uD83E\uDDE1", label: "Accepted", category: "Calm" },
  { emoji: "\uD83D\uDE42", label: "Good", category: "Calm" },
  { emoji: "\uD83D\uDE07", label: "Trusting", category: "Calm" },
  { emoji: "\uD83D\uDE0D", label: "Charming", category: "Calm" },
  { emoji: "\uD83E\uDD20", label: "Cool", category: "Calm" },
  { emoji: "\uD83D\uDC4D", label: "Approving", category: "Calm" },
  { emoji: "\uD83D\uDE4F", label: "Thankful", category: "Calm" },
  { emoji: "\uD83C\uDF31", label: "Growing", category: "Calm" },
  { emoji: "\uD83D\uDE34", label: "Sleepy", category: "Tired" },
  { emoji: "\uD83D\uDE0B", label: "Tired", category: "Tired" },
  { emoji: "\uD83D\uDE2A", label: "Exhausted", category: "Tired" },
  { emoji: "\uD83E\uDD71", label: "Drained", category: "Tired" },
  { emoji: "\uD83D\uDE13", label: "Weary", category: "Tired" },
  { emoji: "\uD83E\uDD74", label: "Burnout", category: "Tired" },
  { emoji: "\uD83D\uDCA4", label: "Drowsy", category: "Tired" },
  { emoji: "\uD83D\uDE2B", label: "Spent", category: "Tired" },
  { emoji: "\uD83E\uDD2B", label: "Stressed", category: "Tired" },
  { emoji: "\uD83E\uDD25", label: "Overwhelmed", category: "Tired" },
  { emoji: "\uD83D\uDE14", label: "Sad", category: "Sad" },
  { emoji: "\uD83D\uDE22", label: "Crying", category: "Sad" },
  { emoji: "\uD83D\uDE1E", label: "Disappointed", category: "Sad" },
  { emoji: "\uD83D\uDE15", label: "Unhappy", category: "Sad" },
  { emoji: "\uD83D\uDE29", label: "Pensive", category: "Sad" },
  { emoji: "\uD83E\uDD13", label: "Confused", category: "Sad" },
  { emoji: "\uD83D\uDE20", label: "Angry", category: "Sad" },
  { emoji: "\uD83D\uDE24", label: "Frustrated", category: "Sad" },
  { emoji: "\uD83D\uDE21", label: "Enraged", category: "Sad" },
  { emoji: "\uD83E\uDD2C", label: "Amused", category: "Sad" },
  { emoji: "\uD83D\uDE1B", label: "Skeptical", category: "Sad" },
  { emoji: "\uD83E\uDD12", label: "Sick", category: "Sad" },
  { emoji: "\uD83D\uDE1F", label: "Worried", category: "Sad" },
  { emoji: "\uD83D\uDE27", label: "Scared", category: "Sad" },
  { emoji: "\uD83D\uDE30", label: "Anxious", category: "Sad" },
  { emoji: "\uD83D\uDE28", label: "Nervous", category: "Sad" },
  { emoji: "\uD83D\uDE2C", label: "Overwhelmed", category: "Sad" },
  { emoji: "\uD83D\uDE11", label: "Apathetic", category: "Sad" },
  { emoji: "\uD83E\uDD11", label: "Lonely", category: "Sad" },
  { emoji: "\uD83E\uDD17", label: "Rejected", category: "Sad" },
  { emoji: "\uD83E\uDD1D", label: "Guilty", category: "Sad" },
  { emoji: "\uD83E\uDD1E", label: "Embarrassed", category: "Sad" },
  { emoji: "\uD83E\uDD1F", label: "Jealous", category: "Sad" },
  { emoji: "\uD83D\uDE19", label: "Disgusted", category: "Sad" },
  { emoji: "\uD83D\uDE12", label: "Unimpressed", category: "Sad" },
  { emoji: "\uD83D\uDE33", label: "Shocked", category: "Sad" },
  { emoji: "\uD83D\uDE2F", label: "Horrified", category: "Sad" },
  { emoji: "\uD83E\uDD75", label: "Lying", category: "Sad" },
  { emoji: "\uD83E\uDD22", label: "Sneezing", category: "Sad" },
  { emoji: "\uD83E\uDD2E", label: "Mind Blown", category: "Sad" },
  { emoji: "\uD83E\uDD27", label: "Starstruck", category: "Sad" },
  { emoji: "\uD83D\uDE0F", label: "Smirking", category: "Sad" },
  { emoji: "\uD83D\uDE09", label: "Winking", category: "Sad" },
  { emoji: "\uD83E\uDD14", label: "Thinking", category: "Sad" },
  { emoji: "\uD83E\uDD35", label: "Shushing", category: "Sad" },
  { emoji: "\uD83E\uDD18", label: "Hand on Mouth", category: "Sad" },
  { emoji: "\uD83E\uDD19", label: "Peeking", category: "Sad" },
  { emoji: "\uD83E\uDD1A", label: "Silent", category: "Sad" },
  { emoji: "\uD83E\uDD1B", label: "Saluting", category: "Sad" },
  { emoji: "\uD83E\uDD1C", label: "Earless", category: "Sad" },
  { emoji: "\uD83E\uDD78", label: "Monocle", category: "Extra" },
  { emoji: "\uD83E\uDD28", label: "Mind Blown", category: "Extra" },
  { emoji: "\uD83E\uDD2F", label: "Hugging", category: "Extra" },
  { emoji: "\uD83E\uDD30", label: "Shaking", category: "Extra" },
  { emoji: "\uD83E\uDD31", label: "Party", category: "Extra" },
  { emoji: "\uD83E\uDD32", label: "Disguised", category: "Extra" },
  { emoji: "\uD83E\uDD33", label: "Pleading", category: "Extra" },
  { emoji: "\uD83E\uDD34", label: "Sweat", category: "Extra" },
  { emoji: "\uD83E\uDD70", label: "Swooning", category: "Extra" },
  { emoji: "\uD83E\uDD76", label: "Zzz", category: "Extra" },
  { emoji: "\uD83D\uDC4D", label: "Thumbs Up", category: "Gestures" },
  { emoji: "\uD83D\uDC4E", label: "Thumbs Down", category: "Gestures" },
  { emoji: "\uD83D\uDC4B", label: "Wave", category: "Gestures" },
  { emoji: "\uD83E\uDD1A", label: "Fist", category: "Gestures" },
  { emoji: "\u270A", label: "Punch", category: "Gestures" },
  { emoji: "\uD83E\uDD1B", label: "Fist Bump", category: "Gestures" },
  { emoji: "\u270B", label: "Hand", category: "Gestures" },
  { emoji: "\uD83E\uDD1C", label: "High Five", category: "Gestures" },
  { emoji: "\uD83E\uDD18", label: "OK", category: "Gestures" },
  { emoji: "\uD83E\uDD19", label: "Call Me", category: "Gestures" },
  { emoji: "\uD83E\uDD1E", label: "Pinch", category: "Gestures" },
  { emoji: "\uD83E\uDD1F", label: "Handshake", category: "Gestures" },
  { emoji: "\u2764\uFE0F", label: "Red Heart", category: "Hearts" },
  { emoji: "\uD83D\uDC94", label: "Broken Heart", category: "Hearts" },
  { emoji: "\uD83D\uDC95", label: "Two Hearts", category: "Hearts" },
  { emoji: "\uD83D\uDC93", label: "Sparkling Heart", category: "Hearts" },
  { emoji: "\uD83D\uDC97", label: "Beating Heart", category: "Hearts" },
  { emoji: "\uD83D\uDC98", label: "Heart Arrow", category: "Hearts" },
  { emoji: "\uD83D\uDC99", label: "Purple Heart", category: "Hearts" },
  { emoji: "\uD83D\uDC9A", label: "Green Heart", category: "Hearts" },
  { emoji: "\uD83E\uDDE1", label: "Revolving Hearts", category: "Hearts" },
  { emoji: "\uD83D\uDC9B", label: "Yellow Heart", category: "Hearts" },
  { emoji: "\uD83E\uDD0D", label: "Brown Heart", category: "Hearts" },
  { emoji: "\uD83E\uDD0E", label: "Black Heart", category: "Hearts" },
  { emoji: "\u2763\uFE0F", label: "Heart Exclamation", category: "Hearts" },
  { emoji: "\uD83E\uDD0F", label: "White Heart", category: "Hearts" },
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
    type: "gratitude", date: "Today", dateISO: todayISO(), time: "8:15 AM", mood: "\uD83E\uDD72",
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
    type: "decision", date: "Yesterday", dateISO: toISODate(new Date(Date.now() - 86400000)), time: "2:30 PM", mood: "\uD83D\uDCAB",
    tags: ["Decision", "Career"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
  },
  {
    id: "5", title: "Dream About the Future",
    content: "I dreamed I was standing on a stage, speaking to thousands of people about intentional living. The audience was engaged and inspired.",
    type: "dream", date: "2 days ago", dateISO: toISODate(new Date(Date.now() - 2 * 86400000)), time: "6:00 AM", mood: "\u2728",
    tags: ["Dream", "Vision"], favorited: false, pinned: false, createdAt: new Date().toISOString(),
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

function getParagraphCount(text: string): number {
  return text.split(/\n\n+/).filter(Boolean).length
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    const data = await res.json()
    if (data.address) {
      const parts = [data.address.city || data.address.town || data.address.village, data.address.country].filter(Boolean)
      return parts.join(", ") || "Location found"
    }
    return "Location found"
  } catch {
    return "Location unavailable"
  }
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
    <div className="relative group/tooltip">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-foreground text-background text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
        {label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Autosave Hook                                         */
/* ────────────────────────────────────────────────────── */

function useAutosave(key: string, delay: number = 2000) {
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
                            <span>\u00B7</span>
                            <span>{entry.time}</span>
                            {entry.mood && (
                              <>
                                <span>\u00B7</span>
                                <span>{entry.mood}</span>
                              </>
                            )}
                            <span>\u00B7</span>
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
/* T\u00e9o AI Assistant Panel                                */
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
          <span className="text-sm font-semibold">Teo AI Writing Assistant</span>
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
          <span>Teo is thinking...</span>
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
          placeholder="Ask Teo anything about your writing..."
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
/* Voice Recorder Component                              */
/* ────────────────────────────────────────────────────── */

function VoiceRecorder({ recordings, onAdd, onDelete, onRename }: {
  recordings: AudioRecording[]
  onAdd: (recording: AudioRecording) => void
  onDelete: (id: string) => void
  onRename: (id: string, name: string) => void
}) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      setIsRecording(false)
      setRecordingTime(0)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        const chunks: Blob[] = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" })
          const url = URL.createObjectURL(blob)
          onAdd({
            id: `audio-${Date.now()}`,
            name: `Recording ${recordings.length + 1}`,
            url,
            duration: recordingTime,
            createdAt: new Date().toISOString(),
          })
          stream.getTracks().forEach((t) => t.stop())
        }
        mediaRecorder.start()
        setIsRecording(true)
        setRecordingTime(0)
        timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
      } catch {
        console.log("Microphone access denied")
      }
    }
  }, [isRecording, onAdd, recordings.length, recordingTime])

  const playRecording = useCallback((recording: AudioRecording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      if (audioRef.current) audioRef.current.pause()
      const audio = new Audio(recording.url)
      audio.onended = () => setPlayingId(null)
      audio.play()
      audioRef.current = audio
      setPlayingId(recording.id)
    }
  }, [playingId])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tooltip label={isRecording ? "Stop Recording" : "Start Recording"}>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isRecording ? "text-red-500 bg-red-500/10" : ""}`}
            onClick={toggleRecording}
          >
            {isRecording ? <StopCircle className="h-4 w-4" /> : <MicIcon className="h-4 w-4" />}
          </Button>
        </Tooltip>
        {isRecording && (
          <span className="text-xs text-red-500 font-medium tabular-nums">{formatTime(recordingTime)}</span>
        )}
      </div>

      {recordings.length > 0 && (
        <div className="space-y-1.5">
          {recordings.map((rec) => (
            <div key={rec.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/30 group">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => playRecording(rec)}
              >
                {playingId === rec.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              {editingId === rec.id ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => { onRename(rec.id, editName); setEditingId(null) }}
                  onKeyDown={(e) => { if (e.key === "Enter") { onRename(rec.id, editName); setEditingId(null) } }}
                  className="flex-1 text-xs bg-transparent focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-xs truncate">{rec.name}</span>
              )}
              <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(rec.duration)}</span>
              <button
                onClick={() => { setEditingId(rec.id); setEditName(rec.name) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
              <button
                onClick={() => onDelete(rec.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
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
          <span className="text-xs text-muted-foreground">Click Esc to exit</span>
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
/* Formatting Toolbar                                    */
/* ────────────────────────────────────────────────────── */

function FormattingToolbar({ onFormat, activeFormats }: { onFormat: (action: string) => void; activeFormats: Set<string> }) {
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

  const fmtBtn = (action: string, icon: React.ReactNode, label: string) => (
    <Tooltip label={label}>
      <button
        onClick={() => onFormat(action)}
        className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors ${
          activeFormats.has(action) ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  )

  return (
    <div className="flex items-center gap-0.5 flex-wrap py-2 border-t border-border/40">
      {fmtBtn("bold", <Bold className="h-3.5 w-3.5" />, "Bold (Ctrl+B)")}
      {fmtBtn("italic", <Italic className="h-3.5 w-3.5" />, "Italic (Ctrl+I)")}
      {fmtBtn("underline", <Underline className="h-3.5 w-3.5" />, "Underline (Ctrl+U)")}
      {fmtBtn("strikethrough", <Strikethrough className="h-3.5 w-3.5" />, "Strikethrough")}

      <div className="w-px h-4 bg-border/40 mx-1" />

      {fmtBtn("bulletList", <List className="h-3.5 w-3.5" />, "Bullet List")}
      {fmtBtn("numberedList", <ListOrdered className="h-3.5 w-3.5" />, "Numbered List")}
      {fmtBtn("checklist", <CheckSquare className="h-3.5 w-3.5" />, "Checklist")}
      {fmtBtn("quote", <Quote className="h-3.5 w-3.5" />, "Quote")}
      {fmtBtn("code", <Code className="h-3.5 w-3.5" />, "Code Block")}

      <div className="w-px h-4 bg-border/40 mx-1" />

      {fmtBtn("textColour", <Palette className="h-3.5 w-3.5" />, "Text Colour")}
      {fmtBtn("highlight", <Highlighter className="h-3.5 w-3.5" />, "Highlight")}

      <div className="w-px h-4 bg-border/40 mx-1" />

      {fmtBtn("undo", <Undo2 className="h-3.5 w-3.5" />, "Undo (Ctrl+Z)")}
      {fmtBtn("redo", <Redo2 className="h-3.5 w-3.5" />, "Redo (Ctrl+Shift+Z)")}

      <div className="w-px h-4 bg-border/40 mx-1" />

      <div className="relative" ref={moreRef}>
        <Tooltip label="More Options">
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
              className="absolute left-0 top-full mt-1 w-52 rounded-xl border bg-background shadow-xl z-30 max-h-[280px] overflow-y-auto"
            >
              <div className="p-1">
                <button onClick={() => { onFormat("h1"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                  <Heading1 className="h-3.5 w-3.5" /> Heading 1
                </button>
                <button onClick={() => { onFormat("h2"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                  <Heading2 className="h-3.5 w-3.5" /> Heading 2
                </button>
                <button onClick={() => { onFormat("h3"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                  <Heading3 className="h-3.5 w-3.5" /> Heading 3
                </button>
                <button onClick={() => { onFormat("link"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                  <Link className="h-3.5 w-3.5" /> Hyperlink (Ctrl+K)
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
                <button onClick={() => { onFormat("inlineCode"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                  <Code className="h-3.5 w-3.5" /> Inline Code
                </button>
                <button onClick={() => { onFormat("clearFormatting"); setMoreOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                  <Type className="h-3.5 w-3.5" /> Clear Formatting
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Mood Picker (WhatsApp-style)                          */
/* ────────────────────────────────────────────────────── */

function MoodPicker({
  selectedMood,
  onSelectMood,
  onCreateCustom,
  customMood,
  open,
  onOpenChange,
}: {
  selectedMood: string | undefined
  onSelectMood: (emoji: string) => void
  onCreateCustom: (emoji: string, label: string) => void
  customMood: { emoji: string; label: string } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [search, setSearch] = useState("")
  const [showCustom, setShowCustom] = useState(false)
  const [customEmoji, setCustomEmoji] = useState("\uD83D\uDE0A")
  const [customLabel, setCustomLabel] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false)
        setSearch("")
      }
    }
    if (open) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler) }
  }, [open, onOpenChange])

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [open])

  const categories = useMemo(() => {
    const cats: Record<string, typeof moods> = {}
    const filtered = search
      ? moods.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()))
      : moods
    filtered.forEach((m) => {
      if (!cats[m.category]) cats[m.category] = []
      cats[m.category].push(m)
    })
    return cats
  }, [search])

  const allCategories = ["Joyful", "Calm", "Tired", "Sad", "Extra", "Gestures", "Hearts"]

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => onOpenChange(!open)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border bg-muted/30 text-foreground hover:bg-muted/50 transition-colors"
      >
        {customMood ? (
          <span>{customMood.emoji} {customMood.label}</span>
        ) : selectedMood ? (
          <span>{selectedMood}</span>
        ) : (
          <span className="text-muted-foreground">Mood</span>
        )}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1 w-[340px] rounded-xl border bg-background shadow-xl z-30 overflow-hidden"
          >
            {/* Search bar */}
            <div className="p-2 border-b">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
                <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search moods..."
                  className="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
                />
                {search && (
                  <button onClick={() => setSearch("")}>
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>

            {/* Mood grid */}
            <div className="max-h-[260px] overflow-y-auto p-2">
              {Object.keys(categories).length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No moods found</div>
              ) : (
                allCategories.map((cat) => {
                  const catMoods = categories[cat]
                  if (!catMoods || catMoods.length === 0) return null
                  return (
                    <div key={cat} className="mb-2">
                      <div className="px-1 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{cat}</div>
                      <div className="grid grid-cols-8 gap-0.5">
                        {catMoods.map((m) => (
                          <button
                            key={`${m.emoji}-${m.label}`}
                            onClick={() => { onSelectMood(m.emoji); onOpenChange(false); setSearch("") }}
                            title={m.label}
                            className={`h-9 w-9 flex items-center justify-center rounded-lg text-lg transition-all hover:bg-muted hover:scale-110 ${
                              selectedMood === m.emoji && !customMood ? "bg-primary/10 ring-1 ring-primary" : ""
                            }`}
                          >
                            {m.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Custom mood */}
            <div className="p-2 border-t">
              {!showCustom ? (
                <button
                  onClick={() => setShowCustom(true)}
                  className="flex items-center gap-2 w-full px-2.5 py-2 text-xs rounded-lg hover:bg-muted transition-colors text-left"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-primary" /> Custom Mood...
                </button>
              ) : (
                <div className="space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customEmoji}
                      onChange={(e) => setCustomEmoji(e.target.value)}
                      className="w-10 h-9 text-lg text-center rounded-lg border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
                      maxLength={2}
                    />
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="Mood name"
                      className="flex-1 h-9 text-xs px-2 rounded-lg border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      size="sm"
                      className="h-9 px-3"
                      onClick={() => {
                        if (customLabel.trim()) {
                          onCreateCustom(customEmoji, customLabel)
                          setShowCustom(false)
                          setCustomLabel("")
                          setCustomEmoji("\uD83D\uDE0A")
                          onOpenChange(false)
                          setSearch("")
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <button
                    onClick={() => { setShowCustom(false); setCustomLabel(""); setCustomEmoji("\uD83D\uDE0A") }}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Rich Text Editor (contenteditable)                    */
/* ────────────────────────────────────────────────────── */

function RichTextEditor({
  initialContent,
  placeholder,
  onContentChange,
  editorRef,
}: {
  initialContent: string
  placeholder: string
  onContentChange: (html: string, text: string) => void
  editorRef: React.RefObject<HTMLDivElement | null>
}) {
  const isInternalChange = useRef(false)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    isInternalChange.current = true
    const html = editorRef.current.innerHTML
    const text = editorRef.current.innerText || ""
    onContentChange(html, text)
    setTimeout(() => { isInternalChange.current = false }, 0)
  }, [onContentChange, editorRef])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow tab to indent in code blocks
    if (e.key === "Tab") {
      e.preventDefault()
      document.execCommand("insertText", false, "    ")
    }
  }, [])

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className="w-full bg-transparent text-[15px] leading-[1.8] focus:outline-none min-h-[140px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:pointer-events-none"
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      spellCheck
      lang="en-GB"
      style={{ wordBreak: "break-word" }}
    />
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
  const [contentHtml, setContentHtml] = useState((draft?.contentHtml as string) || "")
  const [contentText, setContentText] = useState((draft?.contentText as string) || "")
  const [type, setType] = useState<JournalType>((draft?.type as JournalType) || "daily")
  const [tags, setTags] = useState((draft?.tags as string) || "")
  const [mood, setMood] = useState<string | undefined>(draft?.mood as string | undefined)
  const [customMood, setCustomMood] = useState<{ emoji: string; label: string } | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [moodOpen, setMoodOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [teoOpen, setTeoOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [recordings, setRecordings] = useState<AudioRecording[]>([])
  const [location, setLocation] = useState<string>("")
  const [locationLoading, setLocationLoading] = useState(false)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const moodRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const writingStartTime = useRef<Date>(new Date())

  const currentPrompt = useMemo(() => journalTypeConfig[type].prompt, [type])
  const greeting = useMemo(() => journalGreetings[Math.floor(Math.random() * journalGreetings.length)], [])

  const wordCount = useMemo(() => getWordCount(contentText), [contentText])
  const paraCount = useMemo(() => getParagraphCount(contentText), [contentText])
  const voiceCount = recordings.length

  // Auto-save
  useEffect(() => {
    autosave.save({
      title, contentHtml, contentText, type, tags, mood, customMood,
      images, recordings: recordings.map((r) => ({ ...r, url: "" })), location,
    })
  }, [title, contentHtml, contentText, type, tags, mood, customMood, images, recordings, location, autosave])

  // Close mood on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moodRef.current && !moodRef.current.contains(e.target as Node)) {
        setMoodOpen(false)
      }
    }
    if (moodOpen) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler) }
  }, [moodOpen])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        setFocusMode((prev) => !prev)
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") { e.preventDefault(); document.execCommand("bold") }
        if (e.key === "i") { e.preventDefault(); document.execCommand("italic") }
        if (e.key === "u") { e.preventDefault(); document.execCommand("underline") }
        if (e.key === "k") { e.preventDefault(); handleFormat("link") }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); document.execCommand("redo") }
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); document.execCommand("undo") }
        if (e.key === "s") { e.preventDefault(); handleSave() }
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleContentChange = useCallback((html: string, text: string) => {
    setContentHtml(html)
    setContentText(text)
  }, [])

  const handleFormat = useCallback((action: string) => {
    setActiveFormats((prev) => {
      const next = new Set(prev)
      if (next.has(action)) next.delete(action)
      else next.add(action)
      return next
    })

    const editor = editorRef.current
    if (editor) editor.focus()

    switch (action) {
      case "bold": document.execCommand("bold"); break
      case "italic": document.execCommand("italic"); break
      case "underline": document.execCommand("underline"); break
      case "strikethrough": document.execCommand("strikeThrough"); break
      case "h1": document.execCommand("formatBlock", false, "h1"); break
      case "h2": document.execCommand("formatBlock", false, "h2"); break
      case "h3": document.execCommand("formatBlock", false, "h3"); break
      case "quote": document.execCommand("formatBlock", false, "blockquote"); break
      case "code": document.execCommand("formatBlock", false, "pre"); break
      case "inlineCode": {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
          const range = sel.getRangeAt(0)
          const selectedText = range.toString()
          const code = document.createElement("code")
          code.textContent = selectedText
          code.style.backgroundColor = "rgba(148,163,184,0.15)"
          code.style.padding = "1px 4px"
          code.style.borderRadius = "3px"
          code.style.fontSize = "0.9em"
          code.style.fontFamily = "ui-monospace, monospace"
          range.deleteContents()
          range.insertNode(code)
          sel.removeAllRanges()
          const newRange = document.createRange()
          newRange.selectNodeContents(code)
          sel.addRange(newRange)
        }
        break
      }
      case "bulletList": document.execCommand("insertUnorderedList"); break
      case "numberedList": document.execCommand("insertOrderedList"); break
      case "checklist": {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0)
          const text = range.toString() || "Task"
          const lines = text.split("\n")
          const html = lines.map((l) => `<div><input type="checkbox" disabled /> ${l}</div>`).join("")
          document.execCommand("insertHTML", false, html)
        }
        break
      }
      case "divider":
        document.execCommand("insertHorizontalRule")
        break
      case "link": {
        const url = prompt("Enter URL:", "https://")
        if (url) document.execCommand("createLink", false, url)
        break
      }
      case "textColour": {
        const color = prompt("Enter colour (e.g. #FF0000, red, var(--brand-primary)):", "var(--brand-primary)")
        if (color) document.execCommand("foreColor", false, color)
        break
      }
      case "highlight": {
        const color = prompt("Highlight colour:", "#FEF3C7")
        if (color) document.execCommand("hiliteColor", false, color)
        break
      }
      case "undo": document.execCommand("undo"); break
      case "redo": document.execCommand("redo"); break
      case "clearFormatting": document.execCommand("removeFormat"); break
      case "alignLeft": document.execCommand("justifyLeft"); break
      case "alignCenter": document.execCommand("justifyCenter"); break
      case "alignRight": document.execCommand("justifyRight"); break
      case "justify": document.execCommand("justifyFull"); break
    }

    // Update content state after formatting
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML)
      setContentText(editorRef.current.innerText || "")
    }
  }, [])

  const handleSave = useCallback(() => {
    if (!contentText.trim()) return
    const now = new Date()
    const entry: JournalEntry = {
      id: `entry-${Date.now()}`,
      title: title || "Untitled Entry",
      content: contentText,
      type,
      date: "Today",
      dateISO: todayISO(),
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mood: customMood ? `${customMood.emoji} ${customMood.label}` : mood,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      favorited: false,
      pinned: false,
      createdAt: now.toISOString(),
      images,
      audioRecordings: recordings,
      location: location || undefined,
    }
    onCreated(entry)
    setTitle(""); setContentHtml(""); setContentText(""); setTags(""); setMood(undefined); setCustomMood(null); setType("daily")
    setImages([]); setRecordings([]); setLocation("")
    if (editorRef.current) editorRef.current.innerHTML = ""
    autosave.clear()
    const encouragement = teoEncouragements[Math.floor(Math.random() * teoEncouragements.length)]
    onSaveSuccess(encouragement)
  }, [title, contentText, type, tags, mood, customMood, images, recordings, location, onCreated, autosave, onSaveSuccess])

  const handleCancel = useCallback(() => {
    setTitle(""); setContentHtml(""); setContentText(""); setTags(""); setMood(undefined); setCustomMood(null); setType("daily")
    setImages([]); setRecordings([]); setLocation("")
    if (editorRef.current) editorRef.current.innerHTML = ""
    autosave.clear()
    setIsFocused(false)
  }, [autosave])

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

  const handleGetLocation = useCallback(async () => {
    setLocationLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const address = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
          setLocation(address)
          setLocationLoading(false)
        },
        () => {
          setLocation("Location unavailable")
          setLocationLoading(false)
        }
      )
    } else {
      setLocation("Location unavailable")
      setLocationLoading(false)
    }
  }, [])

  const addRecording = useCallback((recording: AudioRecording) => {
    setRecordings((prev) => [...prev, recording])
  }, [])

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const renameRecording = useCallback((id: string, name: string) => {
    setRecordings((prev) => prev.map((r) => r.id === id ? { ...r, name } : r))
  }, [])

  const selectedMood = customMood || moods.find((m) => m.emoji === mood)

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
        {/* Title + Focus Button row */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Give your thoughts a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !contentText && setIsFocused(false)}
            className="flex-1 border-0 bg-transparent text-xl font-semibold focus:outline-none placeholder:text-muted-foreground/30 pb-3 border-b border-border/40"
          />
          <button
            className="h-9 w-9 rounded-full text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 mb-2"
            style={{ backgroundColor: "var(--brand-primary)" }}
            onClick={() => setFocusMode(true)}
            title="Focus Mode"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Rich text editor */}
        <RichTextEditor
          initialContent={contentHtml}
          placeholder={currentPrompt}
          onContentChange={handleContentChange}
          editorRef={editorRef}
        />

        {/* Teo AI Panel */}
        <AnimatePresence>
          {teoOpen && (
            <TeoPanel
              onInsert={(text) => {
                if (editorRef.current) {
                  editorRef.current.focus()
                  document.execCommand("insertHTML", false, `<p>${text}</p>`)
                  setContentHtml(editorRef.current.innerHTML)
                  setContentText(editorRef.current.innerText || "")
                }
              }}
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

        {/* Voice Recordings */}
        <VoiceRecorder
          recordings={recordings}
          onAdd={addRecording}
          onDelete={deleteRecording}
          onRename={renameRecording}
        />

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
        <FormattingToolbar onFormat={handleFormat} activeFormats={activeFormats} />

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

          {/* Mood Picker (WhatsApp-style) */}
          <div ref={moodRef}>
            <MoodPicker
              selectedMood={mood}
              onSelectMood={(emoji) => { setMood(emoji); setCustomMood(null) }}
              onCreateCustom={(emoji, label) => { setCustomMood({ emoji, label }); setMood(undefined) }}
              customMood={customMood}
              open={moodOpen}
              onOpenChange={setMoodOpen}
            />
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
          <div className="flex items-center gap-2">
            <Tooltip label="Ask Teo">
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                onClick={() => setTeoOpen(!teoOpen)}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip label="Camera">
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip label="Microphone">
              <button
                className="h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                onClick={async () => {
                  // Start recording or handle mic
                  if (recordings.length === 0) {
                    // Trigger voice recorder button
                    const micBtn = document.querySelector("[data-voice-recorder-trigger]") as HTMLButtonElement
                    micBtn?.click()
                  }
                }}
              >
                <Mic className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip label="Location">
              <button
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${locationLoading ? "animate-pulse" : ""}`}
                style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                onClick={handleGetLocation}
              >
                <MapPinIcon className="h-4 w-4" />
              </button>
            </Tooltip>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              <span className="tabular-nums">{wordCount} words</span>
              <span className="text-muted-foreground/40">\u00B7</span>
              <span className="tabular-nums">{paraCount} paragraphs</span>
              <span className="text-muted-foreground/40">\u00B7</span>
              <span className="tabular-nums">{voiceCount} {voiceCount === 1 ? "voice note" : "voice notes"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1.5 glow" onClick={handleSave} disabled={!contentText.trim()}>
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
      {focusMode ? (
        <FocusModeOverlay onExit={() => setFocusMode(false)}>
          {editorContent}
        </FocusModeOverlay>
      ) : editorContent}
    </>
  )
}

/* ────────────────────────────────────────────────────── */
/* Entry Reader                                          */
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
                <button onClick={() => { onDuplicate(); setMenuOpen(false) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </button>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Download className="h-3.5 w-3.5" /> Export PDF
                </button>
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <div className="h-px bg-border my-1" />
                <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left" onClick={() => { onDelete(); setMenuOpen(false) }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <article className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.accent, color: cfg.color }}>
            {cfg.label}
          </span>
          {entry.pinned && (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">Pinned</span>
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

  const draftAutosave = useAutosave("intenteo-journal-draft", 2000)

  const streak = useMemo(() => {
    const today = entries.filter((e) => e.dateISO === todayISO()).length
    return today > 0 ? 18 : 17
  }, [entries])

  const greeting = useMemo(() => journalGreetings[Math.floor(Math.random() * journalGreetings.length)], [])

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
              <p className="text-sm text-muted-foreground mt-1">{greeting}</p>
            </div>
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
