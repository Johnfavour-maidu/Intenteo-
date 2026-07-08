"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect, memo } from "react"
import Link from "next/link"
import { Task, TaskPriority, TaskView, Subtask } from "./types"
import { sampleTasks } from "./task-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import {
  Plus,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  GripVertical,
  X,
  Clock,
  Zap,
  ArrowRightLeft,
  Calendar,
  Volume2,
  StopCircle,
} from "lucide-react"
import { useToast, ToastContainer } from "./task-toast"
import { formatDateDDMMYYYY, formatDateLong } from "@/lib/date-utils"

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  priority: "#EF4444",
  progress: "#3B82F6",
  maintenance: "#22C55E",
}

const priorityConfig: Record<
  TaskPriority,
  { label: string; cssColor: string; pastelBg: string; pastelBorder: string; tint: string }
> = {
  priority: {
    label: "Priority",
    cssColor: "var(--brand-secondary)",
    pastelBg: "var(--task-tint-priority)",
    pastelBorder: "var(--task-priority)",
    tint: "var(--task-tint-priority)",
  },
  progress: {
    label: "Progress",
    cssColor: "var(--brand-primary)",
    pastelBg: "var(--task-tint-progress)",
    pastelBorder: "var(--task-progress)",
    tint: "var(--task-tint-progress)",
  },
  maintenance: {
    label: "Maintenance",
    cssColor: "var(--task-maintenance)",
    pastelBg: "var(--task-tint-maintenance)",
    pastelBorder: "var(--task-maintenance)",
    tint: "var(--task-tint-maintenance)",
  },
}

const PriorityDot = memo(function PriorityDot({ priority }: { priority: TaskPriority }) {
  return (
    <div
      className="h-2.5 w-2.5 rounded-full shrink-0"
      style={{ backgroundColor: PRIORITY_COLORS[priority] }}
    />
  )
})

const TaskRow = memo(function TaskRow({
  children,
  tint,
  isDragging,
  isDragOver,
  className = "",
}: {
  children: React.ReactNode
  tint: string
  isDragging?: boolean
  isDragOver?: boolean
  className?: string
}) {
  return (
    <div className={`relative rounded-xl task-row ${className}`}
      style={{
        backgroundColor: tint + "40",
        boxShadow: isDragOver
          ? "0 4px 16px rgba(0,0,0,0.10), 0 0 0 2px var(--primary)"
          : "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
        transform: isDragging ? "scale(0.98)" : isDragOver ? "scale(1.005)" : "none",
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      {children}
    </div>
  )
})

const deadlineOptions = ["Today", "Tomorrow", "Next Week", "Custom"]

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function parseTime(timeStr: string): { hour: number; minute: number } | null {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/)
  if (match) return { hour: parseInt(match[1]), minute: parseInt(match[2]) }
  return null
}

function formatTimeSelection(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function calcDurationFromRange(start: string, end: string): number {
  const s = parseTime(start)
  const e = parseTime(end)
  if (!s || !e) return 0
  return (e.hour * 60 + e.minute) - (s.hour * 60 + s.minute)
}

/* ────────────────────────────────────────────────────── */
/* Time Range Picker                                     */
/* ────────────────────────────────────────────────────── */

const TIME_PRESETS = [
  { value: "anytime" as const, label: "Anytime", desc: "" },
  { value: "morning" as const, label: "Morning", desc: "6:00 AM – 11:59 AM" },
  { value: "afternoon" as const, label: "Afternoon", desc: "12:00 PM – 4:59 PM" },
  { value: "evening" as const, label: "Evening", desc: "5:00 PM – 8:59 PM" },
  { value: "night" as const, label: "Night", desc: "9:00 PM – 5:59 AM" },
  { value: "custom" as const, label: "Custom Time", desc: "Set start & end" },
]

const TIME_PRESET_MAP: Record<string, string> = {
  morning: "06:00",
  afternoon: "12:00",
  evening: "17:00",
  night: "21:00",
}
const TIME_PRESET_END: Record<string, string> = {
  morning: "11:59",
  afternoon: "16:59",
  evening: "20:59",
  night: "05:59",
}

function CustomTimeInput({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const parsed = parseTime(value) || { hour: 9, minute: 0 }
  const isPM = parsed.hour >= 12
  const h12 = parsed.hour === 0 ? 12 : parsed.hour > 12 ? parsed.hour - 12 : parsed.hour

  const setHour = (h: number) => {
    let full = h
    if (isPM && h !== 12) full = h + 12
    if (!isPM && h === 12) full = 0
    onChange(formatTimeSelection(full, parsed.minute))
  }
  const setMin = (m: number) => onChange(formatTimeSelection(parsed.hour, m))
  const toggleAmPm = () => {
    if (isPM) {
      const h = parsed.hour === 12 ? 0 : parsed.hour - 12
      onChange(formatTimeSelection(h, parsed.minute))
    } else {
      const h = parsed.hour === 12 ? 12 : parsed.hour + 12
      onChange(formatTimeSelection(h, parsed.minute))
    }
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const mins = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  return (
    <div className="flex-1">
      <span className="text-[11px] font-medium text-muted-foreground mb-1.5 block">{label}</span>
      <div className="flex items-center gap-1.5">
        <select value={h12} onChange={(e) => setHour(Number(e.target.value))}
          className="flex-1 h-10 px-2 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
          {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
        </select>
        <span className="text-muted-foreground font-medium">:</span>
        <select value={parsed.minute} onChange={(e) => setMin(Number(e.target.value))}
          className="flex-1 h-10 px-2 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
          {mins.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
        </select>
        <button type="button" onClick={toggleAmPm}
          className="h-10 px-3 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-sm font-medium hover:bg-muted/50 transition-colors cursor-pointer">
          {isPM ? "PM" : "AM"}
        </button>
      </div>
    </div>
  )
}

function TimeRangePicker({
  startTime,
  endTime,
  onChange,
  timeRangeType,
  onTimeRangeTypeChange,
}: {
  startTime: string
  endTime: string
  onChange: (start: string, end: string) => void
  timeRangeType: import("./types").TimeRange
  onTimeRangeTypeChange: (v: import("./types").TimeRange) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dur = calcDurationFromRange(startTime, endTime)
  const currentLabel = TIME_PRESETS.find((p) => p.value === timeRangeType)?.label || "Anytime"

  return (
    <div className="space-y-3">
      {/* Time Range Selector */}
      <div className="relative">
        <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full h-10 px-3 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-sm flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{currentLabel}</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>
        {dropdownOpen && (
          <div className="absolute z-30 mt-1 w-full rounded-xl border bg-background shadow-xl p-1">
            {TIME_PRESETS.map((preset) => (
              <button key={preset.value} type="button"
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  timeRangeType === preset.value
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted/50 text-foreground"
                }`}
                onClick={() => {
                  onTimeRangeTypeChange(preset.value)
                  setDropdownOpen(false)
                  if (preset.value !== "custom" && preset.value !== "anytime") {
                    const s = TIME_PRESET_MAP[preset.value]
                    const e = TIME_PRESET_END[preset.value]
                    if (s && e) onChange(s, e)
                  } else if (preset.value === "anytime") {
                    onChange("09:00", "09:30")
                  }
                }}>
                <span>{preset.label}</span>
                {preset.desc && <span className="text-[11px] text-muted-foreground">{preset.desc}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Custom Time Inputs */}
      {timeRangeType === "custom" && (
        <>
          <div className="flex items-start gap-3">
            <CustomTimeInput value={startTime} onChange={(v) => onChange(v, endTime)} label="Start Time" />
            <CustomTimeInput value={endTime} onChange={(v) => onChange(startTime, v)} label="End Time" />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Duration: {dur > 0 ? formatDuration(dur) : "\u2014"}
          </p>
        </>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Productivity Score                                    */
/* ────────────────────────────────────────────────────── */

const ProductivityScore = memo(function ProductivityScore({ percentage }: { percentage: number }) {
  return (
    <div className="flex items-center gap-2">
      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground hidden sm:inline">Productivity Score</span>
      <div className="h-1.5 w-20 bg-muted rounded-full overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
      <span className="text-xs font-semibold tabular-nums">{percentage}%</span>
    </div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Move Task Popover                                     */
/* ────────────────────────────────────────────────────── */

function MoveTaskPopover({ taskId, currentDeadline, onMove, onClose }: {
  taskId: string
  currentDeadline: string
  onMove: (taskId: string, deadline: string) => void
  onClose: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }} className="absolute right-0 top-full mt-1 w-44 rounded-xl border bg-background shadow-xl p-1 z-30">
      <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium">Move to</p>
      {deadlineOptions.map((d) => (
        <button key={d} disabled={d === currentDeadline}
          className={`flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg transition-colors text-left ${
            d === currentDeadline ? "text-muted-foreground/40 cursor-default" : "hover:bg-muted"
          }`} onClick={() => { onMove(taskId, d); onClose() }}>
          <Calendar className="h-3 w-3" /> {d}
        </button>
      ))}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Move Subtask Popover                                  */
/* ────────────────────────────────────────────────────── */

function MoveSubtaskPopover({ subtaskId, currentTaskId, tasks, onMove, onClose }: {
  subtaskId: string
  currentTaskId: string
  tasks: Task[]
  onMove: (fromTaskId: string, subtaskId: string, toTaskId: string) => void
  onClose: () => void
}) {
  const otherTasks = tasks.filter((t) => t.id !== currentTaskId)
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }} className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-background shadow-xl p-1 z-30 max-h-40 overflow-y-auto">
      <p className="text-[10px] text-muted-foreground px-2 py-1 font-medium">Move to task</p>
      {otherTasks.length === 0 && <p className="text-[10px] text-muted-foreground/60 px-2 py-1">No other tasks</p>}
      {otherTasks.map((t) => (
        <button key={t.id} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded-lg hover:bg-muted transition-colors text-left truncate"
          onClick={() => { onMove(currentTaskId, subtaskId, t.id); onClose() }}>
          <ArrowRightLeft className="h-3 w-3 shrink-0" /> {t.title}
        </button>
      ))}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Task History Calendar                                 */
/* ────────────────────────────────────────────────────── */

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0]
}

function TaskHistoryCalendar({ taskHistory, onSelectDate, onClose, selectedDate }: {
  taskHistory: Record<string, Task[]>
  onSelectDate: (date: string, tasks: Task[]) => void
  onClose: () => void
  selectedDate: string | null
}) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("default", { month: "long", year: "numeric" })

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      className="absolute right-0 top-full mt-2 w-72 rounded-2xl border bg-background shadow-2xl p-4 z-40">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="h-6 w-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        </button>
        <span className="text-sm font-medium">{monthLabel}</span>
        <button onClick={nextMonth} className="h-6 w-6 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const hasTasks = taskHistory[dateStr] && taskHistory[dateStr].length > 0
          const isToday = dateStr === toISODate(today)
          const isSelected = dateStr === selectedDate
          return (
            <button key={dateStr}
              className={`relative h-8 w-full rounded-lg text-xs flex flex-col items-center justify-center transition-colors ${
                isSelected ? "bg-primary text-primary-foreground font-semibold ring-2 ring-primary/40" : isToday ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
              }`}
              onClick={() => {
                onSelectDate(dateStr, taskHistory[dateStr] || [])
                onClose()
              }}>
              {day}
              {hasTasks && (
                <div className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-3 pt-2 border-t text-[10px] text-muted-foreground">
        Click a highlighted day to view task history
      </div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Day History View                                      */
/* ────────────────────────────────────────────────────── */

function DayHistoryView({ date, tasks, onClose, onMoveToToday }: {
  date: string
  tasks: Task[]
  onClose: () => void
  onMoveToToday: (tasks: Task[]) => void
}) {
  const incomplete = tasks.filter((t) => t.recurrence === "daily" ? !(t.dailyCompletions || {})[date] : !t.completed)
  const completed = tasks.filter((t) => t.recurrence === "daily" ? !!(t.dailyCompletions || {})[date] : t.completed)
  const displayDate = formatDateLong(date)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="rounded-2xl border bg-card p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">{displayDate}</h3>
          <p className="text-[10px] text-muted-foreground">{tasks.length} tasks \u00B7 {completed.length} completed</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1.5">
        {tasks.map((task) => {
          const isCompleted = task.recurrence === "daily" ? !!(task.dailyCompletions || {})[date] : task.completed
          return (
            <div key={task.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${isCompleted ? "bg-muted/30" : "bg-muted/50"}`}>
              <div className={`h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${isCompleted ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                {isCompleted && <svg className="h-2 w-2 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <span className={`flex-1 ${isCompleted ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
              <span className="text-muted-foreground">{task.timeRange}</span>
            </div>
          )
        })}
      </div>
      {incomplete.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2">Move {incomplete.length} unfinished task{incomplete.length !== 1 ? "s" : ""} to today?</p>
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={() => { onMoveToToday(incomplete); onClose() }}>Move All</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Empty State                                            */
/* ────────────────────────────────────────────────────── */

function EmptyState({ onCreate, viewingDate }: { onCreate: () => void; viewingDate: string }) {
  const isToday = viewingDate === new Date().toISOString().split("T")[0]
  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <svg className="h-8 w-8 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-1">{isToday ? "No tasks planned today." : "No tasks for this day."}</h3>
      <p className="text-sm text-muted-foreground mb-5">Start by adding your first intentional task.</p>
      <Button onClick={onCreate} className="glow"><Plus className="mr-1 h-4 w-4" /> Add Task</Button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/* MAIN TASKS PAGE                                         */
/* ═══════════════════════════════════════════════════════ */

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return sampleTasks
    try {
      const saved = localStorage.getItem("intenteo-tasks")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedIds = new Set(parsed.map((t: Task) => t.id))
          const missingDemo = sampleTasks.filter((t) => !savedIds.has(t.id))
          if (missingDemo.length > 0) return [...parsed, ...missingDemo]
          return parsed
        }
      }
    } catch {}
    return sampleTasks
  })
  const [activeView, setActiveView] = useState<TaskView>("list")
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [expandAll, setExpandAll] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragType, setDragType] = useState<"task" | "subtask" | null>(null)
  const [dragSourceTaskId, setDragSourceTaskId] = useState<string | null>(null)
  const [movePopoverTaskId, setMovePopoverTaskId] = useState<string | null>(null)
  const [moveSubtaskInfo, setMoveSubtaskInfo] = useState<{ taskId: string; subtaskId: string } | null>(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [dayHistory, setDayHistory] = useState<{ date: string; tasks: Task[] } | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState("")
  const recognitionRef = useRef<unknown>(null)

  const { toasts, addToast, removeToast } = useToast()

  const [formTitle, setFormTitle] = useState("")
  const [formWhy, setFormWhy] = useState("")
  const [formPriority, setFormPriority] = useState<TaskPriority>("progress")
  const [formStartHour, setFormStartHour] = useState(9)
  const [formStartMin, setFormStartMin] = useState(0)
  const [formEndHour, setFormEndHour] = useState(9)
  const [formEndMin, setFormEndMin] = useState(30)
  const [formRecurrence, setFormRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none")
  const [formRecurrenceInterval, setFormRecurrenceInterval] = useState(1)
  const [formRecurrenceWeekdays, setFormRecurrenceWeekdays] = useState<number[]>([])
  const [formSubtasks, setFormSubtasks] = useState<{ id: string; title: string; completed: boolean }[]>([])
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split("T")[0])
  const [formTimeRangeType, setFormTimeRangeType] = useState<import("./types").TimeRange>("anytime")
  const [formLinkedHabitId, setFormLinkedHabitId] = useState("")
  const [formLinkedGoalId, setFormLinkedGoalId] = useState("")
  const [formIntention, setFormIntention] = useState("")
  const [recurringEditPrompt, setRecurringEditPrompt] = useState<{ task: Task; scope: "this" | "thisAndFuture" | "all" } | null>(null)
  const [carryOverOpen, setCarryOverOpen] = useState(false)

  const taskHistory = useMemo(() => {
    const history: Record<string, Task[]> = {}
    tasks.forEach((t) => {
      const d = t.date
      if (!history[d]) history[d] = []
      history[d].push(t)
      if (t.recurrence === "daily") {
        const created = new Date(t.createdAt)
        const today = new Date()
        const cur = new Date(created)
        cur.setDate(cur.getDate() + 1)
        while (cur <= today) {
          const ds = cur.toISOString().split("T")[0]
          if (ds !== d) {
            if (!history[ds]) history[ds] = []
            history[ds].push({ ...t, date: ds })
          }
          cur.setDate(cur.getDate() + 1)
        }
      }
    })
    return history
  }, [tasks])

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], [])
  const viewingDate = selectedDate || todayISO
  const isViewingPast = useMemo(() => viewingDate < todayISO, [viewingDate, todayISO])

  // Carry-over: tasks from previous days that are incomplete and not daily
  const carryOverTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.date >= todayISO) return false
      if (t.recurrence === "daily") return false
      if (t.completed) return false
      return true
    })
  }, [tasks, todayISO])

  const displayTasks = useMemo(() => {
    const tasksForDate = tasks.filter((t) => {
      if (t.date === viewingDate) return true
      if (t.recurrence === "daily") {
        const created = new Date(t.createdAt)
        const view = new Date(viewingDate + "T12:00:00")
        return view > created
      }
      return false
    })
    return tasksForDate
  }, [tasks, viewingDate])

  const completedToday = useMemo(() => {
    const viewDate = selectedDate || todayISO
    return displayTasks.filter((t) => t.recurrence === "daily" ? !!(t.dailyCompletions || {})[viewDate] : t.completed).length
  }, [displayTasks, selectedDate, todayISO])
  const remainingToday = useMemo(() => displayTasks.length - completedToday, [displayTasks, completedToday])
  const totalToday = completedToday + remainingToday
  const productivity = useMemo(() => (totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)), [completedToday, totalToday])

  useEffect(() => {
    if (typeof window !== "undefined" && tasks.length > 0) {
      localStorage.setItem("intenteo-tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("intenteo-expand-all", JSON.stringify(expandAll))
    }
  }, [expandAll])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("intenteo-expand-all")
      if (saved === "true") setExpandAll(true)
    }
  }, [])

  useEffect(() => {
    if (expandAll && tasks.length > 0) {
      setExpandedTasks(new Set(tasks.filter((t) => t.subtasks.length > 0).map((t) => t.id)))
    } else if (!expandAll) {
      setExpandedTasks(new Set())
    }
  }, [expandAll, tasks])

  const getSubtaskProgress = useCallback((subtasks: Subtask[]) => {
    if (subtasks.length === 0) return 0
    return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedTasks((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }, [])

  const toggleTask = useCallback((id: string) => {
    const viewDate = selectedDate || todayISO
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t
      if (t.recurrence === "daily") {
        const dc = { ...(t.dailyCompletions || {}) }
        dc[viewDate] = !dc[viewDate]
        return { ...t, dailyCompletions: dc }
      }
      return { ...t, completed: !t.completed }
    }))
  }, [selectedDate, todayISO])

  const handleToggleTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task && !task.completed) addToast()
    toggleTask(id)
  }, [tasks, toggleTask, addToast])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) => prev.map((t) =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) } : t
    ))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const moveTask = useCallback((taskId: string, newDeadline: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, deadline: newDeadline } : t)))
  }, [])

  const moveSubtask = useCallback((fromTaskId: string, subtaskId: string, toTaskId: string) => {
    setTasks((prev) => {
      const subtask = prev.find((t) => t.id === fromTaskId)?.subtasks.find((s) => s.id === subtaskId)
      if (!subtask) return prev
      return prev.map((t) => {
        if (t.id === fromTaskId) return { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
        if (t.id === toTaskId) return { ...t, subtasks: [...t.subtasks, subtask] }
        return t
      })
    })
  }, [])

  const handleMoveToToday = useCallback((movedTasks: Task[]) => {
    setTasks((prev) => prev.map((t) => {
      if (movedTasks.some((m) => m.id === t.id)) return { ...t, deadline: "Today" }
      return t
    }))
    addToast(`${movedTasks.length} unfinished task${movedTasks.length !== 1 ? "s" : ""} moved to today.`)
  }, [addToast])

  const handleCreateTask = useCallback(() => {
    if (!formTitle.trim()) return
    const startStr = formatTimeSelection(formStartHour, formStartMin)
    const endStr = formatTimeSelection(formEndHour, formEndMin)
    const dur = calcDurationFromRange(startStr, endStr)
    const filteredSubs = formSubtasks.filter((s) => s.title.trim()).map((s) => ({ ...s, id: `sub-${Date.now()}-${s.id}`, completed: false }))
    const isAnytime = formTimeRangeType === "anytime"
    const timeRange = isAnytime ? "Anytime" : `${startStr} \u2013 ${endStr}`
    const newTask: Task = {
      id: `new-${Date.now()}`, title: formTitle, whyItMatters: formWhy, priority: formPriority,
      deadline: formDate === todayISO ? "Today" : new Date(formDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", month: "short", day: "numeric" }),
      date: formDate, dueTime: isAnytime ? "Anytime" : startStr, timeRange, timeRangeType: formTimeRangeType,
      estimatedDuration: isAnytime ? 0 : (dur > 0 ? dur : 30), notes: "", subtasks: filteredSubs, recurrence: formRecurrence,
      recurrenceInterval: formRecurrenceInterval, recurrenceWeekdays: formRecurrenceWeekdays,
      completed: false, order: tasks.length, createdAt: new Date().toISOString(),
      dailyCompletions: formRecurrence === "daily" ? { [formDate]: false } : undefined,
      linkedHabitId: formLinkedHabitId || undefined,
      linkedGoalId: formLinkedGoalId || undefined,
      todayIntention: formIntention || undefined,
    }
    setTasks((prev) => [...prev, newTask])
    setFormTitle(""); setFormWhy(""); setFormPriority("progress")
    setFormStartHour(9); setFormStartMin(0)
    setFormEndHour(9); setFormEndMin(30)
    setFormRecurrence("none"); setFormRecurrenceInterval(1); setFormRecurrenceWeekdays([])
    setFormSubtasks([]); setFormDate(todayISO)
    setFormTimeRangeType("anytime"); setFormLinkedHabitId(""); setFormLinkedGoalId(""); setFormIntention("")
    setCreateOpen(false)
  }, [formTitle, formWhy, formPriority, formStartHour, formStartMin, formEndHour, formEndMin, formRecurrence, formRecurrenceInterval, formRecurrenceWeekdays, formSubtasks, formDate, formTimeRangeType, formLinkedHabitId, formLinkedGoalId, formIntention, todayISO, tasks.length])

  const handleSaveEdit = useCallback(() => {
    if (!editingTask) return
    if (editingTask.recurrence === "daily" && !recurringEditPrompt) {
      setRecurringEditPrompt({ task: editingTask, scope: "this" })
      return
    }
    if (recurringEditPrompt) {
      const { task: origTask } = recurringEditPrompt
      const viewDate = selectedDate || todayISO
      if (recurringEditPrompt.scope === "this") {
        setTasks((prev) => prev.map((t) => {
          if (t.id !== editingTask.id) return t
          const dc = { ...(t.dailyCompletions || {}) }
          dc[viewDate] = t.completed
          return { ...t, ...editingTask, dailyCompletions: dc }
        }))
      } else if (recurringEditPrompt.scope === "thisAndFuture") {
        setTasks((prev) => prev.map((t) => {
          if (t.id !== editingTask.id) return t
          const dc = { ...(t.dailyCompletions || {}) }
          const created = new Date(t.createdAt)
          const view = new Date(viewDate + "T12:00:00")
          const cur = new Date(view)
          while (cur >= created) {
            const ds = cur.toISOString().split("T")[0]
            if (dc[ds] === undefined) dc[ds] = false
            cur.setDate(cur.getDate() - 1)
          }
          return { ...editingTask, createdAt: new Date(viewDate + "T12:00:00").toISOString(), dailyCompletions: dc }
        }))
      } else {
        setTasks((prev) => prev.map((t) => t.id === editingTask.id ? editingTask : t))
      }
    } else {
      setTasks((prev) => prev.map((t) => t.id === editingTask.id ? editingTask : t))
    }
    setEditingTask(null); setRecurringEditPrompt(null)
  }, [editingTask, recurringEditPrompt, selectedDate, todayISO])

  const addSubtaskInline = useCallback((taskId: string) => {
    const newSub: Subtask = { id: `sub-${Date.now()}`, title: "New subtask", completed: false }
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t)))
    setExpandedTasks((prev) => new Set(prev).add(taskId))
  }, [])

  const handleTaskDragStart = useCallback((id: string) => {
    setDraggedId(id); setDragType("task"); setDragSourceTaskId(null)
  }, [])

  const handleTaskDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (dragType === "task") setDragOverId(id)
  }, [dragType])

  const handleTaskDrop = useCallback((targetId: string) => {
    if (!draggedId || draggedId === targetId || dragType !== "task") { setDraggedId(null); setDragOverId(null); setDragType(null); return }
    setTasks((prev) => {
      const items = [...prev]
      const d = items.findIndex((t) => t.id === draggedId)
      const r = items.findIndex((t) => t.id === targetId)
      if (d === -1 || r === -1) return prev
      const [dragged] = items.splice(d, 1)
      items.splice(r, 0, dragged)
      return items.map((t, i) => ({ ...t, order: i }))
    })
    setDraggedId(null); setDragOverId(null); setDragType(null)
  }, [draggedId, dragType])

  const handleSubtaskDragStart = useCallback((e: React.DragEvent, taskId: string, subtaskId: string) => {
    e.stopPropagation(); setDraggedId(subtaskId); setDragType("subtask"); setDragSourceTaskId(taskId)
  }, [])

  const handleSubtaskDragOver = useCallback((e: React.DragEvent, taskId: string) => {
    e.preventDefault(); e.stopPropagation()
    if (dragType === "subtask") setDragOverId(taskId)
  }, [dragType])

  const handleSubtaskDrop = useCallback((e: React.DragEvent, targetTaskId: string) => {
    e.stopPropagation()
    if (!draggedId || dragType !== "subtask" || !dragSourceTaskId) {
      setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null); return
    }
    if (dragSourceTaskId === targetTaskId) {
      setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null); return
    }
    moveSubtask(dragSourceTaskId, draggedId, targetTaskId)
    setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null)
  }, [draggedId, dragType, dragSourceTaskId, moveSubtask])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null)
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreateOpen(false); setMovePopoverTaskId(null); setMoveSubtaskInfo(null)
        setEditingTask(null); setCalendarOpen(false); setDayHistory(null)
      }
    }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
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
      setVoiceStatus("")
      return
    }

    const recognition = new (SpeechRecognitionAPI as new () => Record<string, unknown>)()
    recognition.lang = "en-GB"
    recognition.continuous = true
    recognition.interimResults = true
    recognitionRef.current = recognition
    let finalTranscript = ""

    recognition.onresult = (event: unknown) => {
      const e = event as { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } } }
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript
        if (e.results[i].isFinal) { finalTranscript += transcript }
        else { interim += transcript }
      }
      setVoiceStatus(interim || "Listening...")
    }

    recognition.onend = () => {
      setIsListening(false)
      setVoiceStatus("")
      if (finalTranscript.trim()) {
        const parsedTasks = parseVoiceTasks(finalTranscript)
        if (parsedTasks.length > 0) {
          setFormTitle(parsedTasks[0].title)
          if (parsedTasks[0].timeRange) {
            const parts = parsedTasks[0].timeRange.split(" \u2013 ")
            if (parts.length === 2) {
              const s = parseTime(parts[0])
              const en = parseTime(parts[1])
              if (s) { setFormStartHour(s.hour); setFormStartMin(s.minute) }
              if (en) { setFormEndHour(en.hour); setFormEndMin(en.minute) }
            }
          }
          if (parsedTasks[0].duration && !parsedTasks[0].timeRange) {
            const dur = parseDurationText(parsedTasks[0].duration)
            if (dur > 0) {
              const endMin = formStartHour * 60 + formStartMin + dur
              setFormEndHour(Math.floor(endMin / 60) % 24)
              setFormEndMin(endMin % 60)
            }
          }
          setCreateOpen(true)
          addToast(`Captured: "${parsedTasks[0].title}". Review and save.`)
        } else {
          setFormTitle(finalTranscript.trim().slice(0, 100))
          setCreateOpen(true)
          addToast("Could not parse tasks. Please review and edit.")
        }
      }
    }

    recognition.onerror = () => { setIsListening(false); setVoiceStatus("") }
    (recognition as { start: () => void }).start()
    setIsListening(true)
    setVoiceStatus("Listening...")
  }, [isListening, formStartHour, formStartMin, addToast])

  const renderSubtasks = useCallback((task: Task, isExpanded: boolean) => (
    <AnimatePresence initial={false}>
      {isExpanded && task.subtasks.length > 0 && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} className="overflow-hidden">
          <div className="pl-10 pr-4 py-1.5 space-y-0.5">
            {task.subtasks.map((sub) => {
              const isSubDragging = draggedId === sub.id
              const isSubDragOver = dragOverId === task.id && dragType === "subtask" && draggedId !== sub.id
              return (
                <div key={sub.id} draggable
                  onDragStart={(e) => handleSubtaskDragStart(e, task.id, sub.id)}
                  onDragOver={(e) => handleSubtaskDragOver(e, task.id)}
                  onDrop={(e) => handleSubtaskDrop(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2.5 py-1.5 pl-4 pr-2 rounded-lg hover:bg-muted/30 transition-colors group/sub relative cursor-grab active:cursor-grabbing ${
                    isSubDragging ? "opacity-40 scale-[0.98]" : ""
                  } ${isSubDragOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}>
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0 opacity-0 group-hover/sub:opacity-100">
                    <GripVertical className="h-3 w-3" />
                  </div>
                  <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                    {sub.completed ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                        <div className="h-3.5 w-3.5 rounded bg-primary flex items-center justify-center">
                          <svg className="h-2 w-2 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30 hover:border-primary transition-colors" />
                    )}
                  </button>
                  <span className={`text-xs flex-1 ${sub.completed ? "line-through text-muted-foreground" : ""}`}>{sub.title}</span>
                  <div className="relative">
                    <button className="opacity-0 group-hover/sub:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); setMoveSubtaskInfo(moveSubtaskInfo?.subtaskId === sub.id ? null : { taskId: task.id, subtaskId: sub.id }) }}>
                      <ArrowRightLeft className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                    <AnimatePresence>
                      {moveSubtaskInfo?.subtaskId === sub.id && (
                        <MoveSubtaskPopover subtaskId={sub.id} currentTaskId={task.id} tasks={tasks}
                          onMove={moveSubtask} onClose={() => setMoveSubtaskInfo(null)} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )
            })}
            <button onClick={() => addSubtaskInline(task.id)} className="flex items-center gap-1.5 py-1 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="h-3 w-3" /> Add subtask
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [toggleSubtask, addSubtaskInline, tasks, moveSubtask, moveSubtaskInfo, draggedId, dragOverId, dragType, handleSubtaskDragStart, handleSubtaskDragOver, handleSubtaskDrop, handleDragEnd])

  /* ═══════════════════════════════════════════════════════ */
  /* LIST VIEW                                              */
  /* ═══════════════════════════════════════════════════════ */

  const renderListView = useCallback(() => {
    if (displayTasks.length === 0) return <EmptyState onCreate={() => { setFormDate(selectedDate || todayISO); setCreateOpen(true) }} viewingDate={viewingDate} />
    return (
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="sticky top-0 z-10 flex items-center gap-4 px-5 py-3 border-b bg-background/95 backdrop-blur-sm text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="w-6 shrink-0"></div>
          <div className="w-6 shrink-0"></div>
          <div className="flex-1 min-w-0">Task</div>
          <div className="hidden sm:block w-[160px] shrink-0">Time Range</div>
          <div className="hidden sm:block w-[80px] shrink-0">Duration</div>
          <div className="w-[140px] shrink-0">Progress</div>
          <div className="w-[100px] shrink-0">Actions</div>
        </div>

        <LayoutGroup>
          {displayTasks.map((task, i) => {
            const viewDate = selectedDate || todayISO
            const isCompleted = task.recurrence === "daily" ? !!(task.dailyCompletions || {})[viewDate] : task.completed
            const progress = isCompleted ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandAll || expandedTasks.has(task.id)
            const isDragging = draggedId === task.id && dragType === "task"
            const isDragOver = dragOverId === task.id && dragOverId !== draggedId && dragType === "task"
            const pConfig = priorityConfig[task.priority]

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015, layout: { type: "spring", stiffness: 300, damping: 30 } }}>
                <TaskRow tint={pConfig.tint} isDragging={isDragging} isDragOver={isDragOver}>
                  <div
                    draggable={!isViewingPast}
                    onDragStart={() => handleTaskDragStart(task.id)}
                    onDragOver={(e) => handleTaskDragOver(e, task.id)}
                    onDrop={() => handleTaskDrop(task.id)} onDragEnd={handleDragEnd}
                    className="flex items-center gap-4 pl-5 pr-5 py-3.5 group cursor-default"
                  >
                    {/* Priority Dot */}
                    <div className="w-6 shrink-0 flex items-center justify-center">
                      <PriorityDot priority={task.priority} />
                    </div>

                    {/* Checkbox */}
                    <div className="w-6 shrink-0">
                      <button onClick={() => handleToggleTask(task.id)}>
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                        )}
                      </button>
                    </div>

                    {/* Task Name */}
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {!isViewingPast && (
                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium truncate px-1 py-0.5 rounded transition-colors ${isViewingPast ? "" : "cursor-pointer hover:bg-muted/50"} ${isCompleted ? "line-through text-muted-foreground" : ""}`}
                            onClick={() => !isViewingPast && setEditingTask({ ...task })}>
                            {task.title}
                          </span>
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 shrink-0">
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                          {!expandAll && (
                            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 transition-opacity"
                              onClick={() => toggleExpanded(task.id)}>
                              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                            </Button>
                          )}
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] text-muted-foreground hidden group-hover:inline">
                              {isExpanded ? "Collapse" : `Show ${task.subtasks.length}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time Range */}
                    <div className="hidden sm:block w-[160px] shrink-0">
                      <div className={`flex items-center gap-1.5 text-xs text-muted-foreground py-0.5 rounded transition-colors ${isViewingPast ? "" : "cursor-pointer hover:bg-muted/50"}`}
                        onClick={() => !isViewingPast && setEditingTask({ ...task })}>
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>{task.timeRange}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden sm:block w-[80px] shrink-0">
                      <span className={`text-xs text-muted-foreground py-0.5 rounded transition-colors ${isViewingPast ? "" : "cursor-pointer hover:bg-muted/50"}`}
                        onClick={() => !isViewingPast && setEditingTask({ ...task })}>
                        {formatDuration(task.estimatedDuration)}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="w-[140px] shrink-0 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                    </div>

                    {/* Actions */}
                    <div className="w-[100px] shrink-0 flex items-center gap-1">
                      {!isViewingPast && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); setEditingTask({ ...task }) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <div className="relative">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); setMovePopoverTaskId(movePopoverTaskId === task.id ? null : task.id) }}>
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>
                        <AnimatePresence>
                          {movePopoverTaskId === task.id && (
                            <MoveTaskPopover taskId={task.id} currentDeadline={task.deadline} onMove={moveTask} onClose={() => setMovePopoverTaskId(null)} />
                          )}
                        </AnimatePresence>
                      </div>
                      {!isViewingPast && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 text-destructive"
                          onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {renderSubtasks(task, isExpanded)}
                </TaskRow>
              </motion.div>
            )
          })}
        </LayoutGroup>
      </div>
    )
  }, [displayTasks, expandedTasks, expandAll, draggedId, dragOverId, dragType, getSubtaskProgress, handleTaskDragStart, handleTaskDragOver, handleTaskDrop, handleDragEnd, handleToggleTask, toggleExpanded, renderSubtasks, deleteTask, moveTask, movePopoverTaskId, moveSubtask, moveSubtaskInfo, isViewingPast])

  /* ═══════════════════════════════════════════════════════ */
  /* BOARD VIEW                                              */
  /* ═══════════════════════════════════════════════════════ */

  const renderBoardView = useCallback(() => {
    if (displayTasks.length === 0) return <EmptyState onCreate={() => { setFormDate(selectedDate || todayISO); setCreateOpen(true) }} viewingDate={viewingDate} />
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <LayoutGroup>
          {displayTasks.map((task, i) => {
            const viewDate = selectedDate || todayISO
            const isCompleted = task.recurrence === "daily" ? !!(task.dailyCompletions || {})[viewDate] : task.completed
            const progress = isCompleted ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandAll || expandedTasks.has(task.id)
            const pConfig = priorityConfig[task.priority]
            const completedSubs = task.subtasks.filter((s) => s.completed).length

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, layout: { type: "spring", stiffness: 300, damping: 30 } }}>
                <TaskRow tint={pConfig.tint} className="group overflow-hidden">
                  <div className="pl-10 pr-10 p-4">
                    <div className="flex items-start gap-2.5 mb-3">
                      <PriorityDot priority={task.priority} />
                      <button onClick={() => handleToggleTask(task.id)} className="shrink-0 mt-0.5">
                        {isCompleted ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-sm font-semibold truncate px-1 py-0.5 rounded transition-colors ${isViewingPast ? "" : "cursor-pointer hover:bg-muted/50"} ${isCompleted ? "line-through text-muted-foreground" : ""}`}
                            onClick={() => !isViewingPast && setEditingTask({ ...task })}>{task.title}</h3>
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 shrink-0">{completedSubs}/{task.subtasks.length}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{task.timeRange}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span>{formatDuration(task.estimatedDuration)}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="text-[10px]">{task.deadline}</span>
                    </div>

                    {task.subtasks.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {task.subtasks.slice(0, isExpanded ? undefined : 3).map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2">
                            <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                              {sub.completed ? (
                                <div className="h-3 w-3 rounded bg-primary flex items-center justify-center">
                                  <svg className="h-1.5 w-1.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                </div>
                              ) : (
                                <div className="h-3 w-3 rounded border border-muted-foreground/30" />
                              )}
                            </button>
                            <span className={`text-[11px] ${sub.completed ? "line-through text-muted-foreground" : ""}`}>{sub.title}</span>
                          </div>
                        ))}
                        {task.subtasks.length > 3 && !isExpanded && (
                          <button onClick={() => toggleExpanded(task.id)} className="text-[11px] text-primary hover:underline pl-5">+{task.subtasks.length - 3} more</button>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isViewingPast && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted"
                          onClick={() => setEditingTask({ ...task })}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      <div className="relative">
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted"
                          onClick={() => setMovePopoverTaskId(movePopoverTaskId === task.id ? null : task.id)}>
                          <ArrowRightLeft className="h-3 w-3" />
                        </Button>
                        <AnimatePresence>
                          {movePopoverTaskId === task.id && (
                            <MoveTaskPopover taskId={task.id} currentDeadline={task.deadline} onMove={moveTask} onClose={() => setMovePopoverTaskId(null)} />
                          )}
                        </AnimatePresence>
                      </div>
                      {!isViewingPast && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 text-destructive" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </TaskRow>
              </motion.div>
            )
          })}
        </LayoutGroup>
      </div>
    )
  }, [displayTasks, expandedTasks, expandAll, getSubtaskProgress, handleToggleTask, toggleExpanded, toggleSubtask, deleteTask, moveTask, movePopoverTaskId, isViewingPast])

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tasks{selectedDate ? ` \u2014 ${formatDateLong(selectedDate)}` : " \u2014 Today"}
            </h1>
            <p className="text-sm text-foreground mt-0.5 tracking-tight">
              <span style={{ color: "var(--brand-primary)" }}>{totalToday}</span> <span className="text-foreground">Tasks</span>{" \u00B7 "}
              <span style={{ color: "var(--brand-primary)" }}>{completedToday}</span> <span className="text-foreground">Completed</span>{" \u00B7 "}
              <span style={{ color: "var(--foreground)" }}>{remainingToday}</span> <span className="text-foreground">To Go</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <ProductivityScore percentage={productivity} />

            <Link href="/journal">
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Write</span>
              </Button>
            </Link>

            {/* Calendar History */}
            <div className="relative">
              <Tooltip label="Task History">
                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                  onClick={() => { setCalendarOpen(!calendarOpen); setDayHistory(null) }}>
                  <Calendar className="h-4 w-4" />
                </button>
              </Tooltip>
              <AnimatePresence>
                {calendarOpen && (
                  <TaskHistoryCalendar
                    taskHistory={taskHistory}
                    onSelectDate={(date, histTasks) => { setSelectedDate(date); setDayHistory({ date, tasks: histTasks }); setCalendarOpen(false) }}
                    onClose={() => setCalendarOpen(false)}
                    selectedDate={selectedDate} />
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-0.5 p-0.5 bg-muted rounded-xl">
              <Button variant={activeView === "list" ? "default" : "ghost"} size="sm" className="h-8 px-3" onClick={() => setActiveView("list")}>
                <List className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline text-xs">List</span>
              </Button>
              <Button variant={activeView === "table" ? "default" : "ghost"} size="sm" className="h-8 px-3" onClick={() => setActiveView("table")}>
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline text-xs">Board</span>
              </Button>
            </div>

            {/* Voice Capture */}
            <Tooltip label={isListening ? "Stop Dictation" : "Voice Task"}>
              <button
                className={`h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95 ${isListening ? "animate-pulse" : ""}`}
                style={{ backgroundColor: isListening ? "#DC2626" : "var(--brand-primary)", color: "white" }}
                onClick={toggleListening}>
                {isListening ? <StopCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </Tooltip>

            <Button className="glow h-9" onClick={() => { setFormDate(selectedDate || todayISO); setCreateOpen(true) }}>
              <Plus className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {voiceStatus && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-3 py-1.5 rounded-lg bg-primary/10 text-xs text-primary flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {voiceStatus}
          </motion.div>
        )}

        {/* Carry-Over Notification Badge */}
        {carryOverTasks.length > 0 && !selectedDate && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3">
            <button onClick={() => setCarryOverOpen(!carryOverOpen)}
              className="w-full px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span className="font-medium">{carryOverTasks.length} Carry Over Task{carryOverTasks.length !== 1 ? "s" : ""}</span>
              </div>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${carryOverOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {carryOverOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="mt-1 p-3 rounded-lg border bg-background shadow-sm space-y-2">
                    <p className="text-[11px] text-muted-foreground">{carryOverTasks.length} unfinished task{carryOverTasks.length !== 1 ? "s" : ""} from previous days.</p>
                    <div className="space-y-1">
                      {carryOverTasks.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <PriorityDot priority={t.priority} />
                          <span className="truncate">{t.title}</span>
                          <span className="text-[10px] ml-auto shrink-0">{formatDateDDMMYYYY(t.date)}</span>
                        </div>
                      ))}
                      {carryOverTasks.length > 5 && <p className="text-[10px] text-muted-foreground">+{carryOverTasks.length - 5} more</p>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" className="h-7 text-xs flex-1" onClick={() => { handleMoveToToday(carryOverTasks); setCarryOverOpen(false) }}>Move All</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => setCarryOverOpen(false)}>Ignore</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Viewing Past Day Banner */}
        {isViewingPast && selectedDate && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 px-3 py-2 rounded-lg bg-muted/50 border text-xs flex items-center justify-between">
            <span className="text-muted-foreground">
              Viewing tasks for <span className="font-medium text-foreground">{formatDateLong(selectedDate)}</span>
              {" \u2014 "}{displayTasks.length} tasks, {completedToday} completed. Tasks are read-only.
            </span>
            <Button variant="ghost" size="sm" className="h-6 text-xs ml-3" onClick={() => { setSelectedDate(null); setDayHistory(null) }}>
              Back to Today
            </Button>
          </motion.div>
        )}

        {/* Expand/Collapse All */}
        {displayTasks.length > 0 && displayTasks.some((t) => t.subtasks.length > 0) && (
          <div className="mb-3">
            <button onClick={() => setExpandAll(!expandAll)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              {expandAll ? "\u25BC Collapse All Subtasks" : "\u25B6 Expand All Subtasks"}
            </button>
          </div>
        )}

        {/* Day History View */}
        <AnimatePresence>
          {dayHistory && (
            <DayHistoryView date={dayHistory.date} tasks={dayHistory.tasks}
              onClose={() => setDayHistory(null)} onMoveToToday={handleMoveToToday} />
          )}
        </AnimatePresence>

        {activeView === "list" ? renderListView() : renderBoardView()}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedToday} completed today</span>
          <span>{remainingToday} remaining</span>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(createOpen || editingTask) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => { setCreateOpen(false); setEditingTask(null) }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">{editingTask ? "Edit Task" : "New Task"}</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCreateOpen(false); setEditingTask(null) }}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Task Name</label>
                    <Input placeholder="What needs to be done?"
                      value={editingTask ? editingTask.title : formTitle}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, title: e.target.value }) : setFormTitle(e.target.value)}
                      className="mt-1" autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Task Date</label>
                    <input
                      type="date"
                      value={editingTask ? editingTask.date : formDate}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, date: e.target.value }) : setFormDate(e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Subtasks</label>
                    <div className="mt-1 space-y-1.5">
                      {(editingTask ? editingTask.subtasks : formSubtasks).map((sub, idx) => (
                        <div key={sub.id} className="flex items-center gap-2 group">
                          <GripVertical className="h-3 w-3 text-muted-foreground/40 cursor-grab shrink-0" />
                          <Input
                            placeholder="Subtask..."
                            value={sub.title}
                            onChange={(e) => {
                              if (editingTask) {
                                const newSubs = [...editingTask.subtasks]
                                newSubs[idx] = { ...newSubs[idx], title: e.target.value }
                                setEditingTask({ ...editingTask, subtasks: newSubs })
                              } else {
                                const newSubs = [...formSubtasks]
                                newSubs[idx] = { ...newSubs[idx], title: e.target.value }
                                setFormSubtasks(newSubs)
                              }
                            }}
                            className="h-8 text-xs"
                          />
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              if (editingTask) {
                                setEditingTask({ ...editingTask, subtasks: editingTask.subtasks.filter((_, i) => i !== idx) })
                              } else {
                                setFormSubtasks(formSubtasks.filter((_, i) => i !== idx))
                              }
                            }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5"
                        onClick={() => {
                          const newSub = { id: `sub-${Date.now()}`, title: "", completed: false }
                          if (editingTask) {
                            setEditingTask({ ...editingTask, subtasks: [...editingTask.subtasks, newSub] })
                          } else {
                            setFormSubtasks([...formSubtasks, newSub])
                          }
                        }}>
                        + Add New Subtask
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {(["priority", "progress", "maintenance"] as TaskPriority[]).map((p) => (
                        <Button key={p} variant={(editingTask ? editingTask.priority : formPriority) === p ? "default" : "outline"} size="sm" className="flex-1"
                          onClick={() => editingTask ? setEditingTask({ ...editingTask, priority: p }) : setFormPriority(p)}>
                          <div className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: priorityConfig[p].cssColor }} />
                          {priorityConfig[p].label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Time Range</label>
                    <div className="mt-2">
                      <TimeRangePicker
                        startTime={editingTask ? (editingTask.timeRange === "Anytime" ? "09:00" : editingTask.timeRange.split(" \u2013 ")[0] || "09:00") : formatTimeSelection(formStartHour, formStartMin)}
                        endTime={editingTask ? (editingTask.timeRange === "Anytime" ? "09:30" : editingTask.timeRange.split(" \u2013 ")[1] || "09:30") : formatTimeSelection(formEndHour, formEndMin)}
                        onChange={(start, end) => {
                          if (editingTask) {
                            setEditingTask({ ...editingTask, timeRange: `${start} \u2013 ${end}`, dueTime: start, estimatedDuration: calcDurationFromRange(start, end) || editingTask.estimatedDuration })
                          } else {
                            const s = parseTime(start); const en = parseTime(end)
                            if (s) { setFormStartHour(s.hour); setFormStartMin(s.minute) }
                            if (en) { setFormEndHour(en.hour); setFormEndMin(en.minute) }
                          }
                        }}
                        timeRangeType={editingTask ? (editingTask.timeRangeType || "anytime") : formTimeRangeType}
                        onTimeRangeTypeChange={(v) => {
                          if (editingTask) {
                            const isAnytime = v === "anytime"
                            setEditingTask({ ...editingTask, timeRangeType: v, timeRange: isAnytime ? "Anytime" : editingTask.timeRange, dueTime: isAnytime ? "Anytime" : editingTask.dueTime })
                          } else {
                            setFormTimeRangeType(v)
                          }
                        }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recurrence</label>
                    <div className="flex gap-1 mt-1">
                      {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
                        <Button key={r} variant={(editingTask ? editingTask.recurrence : formRecurrence) === r ? "default" : "outline"} size="sm" className="flex-1 text-[10px] px-1"
                          onClick={() => editingTask ? setEditingTask({ ...editingTask, recurrence: r }) : setFormRecurrence(r)}>
                          {r === "none" ? "None" : r.charAt(0).toUpperCase() + r.slice(1)}
                        </Button>
                      ))}
                    </div>
                    {/* Weekly interval & weekday selector */}
                    {(editingTask ? editingTask.recurrence : formRecurrence) === "weekly" && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">Every</span>
                          <select
                            value={editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval}
                            onChange={(e) => {
                              const v = Number(e.target.value)
                              editingTask ? setEditingTask({ ...editingTask, recurrenceInterval: v }) : setFormRecurrenceInterval(v)
                            }}
                            className="h-8 px-2 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                          </select>
                          <span className="text-[11px] text-muted-foreground">week{((editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval) > 1) ? "s" : ""}</span>
                        </div>
                        <div className="flex gap-1">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, i) => {
                            const weekdays = editingTask ? (editingTask.recurrenceWeekdays || []) : formRecurrenceWeekdays
                            const isSelected = weekdays.includes(i)
                            return (
                              <button key={day} type="button"
                                className={`h-7 w-7 rounded-full text-[10px] font-medium transition-colors ${
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                                onClick={() => {
                                  const newDays = isSelected ? weekdays.filter((d) => d !== i) : [...weekdays, i]
                                  editingTask ? setEditingTask({ ...editingTask, recurrenceWeekdays: newDays }) : setFormRecurrenceWeekdays(newDays)
                                }}>
                                {day}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    {/* Monthly interval */}
                    {(editingTask ? editingTask.recurrence : formRecurrence) === "monthly" && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">Every</span>
                        <select
                          value={editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval}
                          onChange={(e) => {
                            const v = Number(e.target.value)
                            editingTask ? setEditingTask({ ...editingTask, recurrenceInterval: v }) : setFormRecurrenceInterval(v)
                          }}
                          className="h-8 px-2 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
                          {[1, 2, 3, 4, 6, 12].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="text-[11px] text-muted-foreground">month{((editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval) > 1) ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Why It Matters</label>
                    <Input placeholder="Optional: Why is this important?"
                      value={editingTask ? editingTask.whyItMatters : formWhy}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, whyItMatters: e.target.value }) : setFormWhy(e.target.value)}
                      className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Linked Habit</label>
                    <select
                      value={editingTask ? (editingTask.linkedHabitId || "") : formLinkedHabitId}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, linkedHabitId: e.target.value || undefined }) : setFormLinkedHabitId(e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
                      <option value="">None</option>
                      {(() => {
                        try {
                          const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
                          return habits.map((h: { id: string; name: string }) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))
                        } catch { return [] }
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Linked Goal</label>
                    <select
                      value={editingTask ? (editingTask.linkedGoalId || "") : formLinkedGoalId}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, linkedGoalId: e.target.value || undefined }) : setFormLinkedGoalId(e.target.value)}
                      className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer">
                      <option value="">None</option>
                      {(() => {
                        try {
                          const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
                          return goals.map((g: { id: string; title: string }) => (
                            <option key={g.id} value={g.id}>{g.title}</option>
                          ))
                        } catch { return [] }
                      })()}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Today&apos;s Intention</label>
                    <Input placeholder="Optional: What's the intention behind this task?"
                      value={editingTask ? (editingTask.todayIntention || "") : formIntention}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, todayIntention: e.target.value || undefined }) : setFormIntention(e.target.value)}
                      className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); setEditingTask(null) }}>Cancel</Button>
                  <Button className="flex-1 glow" onClick={editingTask ? handleSaveEdit : handleCreateTask}
                    disabled={editingTask ? !editingTask.title.trim() : !formTitle.trim()}>
                    {editingTask ? "Save Changes" : "Add Task"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Recurring Task Edit Prompt */}
      <AnimatePresence>
        {recurringEditPrompt && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => { setRecurringEditPrompt(null); setEditingTask(null) }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background rounded-2xl border shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1">Apply changes to:</h3>
                <p className="text-sm text-muted-foreground mb-4">This is a daily recurring task. How would you like to apply your edits?</p>
                <div className="space-y-2">
                  {[
                    { value: "this" as const, label: "This occurrence only", desc: "Change applies only to this day" },
                    { value: "thisAndFuture" as const, label: "This and future occurrences", desc: "Change applies from this day forward" },
                    { value: "all" as const, label: "All occurrences", desc: "Change applies to every day" },
                  ].map((opt) => (
                    <button key={opt.value}
                      className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                        recurringEditPrompt.scope === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:bg-muted/50"
                      }`}
                      onClick={() => setRecurringEditPrompt({ ...recurringEditPrompt, scope: opt.value })}>
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => { setRecurringEditPrompt(null); setEditingTask(null) }}>Cancel</Button>
                  <Button className="flex-1 glow" onClick={handleSaveEdit}>Apply</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Tooltip helper                                         */
/* ────────────────────────────────────────────────────── */

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-[10px] font-medium text-foreground bg-background border rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none">
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Voice parsing helpers                                  */
/* ────────────────────────────────────────────────────── */

function parseTime24(str: string): { hour: number; minute: number } | null {
  const clean = str.trim().toLowerCase()

  if (clean === "noon") return { hour: 12, minute: 0 }
  if (clean === "midnight") return { hour: 0, minute: 0 }

  const ampmMatch = clean.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/)
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1])
    const minute = ampmMatch[2] ? parseInt(ampmMatch[2]) : 0
    const suffix = ampmMatch[3].replace(/\./g, "")
    if (suffix === "pm" && hour < 12) hour += 12
    if (suffix === "am" && hour === 12) hour = 0
    return { hour, minute }
  }

  const twentyFourMatch = clean.match(/(\d{1,2})[:\s](\d{2})/)
  if (twentyFourMatch) {
    const hour = parseInt(twentyFourMatch[1])
    const minute = parseInt(twentyFourMatch[2])
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) return { hour, minute }
  }

  const bareMatch = clean.match(/^(\d{1,2})\s*(?:o.?clock)?$/)
  if (bareMatch) {
    const hour = parseInt(bareMatch[1])
    if (hour >= 0 && hour <= 23) return { hour, minute: 0 }
  }

  return null
}

function parseDurationText(str: string): number {
  const clean = str.toLowerCase()
  let total = 0
  const hourMatch = clean.match(/(\d+)\s*(?:hours?|hrs?)/)
  const minMatch = clean.match(/(\d+)\s*(?:minutes?|mins?)/)
  if (hourMatch) total += parseInt(hourMatch[1]) * 60
  if (minMatch) total += parseInt(minMatch[1])
  if (total === 0 && clean.includes("half")) total = 30
  return total
}

interface ParsedVoiceTask {
  title: string
  timeRange: string | null
  duration: string | null
}

function parseVoiceTasks(text: string): ParsedVoiceTask[] {
  const sentences = text.split(/[.;]\s*/).filter((s) => s.trim().length > 3)
  return sentences.map((sentence) => {
    const clean = sentence.trim()
    let title = ""
    let timeRange: string | null = null
    let duration: string | null = null

    const timeRangeRegex = /(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)\s*(?:to|until|till|through|[-–—])\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i
    const betweenRegex = /between\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)\s+and\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.)?)/i
    const timeMatch = clean.match(timeRangeRegex) || clean.match(betweenRegex)

    if (timeMatch) {
      const startParsed = parseTime24(timeMatch[1])
      const endParsed = parseTime24(timeMatch[2])
      if (startParsed && endParsed) {
        const fmt = (h: number, m: number) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
        timeRange = `${fmt(startParsed.hour, startParsed.minute)} \u2013 ${fmt(endParsed.hour, endParsed.minute)}`
      }
    }

    const durMatch = clean.match(/(?:for\s+)?(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/i)
    if (durMatch) duration = durMatch[0]

    let titleClean = clean
    if (timeMatch) titleClean = titleClean.replace(timeMatch[0], "")
    if (durMatch) titleClean = titleClean.replace(durMatch[0], "")
    titleClean = titleClean.replace(/^(i want to|i need to|i should|i will|let me|can i|please|i'd like to|i wanna|i gotta|i got to|i have to|i've got)\s*/i, "")
    titleClean = titleClean.replace(/^(when i wake up|in the morning|today|tomorrow|right now|asap)\s*/i, "")
    titleClean = titleClean.replace(/\s+/g, " ").trim()

    if (titleClean.length < 2) titleClean = "New task"
    title = titleClean.charAt(0).toUpperCase() + titleClean.slice(1)

    return { title, timeRange, duration }
  }).filter((t) => t.title.length > 0)
}
