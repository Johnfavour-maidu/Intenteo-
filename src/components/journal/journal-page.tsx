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
  Palette,
  Highlighter,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ChevronDown,
  Maximize2,
  Minimize2,
  Type,
  Image as ImageIcon,
  MapPin as MapPinIcon,
  Play,
  Pause,
  Globe,
  RotateCcw,
  Volume2,
  StopCircle,
  PlusCircle,
  Pencil,
  Search,
  Circle,
  Grid3X3,
} from "lucide-react"


const EMOJI_CATEGORIES = [
  { name: "Smileys", emojis: ["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥"] },
  { name: "Gestures", emojis: ["👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤝","🙏"] },
  { name: "Hearts", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝"] },
  { name: "Nature", emojis: ["🌸","🌺","🌻","🌹","🌷","🌱","🌿","🍀","🍃","🍂","🍁","🌾","🌵","🌴","🌳","🌲","⛰️","🏔️","🌊","🔥"] },
  { name: "Activities", emojis: ["🎯","🎨","🎭","🎪","🎬","🎤","🎧","🎵","🎶","🎹","🥁","🎷","🎺","🎸","🎳","⚽","🏀","🎾","🏈"] },
  { name: "Symbols", emojis: ["✨","⭐","🌟","💫","🔥","💥","❄️","🌈","☀️","🌙","💡","🎯","🏁","🚩","💬","💭","❤️","💯","🎉","🎊"] },
]



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
  reflection: { label: "Reflection", icon: <Lightbulb className="h-3.5 w-3.5" />, color: "#7C3AED", accent: "#EDE9FE", prompt: "What challenged you today, and what did you learn?" },
  gratitude: { label: "Gratitude", icon: <Heart className="h-3.5 w-3.5" />, color: "#EC4899", accent: "#FCE7F3", prompt: "What are you grateful for today?" },
  decision: { label: "Decision Journal", icon: <Brain className="h-3.5 w-3.5" />, color: "var(--brand-primary)", accent: "#E0E7FF", prompt: "What important decision are you thinking about?" },
  dream: { label: "Dream Journal", icon: <Sparkles className="h-3.5 w-3.5" />, color: "#A855F7", accent: "#F3E8FF", prompt: "What dream or vision do you want to remember?" },
  prayer: { label: "Prayer Journal", icon: <Heart className="h-3.5 w-3.5" />, color: "#14B8A6", accent: "#CCFBF1", prompt: "What have you been praying about?" },
  legacy: { label: "Legacy Journal", icon: <BookOpen className="h-3.5 w-3.5" />, color: "#16A34A", accent: "#D1FAE5", prompt: "What do you want to leave behind?" },
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

const TEXT_COLOURS = [
  { name: "Black", value: "#000000" },
  { name: "Dark Grey", value: "#4B5563" },
  { name: "Light Grey", value: "#9CA3AF" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#DC2626" },
  { name: "Orange", value: "#EA580C" },
  { name: "Yellow", value: "#CA8A04" },
  { name: "Green", value: "#16A34A" },
  { name: "Teal", value: "#0D9488" },
  { name: "Blue", value: "#2563EB" },
  { name: "Indigo", value: "#1E0E6B" },
  { name: "Purple", value: "#7C3AED" },
  { name: "Brown", value: "#92400E" },
]

const HIGHLIGHT_COLOURS = [
  { name: "Yellow", value: "#FEF3C7" },
  { name: "Green", value: "#D1FAE5" },
  { name: "Cyan", value: "#CFFAFE" },
  { name: "Pink", value: "#FCE7F3" },
  { name: "Orange", value: "#FFEDD5" },
  { name: "Purple", value: "#EDE9FE" },
  { name: "Grey", value: "#F1F5F9" },
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


function textToEditorHtml(text: string): string {
  if (!text) return ""
  return text.split("\n").map((line) => {
    if (!line.trim()) return "<p><br></p>"
    return `<p>${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`
  }).join("")
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
/* Calendar + List Panel (replaces DayDrawer)            */
/* ────────────────────────────────────────────────────── */

function CalendarListPanel({
  entries,
  onSelectEntry,
  onDeleteEntry,
  onToggleFavorite,
  onTogglePin,
  onDuplicateEntry,
}: {
  entries: JournalEntry[]
  onSelectEntry: (entry: JournalEntry) => void
  onDeleteEntry: (id: string) => void
  onToggleFavorite: (id: string) => void
  onTogglePin: (id: string) => void
  onDuplicateEntry: (entry: JournalEntry) => void
}) {
  const [tab, setTab] = useState<"calendar" | "list">("calendar")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const handler = () => setOpenMenuId(null)
    if (openMenuId) { window.addEventListener("click", handler); return () => window.removeEventListener("click", handler) }
  }, [openMenuId])

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries
    const q = searchQuery.toLowerCase()
    return entries.filter((e) =>
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      (e.mood && e.mood.toLowerCase().includes(q)) ||
      journalTypeConfig[e.type].label.toLowerCase().includes(q)
    )
  }, [entries, searchQuery])

  const dayEntries = useMemo(() => {
    return filteredEntries
      .filter((e) => e.dateISO === selectedDate)
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt.localeCompare(a.createdAt))
  }, [filteredEntries, selectedDate])

  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [filteredEntries])

  const entryDates = useMemo(() => {
    const map: Record<string, boolean> = {}
    filteredEntries.forEach((e) => { map[e.dateISO] = true })
    return map
  }, [filteredEntries])

  const today = todayISO()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const days = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [firstDayOfWeek, daysInMonth])

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }, [viewMonth])

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }, [viewMonth])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden mb-6"
    >
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries by title, content, tags, mood, or category..."
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 pt-3">
          <button
            onClick={() => setTab("calendar")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === "calendar" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 inline mr-1.5" />
            Calendar
          </button>
          <button
            onClick={() => setTab("list")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            <List className="h-3.5 w-3.5 inline mr-1.5" />
            List
          </button>
          <span className="ml-auto text-[11px] text-muted-foreground">
            {filteredEntries.length} {filteredEntries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="p-3">
          {tab === "calendar" ? (
            <div className="grid grid-cols-1 md:grid-cols-[1fr,280px] gap-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                  <div className="flex items-center gap-1">
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
                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
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
                        onClick={() => setSelectedDate(iso)}
                        className={`relative flex flex-col items-center justify-center h-9 rounded-lg text-xs transition-all duration-150 ${
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                            : isToday
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted/60"
                        }`}
                      >
                        {day}
                        {hasEntry && <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">{formatDateLong(selectedDate)}</p>
                {dayEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 py-4 text-center">No entries for this day.</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {dayEntries.map((entry) => {
                      const cfg = journalTypeConfig[entry.type]
                      return (
                        <button
                          key={entry.id}
                          onClick={() => onSelectEntry(entry)}
                          className="w-full text-left p-2.5 rounded-xl border border-border/50 bg-background hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {entry.pinned && <Pin className="h-3 w-3 text-primary fill-primary shrink-0" />}
                            <span className="text-xs font-semibold truncate">{entry.title}</span>
                            {entry.favorited && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span className="font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                            <span>·</span>
                            <span>{entry.time}</span>
                            {entry.mood && <><span>·</span><span>{entry.mood}</span></>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sortedEntries.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 py-8 text-center">
                  {searchQuery ? "No entries match your search." : "No entries yet."}
                </p>
              ) : (
                sortedEntries.map((entry) => {
                  const cfg = journalTypeConfig[entry.type]
                  return (
                    <div key={entry.id} className="group relative">
                      <button
                        onClick={() => onSelectEntry(entry)}
                        className="w-full text-left p-3 rounded-xl border border-border/50 bg-background hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {entry.pinned && <Pin className="h-3 w-3 text-primary fill-primary shrink-0" />}
                          <span className="text-sm font-semibold truncate">{entry.title}</span>
                          {entry.favorited && <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
                          <span className="font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                          <span>·</span>
                          <span>{entry.date} at {entry.time}</span>
                          {entry.mood && <><span>·</span><span>{entry.mood}</span></>}
                          <span>·</span>
                          <span>{estimateReadTime(entry.content)} min read</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">{entry.content}</p>
                        {entry.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            {entry.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        )}
                      </button>
                      <div className="absolute right-2 top-2">
                        <div className="relative">
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
                                className="absolute right-0 top-full mt-1 w-40 rounded-xl border bg-background shadow-xl p-1 z-20"
                              >
                                <button onClick={() => { onDuplicateEntry(entry); setOpenMenuId(null) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                                  <Copy className="h-3 w-3" /> Duplicate
                                </button>
                                <button onClick={() => { onToggleFavorite(entry.id); setOpenMenuId(null) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                                  <Star className="h-3 w-3" /> {entry.favorited ? "Unstar" : "Star"}
                                </button>
                                <button onClick={() => { onTogglePin(entry.id); setOpenMenuId(null) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left">
                                  <Pin className="h-3 w-3" /> {entry.pinned ? "Unpin" : "Pin"}
                                </button>
                                <div className="h-px bg-border my-1" />
                                <button onClick={() => { onDeleteEntry(entry.id); setOpenMenuId(null) }} className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left">
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Starred Panel                                         */
/* ────────────────────────────────────────────────────── */

function StarredPanel({
  entries,
  onSelectEntry,
  onClose,
}: {
  entries: JournalEntry[]
  onSelectEntry: (entry: JournalEntry) => void
  onClose: () => void
}) {
  const starred = useMemo(() => entries.filter((e) => e.favorited).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [entries])

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
        className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] z-50 bg-background border-l shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-semibold">Starred Entries</h2>
            <span className="text-[11px] text-muted-foreground">({starred.length})</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {starred.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="h-14 w-14 rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
                <Star className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-1">No starred entries yet.</p>
              <p className="text-xs text-muted-foreground/60">Star your favourite entries to find them quickly.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {starred.map((entry) => {
                const cfg = journalTypeConfig[entry.type]
                return (
                  <button
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    className="w-full text-left p-3 rounded-xl border border-border/50 bg-card hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {entry.pinned && <Pin className="h-3 w-3 text-primary fill-primary shrink-0" />}
                      <span className="text-sm font-semibold truncate">{entry.title}</span>
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
                      <span className="font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span>·</span>
                      <span>{entry.date}</span>
                      {entry.mood && <><span>·</span><span>{entry.mood}</span></>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{entry.content}</p>
                  </button>
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
/* Teo AI Writing Assistant (Fully Functional)           */
/* ────────────────────────────────────────────────────── */

function TeoPanel({ contentText, onInsert, onClose }: { contentText: string; onInsert: (text: string) => void; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"writing" | "reflection" | "summary" | "insights">("writing")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")

  const hasContent = contentText.trim().length > 10

  const fillerWords = ["very", "really", "quite", "just", "actually", "basically", "literally", "honestly", "totally", "absolutely", "definitely", "certainly", "probably", "possibly", "somewhat", "rather", "fairly", "pretty much", "kind of", "sort of", "in order to", "due to the fact", "at this point in time", "for the purpose of"]

  const synonyms: Record<string, string[]> = {
    good: ["excellent", "remarkable", "noteworthy", "impressive", "outstanding"],
    bad: ["challenging", "difficult", "concerning", "unfortunate", "problematic"],
    big: ["significant", "substantial", "considerable", "major", "enormous"],
    happy: ["joyful", "delighted", "content", "pleased", "thrilled"],
    sad: ["melancholy", "downcast", "sorrowful", "disheartened", "gloomy"],
    think: ["believe", "consider", "reflect", "ponder", "contemplate"],
    make: ["create", "build", "construct", "develop", "establish"],
    help: ["assist", "support", "facilitate", "enable", "empower"],
    important: ["essential", "crucial", "vital", "significant", "paramount"],
    interesting: ["fascinating", "compelling", "engaging", "captivating", "intriguing"],
    nice: ["wonderful", "lovely", "delightful", "pleasant", "charming"],
    thing: ["aspect", "element", "factor", "component", "detail"],
    way: ["approach", "method", "strategy", "technique", "process"],
    problem: ["challenge", "obstacle", "issue", "difficulty", "concern"],
    feel: ["sense", "experience", "perceive", "recognize", "observe"],
    want: ["desire", "aspire", "seek", "wish for", "long for"],
    need: ["require", "demand", "necessitate", "call for"],
    start: ["begin", "commence", "initiate", "launch", "embark"],
    show: ["demonstrate", "illustrate", "reveal", "display", "exhibit"],
  }

  const processText = useCallback((action: string) => {
    setLoading(true)
    setResult("")
    setTimeout(() => {
      const text = contentText.trim()
      let output = ""

      switch (action) {
        case "continueWriting": {
          const sentences = text.split(/[.!?]+/).filter((s) => s.trim())
          const lastSentence = sentences[sentences.length - 1] || ""
          const words = lastSentence.trim().split(/\s+/)
          const keywords = words.filter((w) => w.length > 4).slice(-3)
          const starters = [
            `Building on this, I notice that ${keywords[0] || "this idea"} connects deeply with my broader experience.`,
            `This reminds me of a time when ${keywords[0] || "I faced something similar"}. It taught me the value of patience.`,
            `Taking a step back, I can see how ${keywords[1] || "this situation"} reflects a pattern in my life.`,
            `What strikes me most is how ${keywords[0] || "this moment"} aligns with what I have been learning recently.`,
            `I am starting to realise that ${keywords[2] || "this experience"} is part of a larger journey.`,
          ]
          output = starters[Math.floor(Math.random() * starters.length)]
          break
        }
        case "rewrite": {
          const sentences = text.split(/(?<=[.!?])\s+/)
          const rewritten = sentences.map((s) => {
            let result = s
            Object.keys(synonyms).forEach((word) => {
              const regex = new RegExp(`\\b${word}\\b`, "gi")
              if (regex.test(result)) {
                const syns = synonyms[word]
                result = result.replace(regex, syns[Math.floor(Math.random() * syns.length)])
              }
            })
            return result
          })
          output = rewritten.join(" ")
          break
        }
        case "improveClarity": {
          const sentences = text.split(/(?<=[.!?])\s+/)
          const improved = sentences.map((s) => {
            let result = s.trim()
            result = result.replace(/\b(very|really|quite|just|actually|basically)\b/gi, "")
            result = result.replace(/\s{2,}/g, " ").trim()
            if (result.length > 0) result = result.charAt(0).toUpperCase() + result.slice(1)
            return result
          }).filter(Boolean)
          output = improved.join(" ")
          break
        }
        case "shorten": {
          let result = text
          fillerWords.forEach((fw) => {
            const regex = new RegExp(`\\b${fw}\\b`, "gi")
            result = result.replace(regex, "")
          })
          result = result.replace(/\s{2,}/g, " ").trim()
          output = result
          break
        }
        case "expand": {
          const sentences = text.split(/(?<=[.!?])\s+/)
          const additions = [
            "This is worth exploring further because it touches on something fundamental.",
            "In my experience, this connects to a broader pattern of growth.",
            "I believe this deserves more reflection in the days ahead.",
          ]
          const expanded = sentences.flatMap((s, i) => {
            return [s, ...(i < sentences.length - 1 && Math.random() > 0.5 ? [additions[i % additions.length]] : [])]
          })
          output = expanded.join(" ")
          break
        }
        case "simplify": {
          const complexWords: Record<string, string> = {
            subsequently: "then", nevertheless: "but", furthermore: "and", approximately: "about",
            demonstrate: "show", facilitate: "help", commence: "start", terminate: "end",
            utilise: "use", purchase: "buy", inquire: "ask", regarding: "about",
            endeavour: "try", necessitate: "require", acknowledge: "admit", anticipate: "expect",
            aforementioned: "this", consequently: "so",
          }
          let result = text
          Object.entries(complexWords).forEach(([complex, simple]) => {
            const regex = new RegExp(`\\b${complex}\\b`, "gi")
            result = result.replace(regex, simple)
          })
          output = result
          break
        }
        case "professionalTone": {
          let result = text
          const replacements: [RegExp, string][] = [
            [/\b(gonna|want to|wanna)\b/gi, "intend to"],
            [/\b( gotta | got to )\b/gi, " need to "],
            [/\b(thing|stuff)\b/gi, "element"],
            [/\b(lots of)\b/gi, "numerous"],
            [/\b(kinda|kind of)\b/gi, "somewhat"],
            [/\b(pretty good)\b/gi, "satisfactory"],
            [/\b(big)\b/gi, "significant"],
            [/\b(small)\b/gi, "minor"],
            [/\b(get better)\b/gi, "improve"],
            [/\b(figure out)\b/gi, "determine"],
          ]
          replacements.forEach(([pattern, replacement]) => {
            result = result.replace(pattern, replacement)
          })
          if (result.length > 0) result = result.charAt(0).toUpperCase() + result.slice(1)
          output = result
          break
        }
        case "friendlyTone": {
          let result = text
          const replacements: [RegExp, string][] = [
            [/\b(therefore)\b/gi, "so"],
            [/\b(furthermore)\b/gi, "also"],
            [/\b(consequently)\b/gi, "as a result"],
            [/\b(nevertheless)\b/gi, "still"],
            [/\b(however)\b/gi, "but"],
            [/\b(it is worth noting)\b/gi, "funnily enough"],
            [/\b(I believe)\b/gi, "I feel"],
            [/\b(in my opinion)\b/gi, "honestly"],
          ]
          replacements.forEach(([pattern, replacement]) => {
            result = result.replace(pattern, replacement)
          })
          output = result
          break
        }
        case "inspirationalTone": {
          const sentences = text.split(/(?<=[.!?])\s+/)
          const boosters = [
            "This is a powerful realization.", "Every step forward matters.",
            "This shows real growth.", "What a meaningful insight.",
            "This is the beginning of something beautiful.",
          ]
          const enhanced = sentences.map((s) => {
            if (Math.random() > 0.6) {
              return s + " " + boosters[Math.floor(Math.random() * boosters.length)]
            }
            return s
          })
          output = enhanced.join(" ")
          break
        }
        case "grammarCorrection": {
          let result = text
          const fixes: [RegExp, string | ((match: string, p1?: string) => string)][] = [
            [/\bi\b/g, "I"],
            [/\bi am\b/gi, "I am"],
            [/\s+/g, " "],
            [/\.\s*([a-z])/g, (_: string, c?: string) => ". " + (c || "").toUpperCase()],
            [/\bi\b(?=\s+(?:am|was|have|had|will|would|could|should|do|did|don|t|can|may|might|must|shall))/g, "I"],
          ]
          fixes.forEach(([pattern, replacement]) => {
            result = result.replace(pattern, replacement as string)
          })
          output = result.trim()
          break
        }
        case "improveFlow": {
          const sentences = text.split(/(?<=[.!?])\s+/)
          const transitions = ["Furthermore, ", "Additionally, ", "Moreover, ", "In addition, ", "Similarly, ", "Likewise, ", "Meanwhile, ", "Indeed, "]
          const improved = sentences.map((s, i) => {
            if (i > 0 && Math.random() > 0.5) {
              return transitions[Math.floor(Math.random() * transitions.length)] + s.charAt(0).toLowerCase() + s.slice(1)
            }
            return s
          })
          output = improved.join(" ")
          break
        }
        case "reflectQuestions": {
          const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
          const themes = [...new Set(words)].slice(0, 5)
          const questions = [
            `What emotions arise when you think about ${themes[0] || "this topic"}?`,
            `How does ${themes[1] || "this experience"} connect to your core values?`,
            `What would you tell a friend going through ${themes[0] || "a similar situation"}?`,
            `What is one thing you would do differently if you could?`,
            `How might this reflect on where you want to be in five years?`,
            `What does ${themes[2] || "this"} teach you about yourself?`,
            `How has your perspective on ${themes[0] || "this matter"} changed over time?`,
          ]
          const selected = questions.sort(() => Math.random() - 0.5).slice(0, 5)
          output = "Reflective Questions:\n\n" + selected.map((q, i) => `${i + 1}. ${q}`).join("\n")
          break
        }
        case "journalPrompts": {
          const prompts = [
            "Describe a moment today that made you feel truly alive.",
            "What is one thing you are learning about yourself this week?",
            "Write about a challenge you are currently facing and what it is teaching you.",
            "If your future self could give you one piece of advice, what would it be?",
            "What does your ideal day look like, and how close is today to it?",
            "Write a letter to your younger self about what matters most.",
            "What are three things that went well today, and why?",
            "Describe the person you are becoming.",
            "What would you do if you knew you could not fail?",
            "What is the most important lesson you have learned this month?",
          ]
          const selected = prompts.sort(() => Math.random() - 0.5).slice(0, 5)
          output = "Journal Prompts:\n\n" + selected.map((p, i) => `${i + 1}. ${p}`).join("\n")
          break
        }
        case "gratitudeIdeas": {
          const ideas = [
            "Think of someone who made you smile today. What did they do?",
            "What is a simple pleasure you often take for granted?",
            "Describe a challenge that ultimately helped you grow.",
            "What part of your daily routine are you most grateful for?",
            "Think of a place that brings you peace. Why does it matter to you?",
            "What is a skill or ability you are thankful to have?",
            "Who in your life has shaped you for the better?",
            "What is something beautiful you saw today?",
            "Think of a recent accomplishment, no matter how small.",
            "What opportunity are you grateful to have right now?",
          ]
          output = "Gratitude Prompts:\n\n" + ideas.map((idea, i) => `${i + 1}. ${idea}`).join("\n")
          break
        }
        case "prayerPoints": {
          const themes = text.toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 5)
          const points = [
            `Pray for guidance regarding ${themes[0] || "the decisions ahead of you"}.`,
            "Give thanks for the blessings and growth in your life this week.",
            `Ask for strength and wisdom in dealing with ${themes[1] || "current challenges"}.`,
            "Pray for the people you care about and their well-being.",
            `Seek clarity and peace about ${themes[2] || "your path forward"}.`,
            "Pray for patience and understanding in your relationships.",
            "Ask for the courage to step into new opportunities.",
          ]
          const selected = points.sort(() => Math.random() - 0.5).slice(0, 5)
          output = "Prayer Points:\n\n" + selected.map((p, i) => `${i + 1}. ${p}`).join("\n")
          break
        }
        case "summariseToday": {
          const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)
          const key = sentences.slice(0, 3).map((s) => s.trim()).join(". ")
          output = `Summary of today's entry:\n\n${key}.${sentences.length > 3 ? "\n\nThere are " + sentences.length + " key points in this entry." : ""}`
          break
        }
        case "extractThemes": {
          const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 4)
          const freq: Record<string, number> = {}
          const stopWords = new Set(["about", "their", "there", "would", "could", "should", "being", "these", "those", "other", "which", "where", "while", "during", "before", "after", "again", "every", "often", "never", "always", "since", "still", "going", "knowing", "really", "having", "making", "taking", "coming", "beginning", "something", "anything", "nothing", "everything"])
          words.forEach((w) => { if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1 })
          const themes = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word]) => word.charAt(0).toUpperCase() + word.slice(1))
          output = "Main Themes:\n\n" + themes.map((t, i) => `${i + 1}. ${t}`).join("\n") + "\n\nThese themes appear most frequently in your writing."
          break
        }
        case "detectRecurring": {
          const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 5)
          const freq: Record<string, number> = {}
          words.forEach((w) => { freq[w] = (freq[w] || 0) + 1 })
          const recurring = Object.entries(freq).filter(([_, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 5)
          if (recurring.length === 0) {
            output = "No strongly recurring topics detected in this entry. Try writing more to identify patterns."
          } else {
            output = "Recurring Topics:\n\n" + recurring.map(([word, count], i) => `${i + 1}. "${word.charAt(0).toUpperCase() + word.slice(1)}" (mentioned ${count} times)`).join("\n")
          }
          break
        }
        case "emotionalTrends": {
          const emotionWords: Record<string, string[]> = {
            positive: ["happy", "joyful", "grateful", "excited", "proud", "hopeful", "love", "peace", "calm", "content", "inspired", "motivated", "confident", "strong"],
            negative: ["sad", "angry", "frustrated", "anxious", "worried", "stressed", "lonely", "tired", "confused", "disappointed", "fear", "doubt", "hurt"],
            growth: ["learn", "grow", "improve", "reflect", "realize", "understand", "discover", "develop", "change", "progress", "challenge", "overcome"],
          }
          const lowerText = text.toLowerCase()
          const scores: Record<string, number> = { positive: 0, negative: 0, growth: 0 }
          Object.entries(emotionWords).forEach(([category, words]) => {
            words.forEach((word) => {
              const regex = new RegExp(`\\b${word}\\b`, "gi")
              const matches = lowerText.match(regex)
              if (matches) scores[category] += matches.length
            })
          })
          const total = Math.max(scores.positive + scores.negative + scores.growth, 1)
          output = "Emotional Trends:\n\n"
          output += `Positive emotions: ${Math.round((scores.positive / total) * 100)}%\n`
          output += `Growth & learning: ${Math.round((scores.growth / total) * 100)}%\n`
          output += `Challenging emotions: ${Math.round((scores.negative / total) * 100)}%\n\n`
          if (scores.positive > scores.negative && scores.positive > scores.growth) {
            output += "Your writing reflects a predominantly positive emotional state."
          } else if (scores.growth > scores.positive && scores.growth > scores.negative) {
            output += "Your writing shows strong themes of personal growth and reflection."
          } else if (scores.negative > scores.positive) {
            output += "You are processing some challenging emotions. Remember that this is a normal part of growth."
          } else {
            output += "Your emotional state appears balanced across different areas."
          }
          break
        }
        case "suggestHabits": {
          const lowerText = text.toLowerCase()
          const habits = [
            { trigger: ["morning", "wake", "start", "begin"], habit: "Start a 5-minute morning mindfulness practice before checking your phone." },
            { trigger: ["exercise", "walk", "run", "gym", "active"], habit: "Schedule a 20-minute walk after lunch to boost afternoon energy." },
            { trigger: ["sleep", "rest", "tired", "exhausted"], habit: "Set a consistent bedtime alarm 30 minutes before your target sleep time." },
            { trigger: ["read", "book", "learn", "study"], habit: "Dedicate 15 minutes before bed to reading something inspiring." },
            { trigger: ["grateful", "gratitude", "thankful"], habit: "Write three things you are grateful for each morning." },
            { trigger: ["stress", "anxious", "worry", "overwhelm"], habit: "Practice 4-7-8 breathing when you feel stressed (inhale 4s, hold 7s, exhale 8s)." },
            { trigger: ["goal", "achieve", "plan", "project"], habit: "Review your top 3 priorities each Sunday evening." },
            { trigger: ["connect", "friend", "family", "relationship"], habit: "Send one thoughtful message to someone you care about each day." },
          ]
          const matched = habits.filter((h) => h.trigger.some((t) => lowerText.includes(t))).slice(0, 3)
          if (matched.length === 0) {
            output = "Suggested Habits:\n\n1. Start a daily 5-minute journaling practice.\n2. Take a 10-minute walk each day.\n3. Read for 15 minutes before bed."
          } else {
            output = "Suggested Habits Based on Your Writing:\n\n" + matched.map((h, i) => `${i + 1}. ${h.habit}`).join("\n\n")
          }
          break
        }
        case "suggestGoals": {
          const lowerText = text.toLowerCase()
          const goals = [
            { trigger: ["career", "work", "job", "professional"], goal: "Define your top 3 professional strengths and one area to develop this quarter." },
            { trigger: ["health", "fit", "exercise", "wellness"], goal: "Set a specific fitness goal for the next 30 days and track your progress." },
            { trigger: ["relationship", "friend", "family", "love"], goal: "Schedule one quality connection each week with someone who matters to you." },
            { trigger: ["learn", "skill", "study", "grow"], goal: "Choose one new skill to develop and commit to 20 minutes of practice daily." },
            { trigger: ["creative", "art", "write", "music"], goal: "Block 30 minutes, three times a week, for creative practice." },
            { trigger: ["financial", "money", "save", "invest"], goal: "Set a specific savings target for the next 3 months." },
          ]
          const matched = goals.filter((g) => g.trigger.some((t) => lowerText.includes(t))).slice(0, 3)
          if (matched.length === 0) {
            output = "Suggested Goals:\n\n1. Write down your top 3 values and align one goal to each.\n2. Set a 30-day challenge in an area you want to grow.\n3. Create a weekly reflection routine."
          } else {
            output = "Suggested Goals Based on Your Writing:\n\n" + matched.map((g, i) => `${i + 1}. ${g.goal}`).join("\n\n")
          }
          break
        }
        default:
          output = "I can help you with that. Try selecting a specific action from the menu."
      }

      setResult(output)
      setLoading(false)
    }, 800)
  }, [contentText])

  const tabs = [
    { id: "writing" as const, label: "Writing", icon: <PenLine className="h-3 w-3" /> },
    { id: "reflection" as const, label: "Reflection", icon: <Lightbulb className="h-3 w-3" /> },
    { id: "summary" as const, label: "Summary", icon: <BookOpen className="h-3 w-3" /> },
    { id: "insights" as const, label: "Insights", icon: <Brain className="h-3 w-3" /> },
  ]

  const writingActions = [
    { label: "Continue Writing", action: "continueWriting", icon: "✍️" },
    { label: "Rewrite", action: "rewrite", icon: "🔄" },
    { label: "Improve Clarity", action: "improveClarity", icon: "💎" },
    { label: "Shorten", action: "shorten", icon: "✂️" },
    { label: "Expand", action: "expand", icon: "📐" },
    { label: "Simplify", action: "simplify", icon: "✨" },
    { label: "Professional Tone", action: "professionalTone", icon: "💼" },
    { label: "Friendly Tone", action: "friendlyTone", icon: "😊" },
    { label: "Inspirational", action: "inspirationalTone", icon: "🌟" },
    { label: "Fix Grammar", action: "grammarCorrection", icon: "📝" },
    { label: "Improve Flow", action: "improveFlow", icon: "🌊" },
  ]

  const reflectionActions = [
    { label: "Reflective Questions", action: "reflectQuestions", icon: "🤔" },
    { label: "Journal Prompts", action: "journalPrompts", icon: "📓" },
    { label: "Gratitude Ideas", action: "gratitudeIdeas", icon: "🙏" },
    { label: "Prayer Points", action: "prayerPoints", icon: "🙏" },
  ]

  const summaryActions = [
    { label: "Summarise Today", action: "summariseToday", icon: "📊" },
    { label: "Extract Themes", action: "extractThemes", icon: "🏷️" },
    { label: "Recurring Topics", action: "detectRecurring", icon: "🔄" },
    { label: "Emotional Trends", action: "emotionalTrends", icon: "💭" },
  ]

  const insightActions = [
    { label: "Suggest Habits", action: "suggestHabits", icon: "🎯" },
    { label: "Suggest Goals", action: "suggestGoals", icon: "🏆" },
  ]

  const getActions = () => {
    switch (activeTab) {
      case "writing": return writingActions
      case "reflection": return reflectionActions
      case "summary": return summaryActions
      case "insights": return insightActions
    }
  }

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

      <div className="flex items-center gap-1 mb-3 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setResult("") }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {!hasContent && (activeTab === "writing" || activeTab === "summary") && (
        <p className="text-xs text-muted-foreground/60 py-2 text-center">
          Write some journal content first to use {activeTab === "writing" ? "writing" : "summary"} features.
        </p>
      )}

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {getActions().map((a) => (
          <button
            key={a.action}
            onClick={() => processText(a.action)}
            disabled={activeTab !== "reflection" && !hasContent}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs hover:bg-muted transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Teo is thinking...</span>
        </div>
      )}

      {result && !loading && (
        <div className="p-3 rounded-lg bg-muted/30 text-sm text-foreground mb-3 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
          {result}
        </div>
      )}

      {result && !loading && (
        <div className="flex items-center gap-2 mb-3">
          <Button size="sm" className="h-7 text-xs gap-1" onClick={() => onInsert(result)}>
            <Plus className="h-3 w-3" /> Insert into Journal
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setResult("")}>
            Clear
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Ask Teo anything about your writing..."
          className="text-xs h-8"
          onKeyDown={(e) => {
            if (e.key === "Enter" && customPrompt.trim()) {
              setLoading(true)
              setResult("")
              const prompt = customPrompt
              setCustomPrompt("")
              setTimeout(() => {
                const lowerPrompt = prompt.toLowerCase()
                let response = ""
                if (lowerPrompt.includes("continue") || lowerPrompt.includes("next")) {
                  processText("continueWriting")
                  return
                } else if (lowerPrompt.includes("rewrite") || lowerPrompt.includes("rephrase")) {
                  processText("rewrite")
                  return
                } else if (lowerPrompt.includes("summarise") || lowerPrompt.includes("summary")) {
                  processText("summariseToday")
                  return
                } else if (lowerPrompt.includes("question") || lowerPrompt.includes("reflect")) {
                  processText("reflectQuestions")
                  return
                } else if (lowerPrompt.includes("prompt")) {
                  processText("journalPrompts")
                  return
                } else if (lowerPrompt.includes("gratitude") || lowerPrompt.includes("grateful")) {
                  processText("gratitudeIdeas")
                  return
                } else if (lowerPrompt.includes("prayer") || lowerPrompt.includes("pray")) {
                  processText("prayerPoints")
                  return
                } else if (lowerPrompt.includes("habit")) {
                  processText("suggestHabits")
                  return
                } else if (lowerPrompt.includes("goal")) {
                  processText("suggestGoals")
                  return
                } else if (lowerPrompt.includes("theme")) {
                  processText("extractThemes")
                  return
                } else if (lowerPrompt.includes("emotion") || lowerPrompt.includes("mood")) {
                  processText("emotionalTrends")
                  return
                } else {
                  response = `Based on your question about "${prompt}", here are some thoughts:\n\nYour journal entry reflects thoughtful reflection. Consider exploring this topic further by asking yourself what this means to you personally, how it connects to your values, and what actions you might take as a result.`
                }
                setResult(response)
                setLoading(false)
              }, 1200)
            }
          }}
        />
        <Button size="sm" className="h-8 text-xs" onClick={() => {
          if (customPrompt.trim()) {
            setLoading(true)
            setResult("")
            const prompt = customPrompt
            setCustomPrompt("")
            setTimeout(() => {
              setResult(`Here is my response to "${prompt}":\n\nYour writing shows genuine self-awareness. The thoughts you have shared reveal someone who is actively growing and reflecting on their experiences. Keep nurturing this practice - it is a powerful tool for personal development.`)
              setLoading(false)
            }, 1200)
          }
        }}>
          Ask
        </Button>
      </div>
    </motion.div>
  )
}


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
        <Tooltip label={isRecording ? "Stop Recording" : "Voice Notes"}>
          <button
            className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${isRecording ? "animate-pulse" : ""}`}
            style={{ backgroundColor: isRecording ? "#DC2626" : "var(--brand-primary)", color: "white" }}
            onClick={toggleRecording}
          >
            {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
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

type FontSize = "12" | "14" | "16" | "18" | "24" | "32"
type FontFamily = "Calibri" | "Arial" | "Times New Roman" | "Georgia" | "Verdana" | "Courier New"

interface FormattingToolbarProps {
  onToggleBold?: () => void
  onToggleItalic?: () => void
  onToggleUnderline?: () => void
  onToggleStrikethrough?: () => void
  onAlignLeft?: () => void
  onAlignCenter?: () => void
  onAlignRight?: () => void
  onInsertUnorderedList?: () => void
  onInsertOrderedList?: () => void
  onInsertBlockquote?: () => void
  onInsertHorizontalRule?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onTextColour?: (colour: string) => void
  onHighlight?: (colour: string) => void
  onFontSizeChange?: (size: FontSize) => void
  onFontFamilyChange?: (family: FontFamily) => void
  currentFontSize?: FontSize
  currentFontFamily?: FontFamily
}

const FONT_SIZES: FontSize[] = ["12", "14", "16", "18", "24", "32"]
const FONT_FAMILIES: FontFamily[] = ["Calibri", "Arial", "Times New Roman", "Georgia", "Verdana", "Courier New"]

function ToolbarButton({ icon, onClick, active, tooltip }: { icon: React.ReactNode; onClick: () => void; active?: boolean; tooltip?: string }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`inline-flex items-center justify-center w-8 h-8 rounded transition-all duration-150 ${
        active
          ? "bg-violet-100 text-violet-700 shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {icon}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-slate-200 mx-1" />
}

function DropdownButton({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
      >
        <span className="truncate max-w-[60px]">{value || label}</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-violet-50 transition-colors ${
                  opt === value ? "bg-violet-50 text-violet-700 font-medium" : "text-slate-700"
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FormattingToolbar({
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikethrough,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onInsertUnorderedList,
  onInsertOrderedList,
  onInsertBlockquote,
  onInsertHorizontalRule,
  onUndo,
  onRedo,
  onFontSizeChange,
  onFontFamilyChange,
  onTextColour,
  onHighlight,
  currentFontSize = "14",
  currentFontFamily = "Calibri",
}: FormattingToolbarProps) {
  const [textColourOpen, setTextColourOpen] = useState(false)
  const [highlightOpen, setHighlightOpen] = useState(false)
  const textColourRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (textColourRef.current && !textColourRef.current.contains(t)) setTextColourOpen(false)
      if (highlightRef.current && !highlightRef.current.contains(t)) setHighlightOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div className="flex items-center flex-wrap gap-0.5 py-2 border-t border-border/40">
      <DropdownButton
        label="Font"
        options={FONT_FAMILIES}
        value={currentFontFamily}
        onChange={(v) => onFontFamilyChange?.(v as FontFamily)}
      />
      <DropdownButton
        label="Size"
        options={FONT_SIZES}
        value={currentFontSize}
        onChange={(v) => onFontSizeChange?.(v as FontSize)}
      />
      <Divider />
      <ToolbarButton icon={<Bold className="h-4 w-4" />} onClick={onToggleBold || (() => {})} tooltip="Bold" />
      <ToolbarButton icon={<Italic className="h-4 w-4" />} onClick={onToggleItalic || (() => {})} tooltip="Italic" />
      <ToolbarButton icon={<Underline className="h-4 w-4" />} onClick={onToggleUnderline || (() => {})} tooltip="Underline" />
      <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} onClick={onToggleStrikethrough || (() => {})} tooltip="Strikethrough" />
      <Divider />
      <ToolbarButton icon={<AlignLeft className="h-4 w-4" />} onClick={onAlignLeft || (() => {})} tooltip="Align Left" />
      <ToolbarButton icon={<AlignCenter className="h-4 w-4" />} onClick={onAlignCenter || (() => {})} tooltip="Align Center" />
      <ToolbarButton icon={<AlignRight className="h-4 w-4" />} onClick={onAlignRight || (() => {})} tooltip="Align Right" />
      <Divider />
      <ToolbarButton icon={<List className="h-4 w-4" />} onClick={onInsertUnorderedList || (() => {})} tooltip="Bullet List" />
      <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} onClick={onInsertOrderedList || (() => {})} tooltip="Numbered List" />
      <ToolbarButton icon={<Quote className="h-4 w-4" />} onClick={onInsertBlockquote || (() => {})} tooltip="Quote" />
      <Divider />

      {/* Text Colour */}
      <div className="relative" ref={textColourRef}>
        <Tooltip label="Text Colour">
          <button
            onClick={() => { setTextColourOpen(!textColourOpen); setHighlightOpen(false) }}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
          >
            <Palette className="h-4 w-4" />
          </button>
        </Tooltip>
        <AnimatePresence>
          {textColourOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute left-0 top-full mt-1 w-44 rounded-xl border bg-background shadow-xl p-2 z-50"
            >
              <div className="grid grid-cols-4 gap-1">
                {TEXT_COLOURS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { onTextColour?.(c.value); setTextColourOpen(false) }}
                    title={c.name}
                    className="h-7 w-7 rounded-md border flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                  >
                    {c.name === "White" && <div className="h-3 w-3 rounded-sm border border-gray-300" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { onTextColour?.("inherit"); setTextColourOpen(false) }}
                className="w-full text-[10px] text-muted-foreground hover:text-foreground mt-1 py-1"
              >
                Reset to default
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Highlight Colour */}
      <div className="relative" ref={highlightRef}>
        <Tooltip label="Highlight">
          <button
            onClick={() => { setHighlightOpen(!highlightOpen); setTextColourOpen(false) }}
            className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors"
          >
            <Highlighter className="h-4 w-4" />
          </button>
        </Tooltip>
        <AnimatePresence>
          {highlightOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              className="absolute left-0 top-full mt-1 w-36 rounded-xl border bg-background shadow-xl p-2 z-50"
            >
              <div className="grid grid-cols-4 gap-1">
                {HIGHLIGHT_COLOURS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => { onHighlight?.(c.value); setHighlightOpen(false) }}
                    title={c.name}
                    className="h-7 w-7 rounded-md border border-border/30 flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <button
                onClick={() => { onHighlight?.("transparent"); setHighlightOpen(false) }}
                className="w-full text-[10px] text-muted-foreground hover:text-foreground mt-1 py-1"
              >
                Remove highlight
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Divider />
      <ToolbarButton icon={<Undo2 className="h-4 w-4" />} onClick={onUndo || (() => {})} tooltip="Undo" />
      <ToolbarButton icon={<Redo2 className="h-4 w-4" />} onClick={onRedo || (() => {})} tooltip="Redo" />
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Mood Picker (WhatsApp-style + Emoji Picker)           */
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
  const [customEmoji, setCustomEmoji] = useState("😊")
  const [customLabel, setCustomLabel] = useState("")
  const [emojiCategory, setEmojiCategory] = useState("Smileys")
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [openUpward, setOpenUpward] = useState(false)

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setOpenUpward(spaceBelow < 380)
    }
  }, [open])

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

  const currentEmojiCategoryEmojis = useMemo(() => {
    const cat = EMOJI_CATEGORIES.find((c) => c.name === emojiCategory)
    return cat ? cat.emojis : []
  }, [emojiCategory])

  const selectedMoodObj = useMemo(() => {
    if (customMood) return null
    return moods.find((m) => m.emoji === selectedMood)
  }, [selectedMood, customMood])

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => onOpenChange(!open)}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border bg-muted/30 text-foreground hover:bg-muted/50 transition-colors"
      >
        {customMood ? (
          <span>{customMood.emoji} {customMood.label}</span>
        ) : selectedMoodObj ? (
          <span>{selectedMoodObj.emoji} {selectedMoodObj.label}</span>
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
            className={`absolute left-0 rounded-xl border bg-background shadow-xl z-50 overflow-hidden ${openUpward ? "bottom-full mb-1" : "top-full mt-1"}`}
            style={{ width: 360 }}
          >
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

            <div className="max-h-[280px] overflow-y-auto p-2">
              {Object.keys(categories).length === 0 ? (
                <div className="text-center py-4 text-xs text-muted-foreground">No moods found</div>
              ) : (
                allCategories.map((cat) => {
                  const catMoods = categories[cat]
                  if (!catMoods || catMoods.length === 0) return null
                  return (
                    <div key={cat} className="mb-2">
                      <div className="px-1 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{cat}</div>
                      <div className="grid grid-cols-9 gap-0.5">
                        {catMoods.map((m) => (
                          <button
                            key={`${m.emoji}-${m.label}`}
                            onClick={() => { onSelectMood(m.emoji); onOpenChange(false); setSearch("") }}
                            title={m.label}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg text-lg transition-all hover:bg-muted hover:scale-110 ${
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
                    <div className="relative">
                      <button className="w-10 h-9 text-lg text-center rounded-lg border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary flex items-center justify-center">
                        {customEmoji}
                      </button>
                    </div>
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
                          setCustomEmoji("😊")
                          onOpenChange(false)
                          setSearch("")
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex items-center gap-1 mb-2 overflow-x-auto">
                      {EMOJI_CATEGORIES.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setEmojiCategory(cat.name)}
                          className={`px-2 py-1 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors ${
                            emojiCategory === cat.name ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-9 gap-0.5 max-h-[120px] overflow-y-auto">
                      {currentEmojiCategoryEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setCustomEmoji(emoji)}
                          className={`h-7 w-7 flex items-center justify-center rounded text-base transition-all hover:bg-muted hover:scale-110 ${
                            customEmoji === emoji ? "bg-primary/10 ring-1 ring-primary" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowCustom(false); setCustomLabel(""); setCustomEmoji("😊") }}
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


interface RichTextEditorProps {
  value?: string
  onChange?: (html: string) => void
  placeholder?: string
  maxLength?: number
  spellCheck?: boolean
  className?: string
  style?: React.CSSProperties
}

function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
  maxLength = 50000,
  spellCheck = true,
  className = "",
  style,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [charCount, setCharCount] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [currentFontSize, setCurrentFontSize] = useState<"12" | "14" | "16" | "18" | "24" | "32">("14")
  const [currentFontFamily, setCurrentFontFamily] = useState<"Calibri" | "Arial" | "Times New Roman" | "Georgia" | "Verdana" | "Courier New">("Calibri")

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
      setCharCount(editorRef.current.textContent?.length || 0)
    }
  }, [value])

  const execCmd = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }, [])

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML || ""
    const text = editorRef.current?.textContent || ""
    setCharCount(text.length)
    onChange?.(html)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      execCmd("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;")
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      execCmd("insertHTML", "<br><br>")
    }
  }, [execCmd])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    const lines = text.split("\n")
    const html = lines.map(line => `<p>${line || "<br>"}</p>`).join("")
    execCmd("insertHTML", html)
  }, [execCmd])

  const handleFocus = useCallback(() => setIsFocused(true), [])
  const handleBlur = useCallback(() => setIsFocused(false), [])

  return (
    <div className={`relative ${className}`} style={style}>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="min-h-[120px] focus:outline-none prose prose-slate max-w-none [&_p]:mb-0 [&_p]:mt-0"
        style={{
          fontFamily: currentFontFamily,
          fontSize: `${currentFontSize}px`,
          lineHeight: "28px",
          padding: "0 16px",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          overflowX: "hidden",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
        spellCheck
        lang="en-GB"
        data-gramm="false"
        data-gramm_editor="false"
      />
    </div>
  )
}

function CameraModal({ onClose, onCapture, onChoose }: {
  onClose: () => void
  onCapture: (dataUrl: string) => void
  onChoose: (files: FileList) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      setStream(s)
      setCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = s
        videoRef.current.play()
      }
    } catch {
      cameraInputRef.current?.click()
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
      onCapture(dataUrl)
    }
    stream?.getTracks().forEach((t) => t.stop())
    onClose()
  }, [onCapture, onClose, stream])

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()) }
  }, [stream])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-2xl border shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-sm font-semibold">Add Photo</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          {cameraActive ? (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
              <canvas ref={canvasRef} className="hidden" />
              <button
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full bg-white border-4 border-white/80 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="h-11 w-11 rounded-full bg-red-500" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={startCamera}
                className="flex items-center gap-3 w-full p-3 rounded-xl border hover:bg-muted transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary)", color: "white" }}>
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Take Photo</p>
                  <p className="text-xs text-muted-foreground">Open your device camera</p>
                </div>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 w-full p-3 rounded-xl border hover:bg-muted transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--brand-primary)", color: "white" }}>
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Choose from Device</p>
                  <p className="text-xs text-muted-foreground">Select images from your gallery</p>
                </div>
              </button>
            </>
          )}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onChoose(e.target.files)
            onClose()
          }
        }} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const reader = new FileReader()
            reader.onload = (ev) => { onCapture(ev.target?.result as string); onClose() }
            reader.readAsDataURL(e.target.files[0])
          }
        }} />
      </motion.div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Premium Journal Editor                                */
/* ────────────────────────────────────────────────────── */


/* ────────────────────────────────────────────────────── */
/* Premium Journal Editor (WritingArea)                  */
/* ────────────────────────────────────────────────────── */

function WritingArea({
  editingEntry,
  onCreated,
  onUpdated,
  onCancelEdit,
  autosave,
  pinnedEntries,
  onOpenPinned,
  onSaveSuccess,
}: {
  editingEntry: JournalEntry | null
  onCreated: (entry: JournalEntry) => void
  onUpdated: (entry: JournalEntry) => void
  onCancelEdit: () => void
  autosave: { lastSaved: Date | null; isSaving: boolean; save: (data: unknown) => void; load: () => Record<string, unknown> | null; clear: () => void }
  pinnedEntries: JournalEntry[]
  onOpenPinned: (entry: JournalEntry) => void
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
  const [cameraOpen, setCameraOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentFontSize, setCurrentFontSize] = useState<"12" | "14" | "16" | "18" | "24" | "32">("14")
  const [currentFontFamily, setCurrentFontFamily] = useState<"Calibri" | "Arial" | "Times New Roman" | "Georgia" | "Verdana" | "Courier New">("Calibri")
  const [pageStyle, setPageStyle] = useState<"plain" | "lined">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("intenteo-journal-page-style") as "plain" | "lined") || "plain"
    }
    return "plain"
  })
  const moodRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const writingStartTime = useRef<Date>(new Date())
  const recognitionRef = useRef<unknown>(null)

  const currentPrompt = useMemo(() => journalTypeConfig[type].prompt, [type])

  useEffect(() => {
    localStorage.setItem("intenteo-journal-page-style", pageStyle)
  }, [pageStyle])

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title)
      const html = textToEditorHtml(editingEntry.content)
      setContentHtml(html)
      setContentText(editingEntry.content)
      setType(editingEntry.type)
      setTags(editingEntry.tags.join(", "))
      setMood(editingEntry.mood)
      setImages(editingEntry.images || [])
      setRecordings(editingEntry.audioRecordings || [])
      setLocation(editingEntry.location || "")
      if (editorRef.current) {
        editorRef.current.innerHTML = html
      }
    }
  }, [editingEntry])

  useEffect(() => {
    if (!editingEntry) {
      autosave.save({
        title, contentHtml, contentText, type, tags, mood, customMood,
        images, recordings: recordings.map((r) => ({ ...r, url: "" })), location,
      })
    }
  }, [title, contentHtml, contentText, type, tags, mood, customMood, images, recordings, location, autosave, editingEntry])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moodRef.current && !moodRef.current.contains(e.target as Node)) {
        setMoodOpen(false)
      }
    }
    if (moodOpen) { document.addEventListener("mousedown", handler); return () => document.removeEventListener("mousedown", handler) }
  }, [moodOpen])

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
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); document.execCommand("redo") }
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); document.execCommand("undo") }
        if (e.key === "s") { e.preventDefault(); handleSave() }
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleContentChange = useCallback((html: string) => {
    setContentHtml(html)
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    setContentText(tmp.innerText || "")
  }, [])

  const execFormat = useCallback((command: string, value?: string) => {
    if (editorRef.current) editorRef.current.focus()
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContentHtml(editorRef.current.innerHTML)
      setContentText(editorRef.current.innerText || "")
    }
  }, [])

  const handleSave = useCallback(() => {
    if (!contentText.trim()) return
    const now = new Date()

    if (editingEntry) {
      const updated: JournalEntry = {
        ...editingEntry,
        title: title || "Untitled Entry",
        content: contentText,
        type,
        mood: customMood ? `${customMood.emoji} ${customMood.label}` : mood,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        images,
        audioRecordings: recordings,
        location: location || undefined,
      }
      onUpdated(updated)
      onCancelEdit()
      setTitle(""); setContentHtml(""); setContentText(""); setTags(""); setMood(undefined); setCustomMood(null); setType("daily")
      setImages([]); setRecordings([]); setLocation("")
      if (editorRef.current) editorRef.current.innerHTML = ""
      onSaveSuccess("Entry updated successfully.")
    } else {
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
    }
  }, [title, contentText, type, tags, mood, customMood, images, recordings, location, editingEntry, onCreated, onUpdated, onCancelEdit, autosave, onSaveSuccess])

  const handleCancel = useCallback(() => {
    if (editingEntry) {
      onCancelEdit()
    }
    setTitle(""); setContentHtml(""); setContentText(""); setTags(""); setMood(undefined); setCustomMood(null); setType("daily")
    setImages([]); setRecordings([]); setLocation("")
    if (editorRef.current) editorRef.current.innerHTML = ""
    autosave.clear()
    setIsFocused(false)
  }, [autosave, editingEntry, onCancelEdit])

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

  const toggleListening = useCallback(() => {
    const w = window as unknown as Record<string, unknown>
    const SpeechRecognitionAPI = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    if (isListening && recognitionRef.current) {
      (recognitionRef.current as { stop: () => void }).stop()
      setIsListening(false)
      return
    }

    const recognition = new (SpeechRecognitionAPI as new () => Record<string, unknown>)()
    recognition.lang = "en-GB"
    recognition.continuous = true
    recognition.interimResults = true
    recognitionRef.current = recognition

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }
      let finalTranscript = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) {
          finalTranscript += transcript
        }
      }
      if (finalTranscript && editorRef.current) {
        editorRef.current.focus()
        document.execCommand("insertText", false, finalTranscript)
        setContentHtml(editorRef.current.innerHTML)
        setContentText(editorRef.current.innerText || "")
      }
    }

    recognition.onend = () => { setIsListening(false) }
    recognition.onerror = () => { setIsListening(false) }

    (recognition as { start: () => void }).start()
    setIsListening(true)
  }, [isListening])

  const wordCount = useMemo(() => getWordCount(contentText), [contentText])
  const charCount = useMemo(() => contentText.length, [contentText])
  const voiceCount = recordings.length

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
        {editingEntry && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
            <Pencil className="h-3 w-3 text-primary" />
            <span className="text-primary font-medium">Editing: {editingEntry.title}</span>
            <button onClick={handleCancel} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

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
          <div className="flex items-center gap-1.5 mb-2">
            <Tooltip label="Page Style">
              <div className="flex items-center bg-muted/40 rounded-lg p-0.5">
                {(["plain", "lined"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageStyle(s)}
                    className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors ${
                      pageStyle === s ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "plain" ? "Plain" : "Lined"}
                  </button>
                ))}
              </div>
            </Tooltip>
            <button
              className="h-9 w-9 rounded-full text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 shrink-0"
              style={{ backgroundColor: "var(--brand-primary)" }}
              onClick={() => setFocusMode(true)}
              title="Focus Mode"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className={`rounded-xl transition-all duration-200 ${
            pageStyle === "lined" ? "journal-page-lined" : ""
          }`}
          style={pageStyle === "lined" ? {
            backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, #d1d5db 27px, #d1d5db 28px)",
            backgroundSize: "100% 28px",
            backgroundPosition: "0 0",
            lineHeight: "28px",
          } : undefined}
        >
          <RichTextEditor
            value={contentHtml}
            onChange={handleContentChange}
            placeholder={currentPrompt}
            spellCheck={true}
          />
        </div>

        <AnimatePresence>
          {teoOpen && (
            <TeoPanel
              contentText={contentText}
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

        {location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground py-1">
            <MapPinIcon className="h-3 w-3" />
            <span>{location}</span>
            <button onClick={() => setLocation("")} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {pinnedEntries.length > 0 && (
          <div className="flex items-center gap-2 py-2 overflow-x-auto border-t border-border/30">
            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">Pinned:</span>
            {pinnedEntries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onOpenPinned(entry)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 text-[11px] rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                📌 {entry.title}
              </button>
            ))}
          </div>
        )}

        <FormattingToolbar
          onToggleBold={() => execFormat("bold")}
          onToggleItalic={() => execFormat("italic")}
          onToggleUnderline={() => execFormat("underline")}
          onToggleStrikethrough={() => execFormat("strikeThrough")}
          onAlignLeft={() => execFormat("justifyLeft")}
          onAlignCenter={() => execFormat("justifyCenter")}
          onAlignRight={() => execFormat("justifyRight")}
          onInsertUnorderedList={() => execFormat("insertUnorderedList")}
          onInsertOrderedList={() => execFormat("insertOrderedList")}
          onInsertBlockquote={() => execFormat("formatBlock", "blockquote")}
          onInsertHorizontalRule={() => execFormat("insertHorizontalRule")}
          onUndo={() => execFormat("undo")}
          onRedo={() => execFormat("redo")}
          onTextColour={(colour) => execFormat("foreColor", colour)}
          onHighlight={(colour) => execFormat("hiliteColor", colour)}
          onFontSizeChange={(size) => {
            setCurrentFontSize(size)
            const sel = window.getSelection()
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0)
              const span = document.createElement("span")
              span.style.fontSize = size + "px"
              range.surroundContents(span)
              if (editorRef.current) {
                setContentHtml(editorRef.current.innerHTML)
                setContentText(editorRef.current.innerText || "")
              }
            }
          }}
          onFontFamilyChange={(family) => {
            setCurrentFontFamily(family)
            execFormat("fontName", family)
          }}
          currentFontSize={currentFontSize}
          currentFontFamily={currentFontFamily}
        />

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
                onClick={() => setCameraOpen(true)}
              >
                <Camera className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip label={isListening ? "Stop Dictation" : "Dictate"}>
              <button
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${isListening ? "animate-pulse" : ""}`}
                style={{ backgroundColor: isListening ? "#DC2626" : "var(--brand-primary)", color: "white" }}
                onClick={toggleListening}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </Tooltip>
            <div data-voice-recorder className="flex items-center gap-1">
              <VoiceRecorder
                recordings={recordings}
                onAdd={addRecording}
                onDelete={deleteRecording}
                onRename={renameRecording}
              />
            </div>
            <Tooltip label="Location">
              <button
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${locationLoading ? "animate-pulse" : ""}`}
                style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                onClick={handleGetLocation}
              >
                <MapPinIcon className="h-4 w-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground">
              <span className="tabular-nums">{wordCount} words</span>
              <span className="tabular-nums">{charCount} characters</span>
              <span className="tabular-nums">{voiceCount} {voiceCount === 1 ? "voice note" : "voice notes"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCancel}>
                {editingEntry ? "Cancel Edit" : "Cancel"}
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1.5 glow" onClick={handleSave} disabled={!contentText.trim()}>
                <Save className="h-3 w-3" /> {editingEntry ? "Update" : "Save"}
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

      <AnimatePresence>
        {cameraOpen && (
          <CameraModal
            onClose={() => setCameraOpen(false)}
            onCapture={(dataUrl) => setImages((prev) => [...prev, dataUrl])}
            onChoose={(files) => {
              Array.from(files).forEach((file) => {
                const reader = new FileReader()
                reader.onload = (ev) => {
                  setImages((prev) => [...prev, ev.target?.result as string])
                }
                reader.readAsDataURL(file)
              })
            }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

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


/* ────────────────────────────────────────────────────── */
/* Main Journal Page                                     */
/* ────────────────────────────────────────────────────── */

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(sampleEntries)
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [calendarPanelOpen, setCalendarPanelOpen] = useState(false)
  const [starredOpen, setStarredOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])

  const draftAutosave = useAutosave("intenteo-journal-draft", 2000)

  const streak = useMemo(() => {
    const today = entries.filter((e) => e.dateISO === todayISO()).length
    return today > 0 ? 18 : 17
  }, [entries])

  const greeting = useMemo(() => journalGreetings[Math.floor(Math.random() * journalGreetings.length)], [])

  const pinnedEntries = useMemo(() => entries.filter((e) => e.pinned), [entries])

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

  const handleUpdateEntry = useCallback((updated: JournalEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    addToast("Entry updated successfully.", "success")
  }, [addToast])

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (editingEntry && editingEntry.id === id) {
      setEditingEntry(null)
    }
  }, [editingEntry])

  const handleToggleFavorite = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, favorited: !e.favorited } : e)))
  }, [])

  const handleTogglePin = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, pinned: !e.pinned } : e)))
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

  const handleSelectEntryForEdit = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry)
    setCalendarPanelOpen(false)
    setStarredOpen(false)
    setTimeout(() => {
      const el = document.querySelector("[data-writing-area]")
      el?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

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
              <Tooltip label="Browse Entries">
                <button
                  className="h-9 w-9 rounded-full text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{ backgroundColor: "var(--brand-primary)" }}
                  onClick={() => { setCalendarPanelOpen(!calendarPanelOpen); setStarredOpen(false) }}
                >
                  <Calendar className="h-4 w-4" />
                </button>
              </Tooltip>

              <Tooltip label="Starred Entries">
                <button
                  className={`h-9 w-9 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ${
                    starredOpen ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                  }`}
                  onClick={() => { setStarredOpen(!starredOpen); setCalendarPanelOpen(false) }}
                >
                  <Star className="h-4 w-4" />
                </button>
              </Tooltip>

              <StreakCircle streak={streak} />

              <Button className="glow h-9" onClick={() => {
                if (editingEntry) {
                  setEditingEntry(null)
                }
                const el = document.querySelector("[data-writing-area]")
                el?.scrollIntoView({ behavior: "smooth" })
              }}>
                <Plus className="mr-1 h-4 w-4" /> {editingEntry ? "New Entry" : "New Entry"}
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar/List Panel */}
        <AnimatePresence>
          {calendarPanelOpen && (
            <CalendarListPanel
              entries={entries}
              onSelectEntry={handleSelectEntryForEdit}
              onDeleteEntry={handleDeleteEntry}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              onDuplicateEntry={handleDuplicateEntry}
            />
          )}
        </AnimatePresence>

        {/* Starred Panel */}
        <AnimatePresence>
          {starredOpen && (
            <StarredPanel
              entries={entries}
              onSelectEntry={handleSelectEntryForEdit}
              onClose={() => setStarredOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Writing Area */}
        <div className="mb-8" data-writing-area>
          <WritingArea
            editingEntry={editingEntry}
            onCreated={handleCreateEntry}
            onUpdated={handleUpdateEntry}
            onCancelEdit={() => setEditingEntry(null)}
            autosave={draftAutosave}
            pinnedEntries={pinnedEntries}
            onOpenPinned={handleSelectEntryForEdit}
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
    </div>
  )
}
