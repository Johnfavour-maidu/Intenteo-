"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  Send,
  Paperclip,
  X,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Volume2,
  CornerDownLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ────────────────────────────────────────────────────── */
/* Types                                                    */
/* ────────────────────────────────────────────────────── */

type MessageKind = "voice" | "text" | "file"
type MessageRole = "user" | "teo"

interface TeoMessage {
  id: string
  role: MessageRole
  kind: MessageKind
  content: string
  fileName?: string
  fileType?: string
  timestamp: number
}

export interface TeoAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: { id: string; title: string; completed: boolean; date: string; recurrence?: string; dailyCompletions?: Record<string, boolean> }[]
  onAddTask: (title?: string, date?: string) => void
  onStartFocus: () => void
}

/* ────────────────────────────────────────────────────── */
/* Helpers                                                  */
/* ────────────────────────────────────────────────────── */

const todayISO = () => new Date().toISOString().split("T")[0]

const addDays = (iso: string, days: number) => {
  const d = new Date(iso + "T12:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const HABIT_SYNONYMS: Record<string, string> = {
  workout: "exercise",
  exercising: "exercise",
  jog: "exercise",
  jogging: "exercise",
  run: "exercise",
  running: "exercise",
  meditate: "meditation",
  meditating: "meditation",
  pray: "prayer",
  praying: "prayer",
  study: "study",
  studying: "study",
  read: "reading",
  reading: "reading",
  write: "journal",
  writing: "journal",
  drink: "water",
  drinking: "water",
  stretch: "stretch",
  stretching: "stretch",
  walk: "walk",
  walking: "walk",
  sleep: "sleep",
}

const STOP_WORDS = new Set([
  "my", "the", "a", "to", "i", "finished", "complete", "completing", "mark", "marked",
  "done", "habit", "habits", "today", "and", "is", "was", "have", "has", "just", "need",
  "want", "task", "tasks", "please", "can", "you", "me", "for", "of", "on", "in", "at",
  "this", "that", "with", "already", "did",
])

/* Match a habit name from a spoken/typed phrase. */
function matchHabit(phrase: string): { id: string; name: string } | null {
  const habits = readStore<{ id: string; name: string }[]>("intenteo-habits", [])
  if (!habits.length) return null
  const words = phrase
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  const expanded = words.flatMap((w) => (HABIT_SYNONYMS[w] ? [w, HABIT_SYNONYMS[w]] : [w]))
  if (!expanded.length) return null

  for (const h of habits) {
    const name = (h.name || "").toLowerCase()
    if (!name) continue
    const nameWords = name.split(/\s+/)
    if (expanded.some((w) => name.includes(w) && w.length >= 4)) return { id: h.id, name: h.name }
    if (nameWords.some((nw) => nw.length >= 4 && expanded.includes(nw))) return { id: h.id, name: h.name }
  }
  return null
}

/* Mark a habit complete for today and return its display name. */
function completeHabitToday(habitId: string): string | null {
  const habits = readStore<{ id: string; name: string; completions?: Record<string, { completed: boolean; time?: string; quality?: string }>; streak?: number }[]>("intenteo-habits", [])
  const idx = habits.findIndex((h) => h.id === habitId)
  if (idx === -1) return null
  const today = todayISO()
  const habit = habits[idx]
  const completions = habit.completions || {}
  completions[today] = {
    completed: true,
    time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    quality: "good",
  }
  habits[idx] = { ...habit, completions, streak: (habit.streak || 0) + 1 }
  try {
    localStorage.setItem("intenteo-habits", JSON.stringify(habits))
  } catch {}
  return habit.name
}

/* Compute a simple Intent Score from local data. */
function computeIntentScore(tasks: TeoAssistantProps["tasks"]): number {
  const habits = readStore<{ completions?: Record<string, { completed: boolean }> }[]>("intenteo-habits", [])
  const today = todayISO()
  const totalTasks = tasks.length || 1
  const completedTasks = tasks.filter((t) =>
    t.recurrence === "daily" ? !!(t.dailyCompletions || {})[today] : t.completed
  ).length
  const totalHabits = habits.length || 1
  const completedHabits = habits.filter((h) => !!(h.completions || {})[today]?.completed).length
  const score = Math.round(
    ((completedTasks * 25 + completedHabits * 15) / (totalTasks * 25 + totalHabits * 15)) * 100
  )
  return Math.min(100, Math.max(0, score))
}

/* Extract a task title + date from a phrase. */
function extractTask(phrase: string): { title: string; date?: string } {
  let text = phrase
  text = text.replace(/^(please\s+)?(can you\s+)?(i (want to|need to)\s+)?/i, "")
  text = text.replace(/^(add|create|remind me to|make|new)\s+(a\s+)?(task\s+(to\s+)?)?/i, "")
  text = text.replace(/\b(tomorrow|today|tonight)\b/gi, (m) =>
    m.toLowerCase() === "tomorrow" ? "[[TOMORROW]]" : "[[TODAY]]"
  )
  text = text.replace(/\s*(at|by|before)\s+\d{1,2}(\s*(am|pm|:\d{2}))?/gi, "")
  text = text.replace(/\[\[TOMORROW\]\]/gi, " tomorrow").replace(/\[\[TODAY\]\]/gi, " today")
  text = text.replace(/\s+/g, " ").trim().replace(/\.$/, "")
  let date: string | undefined
  if (/\btomorrow\b/i.test(text)) date = addDays(todayISO(), 1)
  else if (/\btoday\b/i.test(text)) date = todayISO()
  text = text.replace(/\b(tomorrow|today)\b/gi, "").replace(/\s+/g, " ").trim()
  const title = text.charAt(0).toUpperCase() + text.slice(1)
  return { title: title || "New task", date }
}

/* ────────────────────────────────────────────────────── */
/* Quick suggestions + chips                               */
/* ────────────────────────────────────────────────────── */

const DEFAULT_SUGGESTIONS = [
  "Plan my day",
  "Add a task",
  "Mark Exercise complete",
  "Open my journal",
  "Create a goal",
  "Show today's habits",
  "Review this week",
  "Help me focus",
]

const QUICK_ACTIONS = [
  { label: "Plan My Day", phrase: "Plan my day" },
  { label: "Today's Habits", phrase: "Show today's habits" },
  { label: "Open Journal", phrase: "Open my journal" },
  { label: "Goals", phrase: "Create a goal" },
  { label: "Tasks", phrase: "Show my tasks" },
  { label: "Focus Mode", phrase: "Help me focus" },
  { label: "My Journey", phrase: "Review this week" },
]

const WELCOME = "👋 Hi John.\n\nWhat would you like to do?"

/* ────────────────────────────────────────────────────── */
/* Waveform animation                                      */
/* ────────────────────────────────────────────────────── */

function Waveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 28 })
  return (
    <div className="flex items-end justify-center gap-[3px] h-12" aria-hidden>
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-primary to-purple-400"
          style={{ transformOrigin: "bottom", height: 6 }}
          animate={active ? { height: [6, 34, 14, 40, 10, 28, 6] } : { height: 6 }}
          transition={
            active
              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.08 }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Component                                                */
/* ────────────────────────────────────────────────────── */

export function TeoAssistant({ open, onOpenChange, tasks, onAddTask, onStartFocus }: TeoAssistantProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<TeoMessage[]>([])
  const [input, setInput] = useState("")
  const [listening, setListening] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState("")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<unknown>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, listening, typing])

  /* Reset transient state when the panel closes. */
  useEffect(() => {
    if (!open) {
      setListening(false)
      setLiveTranscript("")
    }
  }, [open])

  const pushTeo = useCallback((content: string, delay = 700) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + Math.random(), role: "teo", kind: "text", content, timestamp: Date.now() },
      ])
    }, delay)
  }, [])

  /* ── Intent recognition ── */
  const runIntent = useCallback(
    (rawText: string): { reply: string; action?: "close" | "none"; navigate?: string; effect?: () => void } => {
      const text = rawText.trim()
      const lower = text.toLowerCase()

      /* 1. Navigate to Journal */
      if (/(open|go to|show|my).{0,12}journal/.test(lower) && !/complete|mark|done|finish/.test(lower)) {
        return { reply: "Opening your journal. Capture today's reflections there.", action: "close", navigate: "/journal" }
      }
      /* 2. Navigate to Habits */
      if (/(today'?s|my|show).{0,8}habits|open.{0,8}habits/.test(lower)) {
        return { reply: "Here are today's habits. Keep the streak alive!", action: "close", navigate: "/habits" }
      }
      /* 3. Navigate to Goals */
      if (/(create|new|add).{0,6}goal|open.{0,6}goals/.test(lower)) {
        return { reply: "Let's set a new goal. Heading to Goals now.", action: "close", navigate: "/goals" }
      }
      /* 4. Navigate to Journey */
      if (/(review this week|how am i doing this week|my week|weekly|my journey)/.test(lower)) {
        return { reply: "Opening My Journey — your weekly story and insights await.", action: "close", navigate: "/journey" }
      }
      /* 5. Show Tasks */
      if (/(show|my|unfinished).{0,10}tasks/.test(lower)) {
        const pending = tasks.filter((t) => (t.recurrence === "daily" ? !(t.dailyCompletions || {})[todayISO()] : !t.completed))
        if (!pending.length) return { reply: "You have no unfinished tasks. Nicely done! 🎉" }
        const list = pending.slice(0, 5).map((t) => `• ${t.title}`).join("\n")
        return { reply: `You have ${pending.length} unfinished task${pending.length !== 1 ? "s" : ""}:\n${list}` }
      }
      /* 6. Complete a habit */
      if (/(complete|completed|mark|marked|finished|finish|done|did).{0,20}(my|the)?/.test(lower) || /i (finished|completed|did|did my)/.test(lower)) {
        const habit = matchHabit(text)
        if (habit) {
          const name = completeHabitToday(habit.id)
          if (name) return { reply: `✓ ${name} marked complete.` }
        }
      }
      /* 7. Add a task */
      if (/(add|create|remind me to|make|new).{0,4}(a )?(task|reminder)/.test(lower) || /^remind me to /i.test(lower)) {
        const { title, date } = extractTask(text)
        return {
          reply: `✓ Task added successfully: "${title}".`,
          action: "close",
          effect: () => onAddTask(title, date),
        }
      }
      /* 8. Focus Mode */
      if (/(start|begin|launch|help me).{0,12}(focus|deep work)|focus mode/.test(lower)) {
        return { reply: "Launching Focus Mode. I'll help you stay in flow.", action: "close", effect: onStartFocus }
      }
      /* 9. Plan my day / what to focus on */
      if (/(plan my day|plan today|what should i focus on|what.{0,8}focus on|next best action|next step)/.test(lower)) {
        const pending = tasks
          .filter((t) => (t.recurrence === "daily" ? !(t.dailyCompletions || {})[todayISO()] : !t.completed))
          .slice(0, 5)
        const habits = readStore<{ name: string }[]>("intenteo-habits", [])
        if (!pending.length && !habits.length)
          return { reply: "Your day is clear. A great moment to set an intention or start a new habit." }
        const taskLines = pending.map((t) => `• ${t.title}`).join("\n")
        const habitLines = habits.slice(0, 3).map((h) => `• ${h.name}`).join("\n")
        return {
          reply:
            `Here's a focused plan for today:\n\n` +
            (taskLines ? `Tasks:\n${taskLines}\n\n` : "") +
            (habitLines ? `Habits to keep alive:\n${habitLines}\n\n` : "") +
            `Start with the highest-impact item and protect a block of deep work.`,
        }
      }
      /* 10. Intent Score explanation */
      if (/intent score|why is my|why.{0,8}low|my score/.test(lower)) {
        const score = computeIntentScore(tasks)
        const pending = tasks.filter((t) => (t.recurrence === "daily" ? !(t.dailyCompletions || {})[todayISO()] : !t.completed))
        const habits = readStore<{ completions?: Record<string, { completed: boolean }> }[]>("intenteo-habits", [])
        const pendingHabits = habits.filter((h) => !(h.completions || {})[todayISO()]?.completed)
        const tasksPart = pending.length ? `${pending.length} unfinished task${pending.length !== 1 ? "s" : ""}` : "all tasks done"
        const habitsPart = pendingHabits.length ? `${pendingHabits.length} incomplete habit${pendingHabits.length !== 1 ? "s" : ""}` : "all habits done"
        return {
          reply:
            `Your Intent Score is ${score}/100.\n\n` +
            `Currently: ${tasksPart}, and ${habitsPart}.\n\n` +
            `To lift it, complete a few high-impact tasks and keep your key habits (like Exercise and Journaling) consistent. Small daily wins compound.`,
        }
      }
      /* 11. Generic helpful fallback */
      return {
        reply:
          "I'm here to help you live intentionally. I can plan your day, add tasks, complete habits, start Focus Mode, or open Journal, Habits, Goals and My Journey. What would you like to do?",
      }
    },
    [tasks, onAddTask, onStartFocus]
  )

  const send = useCallback(
    (rawText?: string, kind: MessageKind = "text") => {
      const content = (rawText ?? input).trim()
      if (!content) return
      setInput("")
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "user", kind, content, timestamp: Date.now() },
      ])

      const result = runIntent(content)
      if (result.navigate) {
        pushTeo(result.reply, 500)
        setTimeout(() => {
          onOpenChange(false)
          router.push(result.navigate!)
        }, 900)
        return
      }
      if (result.effect) {
        pushTeo(result.reply, 500)
        setTimeout(() => {
          onOpenChange(false)
          result.effect!()
        }, 900)
        return
      }
      pushTeo(result.reply)
    },
    [input, runIntent, pushTeo, onOpenChange, router]
  )

  /* ── Voice ── */
  const stopListening = useCallback(() => {
    try {
      ;(recognitionRef.current as { stop?: () => void } | null)?.stop?.()
    } catch {}
    setListening(false)
    setLiveTranscript("")
  }, [])

  const startListening = useCallback(() => {
    const w = window as unknown as Record<string, unknown>
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) {
      pushTeo("Speech recognition isn't supported in this browser, but you can still type to me below.")
      return
    }
    const recognition = new (SR as new () => Record<string, unknown>)()
    ;(recognition as Record<string, unknown>).lang = "en-GB"
    ;(recognition as Record<string, unknown>).continuous = true
    ;(recognition as Record<string, unknown>).interimResults = true
    recognitionRef.current = recognition
    let finalTranscript = ""

    ;(recognition as Record<string, unknown>).onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += transcript
        else interim += transcript
      }
      setLiveTranscript(interim || finalTranscript || "Listening...")
    }
    ;(recognition as Record<string, unknown>).onend = () => {
      setListening(false)
      if (finalTranscript.trim()) {
        const spoken = finalTranscript.trim()
        setLiveTranscript("")
        send(spoken, "voice")
      } else {
        setLiveTranscript("")
      }
    }
    ;(recognition as Record<string, unknown>).onerror = () => {
      setListening(false)
      setLiveTranscript("")
    }
    ;(recognition as { start: () => void }).start()
    setListening(true)
    setLiveTranscript("Listening...")
  }, [pushTeo, send])

  const toggleMic = useCallback(() => {
    if (listening) stopListening()
    else startListening()
  }, [listening, startListening, stopListening])

  /* ── File upload (modular for future parsers) ── */
  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ""
      if (!file) return
      const isImage = file.type.startsWith("image/")
      const kind: MessageKind = "file"
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          kind,
          content: isImage ? "Shared an image" : `Uploaded ${file.name}`,
          fileName: file.name,
          fileType: file.type || "file",
          timestamp: Date.now(),
        },
      ])
      /* Future-ready: this is where document/image OCR, summarisation and
         "turn into tasks" logic will plug in. For now we acknowledge receipt. */
      pushTeo(
        `Got it — I've received "${file.name}". Once file understanding is enabled I'll summarise it, extract goals, or turn it into tasks. For now, just tell me what you'd like me to do with it.`
      )
    },
    [pushTeo]
  )

  const showSuggestions = messages.length === 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed z-[80] flex flex-col bg-background/95 backdrop-blur-xl border shadow-2xl outline-none",
            "inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl",
            "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=open]:zoom-in-95"
          )}
          aria-label="Talk with Téo"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-md shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-base font-semibold leading-tight">Talk with Téo</Dialog.Title>
              <Dialog.Description className="text-xs text-muted-foreground truncate">
                Your personal guide for intentional living.
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring p-1">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex gap-3">
                <AvatarBubble />
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm whitespace-pre-line">
                  {WELCOME}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "teo" && <AvatarBubble />}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  {m.kind === "file" ? (
                    <span className="inline-flex items-center gap-2">
                      {m.fileType?.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      {m.content}
                    </span>
                  ) : (
                    m.content
                  )}
                  <div className={cn("text-[10px] mt-1", m.role === "user" ? "opacity-70" : "text-muted-foreground")}>
                    {m.kind === "voice" ? "🎤 Voice" : m.kind === "file" ? "📎 File" : "Text"} ·{" "}
                    {new Date(m.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex gap-3">
                <AvatarBubble />
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Téo is typing…
                </div>
              </div>
            )}

            {/* Listening state */}
            <AnimatePresence>
              {listening && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.span
                      className="h-2.5 w-2.5 rounded-full bg-primary"
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-primary">Listening…</span>
                  </div>
                  <Waveform active={listening} />
                  {liveTranscript && (
                    <p className="mt-3 text-sm text-foreground/90 text-center px-2">{liveTranscript}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Default suggestions */}
            {showSuggestions && !listening && (
              <div className="flex flex-wrap gap-2 pt-1">
                {DEFAULT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/10 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick action chips */}
          {!listening && (
            <div className="px-5 pt-2 flex flex-wrap gap-2 border-t">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.phrase)}
                  className="rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-t">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFile}
            />
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Attach a file"
              className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Ask Téo anything..."
              className="flex-1 h-10 rounded-full border border-input bg-background px-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={toggleMic}
              aria-label={listening ? "Stop listening" : "Talk with Téo"}
              className={cn(
                "h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                listening ? "bg-red-500 animate-pulse" : "bg-gradient-to-br from-primary to-purple-600"
              )}
            >
              {listening ? <Volume2 className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              aria-label="Send"
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-primary text-primary-foreground transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Enter hint */}
          <div className="px-4 pb-2 text-[10px] text-muted-foreground/70 flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> Press Enter to send · Esc to close
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function AvatarBubble() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-white text-xs font-semibold">
      T
    </div>
  )
}
