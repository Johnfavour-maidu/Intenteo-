"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Mic,
  Paperclip,
  X,
  Maximize2,
  Image as ImageIcon,
  FileText,
  Loader2,
  Target,
  CheckSquare,
  BookOpen,
  Repeat,
} from "lucide-react"
import { TeoIcon } from "@/components/ui/teo-icon"

type MessageRole = "user" | "teo"

interface GlobalMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
}

const ADAPTIVE_MESSAGES = [
  "\u2728 Need help planning your day?",
  "\uD83D\uDCAC Ask Téo anything.",
  "\uD83C\uDFAF Want help choosing your next priority?",
  "\uD83C\uDF1F How about a quick check-in?",
  "\uD83D\uDCA1 Let's set an intention for today.",
]

const CONTEXT_SUGGESTIONS: Record<string, { prompt: string; icon: React.ReactNode }[]> = {
  "/tasks": [
    { prompt: "Help me prioritize my tasks", icon: <Target className="h-3.5 w-3.5" /> },
    { prompt: "What should I do first?", icon: <CheckSquare className="h-3.5 w-3.5" /> },
    { prompt: "Add a new task", icon: <FileText className="h-3.5 w-3.5" /> },
    { prompt: "Show my overdue tasks", icon: <Target className="h-3.5 w-3.5" /> },
  ],
  "/goals": [
    { prompt: "Help me break down my goals", icon: <Target className="h-3.5 w-3.5" /> },
    { prompt: "How are my goals progressing?", icon: <TeoIcon size="xs" /> },
    { prompt: "Create a new goal", icon: <Target className="h-3.5 w-3.5" /> },
    { prompt: "What goal should I focus on?", icon: <CheckSquare className="h-3.5 w-3.5" /> },
  ],
  "/journal": [
    { prompt: "Reflect on my journal", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { prompt: "Summarize my recent entries", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { prompt: "Journaling prompts for today", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { prompt: "Help me process my thoughts", icon: <BookOpen className="h-3.5 w-3.5" /> },
  ],
  "/habits": [
    { prompt: "How can I improve my habits?", icon: <Repeat className="h-3.5 w-3.5" /> },
    { prompt: "Review my habit streaks", icon: <Repeat className="h-3.5 w-3.5" /> },
    { prompt: "Add a new habit", icon: <Repeat className="h-3.5 w-3.5" /> },
    { prompt: "Which habits am I neglecting?", icon: <Repeat className="h-3.5 w-3.5" /> },
  ],
  default: [
    { prompt: "What should I focus on today?", icon: <Target className="h-3.5 w-3.5" /> },
    { prompt: "Review my habits", icon: <Repeat className="h-3.5 w-3.5" /> },
    { prompt: "Help me plan my day", icon: <CheckSquare className="h-3.5 w-3.5" /> },
    { prompt: "Reflect on today", icon: <BookOpen className="h-3.5 w-3.5" /> },
    { prompt: "How's my progress?", icon: <TeoIcon size="xs" /> },
    { prompt: "What are my top priorities?", icon: <Target className="h-3.5 w-3.5" /> },
  ],
}

const TEO_RESPONSES: Record<string, string> = {
  plan: "Here's a focused plan for your day:\n\n1. Start with your highest-priority task when energy is peak\n2. Block 25-50 minutes for deep work on important goals\n3. Take short breaks between focus blocks\n4. End with a quick journal reflection\n\nWould you like me to help prioritize specific tasks?",
  habit: "To improve your habits, try these strategies:\n\n• Start small \u2014 commit to 2-minute versions\n• Stack new habits onto existing routines\n• Track streaks to build momentum\n• Celebrate small wins along the way\n\nWhich habit would you like to focus on?",
  goal: "Breaking down goals makes them achievable:\n\n1. Define the end result clearly\n2. Set a realistic deadline\n3. Break into weekly milestones\n4. Identify daily actions that move you forward\n5. Review progress every Sunday\n\nWhat goal would you like to work on?",
  focus: "For better focus today:\n\n• Pick ONE priority task\n• Put your phone on Do Not Disturb\n• Use a timer (25 min work / 5 min break)\n• Work in a distraction-free environment\n• Start with the hardest task first\n\nWhat task needs your full attention?",
  reflect: "Here are some reflection prompts:\n\n• What went well today?\n• What challenged me?\n• What did I learn about myself?\n• What am I grateful for?\n• What will I do differently tomorrow?\n\nTake a moment to sit with these questions.",
  progress: "Looking at your overall progress:\n\nYou're building consistency in your daily routines. The key is to keep showing up \u2014 even on days when motivation is low. Small daily actions compound into significant life changes over time.\n\nWhat area would you like to focus on improving?",
  default: "I'm here to help you live intentionally. I can help you plan your day, build habits, reach goals, reflect through journaling, or make better decisions.\n\nWhat would you like to work on?",
}

function getTeoResponse(userMessage: string, pathname: string): string {
  const lower = userMessage.toLowerCase()

  if (/plan|day|schedule|today|tomorrow/.test(lower)) return TEO_RESPONSES.plan
  if (/habit|streak|routine|consistent/.test(lower)) return TEO_RESPONSES.habit
  if (/goal|target|milestone|objective/.test(lower)) return TEO_RESPONSES.goal
  if (/focus|concentrate|productive|energy|priority/.test(lower)) return TEO_RESPONSES.focus
  if (/reflect|journal|think|grateful|gratitude/.test(lower)) return TEO_RESPONSES.reflect
  if (/progress|how am i|doing|score|streak/.test(lower)) return TEO_RESPONSES.progress
  return TEO_RESPONSES.default
}

function getContextSuggestions(pathname: string) {
  const key = Object.keys(CONTEXT_SUGGESTIONS).find((k) => k !== "default" && pathname.startsWith(k))
  return CONTEXT_SUGGESTIONS[key || "default"]
}

const STORAGE_KEY = "intenteo-teo-position"

function loadSavedPosition(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function GlobalFloatingTeo() {
  const router = useRouter()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<GlobalMessage[]>([])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [showPill, setShowPill] = useState(false)
  const [pillMessage, setPillMessage] = useState("")
  const [isHovering, setIsHovering] = useState(false)

  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number; moved: boolean } | null>(null)

  useEffect(() => {
    const saved = loadSavedPosition()
    if (saved) setBtnPos(saved)
  }, [])

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pillTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasTriggeredPill = useRef(false)
  const lastActivityRef = useRef(Date.now())

  const BUTTON_SIZE = 56
  const MARGIN = 24

  const clampToViewport = useCallback((x: number, y: number) => {
    const maxX = window.innerWidth - BUTTON_SIZE - MARGIN
    const maxY = window.innerHeight - BUTTON_SIZE - MARGIN
    return { x: Math.max(MARGIN, Math.min(x, maxX)), y: Math.max(MARGIN, Math.min(y, maxY)) }
  }, [])

  const onDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    const currentPos = btnPos || { x: window.innerWidth - BUTTON_SIZE - MARGIN, y: window.innerHeight - BUTTON_SIZE - MARGIN }
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: currentPos.x, startPosY: currentPos.y, moved: false }
    const target = e.currentTarget as HTMLElement
    target.setPointerCapture(e.pointerId)
  }, [btnPos])

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true
    const newPos = clampToViewport(dragRef.current.startPosX + dx, dragRef.current.startPosY + dy)
    setBtnPos(newPos)
  }, [clampToViewport])

  const onDragEnd = useCallback((e: React.PointerEvent) => {
    if (dragRef.current?.moved) {
      e.preventDefault()
      e.stopPropagation()
      const target = e.currentTarget as HTMLElement
      try { target.releasePointerCapture(e.pointerId) } catch {}
      const currentPos = btnPos
      if (currentPos) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPos)) } catch {}
      }
    }
    dragRef.current = null
  }, [btnPos])

  const btnStyle = btnPos ? { left: btnPos.x, top: btnPos.y } : { right: 24, bottom: 24 }
  const pillStyle = btnPos ? { left: btnPos.x, top: btnPos.y - 8 } : { right: 24, bottom: 80 }
  const tooltipStyle = btnPos ? { left: btnPos.x, top: btnPos.y - 16 } : { right: 24, bottom: 80 }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
    if (hasTriggeredPill.current) return

    inactivityTimerRef.current = setTimeout(() => {
      if (!isOpen && !hasTriggeredPill.current) {
        hasTriggeredPill.current = true
        const msg = ADAPTIVE_MESSAGES[Math.floor(Math.random() * ADAPTIVE_MESSAGES.length)]
        setPillMessage(msg)
        setShowPill(true)
        pillTimerRef.current = setTimeout(() => setShowPill(false), 5000)
      }
    }, 45000)
  }, [isOpen])

  useEffect(() => {
    if (isOpen || hasTriggeredPill.current) return

    const handleActivity = () => resetInactivityTimer()
    window.addEventListener("mousemove", handleActivity)
    window.addEventListener("keydown", handleActivity)
    window.addEventListener("scroll", handleActivity, true)

    resetInactivityTimer()

    return () => {
      window.removeEventListener("mousemove", handleActivity)
      window.removeEventListener("keydown", handleActivity)
      window.removeEventListener("scroll", handleActivity, true)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current)
    }
  }, [isOpen, resetInactivityTimer])

  const pushTeo = useCallback((content: string, delay = 1200) => {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + Math.random(), role: "teo", content, timestamp: Date.now() },
      ])
    }, delay)
  }, [])

  const sendMessage = useCallback(
    (text?: string) => {
      const content = (text ?? input).trim()
      if (!content) return
      setInput("")
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "user", content, timestamp: Date.now() },
      ])
      const response = getTeoResponse(content, pathname)
      pushTeo(response)
    },
    [input, pathname, pushTeo]
  )

  const handleToggle = useCallback(() => {
    if (isOpen) {
      setIsOpen(false)
    } else {
      setShowPill(false)
      if (pillTimerRef.current) clearTimeout(pillTimerRef.current)
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current)
      setIsOpen(true)
    }
  }, [isOpen])

  const handleExpand = useCallback(() => {
    router.push("/coach")
    setIsOpen(false)
  }, [router])

  const suggestions = getContextSuggestions(pathname)

  return (
    <>
      {/* Adaptive Pill */}
      <AnimatePresence>
        {showPill && !isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, width: 56 }}
            animate={{ opacity: 1, scale: 1, width: "auto" }}
            exit={{ opacity: 0, scale: 0.8, width: 56 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={handleToggle}
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            className="fixed z-50 flex items-center gap-2 rounded-full bg-[#1E0E6B] px-4 py-3 text-white text-sm font-medium shadow-lg shadow-[#1E0E6B]/20 hover:shadow-xl hover:shadow-[#1E0E6B]/30 transition-shadow cursor-pointer touch-none"
            style={pillStyle}
            aria-label={pillMessage}
          >
            <TeoIcon size="xs" className="shrink-0" />
            <span className="whitespace-nowrap">{pillMessage}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!showPill && !isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          onClick={handleToggle}
          className="fixed z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1E0E6B] text-white shadow-lg shadow-[#1E0E6B]/20 hover:shadow-xl hover:shadow-[#1E0E6B]/30 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0E6B]/50 focus-visible:ring-offset-2 touch-none"
          style={btnStyle}
          aria-label="Talk with Téo"
        >
          <TeoIcon size="fab" />
        </motion.button>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {isHovering && !isOpen && !showPill && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 whitespace-nowrap rounded-lg bg-[#1E0E6B] px-3 py-1.5 text-xs font-medium text-white shadow-md pointer-events-none"
            style={tooltipStyle}
          >
            Talk with Téo
            <div className="absolute -bottom-1 right-5 h-2 w-2 rotate-45 bg-[#1E0E6B]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm sm:bg-black/20"
              aria-hidden="true"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-24 right-4 z-[70] flex w-[calc(100vw-2rem)] max-w-md flex-col rounded-2xl border border-[#1E0E6B]/10 bg-white shadow-2xl shadow-[#1E0E6B]/10 overflow-hidden sm:right-6 sm:w-[400px] max-h-[70vh]"
              role="dialog"
              aria-label="Chat with Téo"
            >
              {/* Header */}
              <div className="flex items-center gap-3 bg-[#1E0E6B] px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <TeoIcon size="sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-white leading-tight">Talk with Téo</h2>
                  <p className="text-xs text-white/70 truncate">Your personal guide for intentional living.</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleExpand}
                    aria-label="Open full coach"
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    aria-label="Close chat"
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Empty state */}
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E0E6B] mb-3 shadow-md shadow-[#1E0E6B]/10">
                      <TeoIcon size="lg" />
                    </div>
                    <p className="text-sm font-medium text-[#1E0E6B]">Hi, I&apos;m Téo.</p>
                    <p className="text-xs text-gray-500 mt-1">Your intentional living companion.</p>
                  </div>
                )}

                {/* Messages */}
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    {m.role === "teo" && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden mt-1">
                        <TeoIcon size="sm" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${
                        m.role === "user"
                          ? "bg-white border border-[#1E0E6B]/10 rounded-tr-sm text-gray-800 shadow-sm"
                          : "bg-[#1E0E6B]/5 rounded-tl-sm text-gray-800"
                      }`}
                    >
                      {m.content}
                      <div className="text-[10px] mt-1.5 text-gray-400">
                        {new Date(m.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden mt-1">
                      <TeoIcon size="sm" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-[#1E0E6B]/5 px-4 py-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-[#1E0E6B]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-[#1E0E6B]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-[#1E0E6B]"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggestion Chips (no messages) */}
                {messages.length === 0 && !typing && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-gray-400 text-center font-medium">Suggested</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {suggestions.map((s) => (
                        <button
                          key={s.prompt}
                          onClick={() => sendMessage(s.prompt)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#1E0E6B]/20 px-3 py-1.5 text-xs font-medium text-[#1E0E6B]/80 transition-colors hover:bg-[#1E0E6B]/5 hover:border-[#1E0E6B]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0E6B]/30"
                        >
                          {s.icon}
                          {s.prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-[#1E0E6B]/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Attach a file"
                    className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1E0E6B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0E6B]/30"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Upload an image"
                    className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1E0E6B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0E6B]/30"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Ask Téo anything..."
                    className="flex-1 h-10 rounded-full border border-[#1E0E6B]/15 bg-gray-50 px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/20 focus:border-[#1E0E6B]/30 transition-all"
                    aria-label="Message input"
                  />
                  <button
                    aria-label="Voice input"
                    className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#1E0E6B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0E6B]/30"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-[#EB9E5B] text-white transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-[#EB9E5B]/30 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EB9E5B]/50 disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
                  <span>Press Enter to send</span>
                  <span className="text-gray-300">&middot;</span>
                  <span>Esc to close</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
