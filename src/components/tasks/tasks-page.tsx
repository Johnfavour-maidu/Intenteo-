"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from "react"
import { Task, TaskPriority, TaskView, Subtask } from "./types"
import { sampleTasks } from "./task-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import {
  Plus,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  Pencil,
  Archive,
  GripVertical,
  X,
  Repeat,
  Clock,
  Target,
  CheckCircle2,
  Flame,
  PenLine,
  Save,
  Zap,
} from "lucide-react"
import { useToast, ToastContainer } from "./task-toast"

const priorityConfig: Record<
  TaskPriority,
  { label: string; cssColor: string; pastelBg: string; pastelBorder: string }
> = {
  priority: {
    label: "Priority",
    cssColor: "#F97316",
    pastelBg: "#FFF7ED",
    pastelBorder: "#F97316",
  },
  progress: {
    label: "Progress",
    cssColor: "#7C3AED",
    pastelBg: "#F5F3FF",
    pastelBorder: "#7C3AED",
  },
  maintenance: {
    label: "Maintenance",
    cssColor: "#14B8A6",
    pastelBg: "#F0FDFA",
    pastelBorder: "#14B8A6",
  },
}

const hours = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i))
const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function parseTime(timeStr: string): { hour: number; minute: number; period: "AM" | "PM" } | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return null
  return {
    hour: parseInt(match[1]),
    minute: parseInt(match[2]),
    period: match[3].toUpperCase() as "AM" | "PM",
  }
}

function formatTimeSelection(hour: number, minute: number, period: string): string {
  return `${hour}:${String(minute).padStart(2, "0")} ${period}`
}

function calcDurationFromRange(start: string, end: string): number {
  const s = parseTime(start)
  const e = parseTime(end)
  if (!s || !e) return 0
  let sMin = (s.period === "PM" && s.hour !== 12 ? s.hour + 12 : s.period === "AM" && s.hour === 12 ? 0 : s.hour) * 60 + s.minute
  let eMin = (e.period === "PM" && e.hour !== 12 ? e.hour + 12 : e.period === "AM" && e.hour === 12 ? 0 : e.hour) * 60 + e.minute
  if (eMin <= sMin) eMin += 24 * 60
  return eMin - sMin
}

/* ────────────────────────────────────────────────────── */
/* Time Range Picker                                     */
/* ────────────────────────────────────────────────────── */

function TimeRangePicker({
  startTime,
  endTime,
  onChange,
}: {
  startTime: string
  endTime: string
  onChange: (start: string, end: string, durationMin: number) => void
}) {
  const s = parseTime(startTime) || { hour: 9, minute: 0, period: "AM" as const }
  const e = parseTime(endTime) || { hour: 9, minute: 30, period: "AM" as const }

  const [startHour, setStartHour] = useState(s.hour)
  const [startMin, setStartMin] = useState(s.minute)
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">(s.period)
  const [endHour, setEndHour] = useState(e.hour)
  const [endMin, setEndMin] = useState(e.minute)
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">(e.period)

  useEffect(() => {
    const sStr = formatTimeSelection(startHour, startMin, startPeriod)
    const eStr = formatTimeSelection(endHour, endMin, endPeriod)
    const dur = calcDurationFromRange(sStr, eStr)
    onChange(sStr, eStr, dur > 0 ? dur : 0)
  }, [startHour, startMin, startPeriod, endHour, endMin, endPeriod, onChange])

  const ScrollCol = ({
    items,
    selected,
    onSelect,
    label,
  }: {
    items: (number | string)[]
    selected: number | string
    onSelect: (v: number | string) => void
    label: string
  }) => (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      <div className="h-20 overflow-y-auto scrollbar-hide relative w-14">
        <div className="py-6">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`w-full h-7 flex items-center justify-center text-xs rounded-md transition-all duration-150 ${
                selected === item
                  ? "bg-primary text-primary-foreground font-semibold scale-105"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {typeof item === "number" && label !== "AM/PM"
                ? String(item).padStart(2, "0")
                : item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex items-center gap-3">
      <div className="text-[10px] text-muted-foreground font-medium">Start</div>
      <div className="flex items-center gap-1 p-2 rounded-xl bg-muted/30 border">
        <ScrollCol items={hours} selected={startHour} onSelect={(v) => setStartHour(v as number)} label="Hr" />
        <div className="text-lg font-bold text-muted-foreground/40 mt-3">:</div>
        <ScrollCol items={minutes} selected={startMin} onSelect={(v) => setStartMin(v as number)} label="Min" />
        <ScrollCol items={["AM", "PM"]} selected={startPeriod} onSelect={(v) => setStartPeriod(v as "AM" | "PM")} label="AM/PM" />
      </div>
      <div className="text-muted-foreground/40 mt-3">–</div>
      <div className="text-[10px] text-muted-foreground font-medium">End</div>
      <div className="flex items-center gap-1 p-2 rounded-xl bg-muted/30 border">
        <ScrollCol items={hours} selected={endHour} onSelect={(v) => setEndHour(v as number)} label="Hr" />
        <div className="text-lg font-bold text-muted-foreground/40 mt-3">:</div>
        <ScrollCol items={minutes} selected={endMin} onSelect={(v) => setEndMin(v as number)} label="Min" />
        <ScrollCol items={["AM", "PM"]} selected={endPeriod} onSelect={(v) => setEndPeriod(v as "AM" | "PM")} label="AM/PM" />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Daily Productivity Widget                             */
/* ────────────────────────────────────────────────────── */

function ProductivityWidget({ percentage }: { percentage: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border shadow-sm">
      <div className="relative h-20 w-20 shrink-0">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/50" />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-primary"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-lg font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold">Today&apos;s Productivity</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Based on today&apos;s planned work</p>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Inline Edit Component                                 */
/* ────────────────────────────────────────────────────── */

const InlineEdit = memo(function InlineEdit({
  taskId,
  field,
  value,
  className,
  isTextarea = false,
  editingField,
  editValue,
  setEditingField,
  setEditValue,
  saveEditing,
  editInputRef,
}: {
  taskId: string
  field: string
  value: string
  className?: string
  isTextarea?: boolean
  editingField: { taskId: string; field: string } | null
  editValue: string
  setEditingField: (v: { taskId: string; field: string } | null) => void
  setEditValue: (v: string) => void
  saveEditing: () => void
  editInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
}) {
  const isEditing = editingField?.taskId === taskId && editingField?.field === field

  const startEditing = useCallback(() => {
    setEditingField({ taskId, field })
    setEditValue(value)
    setTimeout(() => (editInputRef as React.RefObject<HTMLInputElement>)?.current?.focus(), 0)
  }, [taskId, field, value, setEditingField, setEditValue, editInputRef])

  if (isEditing) {
    return isTextarea ? (
      <Textarea
        ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={saveEditing}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEditing() }
          if (e.key === "Escape") setEditingField(null)
        }}
        className={`min-h-[60px] text-sm ${className || ""}`}
      />
    ) : (
      <Input
        ref={editInputRef as React.RefObject<HTMLInputElement>}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={saveEditing}
        onKeyDown={(e) => {
          if (e.key === "Enter") saveEditing()
          if (e.key === "Escape") setEditingField(null)
        }}
        className={`h-7 text-sm px-2 py-0 ${className || ""}`}
      />
    )
  }

  return (
    <span
      className={`cursor-text rounded-md px-1 -mx-1 hover:bg-muted/50 transition-colors ${className || ""}`}
      onClick={startEditing}
    >
      {value || <span className="text-muted-foreground italic">Click to edit</span>}
    </span>
  )
})

/* ────────────────────────────────────────────────────── */
/* Main Tasks Page                                       */
/* ────────────────────────────────────────────────────── */

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [activeView, setActiveView] = useState<TaskView>("list")
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(
    () => new Set(sampleTasks.map((t) => t.id))
  )
  const [contextMenu, setContextMenu] = useState<{ taskId: string; x: number; y: number } | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<{ taskId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const { toasts, addToast, removeToast } = useToast()

  // Create form state
  const [formTitle, setFormTitle] = useState("")
  const [formWhy, setFormWhy] = useState("")
  const [formPriority, setFormPriority] = useState<TaskPriority>("progress")
  const [formStartHour, setFormStartHour] = useState(9)
  const [formStartMin, setFormStartMin] = useState(0)
  const [formStartPeriod, setFormStartPeriod] = useState<"AM" | "PM">("AM")
  const [formEndHour, setFormEndHour] = useState(9)
  const [formEndMin, setFormEndMin] = useState(30)
  const [formEndPeriod, setFormEndPeriod] = useState<"AM" | "PM">("AM")
  const [formRecurrence, setFormRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none")
  const [formNotes, setFormNotes] = useState("")

  const completedToday = useMemo(() => tasks.filter((t) => t.completed).length, [tasks])
  const remainingToday = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks])
  const totalToday = completedToday + remainingToday
  const productivity = useMemo(
    () => (totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)),
    [completedToday, totalToday]
  )

  const getSubtaskProgress = useCallback((subtasks: Subtask[]) => {
    if (subtasks.length === 0) return 0
    return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }, [])

  const handleToggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id)
      if (task && !task.completed) addToast()
      toggleTask(id)
    },
    [tasks, toggleTask, addToast]
  )

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed: !s.completed } : s)) }
          : t
      )
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setContextMenu(null)
  }, [])

  const duplicateTask = useCallback(
    (task: Task) => {
      const newTask: Task = {
        ...task,
        id: `dup-${Date.now()}`,
        title: `${task.title} (Copy)`,
        completed: false,
        order: task.order,
        subtasks: task.subtasks.map((s) => ({ ...s, id: `s-${Date.now()}-${s.id}`, completed: false })),
        createdAt: new Date().toISOString(),
      }
      setTasks((prev) => {
        const items = [...prev]
        const idx = items.findIndex((t) => t.id === task.id)
        items.splice(idx + 1, 0, newTask)
        return items.map((t, i) => ({ ...t, order: i }))
      })
      setContextMenu(null)
    },
    []
  )

  const archiveTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setContextMenu(null)
  }, [])

  const handleCreateTask = useCallback(() => {
    if (!formTitle.trim()) return
    const startStr = formatTimeSelection(formStartHour, formStartMin, formStartPeriod)
    const endStr = formatTimeSelection(formEndHour, formEndMin, formEndPeriod)
    const dur = calcDurationFromRange(startStr, endStr)
    const newTask: Task = {
      id: `new-${Date.now()}`,
      title: formTitle,
      whyItMatters: formWhy,
      priority: formPriority,
      deadline: "Today",
      dueTime: startStr,
      timeRange: `${startStr} – ${endStr}`,
      estimatedDuration: dur > 0 ? dur : 30,
      notes: formNotes,
      subtasks: [],
      recurrence: formRecurrence,
      completed: false,
      order: tasks.length,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    setFormTitle("")
    setFormWhy("")
    setFormPriority("progress")
    setFormStartHour(9)
    setFormStartMin(0)
    setFormStartPeriod("AM")
    setFormEndHour(9)
    setFormEndMin(30)
    setFormEndPeriod("AM")
    setFormRecurrence("none")
    setFormNotes("")
    setCreateOpen(false)
  }, [formTitle, formWhy, formPriority, formStartHour, formStartMin, formStartPeriod, formEndHour, formEndMin, formEndPeriod, formRecurrence, formNotes, tasks.length])

  const saveEditing = useCallback(() => {
    if (!editingField) return
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== editingField.taskId) return t
        switch (editingField.field) {
          case "title": return { ...t, title: editValue }
          case "whyItMatters": return { ...t, whyItMatters: editValue }
          case "timeRange": return { ...t, timeRange: editValue }
          case "estimatedDuration": return { ...t, estimatedDuration: parseInt(editValue) || t.estimatedDuration }
          case "notes": return { ...t, notes: editValue }
          default: return t
        }
      })
    )
    setEditingField(null)
    setEditValue("")
  }, [editingField, editValue])

  const cancelEditing = useCallback(() => {
    setEditingField(null)
    setEditValue("")
  }, [])

  const addSubtaskInline = useCallback((taskId: string) => {
    const newSub: Subtask = { id: `sub-${Date.now()}`, title: "New subtask", completed: false }
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t)))
    setExpandedTasks((prev) => new Set(prev).add(taskId))
  }, [])

  const handleDragStart = useCallback((id: string) => setDraggedId(id), [])
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => { e.preventDefault(); setDragOverId(id) }, [])
  const handleDrop = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return }
      setTasks((prev) => {
        const items = [...prev]
        const dragIdx = items.findIndex((t) => t.id === draggedId)
        const dropIdx = items.findIndex((t) => t.id === targetId)
        if (dragIdx === -1 || dropIdx === -1) return prev
        const [dragged] = items.splice(dragIdx, 1)
        items.splice(dropIdx, 0, dragged)
        return items.map((t, i) => ({ ...t, order: i }))
      })
      setDraggedId(null)
      setDragOverId(null)
    },
    [draggedId]
  )
  const handleDragEnd = useCallback(() => { setDraggedId(null); setDragOverId(null) }, [])

  useEffect(() => {
    if (contextMenu) {
      const handler = () => setContextMenu(null)
      window.addEventListener("click", handler)
      return () => window.removeEventListener("click", handler)
    }
  }, [contextMenu])

  useEffect(() => {
    if (editingField && editInputRef.current) {
      editInputRef.current.focus()
      if (["title", "whyItMatters", "notes"].includes(editingField.field)) {
        ;(editInputRef.current as HTMLInputElement).select?.()
      }
    }
  }, [editingField])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setContextMenu(null); cancelEditing(); setCreateOpen(false) }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [cancelEditing])

  /* ─── Shared task row renderers ─── */
  const renderSubtasks = useCallback(
    (task: Task, isExpanded: boolean) => (
      <AnimatePresence initial={false}>
        {isExpanded && task.subtasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-10 pr-4 py-1.5 space-y-0.5">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                    {sub.completed ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                        <div className="h-3.5 w-3.5 rounded bg-primary flex items-center justify-center">
                          <svg className="h-2 w-2 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30 hover:border-primary transition-colors" />
                    )}
                  </button>
                  <span className={`text-xs ${sub.completed ? "line-through text-muted-foreground" : ""}`}>{sub.title}</span>
                </div>
              ))}
              <button
                onClick={() => addSubtaskInline(task.id)}
                className="flex items-center gap-1.5 py-1 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add subtask
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    ),
    [toggleSubtask, addSubtaskInline]
  )

  /* ═══════════════════════════════════════════════════════ */
  /* LIST VIEW — planner rows (default)                     */
  /* ═══════════════════════════════════════════════════════ */
  const renderListView = useCallback(() => {
    if (tasks.length === 0) return <EmptyState onCreate={() => setCreateOpen(true)} />
    return (
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="sticky top-0 z-10 grid grid-cols-[1fr_160px_100px_120px_44px] gap-4 px-5 py-3 border-b bg-background/95 backdrop-blur-sm text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div>Task</div>
          <div className="hidden sm:block">Time Range</div>
          <div className="hidden sm:block text-right">Duration</div>
          <div>Progress</div>
          <div></div>
        </div>

        <LayoutGroup>
          {tasks.map((task, i) => {
            const progress = task.completed ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandedTasks.has(task.id)
            const isDragging = draggedId === task.id
            const isDragOver = dragOverId === task.id && dragOverId !== draggedId
            const pConfig = priorityConfig[task.priority]

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015, layout: { type: "spring", stiffness: 300, damping: 30 } }}
              >
                <div
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDrop={() => handleDrop(task.id)}
                  onDragEnd={handleDragEnd}
                  className={`grid grid-cols-[1fr_160px_100px_120px_44px] gap-4 px-5 py-3.5 items-center group transition-all duration-150 cursor-default border-b border-border/30 last:border-0 mx-1 my-0.5 rounded-xl ${
                    isDragging ? "opacity-40 scale-[0.98]" : ""
                  } ${isDragOver ? "border-t-2 border-t-primary" : ""} hover:bg-muted/40`}
                  style={{
                    borderLeftWidth: "3px",
                    borderLeftColor: pConfig.cssColor,
                    backgroundColor: `${pConfig.pastelBg}40`,
                  }}
                >
                  {/* Drag Handle */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Checkbox */}
                    <button onClick={() => handleToggleTask(task.id)} className="shrink-0">
                      {task.completed ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                      )}
                    </button>

                    {/* Task Title + Count */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <InlineEdit
                          taskId={task.id} field="title" value={task.title}
                          className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
                          editingField={editingField} editValue={editValue} setEditingField={setEditingField}
                          setEditValue={setEditValue} saveEditing={saveEditing} editInputRef={editInputRef}
                        />
                        {task.subtasks.length > 0 && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 shrink-0">
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                        <Button
                          variant="ghost" size="icon"
                          className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => toggleExpanded(task.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                      </div>
                      {task.whyItMatters && (
                        <InlineEdit
                          taskId={task.id} field="whyItMatters" value={task.whyItMatters}
                          className="text-[11px] text-muted-foreground truncate block mt-0.5"
                          editingField={editingField} editValue={editValue} setEditingField={setEditingField}
                          setEditValue={setEditValue} saveEditing={saveEditing} editInputRef={editInputRef}
                        />
                      )}
                    </div>
                  </div>

                  {/* Time Range */}
                  <div className="hidden sm:block">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0" />
                      <InlineEdit
                        taskId={task.id} field="timeRange" value={task.timeRange} className="text-xs"
                        editingField={editingField} editValue={editValue} setEditingField={setEditingField}
                        setEditValue={setEditValue} saveEditing={saveEditing} editInputRef={editInputRef}
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="hidden sm:block text-right">
                    <span className="text-xs text-muted-foreground">{formatDuration(task.estimatedDuration)}</span>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                  </div>

                  {/* Actions */}
                  <div className="relative flex justify-end">
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.getBoundingClientRect()
                        setContextMenu({ taskId: task.id, x: rect.right - 180, y: rect.bottom + 4 })
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  </div>
                </div>

                {renderSubtasks(task, isExpanded)}
              </motion.div>
            )
          })}
        </LayoutGroup>
      </div>
    )
  }, [tasks, expandedTasks, draggedId, dragOverId, editingField, editValue, getSubtaskProgress, handleDragStart, handleDragOver, handleDrop, handleDragEnd, handleToggleTask, toggleExpanded, renderSubtasks, saveEditing])

  /* ═══════════════════════════════════════════════════════ */
  /* TABLE VIEW — compact card grid                         */
  /* ═══════════════════════════════════════════════════════ */
  const renderTableView = useCallback(() => {
    if (tasks.length === 0) return <EmptyState onCreate={() => setCreateOpen(true)} />
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <LayoutGroup>
          {tasks.map((task, i) => {
            const progress = task.completed ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandedTasks.has(task.id)
            const pConfig = priorityConfig[task.priority]
            const completedSubs = task.subtasks.filter((s) => s.completed).length

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                className="rounded-2xl border bg-card shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                style={{
                  borderTopWidth: "3px",
                  borderTopColor: pConfig.pastelBorder,
                  backgroundColor: pConfig.pastelBg + "30",
                }}
              >
                <div className="p-4">
                  {/* Header: Checkbox + Title + Count */}
                  <div className="flex items-start gap-2.5 mb-3">
                    <button onClick={() => handleToggleTask(task.id)} className="shrink-0 mt-0.5">
                      {task.completed ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className={`text-sm font-semibold truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </h3>
                        {task.subtasks.length > 0 && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 shrink-0">
                            {completedSubs}/{task.subtasks.length}
                          </span>
                        )}
                      </div>
                      {task.whyItMatters && (
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{task.whyItMatters}</p>
                      )}
                    </div>
                    <span
                      className="shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: pConfig.pastelBorder + "20", color: pConfig.pastelBorder }}
                    >
                      {pConfig.label}
                    </span>
                  </div>

                  {/* Meta: Time + Duration */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.timeRange}
                    </span>
                    <span className="text-muted-foreground/40">|</span>
                    <span>{formatDuration(task.estimatedDuration)}</span>
                  </div>

                  {/* Subtasks preview */}
                  {task.subtasks.length > 0 && (
                    <div className="mb-3 space-y-1">
                      {task.subtasks.slice(0, isExpanded ? undefined : 3).map((sub) => (
                        <div key={sub.id} className="flex items-center gap-2">
                          <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                            {sub.completed ? (
                              <div className="h-3 w-3 rounded bg-primary flex items-center justify-center">
                                <svg className="h-1.5 w-1.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            ) : (
                              <div className="h-3 w-3 rounded border border-muted-foreground/30" />
                            )}
                          </button>
                          <span className={`text-[11px] ${sub.completed ? "line-through text-muted-foreground" : ""}`}>{sub.title}</span>
                        </div>
                      ))}
                      {task.subtasks.length > 3 && !isExpanded && (
                        <button onClick={() => toggleExpanded(task.id)} className="text-[11px] text-primary hover:underline pl-5">
                          +{task.subtasks.length - 3} more
                        </button>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => duplicateTask(task)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => archiveTask(task.id)}>
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteTask(task.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </LayoutGroup>
      </div>
    )
  }, [tasks, expandedTasks, getSubtaskProgress, handleToggleTask, toggleExpanded, toggleSubtask, duplicateTask, archiveTask, deleteTask])

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedToday} of {totalToday} completed today
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Summary Cards */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-xs font-medium text-blue-600 dark:text-blue-400">
                <Target className="h-3.5 w-3.5" />
                <span>{totalToday}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-xs font-medium text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{completedToday}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-xs font-medium text-red-600 dark:text-red-400">
                <Flame className="h-3.5 w-3.5" />
                <span>{remainingToday}</span>
              </div>
            </div>

            {/* Productivity Widget */}
            <ProductivityWidget percentage={productivity} />

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              <Button
                variant={activeView === "list" ? "default" : "ghost"}
                size="sm" className="h-8 px-3"
                onClick={() => setActiveView("list")}
              >
                <List className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline text-xs">List</span>
              </Button>
              <Button
                variant={activeView === "table" ? "default" : "ghost"}
                size="sm" className="h-8 px-3"
                onClick={() => setActiveView("table")}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline text-xs">Board</span>
              </Button>
            </div>

            {/* Add Task */}
            <Button className="glow" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Views */}
        {activeView === "list" ? renderListView() : renderTableView()}

        {/* Daily Reflection */}
        <DailyReflection />

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedToday} completed today</span>
          <span>{remainingToday} remaining</span>
        </div>
      </div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="fixed z-50 w-44 rounded-xl border bg-background shadow-xl p-1"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  const task = tasks.find((t) => t.id === contextMenu.taskId)
                  if (task) {
                    setEditingField({ taskId: task.id, field: "title" })
                    setEditValue(task.title)
                    setContextMenu(null)
                  }
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  const task = tasks.find((t) => t.id === contextMenu.taskId)
                  if (task) duplicateTask(task)
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <button
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                onClick={() => archiveTask(contextMenu.taskId)}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
              <div className="h-px bg-border my-1" />
              <button
                className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                onClick={() => deleteTask(contextMenu.taskId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {createOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">New Task</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCreateOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Task Name</label>
                    <Input
                      placeholder="What needs to be done?"
                      value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                      className="mt-1" autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Why does this matter?</label>
                    <Textarea
                      placeholder="How does this connect to your purpose?"
                      value={formWhy} onChange={(e) => setFormWhy(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {(["priority", "progress", "maintenance"] as TaskPriority[]).map((p) => (
                        <Button
                          key={p}
                          variant={formPriority === p ? "default" : "outline"}
                          size="sm" className="flex-1"
                          onClick={() => setFormPriority(p)}
                        >
                          <div className="h-2 w-2 rounded-full mr-1.5" style={{ backgroundColor: priorityConfig[p].cssColor }} />
                          {priorityConfig[p].label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Time Range</label>
                    <div className="mt-2 overflow-x-auto">
                      <TimeRangePicker
                        startTime={`${formStartHour}:${String(formStartMin).padStart(2, "0")} ${formStartPeriod}`}
                        endTime={`${formEndHour}:${String(formEndMin).padStart(2, "0")} ${formEndPeriod}`}
                        onChange={(start, end, dur) => {
                          const s = parseTime(start)
                          const e = parseTime(end)
                          if (s) { setFormStartHour(s.hour); setFormStartMin(s.minute); setFormStartPeriod(s.period) }
                          if (e) { setFormEndHour(e.hour); setFormEndMin(e.minute); setFormEndPeriod(e.period) }
                        }}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                        Duration: {formatDuration(calcDurationFromRange(
                          formatTimeSelection(formStartHour, formStartMin, formStartPeriod),
                          formatTimeSelection(formEndHour, formEndMin, formEndPeriod)
                        ))}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recurrence</label>
                    <div className="flex gap-1 mt-1">
                      {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
                        <Button
                          key={r}
                          variant={formRecurrence === r ? "default" : "outline"}
                          size="sm" className="flex-1 text-[10px] px-1"
                          onClick={() => setFormRecurrence(r)}
                        >
                          {r === "none" ? "\u2014" : r.charAt(0).toUpperCase() + r.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Notes</label>
                    <Textarea
                      placeholder="Additional details..."
                      value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                      className="mt-1 min-h-[50px]"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 glow" onClick={handleCreateTask} disabled={!formTitle.trim()}>
                    Add Task
                  </Button>
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
/* Daily Reflection                                       */
/* ────────────────────────────────────────────────────── */

function DailyReflection() {
  const [reflection, setReflection] = useState("")
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const charCount = reflection.length
  const maxChars = 2000

  const handleSave = useCallback(() => {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    setExpanded(false)
  }, [])

  const handleExpand = useCallback(() => {
    setExpanded(true)
    setTimeout(() => textareaRef.current?.focus(), 300)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 rounded-2xl border bg-card shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <PenLine className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Daily Reflection</h3>
        </div>
        {savedAt && (
          <span className="text-[10px] text-muted-foreground">Saved at {savedAt}</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.div
            key="input"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <input
              ref={inputRef}
              type="text"
              value={reflection}
              onChange={(e) => setReflection(e.target.value.slice(0, maxChars))}
              onFocus={handleExpand}
              placeholder="What are you thinking about your day?"
              className="w-full px-5 py-3 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
            />
          </motion.div>
        ) : (
          <motion.div
            key="textarea"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <textarea
              ref={textareaRef}
              value={reflection}
              onChange={(e) => setReflection(e.target.value.slice(0, maxChars))}
              placeholder="What are you thinking about your day?"
              className="w-full px-5 py-3 text-sm leading-relaxed bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground/50 min-h-[120px]"
            />
            <div className="flex items-center justify-between px-5 py-2.5 border-t bg-muted/20">
              <span className={`text-[10px] ${charCount > maxChars * 0.9 ? "text-orange-500" : "text-muted-foreground"}`}>
                {charCount}/{maxChars}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setExpanded(false)}>
                  Continue Later
                </Button>
                <Button size="sm" className="h-7 text-xs gap-1.5" onClick={handleSave} disabled={!reflection.trim()}>
                  <Save className="h-3 w-3" />
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Empty State                                            */
/* ────────────────────────────────────────────────────── */

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        <svg className="h-8 w-8 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-1">No tasks planned today.</h3>
      <p className="text-sm text-muted-foreground mb-5">Start by adding your first intentional task.</p>
      <Button onClick={onCreate} className="glow">
        <Plus className="mr-1 h-4 w-4" />
        Add Task
      </Button>
    </div>
  )
}
