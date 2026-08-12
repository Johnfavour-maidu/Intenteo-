"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Target,
  Clock,
  Volume2,
  VolumeX,
  Coffee,
  Zap,
  Timer,
  ArrowLeft,
  Settings,
  Cloud,
  TreePine,
  Waves,
} from "lucide-react"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface TimerPreset {
  label: string
  focus: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

const PRESETS: TimerPreset[] = [
  { label: "Pomodoro", focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
  { label: "Deep Work", focus: 50, shortBreak: 10, longBreak: 20, longBreakInterval: 3 },
  { label: "Quick Sprint", focus: 15, shortBreak: 3, longBreak: 10, longBreakInterval: 4 },
  { label: "Custom", focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
]

const AMBIENT_SOUNDS = [
  { id: "none", label: "None", icon: VolumeX },
  { id: "rain", label: "Rain", icon: Cloud },
  { id: "forest", label: "Forest", icon: TreePine },
  { id: "cafe", label: "Café", icon: Coffee },
  { id: "white-noise", label: "White Noise", icon: Waves },
]

export function FocusTimerPage() {
  const router = useRouter()

  const [presetIndex, setPresetIndex] = useState(0)
  const [mode, setMode] = useState<TimerMode>("focus")
  const [customFocus, setCustomFocus] = useState(25)
  const [customShortBreak, setCustomShortBreak] = useState(5)
  const [customLongBreak, setCustomLongBreak] = useState(15)

  const preset = PRESETS[presetIndex]
  const focusDuration = presetIndex === 3 ? customFocus : preset.focus
  const shortBreakDuration = presetIndex === 3 ? customShortBreak : preset.shortBreak
  const longBreakDuration = presetIndex === 3 ? customLongBreak : preset.longBreak
  const longBreakInterval = preset.longBreakInterval

  const totalSeconds = mode === "focus"
    ? focusDuration * 60
    : mode === "shortBreak"
      ? shortBreakDuration * 60
      : longBreakDuration * 60

  const [secondsLeft, setSecondsLeft] = useState(focusDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [totalFocusTime, setTotalFocusTime] = useState(0)
  const [ambientSound, setAmbientSound] = useState("none")
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setIsRunning(false)
          handleTimerComplete()
          return 0
        }
        if (mode === "focus") {
          setTotalFocusTime((t) => t + 1)
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode])

  const handleTimerComplete = useCallback(() => {
    if (mode === "focus") {
      const newSessions = sessionsCompleted + 1
      setSessionsCompleted(newSessions)
      if (newSessions % longBreakInterval === 0) {
        setMode("longBreak")
        setSecondsLeft(longBreakDuration * 60)
      } else {
        setMode("shortBreak")
        setSecondsLeft(shortBreakDuration * 60)
      }
    } else {
      setMode("focus")
      setSecondsLeft(focusDuration * 60)
    }
  }, [mode, sessionsCompleted, longBreakInterval, longBreakDuration, shortBreakDuration, focusDuration])

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    if (mode === "focus") {
      setSecondsLeft(focusDuration * 60)
    } else if (mode === "shortBreak") {
      setSecondsLeft(shortBreakDuration * 60)
    } else {
      setSecondsLeft(longBreakDuration * 60)
    }
  }, [mode, focusDuration, shortBreakDuration, longBreakDuration])

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsRunning(false)
    setMode(newMode)
    if (newMode === "focus") {
      setSecondsLeft(focusDuration * 60)
    } else if (newMode === "shortBreak") {
      setSecondsLeft(shortBreakDuration * 60)
    } else {
      setSecondsLeft(longBreakDuration * 60)
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration])

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  const modeColors: Record<TimerMode, string> = {
    focus: "from-[#1E0E6B] to-[#3B1F8E]",
    shortBreak: "from-emerald-500 to-teal-500",
    longBreak: "from-blue-500 to-indigo-500",
  }

  const circumference = 2 * Math.PI * 120
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-10">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <h1 className="text-lg font-semibold">Focus Timer</h1>
          <Button variant="ghost" size="sm" onClick={() => setShowSettings((s) => !s)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-10">
          {(["focus", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "focus" ? "Focus" : m === "shortBreak" ? "Short Break" : "Long Break"}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative mb-10">
          <svg width="260" height="260" className="-rotate-90">
            <circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/50"
            />
            <motion.circle
              cx="130"
              cy="130"
              r="120"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-color-${mode === "focus" ? "[#1E0E6B]" : mode === "shortBreak" ? "emerald-500" : "blue-500"}`} />
                <stop offset="100%" className={`stop-color-${mode === "focus" ? "[#3B1F8E]" : mode === "shortBreak" ? "teal-500" : "indigo-500"}`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tabular-nums tracking-tight">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-sm text-muted-foreground mt-1 capitalize">
              {mode === "focus" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-10">
          <Button variant="outline" size="lg" onClick={resetTimer} className="h-14 w-14 rounded-full p-0">
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            onClick={toggleTimer}
            className={`h-20 w-20 rounded-full p-0 bg-gradient-to-br ${modeColors[mode]} text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <AnimatePresence mode="wait">
              {isRunning ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause className="h-8 w-8" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play className="h-8 w-8 ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
          <Button variant="outline" size="lg" className="h-14 w-14 rounded-full p-0" onClick={() => setShowSettings((s) => !s)}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-10">
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{sessionsCompleted}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{Math.floor(totalFocusTime / 60)}</p>
              <p className="text-xs text-muted-foreground">Minutes Focused</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-2xl font-bold">{Math.floor(sessionsCompleted / longBreakInterval)}</p>
              <p className="text-xs text-muted-foreground">Cycles</p>
            </CardContent>
          </Card>
        </div>

        {/* Session Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Session Progress</span>
            <span>{sessionsCompleted % longBreakInterval} / {longBreakInterval}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: longBreakInterval }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < sessionsCompleted % longBreakInterval
                    ? "bg-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-md overflow-hidden"
            >
              <Card className="mb-8">
                <CardContent className="p-6 space-y-6">
                  {/* Preset Selection */}
                  <div>
                    <p className="text-sm font-medium mb-3">Timer Preset</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESETS.map((p, i) => (
                        <button
                          key={p.label}
                          onClick={() => setPresetIndex(i)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            presetIndex === i
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-muted hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Durations */}
                  {presetIndex === 3 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-muted-foreground">Focus (min)</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={customFocus}
                          onChange={(e) => setCustomFocus(parseInt(e.target.value) || 25)}
                          className="w-20 px-3 py-1.5 text-sm text-right rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-muted-foreground">Short Break (min)</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={customShortBreak}
                          onChange={(e) => setCustomShortBreak(parseInt(e.target.value) || 5)}
                          className="w-20 px-3 py-1.5 text-sm text-right rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-muted-foreground">Long Break (min)</label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={customLongBreak}
                          onChange={(e) => setCustomLongBreak(parseInt(e.target.value) || 15)}
                          className="w-20 px-3 py-1.5 text-sm text-right rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}

                  {/* Ambient Sound */}
                  <div>
                    <p className="text-sm font-medium mb-3">Ambient Sound</p>
                    <div className="grid grid-cols-5 gap-2">
                      {AMBIENT_SOUNDS.map((s) => {
                        const Icon = s.icon
                        return (
                          <button
                            key={s.id}
                            onClick={() => setAmbientSound(s.id)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                              ambientSound === s.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-muted hover:bg-muted/50 text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-[10px] font-medium">{s.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Text */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {mode === "focus"
              ? "Stay focused. You're making progress."
              : "Take a breather. You've earned it."}
          </p>
        </div>
      </div>
    </div>
  )
}
