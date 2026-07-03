"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Task } from "./types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Clock,
  Timer,
  Sparkles,
  Music,
  StickyNote,
  Bot,
  MessageSquare,
} from "lucide-react"

interface FocusModeProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onComplete: (id: string) => void
}

export function FocusMode({ task, open, onClose, onComplete }: FocusModeProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [notes, setNotes] = useState("")

  const targetTime = task ? task.estimatedDuration * 60 : 0
  const progress = targetTime > 0 ? Math.min((timeElapsed / targetTime) * 100, 100) : 0
  const remaining = Math.max(targetTime - timeElapsed, 0)
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isRunning && open) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, open])

  useEffect(() => {
    if (open) {
      setTimeElapsed(0)
      setIsRunning(false)
    }
  }, [open])

  const handleToggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const handleReset = useCallback(() => {
    setTimeElapsed(0)
    setIsRunning(false)
  }, [])

  if (!task) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center h-full px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              {/* Focus Badge */}
              <Badge variant="outline" className="mb-6 text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                Focus Mode
              </Badge>

              {/* Task Title */}
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{task.title}</h1>
              <p className="text-muted-foreground mb-8">{task.purpose}</p>

              {/* Timer Ring */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <ProgressRing
                  value={progress}
                  size={200}
                  strokeWidth={6}
                  showLabel={false}
                  indicatorClassName={progress >= 100 ? "text-emerald-500" : "text-primary"}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-mono font-bold tabular-nums">
                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {Math.round(progress)}% of {task.estimatedDuration}m
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleReset}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full glow"
                  onClick={handleToggleTimer}
                >
                  {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => onComplete(task.id)}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
              </div>

              {/* Task Info */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="outline" className="text-xs">
                  <Timer className="mr-1 h-3 w-3" />
                  {task.estimatedDuration}m
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Zap className="mr-1 h-3 w-3" />
                  {task.energyRequired} energy
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Target className="mr-1 h-3 w-3" />
                  +{task.intentScore} Intent
                </Badge>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)}>
                  <StickyNote className="mr-1 h-4 w-4" />
                  Notes
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowChecklist(!showChecklist)}>
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Checklist
                </Button>
                <Button variant="ghost" size="sm">
                  <Music className="mr-1 h-4 w-4" />
                  Music
                </Button>
                <Button variant="ghost" size="sm">
                  <Bot className="mr-1 h-4 w-4" />
                  AI Coach
                </Button>
              </div>

              {/* Notes Panel */}
              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <textarea
                      placeholder="Take notes while you focus..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-32 p-3 rounded-xl border bg-background text-sm resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Checklist Panel */}
              <AnimatePresence>
                {showChecklist && task.subtasks.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="p-3 rounded-xl border bg-background text-left">
                      <div className="space-y-1">
                        {task.subtasks.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2 py-1">
                            {sub.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className={`text-sm ${sub.completed ? "line-through text-muted-foreground" : ""}`}>
                              {sub.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Zap(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function Target(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
