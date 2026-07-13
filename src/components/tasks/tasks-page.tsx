"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect, useLayoutEffect, memo } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { Task, TaskPriority, TaskView, Subtask } from "./types"
import { sampleTasks } from "./task-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUndoRedo } from "@/components/providers/undo-redo-provider"
import { AutosuggestInput } from "@/components/ui/autosuggest-input"
import { TeoAssistant } from "@/components/teo/teo-assistant"
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
  Copy,
  Target,
  Bell,
  Crosshair,
  Pause,
  Play,
  CheckCircle2,
  ArrowUp,
  Smile,
  Meh,
  Frown,
  Moon,
  Angry,
  Timer,
  Sparkles,
  Target as TargetIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast, ToastContainer } from "./task-toast"
import { formatDateDDMMYYYY, formatDateLong } from "@/lib/date-utils"
import { DateInput } from "@/components/ui/date-input"

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
  brandBorder = false,
  selected = false,
}: {
  children: React.ReactNode
  tint: string
  isDragging?: boolean
  isDragOver?: boolean
  className?: string
  brandBorder?: boolean
  selected?: boolean
}) {
  const borderCls = brandBorder
    ? selected
      ? "border-2 border-[var(--brand-primary)] ring-2 ring-[rgba(30,14,107,0.25)] shadow-md"
      : "border-[1.5px] border-[var(--brand-primary)] hover:border-[var(--brand-primary-lighter)] shadow-sm hover:shadow-lg transition-shadow duration-200"
    : ""
  return (
    <div className={`relative rounded-xl task-row ${borderCls} ${className}`}
      style={{
        backgroundColor: tint + "40",
        boxShadow: isDragOver
          ? "0 4px 16px rgba(0,0,0,0.10), 0 0 0 2px var(--primary)"
          : brandBorder
            ? undefined
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
  { value: "morning" as const, label: "Morning", desc: "06:00 – 11:59" },
  { value: "afternoon" as const, label: "Afternoon", desc: "12:00 – 16:59" },
  { value: "evening" as const, label: "Evening", desc: "17:00 – 20:59" },
  { value: "night" as const, label: "Night", desc: "21:00 – 05:59" },
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

  const setHour = (h: number) => onChange(formatTimeSelection(h, parsed.minute))
  const setMin = (m: number) => onChange(formatTimeSelection(parsed.hour, m))

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const mins = Array.from({ length: 60 }, (_, i) => i)

  return (
    <div className="flex-1">
      <span className="text-[11px] font-medium text-muted-foreground mb-1.5 block">{label}</span>
      <div className="flex items-center gap-1.5">
        <select value={parsed.hour} onChange={(e) => setHour(Number(e.target.value))}
          className="flex-1 h-10 px-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
          {hours.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}</option>)}
        </select>
        <span className="text-muted-foreground font-medium">:</span>
        <select value={parsed.minute} onChange={(e) => setMin(Number(e.target.value))}
          className="flex-1 h-10 px-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer">
          {mins.map((m) => <option key={m} value={m}>{String(m).padStart(2, "0")}</option>)}
        </select>
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
          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm flex items-center justify-between hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
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

      {/* Start & End Time Inputs */}
      <div className="flex items-start gap-3">
        <CustomTimeInput value={startTime} onChange={(v) => onChange(v, endTime)} label="Start Time" />
        <CustomTimeInput value={endTime} onChange={(v) => onChange(startTime, v)} label="End Time" />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Duration: {dur > 0 ? formatDuration(dur) : "\u2014"}
      </p>
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
      <div className="relative h-9 w-9 shrink-0">
        <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="text-[#1E0E6B]/15" />
          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="text-[#1E0E6B]" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 15}
            strokeDashoffset={2 * Math.PI * 15 * (1 - percentage / 100)} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-[#1E0E6B]">{percentage}</span>
        </div>
      </div>
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
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("en-GB", { month: "long", year: "numeric" })

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
  const pathname = usePathname()
  const router = useRouter()
  const { showUndoSnackbar } = useUndoRedo()

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
  const [teoOpen, setTeoOpen] = useState(false)
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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
  const [formReminder, setFormReminder] = useState(true)
  const [recurringEditPrompt, setRecurringEditPrompt] = useState<{ task: Task; scope: "this" | "thisAndFuture" | "all" } | null>(null)
  const [carryOverOpen, setCarryOverOpen] = useState(false)
  const [selectedCarryOverIds, setSelectedCarryOverIds] = useState<Set<string>>(new Set())
  const [ignoredCarryOverIds, setIgnoredCarryOverIds] = useState<Set<string>>(new Set())
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ task: Task } | null>(null)
  const [sortMode, setSortMode] = useState<import("./types").SortMode>("time-asc")
  const [formMonthlyRepeatMode, setFormMonthlyRepeatMode] = useState<import("./types").MonthlyRepeatMode>("dayOfMonth")
  const [formMonthlyWeekdayIndex, setFormMonthlyWeekdayIndex] = useState(0)
  const [formMonthlyWeekdayOrdinal, setFormMonthlyWeekdayOrdinal] = useState(1)

  // Feature: Reminders Panel
  const [remindersPanelOpen, setRemindersPanelOpen] = useState(false)
  const [reminders, setReminders] = useState<{ id: string; title: string; date: string; createdAt: string }[]>([])

  const loadReminders = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
      if (Array.isArray(stored)) setReminders(stored)
    } catch { setReminders([]) }
  }, [])

  useEffect(() => { loadReminders() }, [loadReminders])

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => {
      const next = prev.filter(r => r.id !== id)
      localStorage.setItem("intenteo-reminders", JSON.stringify(next))
      return next
    })
  }, [])

  const addReminderAsTask = useCallback((reminder: { id: string; title: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: reminder.title,
      whyItMatters: "",
      priority: "progress" as TaskPriority,
      deadline: "Today",
      date: new Date().toISOString().split("T")[0],
      dueTime: "",
      timeRange: "",
      timeRangeType: "anytime" as any,
      estimatedDuration: 0,
      notes: "",
      subtasks: [],
      recurrence: "none" as any,
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
    removeReminder(reminder.id)
  }, [removeReminder])

  const getReminderSmartDate = useCallback((dateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr + "T00:00:00")
    target.setHours(0, 0, 0, 0)
    const diffMs = target.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return { label: "Today", color: "text-emerald-600 dark:text-emerald-400" }
    if (diffDays === 1) return { label: "Tomorrow", color: "text-orange-500 dark:text-orange-400" }
    if (diffDays < 0) return { label: `Overdue \u2022 ${diffDays === -1 ? "Yesterday" : `${Math.abs(diffDays)} days ago`}`, color: "text-red-500 dark:text-red-400" }
    const dayName = target.toLocaleDateString("en-US", { weekday: "short" })
    const dayNum = target.getDate()
    const monthName = target.toLocaleDateString("en-US", { month: "short" })
    return { label: `${dayName}, ${dayNum} ${monthName}`, color: "text-blue-600 dark:text-blue-400" }
  }, [])

  const formatCreatedDate = useCallback((dateStr: string) => {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  }, [])

  // Feature: Focus Mode
  const [focusTask, setFocusTask] = useState<Task | null>(null)

  // Feature: Daily Completion Review
  const [reviewOpen, setReviewOpen] = useState(false)

  // Linked data (goals, habits, projects) loaded from localStorage for Relationships & Focus
  const [goalsData, setGoalsData] = useState<{ id: string; title: string; health?: number }[]>([])
  const [habitsData, setHabitsData] = useState<{ id: string; name: string }[]>([])
  const [projectsData, setProjectsData] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    try { setGoalsData(JSON.parse(localStorage.getItem("intenteo-goals") || "[]")) } catch {}
    try { setHabitsData(JSON.parse(localStorage.getItem("intenteo-habits") || "[]")) } catch {}
    try { setProjectsData(JSON.parse(localStorage.getItem("intenteo-projects") || "[]")) } catch {}
  }, [])

  // Route change cleanup: clear all temporary UI state when leaving Tasks page
  useEffect(() => {
    if (pathname !== "/tasks") {
      setSelectedDate(null)
      setCarryOverOpen(false)
      setExpandedTasks(new Set())
      setExpandAll(false)
      setCreateOpen(false)
      setEditingTask(null)
      setMovePopoverTaskId(null)
      setMoveSubtaskInfo(null)
      setCalendarOpen(false)
      setDraggedId(null)
      setDragOverId(null)
      setDragType(null)
      setDragSourceTaskId(null)
      setRecurringEditPrompt(null)
    }
  }, [pathname])

  // Always start on today's date - clear any stale selectedDate on mount
  useEffect(() => {
    setSelectedDate(null)
    setCarryOverOpen(false)
  }, [])

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

  const taskTitleSuggestions = useMemo(() => {
    return [...new Set(tasks.map((t) => t.title.trim()).filter(Boolean))]
  }, [tasks])

  const todayISO = useMemo(() => new Date().toISOString().split("T")[0], [])

  // Carry-over: tasks from previous days that are incomplete and not daily
  const carryOverTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.date >= todayISO) return false
      if (t.recurrence === "daily") return false
      if (t.completed) return false
      if (ignoredCarryOverIds.has(t.id)) return false
      return true
    })
  }, [tasks, todayISO, ignoredCarryOverIds])

  const viewingDate = selectedDate || todayISO
  const isViewingPast = useMemo(() => viewingDate < todayISO, [viewingDate, todayISO])

  const isFutureTask = useCallback((task: Task) => {
    if (task.recurrence === "daily" || task.recurrence === "weekly" || task.recurrence === "monthly") {
      return viewingDate !== todayISO
    }
    return todayISO < task.date
  }, [viewingDate, todayISO])

  const isCompletedPastTask = useCallback((task: Task) => {
    if (viewingDate >= todayISO) return false
    if (task.recurrence === "daily") {
      return !!(task.dailyCompletions || {})[viewingDate]
    }
    return task.completed
  }, [viewingDate, todayISO])

  const displayTasks = useMemo(() => {
    const tasksForDate = tasks.filter((t) => {
      if ((t.deletedDates || []).includes(viewingDate)) return false
      if (t.date === viewingDate) return true
      const created = new Date(t.createdAt + "T12:00:00")
      const view = new Date(viewingDate + "T12:00:00")
      if (view <= created) return false
      if (t.recurrence === "daily") {
        return true
      }
      if (t.recurrence === "weekly") {
        const weekdays = t.recurrenceWeekdays || []
        const viewDay = view.getDay()
        return weekdays.includes(viewDay)
      }
      if (t.recurrence === "monthly") {
        const viewDay = view.getDate()
        if (t.monthlyRepeatMode === "weekdayOfMonth") {
          const targetWeekday = t.monthlyWeekdayIndex ?? 0
          const targetOrdinal = t.monthlyWeekdayOrdinal ?? 1
          const firstDay = new Date(view.getFullYear(), view.getMonth(), 1)
          let count = 0
          for (let d = 1; d <= 31; d++) {
            const dt = new Date(view.getFullYear(), view.getMonth(), d)
            if (dt.getMonth() !== view.getMonth()) break
            if (dt.getDay() === targetWeekday) {
              count++
              if (count === targetOrdinal && d === viewDay) return true
            }
          }
          return false
        }
        const targetDay = new Date(t.createdAt).getDate()
        return viewDay === targetDay
      }
      return false
    })
    return tasksForDate
  }, [tasks, viewingDate])

  const sortedTasks = useMemo(() => {
    const tasks = [...displayTasks]
    switch (sortMode) {
      case "time-asc":
        return tasks.sort((a, b) => (a.dueTime === "Anytime" ? 0 : parseInt(a.dueTime.replace(":", ""))) - (b.dueTime === "Anytime" ? 0 : parseInt(b.dueTime.replace(":", ""))))
      case "time-desc":
        return tasks.sort((a, b) => (b.dueTime === "Anytime" ? 9999 : parseInt(b.dueTime.replace(":", ""))) - (a.dueTime === "Anytime" ? 9999 : parseInt(a.dueTime.replace(":", ""))))
      case "priority": {
        const order = { priority: 0, progress: 1, maintenance: 2 }
        return tasks.sort((a, b) => order[a.priority] - order[b.priority])
      }
      case "progress": {
        const order = { progress: 0, priority: 1, maintenance: 2 }
        return tasks.sort((a, b) => order[a.priority] - order[b.priority])
      }
      case "completion":
        return tasks.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0))
      case "dueDate": {
        const getDueScore = (t: Task) => {
          if (t.date === todayISO) return 0
          if (t.date > todayISO) return 1
          return 2
        }
        return tasks.sort((a, b) => getDueScore(a) - getDueScore(b))
      }
      case "alpha-asc":
        return tasks.sort((a, b) => a.title.localeCompare(b.title))
      case "alpha-desc":
        return tasks.sort((a, b) => b.title.localeCompare(a.title))
      case "duration":
        return tasks.sort((a, b) => a.estimatedDuration - b.estimatedDuration)
      case "recentlyEdited":
        return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return tasks.sort((a, b) => a.order - b.order)
    }
  }, [displayTasks, sortMode, todayISO])

  const completedToday = useMemo(() => {
    const viewDate = selectedDate || todayISO
    return displayTasks.filter((t) => t.recurrence === "daily" ? !!(t.dailyCompletions || {})[viewDate] : t.completed).length
  }, [displayTasks, selectedDate, todayISO])
  const remainingToday = useMemo(() => displayTasks.length - completedToday, [displayTasks, completedToday])
  const totalToday = completedToday + remainingToday
  const productivity = useMemo(() => (totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)), [completedToday, totalToday])

  // Auto-trigger Daily Completion Review when all of today's tasks are completed
  useEffect(() => {
    if (selectedDate) return
    if (totalToday === 0) return
    if (completedToday !== totalToday) return
    try {
      const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
      const already = reviews.some((r: { date: string }) => r.date === todayISO)
      if (!already) setReviewOpen(true)
    } catch {}
  }, [completedToday, totalToday, selectedDate, todayISO])

  useEffect(() => {
    if (typeof window !== "undefined" && tasks.length > 0) {
      localStorage.setItem("intenteo-tasks", JSON.stringify(tasks))
    }
  }, [tasks])

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
    const isPast = viewDate < todayISO
    setTasks((prev) => prev.map((t) => {
      if (t.id !== id) return t
      if (isPast) {
        if (t.recurrence === "daily") {
          const dc = { ...(t.dailyCompletions || {}) }
          if (dc[viewDate]) return t
          dc[viewDate] = true
          return { ...t, dailyCompletions: dc }
        }
        if (t.completed) return t
      }
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
    if (!task || isFutureTask(task) || isCompletedPastTask(task)) return
    if (!task.completed) addToast()
    toggleTask(id)
  }, [tasks, toggleTask, addToast, isFutureTask, isCompletedPastTask])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task && (isFutureTask(task) || isCompletedPastTask(task))) return
    setTasks((prev) => prev.map((t) =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) } : t
    ))
  }, [tasks, isFutureTask, isCompletedPastTask])

  const deleteTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    if (task.recurrence === "daily" || task.recurrence === "weekly" || task.recurrence === "monthly") {
      setDeleteConfirmModal({ task })
      return
    }
    const deleted = { ...task }
    setTasks((prev) => prev.filter((t) => t.id !== id))
    showUndoSnackbar("Task deleted.", () => {
      setTasks((prev) => {
        if (prev.some(t => t.id === deleted.id)) return prev
        return [...prev, deleted]
      })
    })
  }, [tasks, showUndoSnackbar])

  const handleConfirmDelete = useCallback((scope: "today" | "series") => {
    if (!deleteConfirmModal) return
    const { task } = deleteConfirmModal
    const viewDate = selectedDate || todayISO

    if (scope === "today") {
      if (task.recurrence === "daily") {
        setTasks((prev) => prev.map((t) => {
          if (t.id !== task.id) return t
          const dc = { ...(t.dailyCompletions || {}) }
          delete dc[viewDate]
          const dd = [...(t.deletedDates || []), viewDate]
          return { ...t, dailyCompletions: dc, deletedDates: dd }
        }))
      } else {
        setTasks((prev) => prev.map((t) => {
          if (t.id !== task.id) return t
          const dd = [...(t.deletedDates || []), viewDate]
          return { ...t, deletedDates: dd }
        }))
      }
      addToast(`Deleted "${task.title}" for today only.`)
    } else {
      const deleted = { ...task }
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      addToast(`Deleted entire series: "${task.title}".`)
      showUndoSnackbar("Task deleted.", () => {
        setTasks((prev) => {
          if (prev.some(t => t.id === deleted.id)) return prev
          return [...prev, deleted]
        })
      })
    }
    setDeleteConfirmModal(null)
  }, [deleteConfirmModal, selectedDate, todayISO, addToast, showUndoSnackbar])

  const duplicateTask = useCallback((task: Task) => {
    const newTask: Task = {
      ...task,
      id: `dup-${Date.now()}`,
      title: `${task.title} (Copy)`,
      completed: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
      dailyCompletions: task.recurrence === "daily" ? { [todayISO]: false } : undefined,
    }
    setTasks((prev) => [...prev, newTask])
    addToast(`Duplicated: "${task.title}"`)
  }, [tasks.length, todayISO, addToast])

  const moveTask = useCallback((taskId: string, newDeadline: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    const dateMap: Record<string, string> = {
      "Today": todayISO,
      "Tomorrow": (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0] })(),
      "Next Week": (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split("T")[0] })(),
    }
    const newDate = dateMap[newDeadline] || todayISO
    const newTask: Task = {
      ...task,
      id: `move-${Date.now()}`,
      date: newDate,
      deadline: newDeadline,
      completed: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
      dailyCompletions: task.recurrence === "daily" ? { [newDate]: false } : undefined,
    }
    setTasks((prev) => [...prev, newTask])
  }, [tasks, todayISO])

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
    const originals = movedTasks.map(t => ({ id: t.id, date: t.date, deadline: t.deadline }))
    setTasks((prev) => prev.map((t) => {
      if (movedTasks.some((m) => m.id === t.id)) return { ...t, deadline: "Today", date: todayISO }
      return t
    }))
    addToast(`${movedTasks.length} unfinished task${movedTasks.length !== 1 ? "s" : ""} moved to today.`)
    showUndoSnackbar("Carry-over completed.", () => {
      setTasks((prev) => prev.map((t) => {
        const orig = originals.find(o => o.id === t.id)
        if (orig) return { ...t, date: orig.date, deadline: orig.deadline }
        return t
      }))
    })
  }, [addToast, todayISO, showUndoSnackbar])

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
      deadline: formDate === todayISO ? "Today" : formatDateDDMMYYYY(formDate),
      date: formDate, dueTime: isAnytime ? "Anytime" : startStr, timeRange, timeRangeType: formTimeRangeType,
      estimatedDuration: isAnytime ? 0 : (dur > 0 ? dur : 30), notes: "", subtasks: filteredSubs, recurrence: formRecurrence,
      recurrenceInterval: formRecurrenceInterval, recurrenceWeekdays: formRecurrenceWeekdays,
      monthlyRepeatMode: formRecurrence === "monthly" ? formMonthlyRepeatMode : undefined,
      monthlyWeekdayIndex: formRecurrence === "monthly" && formMonthlyRepeatMode === "weekdayOfMonth" ? formMonthlyWeekdayIndex : undefined,
      monthlyWeekdayOrdinal: formRecurrence === "monthly" && formMonthlyRepeatMode === "weekdayOfMonth" ? formMonthlyWeekdayOrdinal : undefined,
      completed: false, order: tasks.length, createdAt: new Date().toISOString(),
      dailyCompletions: formRecurrence === "daily" ? { [formDate]: false } : undefined,
      linkedHabitId: formLinkedHabitId || undefined,
      linkedGoalId: formLinkedGoalId || undefined,
      todayIntention: formIntention || undefined,
      reminder: formReminder,
    }
    setTasks((prev) => [...prev, newTask])
    setFormTitle(""); setFormWhy(""); setFormPriority("progress")
    setFormStartHour(9); setFormStartMin(0)
    setFormEndHour(9); setFormEndMin(30)
    setFormRecurrence("none"); setFormRecurrenceInterval(1); setFormRecurrenceWeekdays([])
    setFormMonthlyRepeatMode("dayOfMonth"); setFormMonthlyWeekdayIndex(0); setFormMonthlyWeekdayOrdinal(1)
    setFormSubtasks([]); setFormDate(todayISO)
    setFormTimeRangeType("anytime"); setFormLinkedHabitId(""); setFormLinkedGoalId(""); setFormIntention(""); setFormReminder(true)
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
        setEditingTask(null); setCalendarOpen(false)
      }
    }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
  }, [])

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
            <TaskRelationships task={task} goals={goalsData} habits={habitsData} projects={projectsData} router={router} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [toggleSubtask, addSubtaskInline, tasks, moveSubtask, moveSubtaskInfo, draggedId, dragOverId, dragType, handleSubtaskDragStart, handleSubtaskDragOver, handleSubtaskDrop, handleDragEnd])

  /* ═══════════════════════════════════════════════════════ */
  /* LIST VIEW                                              */
  /* ═══════════════════════════════════════════════════════ */

  const renderListView = useCallback(() => {
    if (sortedTasks.length === 0) return <EmptyState onCreate={() => { setFormDate(selectedDate || todayISO); setCreateOpen(true) }} viewingDate={viewingDate} />
    return (
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="sticky top-0 z-10 flex items-center gap-4 px-5 py-3 border-b bg-background/95 backdrop-blur-sm text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="w-6 shrink-0"></div>
          <div className="w-6 shrink-0"></div>
          <div className="flex-1 min-w-0">Task</div>
          <div className="hidden sm:block w-[160px] shrink-0">Time Range</div>
          <div className="hidden sm:block w-[80px] shrink-0">Duration</div>
          <div className="w-[140px] shrink-0">Progress</div>
          <div className="w-[120px] shrink-0">Actions</div>
        </div>

        <LayoutGroup>
          {sortedTasks.map((task, i) => {
            const viewDate = selectedDate || todayISO
            const isCompleted = task.recurrence === "daily" ? !!(task.dailyCompletions || {})[viewDate] : task.completed
            const progress = isCompleted ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandAll || expandedTasks.has(task.id)
            const isDragging = draggedId === task.id && dragType === "task"
            const isDragOver = dragOverId === task.id && dragOverId !== draggedId && dragType === "task"
            const pConfig = priorityConfig[task.priority]
            const future = isFutureTask(task)
            const pastCompleted = isCompletedPastTask(task)

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015, layout: { type: "spring", stiffness: 300, damping: 30 } }}>
                <TaskRow tint={pConfig.tint} isDragging={isDragging} isDragOver={isDragOver}>
                  <div
                    draggable={!isViewingPast && !future}
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
                      {future ? (
                        <Tooltip label="This task becomes available on its scheduled date.">
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20 bg-muted/30 cursor-not-allowed" />
                        </Tooltip>
                      ) : pastCompleted && isCompleted ? (
                        <Tooltip label="Completed on this day. Historical records cannot be changed.">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center cursor-not-allowed">
                            <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        </Tooltip>
                      ) : (
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
                      )}
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
                          <span className={`text-sm font-medium truncate px-1 py-0.5 rounded transition-colors ${isViewingPast || future ? "" : "cursor-pointer hover:bg-muted/50"} ${isCompleted ? "line-through text-muted-foreground" : ""} ${future ? "text-muted-foreground" : ""}`}
                            onClick={() => !isViewingPast && !future && setEditingTask({ ...task })}>
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
                    <div className="w-[120px] shrink-0 flex items-center gap-1">
                      {!isViewingPast && !future && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); setEditingTask({ ...task }) }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {!isViewingPast && !future && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); duplicateTask(task) }}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted"
                        onClick={(e) => { e.stopPropagation(); setFocusTask(task) }}>
                        <Target className="h-3.5 w-3.5" />
                      </Button>
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
                      {!isViewingPast && !future && (
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
  }, [sortedTasks, expandedTasks, expandAll, draggedId, dragOverId, dragType, getSubtaskProgress, handleTaskDragStart, handleTaskDragOver, handleTaskDrop, handleDragEnd, handleToggleTask, toggleExpanded, renderSubtasks, deleteTask, moveTask, movePopoverTaskId, moveSubtask, moveSubtaskInfo, isViewingPast, isFutureTask, isCompletedPastTask])

  /* ═══════════════════════════════════════════════════════ */
  /* BOARD VIEW                                              */
  /* ═══════════════════════════════════════════════════════ */

  const renderBoardView = useCallback(() => {
    if (sortedTasks.length === 0) return <EmptyState onCreate={() => { setFormDate(selectedDate || todayISO); setCreateOpen(true) }} viewingDate={viewingDate} />
    return (
      <div className="space-y-1">
        <LayoutGroup>
          {sortedTasks.map((task, i) => {
            const viewDate = selectedDate || todayISO
            const isCompleted = task.recurrence === "daily" ? !!(task.dailyCompletions || {})[viewDate] : task.completed
            const progress = isCompleted ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandAll || expandedTasks.has(task.id)
            const pConfig = priorityConfig[task.priority]
            const completedSubs = task.subtasks.filter((s) => s.completed).length
            const future = isFutureTask(task)
            const pastCompleted = isCompletedPastTask(task)

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, layout: { type: "spring", stiffness: 300, damping: 30 } }}>
                <TaskRow tint={pConfig.tint} brandBorder selected={editingTask?.id === task.id} className="group overflow-hidden">
                  <div className="pl-10 pr-10 p-4">
                    <div className="flex items-start gap-2.5 mb-3">
                      <PriorityDot priority={task.priority} />
                      {future ? (
                        <Tooltip label="This task becomes available on its scheduled date.">
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/20 bg-muted/30 cursor-not-allowed mt-0.5 shrink-0" />
                        </Tooltip>
                      ) : pastCompleted && isCompleted ? (
                        <Tooltip label="Completed on this day. Historical records cannot be changed.">
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center cursor-not-allowed mt-0.5 shrink-0">
                            <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        </Tooltip>
                      ) : (
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
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className={`text-sm font-semibold truncate px-1 py-0.5 rounded transition-colors ${isViewingPast || future ? "" : "cursor-pointer hover:bg-muted/50"} ${isCompleted ? "line-through text-muted-foreground" : ""} ${future ? "text-muted-foreground" : ""}`}
                            onClick={() => !isViewingPast && !future && setEditingTask({ ...task })}>{task.title}</h3>
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
                        {isExpanded && task.subtasks.map((sub) => (
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
                        <button onClick={() => toggleExpanded(task.id)}
                          className="text-[11px] text-primary hover:underline pl-1 flex items-center gap-1">
                          {isExpanded ? (
                            <><ChevronDown className="h-3 w-3" /> Hide subtasks</>
                          ) : (
                            <><ChevronRight className="h-3 w-3" /> {task.subtasks.length} subtask{task.subtasks.length !== 1 ? "s" : ""}</>
                          )}
                        </button>
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
                      {!isViewingPast && !future && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted"
                          onClick={() => setEditingTask({ ...task })}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                      {!isViewingPast && !future && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted"
                          onClick={() => duplicateTask(task)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted"
                        onClick={() => setFocusTask(task)}>
                        <Target className="h-3 w-3" />
                      </Button>
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
                      {!isViewingPast && !future && (
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
  }, [sortedTasks, expandedTasks, expandAll, getSubtaskProgress, handleToggleTask, toggleExpanded, toggleSubtask, deleteTask, moveTask, movePopoverTaskId, isViewingPast, isFutureTask, isCompletedPastTask])

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap">
              Tasks{` \u2014 ${formatDateDDMMYYYY(selectedDate || todayISO)}`}
            </h1>
            <p className="text-sm text-foreground mt-0.5 tracking-tight">
              <span style={{ color: "var(--brand-primary)" }}>{totalToday}</span> <span className="text-foreground">Tasks</span>
              <span className="mx-1.5 text-muted-foreground">&middot;</span>
              <span style={{ color: "var(--brand-primary)" }}>{completedToday}</span> <span className="text-foreground">Completed</span>
              <span className="mx-1.5 text-muted-foreground">&middot;</span>
              <span style={{ color: "var(--foreground)" }}>{remainingToday}</span> <span className="text-foreground">To Go</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <ProductivityScore percentage={productivity} />

            {/* Calendar History */}
            <div className="relative">
              <Tooltip label="Task History">
                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                  style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                  onClick={() => setCalendarOpen(!calendarOpen)}>
                  <Calendar className="h-4 w-4" />
                </button>
              </Tooltip>
              <AnimatePresence>
                {calendarOpen && (
                  <TaskHistoryCalendar
                    taskHistory={taskHistory}
                    onSelectDate={(date, histTasks) => { setSelectedDate(date); setCalendarOpen(false) }}
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

            {/* Talk with Téo */}
            <Tooltip label="Talk with Téo">
              <button
                className="h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--brand-primary)", color: "white" }}
                onClick={() => setTeoOpen(true)}>
                <Volume2 className="h-4 w-4" />
              </button>
            </Tooltip>

            <Button className="glow h-9" onClick={() => { setFormDate(selectedDate || todayISO); setCreateOpen(true) }}>
              <Plus className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {/* Carry-Over Modal */}
        <AnimatePresence>
          {carryOverOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setCarryOverOpen(false)} />
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl border shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Carry-over Tasks</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCarryOverOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {carryOverTasks.length} unfinished task{carryOverTasks.length !== 1 ? "s" : ""} found from previous days.
                  </p>
                  <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                    {carryOverTasks.map((t) => {
                      const isSelected = selectedCarryOverIds.has(t.id)
                      return (
                        <button key={t.id} type="button"
                          onClick={() => {
                            setSelectedCarryOverIds((prev) => {
                              const next = new Set(prev)
                              if (next.has(t.id)) next.delete(t.id)
                              else next.add(t.id)
                              return next
                            })
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                            isSelected
                              ? "bg-primary/10 border border-primary/30"
                              : "bg-muted/30 border border-transparent hover:bg-muted/50"
                          }`}>
                          <div className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                            isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                          }`}>
                            {isSelected && (
                              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 6l3 3 5-5" />
                              </svg>
                            )}
                          </div>
                          <PriorityDot priority={t.priority} />
                          <span className="text-sm flex-1 truncate">{t.title}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{formatDateDDMMYYYY(t.date)}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" disabled={selectedCarryOverIds.size === 0}
                      onClick={() => {
                        const selected = carryOverTasks.filter((t) => selectedCarryOverIds.has(t.id))
                        if (selected.length > 0) {
                          handleMoveToToday(selected)
                          setCarryOverOpen(false)
                          setSelectedCarryOverIds(new Set())
                        }
                      }}>
                      Move Selected {selectedCarryOverIds.size > 0 && `(${selectedCarryOverIds.size})`}
                    </Button>
                    <Button size="sm" className="flex-1" variant="secondary"
                      onClick={() => { handleMoveToToday(carryOverTasks); setCarryOverOpen(false); setSelectedCarryOverIds(new Set()) }}>
                      Move All
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setIgnoredCarryOverIds(new Set(carryOverTasks.map((t) => t.id))); setCarryOverOpen(false); setSelectedCarryOverIds(new Set()) }}>
                      Ignore Today
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Expand/Collapse + Carry-over + Sort */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 shrink-0">
            {sortedTasks.length > 0 && sortedTasks.some((t) => t.subtasks.length > 0) && (
              <button onClick={() => setExpandAll(!expandAll)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                {expandAll ? "\u25BC Collapse All Subtasks" : "\u25B6 Expand All Subtasks"}
              </button>
            )}
            {carryOverTasks.length > 0 && !selectedDate && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                <Tooltip label="Move unfinished tasks from your previous day into today's plan.">
                  <button onClick={() => setCarryOverOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3F1FF] dark:bg-[#1E0E6B]/20 border border-[#1E0E6B]/20 text-xs font-medium text-[#1E0E6B] dark:text-[#EB9E5B] shadow-sm hover:bg-[#1E0E6B] hover:text-white hover:border-[#1E0E6B] transition-all duration-200 group">
                    <ArrowRightLeft className="h-3 w-3 text-[#EB9E5B] group-hover:text-white transition-colors duration-200" />
                    Carry Over
                    <span className="inline-flex items-center justify-center h-4.5 min-w-[18px] px-1 rounded-full bg-[#1E0E6B] text-white text-[9px] font-bold leading-none">
                      {carryOverTasks.length}
                    </span>
                  </button>
                </Tooltip>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Reminders */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 border-[#1E0E6B]/30 text-[#1E0E6B] hover:bg-[#1E0E6B]/5 text-xs"
              onClick={() => { setRemindersPanelOpen(true); loadReminders() }}
            >
              <Bell className="h-3.5 w-3.5" />
              View Reminders
              {reminders.length > 0 && (
                <span className="ml-1 h-5 min-w-[20px] px-1 rounded-full bg-[#1E0E6B] text-white text-[10px] font-medium flex items-center justify-center">
                  {reminders.length}
                </span>
              )}
            </Button>

            {/* Sort */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as import("./types").SortMode)}
              className="h-8 px-2 pr-7 rounded-lg border border-[#1E0E6B]/30 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/50 cursor-pointer appearance-none">
              <option value="manual">Sort: Manual</option>
              <option value="time-asc">Sort: Earliest First</option>
              <option value="time-desc">Sort: Latest First</option>
              <option value="priority">Sort: Priority</option>
              <option value="completion">Sort: Incomplete First</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="alpha-asc">Sort: A-Z</option>
              <option value="alpha-desc">Sort: Z-A</option>
              <option value="duration">Sort: Shortest First</option>
              <option value="recentlyEdited">Sort: Recently Edited</option>
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
          </div>
          </div>
        </div>

        {activeView === "list" ? renderListView() : renderBoardView()}

        {/* Viewing Past Day Banner — below task list */}
        {isViewingPast && selectedDate && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 px-3 py-2 rounded-lg bg-muted/50 border text-xs flex items-center justify-between">
            <span className="text-muted-foreground">
              Viewing tasks for <span className="font-medium text-foreground">{formatDateLong(selectedDate)}</span>
              {" \u2014 "}{sortedTasks.length} tasks, {completedToday} completed. Tasks are read-only.
            </span>
            <Button variant="ghost" size="sm" className="h-6 text-xs ml-3" onClick={() => setSelectedDate(null)}>
              Back to Today
            </Button>
          </motion.div>
        )}

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
                    <AutosuggestInput placeholder="What needs to be done?"
                      value={editingTask ? editingTask.title : formTitle}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, title: e.target.value }) : setFormTitle(e.target.value)}
                      suggestions={taskTitleSuggestions}
                      className="mt-1" autoFocus />
                  </div>
                  <div>
                    <DateInput
                      value={editingTask ? editingTask.date : formDate}
                      onChange={(v) => editingTask ? setEditingTask({ ...editingTask, date: v }) : setFormDate(v)}
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
                    <label className="text-xs font-medium text-muted-foreground">Reminder</label>
                    <div className="mt-1 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (editingTask) {
                            setEditingTask({ ...editingTask, reminder: !editingTask.reminder })
                          } else {
                            setFormReminder(!formReminder)
                          }
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          (editingTask ? editingTask.reminder : formReminder)
                            ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                            (editingTask ? editingTask.reminder : formReminder)
                              ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span className="text-xs text-muted-foreground">
                        {(editingTask ? editingTask.reminder : formReminder) ? "Reminder ON" : "Reminder OFF"}
                      </span>
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
                          <div className="relative">
                            <select
                              value={editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval}
                              onChange={(e) => {
                                const v = Number(e.target.value)
                                editingTask ? setEditingTask({ ...editingTask, recurrenceInterval: v }) : setFormRecurrenceInterval(v)
                              }}
                              className="h-8 px-2 pr-6 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none">
                              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                          </div>
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
                    {/* Monthly interval & repeat mode */}
                    {(editingTask ? editingTask.recurrence : formRecurrence) === "monthly" && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">Every</span>
                          <div className="relative">
                            <select
                              value={editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval}
                              onChange={(e) => {
                                const v = Number(e.target.value)
                                editingTask ? setEditingTask({ ...editingTask, recurrenceInterval: v }) : setFormRecurrenceInterval(v)
                              }}
                              className="h-8 px-2 pr-6 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none">
                              {[1, 2, 3, 4, 6, 12].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">month{((editingTask ? (editingTask.recurrenceInterval || 1) : formRecurrenceInterval) > 1) ? "s" : ""}</span>
                        </div>
                        <div className="flex gap-1">
                          {([ "dayOfMonth", "weekdayOfMonth" ] as const).map((mode) => (
                            <button key={mode} type="button"
                              className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors border ${
                                (editingTask ? (editingTask.monthlyRepeatMode || "dayOfMonth") : formMonthlyRepeatMode) === mode
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-muted hover:bg-muted/50 text-muted-foreground"
                              }`}
                              onClick={() => editingTask ? setEditingTask({ ...editingTask, monthlyRepeatMode: mode }) : setFormMonthlyRepeatMode(mode)}>
                              {mode === "dayOfMonth" ? "Day of Month" : "Weekday of Month"}
                            </button>
                          ))}
                        </div>
                        {(editingTask ? (editingTask.monthlyRepeatMode || "dayOfMonth") : formMonthlyRepeatMode) === "weekdayOfMonth" && (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <select
                                value={editingTask ? (editingTask.monthlyWeekdayOrdinal || 1) : formMonthlyWeekdayOrdinal}
                                onChange={(e) => {
                                  const v = Number(e.target.value)
                                  editingTask ? setEditingTask({ ...editingTask, monthlyWeekdayOrdinal: v }) : setFormMonthlyWeekdayOrdinal(v)
                                }}
                                className="h-8 px-2 pr-6 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none">
                                {[1, 2, 3, 4, -1].map((n) => <option key={n} value={n}>{n === -1 ? "Last" : ["First", "Second", "Third", "Fourth"][n - 1]}</option>)}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                            </div>
                            <div className="relative">
                              <select
                                value={editingTask ? (editingTask.monthlyWeekdayIndex ?? 0) : formMonthlyWeekdayIndex}
                                onChange={(e) => {
                                  const v = Number(e.target.value)
                                  editingTask ? setEditingTask({ ...editingTask, monthlyWeekdayIndex: v }) : setFormMonthlyWeekdayIndex(v)
                                }}
                                className="h-8 px-2 pr-6 rounded-lg border border-white/20 bg-white/50 dark:bg-white/5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none">
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
                                  <option key={i} value={i}>{day}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                            </div>
                          </div>
                        )}
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
                    <div className="relative">
                      <select
                        value={editingTask ? (editingTask.linkedHabitId || "") : formLinkedHabitId}
                        onChange={(e) => editingTask ? setEditingTask({ ...editingTask, linkedHabitId: e.target.value || undefined }) : setFormLinkedHabitId(e.target.value)}
                        className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer appearance-none">
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
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Linked Goal</label>
                    <div className="relative">
                      <select
                        value={editingTask ? (editingTask.linkedGoalId || "") : formLinkedGoalId}
                        onChange={(e) => editingTask ? setEditingTask({ ...editingTask, linkedGoalId: e.target.value || undefined }) : setFormLinkedGoalId(e.target.value)}
                        className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer appearance-none">
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
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                    </div>
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

      {/* Recurring Task Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirmModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirmModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-background rounded-2xl border shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-1">Delete Recurring Task</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This task repeats {deleteConfirmModal.task.recurrence === "daily" ? "every day" : deleteConfirmModal.task.recurrence === "weekly" ? "every week" : "every month"}. What would you like to delete?
                </p>
                <div className="space-y-2">
                  <button
                    className="w-full text-left px-4 py-3 rounded-xl border border-muted hover:bg-muted/50 transition-colors"
                    onClick={() => handleConfirmDelete("today")}>
                    <div className="text-sm font-medium">
                      {deleteConfirmModal.task.recurrence === "daily" ? "Delete Today Only" : deleteConfirmModal.task.recurrence === "weekly" ? "Delete This Week Only" : "Delete This Month Only"}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Task will still appear on other days</div>
                  </button>
                  <button
                    className="w-full text-left px-4 py-3 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors"
                    onClick={() => handleConfirmDelete("series")}>
                    <div className="text-sm font-medium text-destructive">Delete Entire Series</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Permanently remove this task and all its occurrences</div>
                  </button>
                </div>
                <div className="flex gap-2 mt-5">
                  <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirmModal(null)}>Cancel</Button>
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

      {/* Focus Mode Overlay */}
      {focusTask && (
        <FocusMode
          task={focusTask}
          onExit={() => setFocusTask(null)}
          onComplete={() => { handleToggleTask(focusTask.id); setFocusTask(null); addToast("Focus session complete") }}
        />
      )}

      {/* Daily Completion Review Modal */}
      {reviewOpen && (
        <DailyReviewModal
          date={selectedDate || todayISO}
          tasksCompleted={completedToday}
          totalTasks={totalToday}
          productivity={productivity}
          completedHabits={0}
          totalHabits={habitsData.length}
          habitNames={habitsData.map(h => ({ name: h.name, completed: false, score: 0 }))}
          taskList={sortedTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, subtasks: (t.subtasks || []).map(s => ({ title: s.title, completed: s.completed })) }))}
          existingReview={null}
          router={router}
          onClose={() => setReviewOpen(false)}
          onSave={(data) => {
            try {
              const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
              reviews.push({ date: selectedDate || todayISO, ...data, productivity, tasksCompleted: completedToday, completedHabits: 0, totalHabits: habitsData.length, createdAt: new Date().toISOString() })
              localStorage.setItem("intenteo-reviews", JSON.stringify(reviews))
            } catch {}
            addToast("Daily review saved")
            setReviewOpen(false)
          }}
        />
      )}

      {/* Reminder Panel */}
      <AnimatePresence>
        {remindersPanelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setRemindersPanelOpen(false)} />
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-background border-l shadow-2xl overflow-y-auto">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Reminders</h2>
                    {reminders.length > 0 && (
                      <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                        {reminders.length}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRemindersPanelOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {reminders.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No reminders yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Quick reminders appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reminders.map((r) => {
                      const smartDate = getReminderSmartDate(r.date)
                      const createdFormatted = formatCreatedDate(r.createdAt)
                      return (
                        <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow">
                          <p className="text-sm font-medium mb-1">{r.title}</p>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className={`text-xs font-medium ${smartDate.color}`}>{smartDate.label}</span>
                          </div>
                          {createdFormatted && (
                            <p className="text-[10px] text-muted-foreground/60 mb-2">Created: {createdFormatted}</p>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 gap-1"
                              onClick={() => addReminderAsTask(r)}>
                              <Plus className="h-3 w-3" />
                              Add to Today&apos;s Tasks
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 gap-1"
                              onClick={() => removeReminder(r.id)}>
                              <CheckCircle2 className="h-3 w-3" />
                              Done
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-[11px] px-2 gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => removeReminder(r.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <TeoAssistant
        open={teoOpen}
        onOpenChange={setTeoOpen}
        tasks={tasks}
        onAddTask={(title, date) => {
          if (title) setFormTitle(title)
          if (date) setFormDate(date)
          setCreateOpen(true)
        }}
        onStartFocus={() => {
          const focusTarget = tasks.find((x) => !x.completed && !isFutureTask(x))
          if (focusTarget) setFocusTask(focusTarget)
        }}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Task Relationships (expandable section)                */
/* ────────────────────────────────────────────────────── */

function TaskRelationships({ task, goals, habits, projects, router }: {
  task: Task
  goals: { id: string; title: string }[]
  habits: { id: string; name: string }[]
  projects: { id: string; name: string }[]
  router: ReturnType<typeof useRouter>
}) {
  const goal = task.linkedGoalId ? goals.find((g) => g.id === task.linkedGoalId) : null
  const habit = task.linkedHabitId ? habits.find((h) => h.id === task.linkedHabitId) : null
  const project = task.linkedProjectId ? projects.find((p) => p.id === task.linkedProjectId) : null

  const hasAny = goal || habit || project || task.category || task.contributionPercent !== undefined
  if (!hasAny) return null

  const Row = ({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {onClick ? (
        <button onClick={onClick} className="text-xs font-medium text-primary hover:underline truncate max-w-[60%] text-right">{value}</button>
      ) : (
        <span className="text-xs font-medium truncate max-w-[60%] text-right">{value}</span>
      )}
    </div>
  )

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-muted-foreground/20">
      <div className="flex items-center gap-1.5 mb-2">
        <Crosshair className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Relationships</span>
      </div>

      <div className="space-y-0.5">
        {goal && <Row label="Goal" value={goal.title} onClick={() => router.push("/goals")} />}
        {habit && <Row label="Habit" value={habit.name} onClick={() => router.push("/habits")} />}
        {project && <Row label="Project" value={project.name} onClick={() => router.push("/projects")} />}
        {task.category && <Row label="Category" value={task.category} />}
        {task.contributionPercent !== undefined && <Row label="Contribution" value={`${task.contributionPercent}%`} />}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
        <span>Life Vision</span>
        <ArrowUp className="h-2.5 w-2.5 rotate-90" />
        <span>Goal</span>
        <ArrowUp className="h-2.5 w-2.5 rotate-90" />
        <span>Project</span>
        <ArrowUp className="h-2.5 w-2.5 rotate-90" />
        <span>Task</span>
      </div>

      {(goal || task.contributionPercent !== undefined) && (
        <div className="mt-2 flex items-start gap-1.5 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <Sparkles className="h-3 w-3 text-primary mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-snug">
            <span className="font-medium text-foreground">Téo Suggests</span> — This task contributes approximately{" "}
            <span className="font-semibold text-primary">{task.contributionPercent ?? 15}%</span>{" "}
            toward your <span className="font-medium">{goal?.title ?? "goal"}</span>.
          </p>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Focus Mode Overlay                                     */
/* ────────────────────────────────────────────────────── */

function FocusMode({ task, onExit, onComplete }: {
  task: Task
  onExit: () => void
  onComplete: () => void
}) {
  const [paused, setPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerActive, setTimerActive] = useState(false)
  const [interceptions, setInterceptions] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      if (!paused) setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [paused])

  useEffect(() => {
    if (!timerActive) return
    const remaining = timerMinutes * 60 - seconds
    if (remaining <= 0) setTimerActive(false)
  }, [seconds, timerMinutes, timerActive])

  const totalDuration = task.estimatedDuration || 60
  const elapsed = task.estimatedDuration ? Math.min(seconds / 60 / (totalDuration / 60) * 100, 100) : 0
  const progressPct = timerActive ? Math.min((seconds / (timerMinutes * 60)) * 100, 100) : elapsed

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
  const remaining = Math.max(timerMinutes * 60 - seconds, 0)
  const completedSubs = task.subtasks.filter((s) => s.completed).length

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 text-muted-foreground mb-8">
          <Target className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Focus Mode</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-center mb-8">{task.title}</h1>

        {/* Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Progress</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
          </div>
        </div>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="w-full max-w-md mb-8 space-y-1.5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subtasks</p>
            {task.subtasks.map((s) => (
              <div key={s.id} className={`flex items-center gap-2.5 text-sm ${s.completed ? "line-through text-muted-foreground" : ""}`}>
                <div className={`h-4 w-4 rounded border-2 ${s.completed ? "bg-primary border-primary" : "border-muted-foreground/30"} flex items-center justify-center`}>
                  {s.completed && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                </div>
                {s.title}
              </div>
            ))}
            {completedSubs === 0 && task.subtasks.length > 0 && null}
          </div>
        )}

        {/* Linked Habit / Goal */}
        <div className="w-full max-w-md grid grid-cols-2 gap-3 mb-8">
          {task.linkedHabitId && (
            <div className="p-3 rounded-xl bg-muted/40 border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Linked Habit</p>
              <p className="text-sm font-medium truncate">Habit</p>
            </div>
          )}
          {task.linkedGoalId && (
            <div className="p-3 rounded-xl bg-muted/40 border text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Linked Goal</p>
              <p className="text-sm font-medium truncate">Goal</p>
            </div>
          )}
        </div>

        {/* Why It Matters */}
        {task.whyItMatters && (
          <div className="w-full max-w-md mb-8">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Why It Matters</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{task.whyItMatters}</p>
          </div>
        )}

        {/* Timer */}
        <div className="w-full max-w-md mb-8">
          <div className="flex items-center justify-center gap-2 text-4xl font-bold tabular-nums mb-3">
            <Timer className="h-5 w-5 text-muted-foreground" />
            {timerActive ? fmt(remaining) : fmt(seconds)}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[25, 45, 60, 90].map((m) => (
              <button key={m} onClick={() => { setTimerMinutes(m); setTimerActive(true) }}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${timerMinutes === m && timerActive ? "border-primary bg-primary/10 text-primary" : "border-muted hover:bg-muted/50 text-muted-foreground"}`}>
                {m}m
              </button>
            ))}
            <button onClick={() => setTimerActive((a) => !a)}
              className="px-3 py-1 rounded-lg text-xs font-medium border border-muted hover:bg-muted/50 text-muted-foreground">
              {timerActive ? "Reset" : "Start"}
            </button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 mb-8 text-center">
          <p>Estimated Duration: {task.estimatedDuration ? `${task.estimatedDuration}m` : "—"}</p>
          {task.estimatedDuration ? <p>Time Spent: {fmt(seconds)}</p> : null}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { setInterceptions((n) => n + 1); setPaused(true) }}>
            <Pause className="h-4 w-4 mr-1.5" /> {paused ? "Resume" : "Pause"}
          </Button>
          <Button className="glow" onClick={onComplete}>
            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete Task
          </Button>
          <Button variant="ghost" onClick={onExit}>Exit Focus Mode</Button>
        </div>

        {interceptions > 0 && (
          <p className="text-[10px] text-muted-foreground/60 mt-3">Interruptions logged: {interceptions}</p>
        )}
      </div>
    </div>
  )
}


/* ────────────────────────────────────────────────────── */
/* Daily Completion Review Modal                         */
/* ────────────────────────────────────────────────────── */

interface ReviewData {
  wentWell: string; improve: string; intentional: number; mood: string
  biggestWin: string; biggestChallenge: string; gratitude: string; lesson: string
  intention: string; carryForward: string[]
}

export function DailyReviewModal({ date, tasksCompleted, totalTasks, productivity, completedHabits, totalHabits, habitNames, taskList, existingReview, onClose, onSave, router }: {
  date: string
  tasksCompleted: number
  totalTasks: number
  productivity: number
  completedHabits: number
  totalHabits: number
  habitNames: { name: string; completed: boolean; score: number }[]
  taskList: { id: string; title: string; completed: boolean; subtasks: { title: string; completed: boolean }[] }[]
  existingReview: { wentWell?: string; improve?: string; gratitude?: string; lesson?: string; biggestWin?: string; biggestChallenge?: string; intention?: string } | null
  onClose: () => void
  onSave: (data: ReviewData) => void
  router: ReturnType<typeof useRouter>
}) {
  const [wentWell, setWentWell] = useState(existingReview?.wentWell || "")
  const [improve, setImprove] = useState(existingReview?.improve || "")
  const [intentional, setIntentional] = useState(7)
  const [mood, setMood] = useState("smile")
  const [biggestWin, setBiggestWin] = useState(existingReview?.biggestWin || "")
  const [biggestChallenge, setBiggestChallenge] = useState(existingReview?.biggestChallenge || "")
  const [gratitude, setGratitude] = useState(existingReview?.gratitude || "")
  const [lesson, setLesson] = useState(existingReview?.lesson || "")
  const [intention, setIntention] = useState(existingReview?.intention || "Be fully present in every conversation.")
  const [carryForward, setCarryForward] = useState<string[]>([])

  const moods = [
    { key: "smile", icon: Smile, label: "Good" },
    { key: "meh", icon: Meh, label: "Okay" },
    { key: "frown", icon: Frown, label: "Low" },
    { key: "moon", icon: Moon, label: "Tired" },
    { key: "angry", icon: Angry, label: "Stressed" },
  ]

  const teoReflection = useMemo(() => {
    const insights = []
    if (completedHabits === totalHabits && totalHabits > 0) insights.push("Perfect day! You completed every habit.")
    else if (completedHabits > 0) insights.push(`You completed ${completedHabits} habit${completedHabits > 1 ? "s" : ""} today. Keep the momentum.`)
    if (tasksCompleted === totalTasks && totalTasks > 0) insights.push("All tasks done! Great focus today.")
    if (tasksCompleted < totalTasks && totalTasks > 0) insights.push(`${totalTasks - tasksCompleted} task${totalTasks - tasksCompleted > 1 ? "s" : ""} remaining. Consider prioritizing tomorrow.`)
    if (habitNames.some(h => h.score >= 90)) insights.push(`Strong performance on ${habitNames.find(h => h.score >= 90)?.name}.`)
    return insights[0] || "Every day is a step forward."
  }, [completedHabits, totalHabits, tasksCompleted, totalTasks, habitNames])

  const unfinishedTasks = taskList.filter(t => !t.completed)
  const habitCompletionPct = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
  const subtasksCompleted = taskList.reduce((acc, t) => acc + t.subtasks.filter(s => s.completed).length, 0)
  const subtasksTotal = taskList.reduce((acc, t) => acc + t.subtasks.length, 0)
  const anyReflectionFilled = wentWell.length > 0 || improve.length > 0 || biggestWin.length > 0 || biggestChallenge.length > 0 || gratitude.length > 0 || lesson.length > 0

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-lg bg-background rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-5">

          {/* 1. Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Today&apos;s Review</h3>
              <p className="text-xs text-muted-foreground">{formatDateLong(date)}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>

          {/* 2. Today's Intention */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Today&apos;s Intention</span>
            </div>
            <p className="text-sm">&quot;{intention}&quot;</p>
          </div>

          {/* 3. Today's Habits */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Today&apos;s Habits</span>
              <span className="text-xs font-semibold">{completedHabits} / {totalHabits} ({habitCompletionPct}%)</span>
            </div>
            <div className="space-y-1.5">
              {habitNames.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {h.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                  )}
                  <span className={`flex-1 ${h.completed ? "text-muted-foreground" : ""}`}>{h.name}</span>
                  <span className="text-[10px] font-medium" style={{ color: h.score >= 80 ? "#22C55E" : h.score >= 50 ? "#F97316" : "#EF4444" }}>{h.score}%</span>
                </div>
              ))}
              {habitNames.length === 0 && <p className="text-xs text-muted-foreground">No habits tracked today.</p>}
            </div>
          </div>

          {/* 4. Today's Tasks */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Today&apos;s Tasks</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{tasksCompleted} / {totalTasks}</p>
                <p className="text-[10px] text-muted-foreground">Tasks Done</p>
              </div>
              <div>
                <p className="text-lg font-bold">{productivity}%</p>
                <p className="text-[10px] text-muted-foreground">Productivity</p>
              </div>
              <div>
                <p className="text-lg font-bold">{subtasksCompleted}/{subtasksTotal}</p>
                <p className="text-[10px] text-muted-foreground">Subtasks</p>
              </div>
            </div>
          </div>

          {/* 5. Biggest Win */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">What was your biggest win today?</label>
            <textarea value={biggestWin} onChange={(e) => setBiggestWin(e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Your highlight of the day..." />
          </div>

          {/* 6. Biggest Challenge */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">What challenged you today?</label>
            <textarea value={biggestChallenge} onChange={(e) => setBiggestChallenge(e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Obstacles you faced..." />
          </div>

          {/* 7. Gratitude */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">What are you grateful for today?</label>
            <textarea value={gratitude} onChange={(e) => setGratitude(e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Moments of gratitude..." />
          </div>

          {/* 8. Lesson Learned */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">What did today teach you?</label>
            <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} rows={2}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="A lesson or insight..." />
          </div>

          {/* 9. Mood */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Mood</label>
            <div className="flex gap-1.5 mt-1">
              {moods.map((m) => {
                const Icon = m.icon
                return (
                  <button key={m.key} onClick={() => setMood(m.key)}
                    className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${mood === m.key ? "border-primary bg-primary/10 text-primary" : "border-muted hover:bg-muted/50 text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* 10. Intentionality Score */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">How intentional did today feel? {intentional}/10</label>
            <input type="range" min={1} max={10} value={intentional} onChange={(e) => setIntentional(Number(e.target.value))}
              className="mt-1 w-full accent-primary" />
          </div>

          {/* 11. Carry Forward */}
          {unfinishedTasks.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/40 border">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Carry Forward</span>
              <p className="text-xs text-muted-foreground mt-1 mb-2">Move unfinished tasks to tomorrow:</p>
              <div className="space-y-1.5">
                {unfinishedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <button onClick={() => setCarryForward(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}
                      className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${carryForward.includes(t.id) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40"}`}>
                      {carryForward.includes(t.id) && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <span className="text-sm flex-1">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. Téo Reflection */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-[#1E0E6B]" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Téo Reflection</span>
            </div>
            <p className="text-sm">{teoReflection}</p>
          </div>

          {/* 13. End of Day Summary */}
          <div className="p-3 rounded-xl bg-muted/40 border">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium block mb-2">End of Day Summary</span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-bold text-sm">{intentional}/10</p>
                <p className="text-muted-foreground">Intent Score</p>
              </div>
              <div>
                <p className="font-bold text-sm">{productivity}%</p>
                <p className="text-muted-foreground">Productivity</p>
              </div>
              <div>
                <p className="font-bold text-sm">{completedHabits}/{totalHabits}</p>
                <p className="text-muted-foreground">Habits</p>
              </div>
              <div>
                <p className="font-bold text-sm">{tasksCompleted}/{totalTasks}</p>
                <p className="text-muted-foreground">Tasks</p>
              </div>
              <div>
                <p className="font-bold text-sm capitalize">{mood}</p>
                <p className="text-muted-foreground">Mood</p>
              </div>
              <div>
                <p className="font-bold text-sm">{anyReflectionFilled ? "Yes" : "No"}</p>
                <p className="text-muted-foreground">Reflection</p>
              </div>
            </div>
          </div>

          {/* 14. Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Skip</Button>
            <Button className="flex-1 glow" onClick={() => onSave({ wentWell, improve, intentional, mood, biggestWin, biggestChallenge, gratitude, lesson, intention, carryForward })}>Save Review</Button>
          </div>
          <button onClick={() => router.push("/journey")} className="w-full text-xs text-primary hover:underline">View My Journey</button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ────────────────────────────────────────────────────── */
/* Tooltip helper                                         */
/* ────────────────────────────────────────────────────── */

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ left: rect.left + rect.width / 2, top: rect.top })
    }
    setShow(true)
  }

  return (
    <div className="relative inline-flex" ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={() => setShow(false)}>
      {children}
      {show && typeof document !== 'undefined' && createPortal(
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="fixed px-2 py-1 text-[10px] font-medium text-foreground bg-background border rounded-lg shadow-lg whitespace-nowrap z-[9999] pointer-events-none"
          style={{ left: pos.left, top: pos.top - 8, transform: 'translateX(-50%) translateY(-100%)' }}>
          {label}
        </motion.div>,
        document.body
      )}
    </div>
  )
}
