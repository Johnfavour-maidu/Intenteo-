"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect, memo } from "react"
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
} from "lucide-react"
import { useToast, ToastContainer } from "./task-toast"

const priorityConfig: Record<
  TaskPriority,
  {
    label: string
    cssColor: string
    pastelBg: string
    pastelBorder: string
    railGradient: string
    tint: string
  }
> = {
  priority: {
    label: "Priority",
    cssColor: "var(--brand-secondary)",
    pastelBg: "var(--task-tint-priority)",
    pastelBorder: "var(--task-priority)",
    railGradient: "var(--task-rail-priority)",
    tint: "var(--task-tint-priority)",
  },
  progress: {
    label: "Progress",
    cssColor: "var(--brand-primary)",
    pastelBg: "var(--task-tint-progress)",
    pastelBorder: "var(--task-progress)",
    railGradient: "var(--task-rail-progress)",
    tint: "var(--task-tint-progress)",
  },
  maintenance: {
    label: "Maintenance",
    cssColor: "var(--task-maintenance)",
    pastelBg: "var(--task-tint-maintenance)",
    pastelBorder: "var(--task-maintenance)",
    railGradient: "var(--task-rail-maintenance)",
    tint: "var(--task-tint-maintenance)",
  },
}

/* ────────────────────────────────────────────────────── */
/* Premium Task Rails — Signature vertical page markers  */
/* ────────────────────────────────────────────────────── */

const TaskRails = memo(function TaskRails({
  gradient,
  height = "calc(100% - 16px)",
}: {
  gradient: string
  height?: string
}) {
  return (
    <>
      {/* Left rail */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[6px] rounded-full shrink-0"
        style={{ background: gradient, height }}
      />
      {/* Right rail */}
      <div
        className="absolute right-0 top-2 bottom-2 w-[6px] rounded-full shrink-0"
        style={{ background: gradient, height }}
      />
    </>
  )
})

/* ────────────────────────────────────────────────────── */
/* Premium Task Row Wrapper                              */
/* ────────────────────────────────────────────────────── */

const TaskRow = memo(function TaskRow({
  children,
  gradient,
  tint,
  isDragging,
  isDragOver,
  className = "",
}: {
  children: React.ReactNode
  gradient: string
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
      <TaskRails gradient={gradient} />
      {children}
    </div>
  )
})

const hours24 = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

const deadlineOptions = ["Today", "Tomorrow", "Next Week", "Custom"]

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function parseTime(timeStr: string): { hour: number; minute: number } | null {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!match) return null
  return { hour: parseInt(match[1]), minute: parseInt(match[2]) }
}

function formatTimeSelection(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

function calcDurationFromRange(start: string, end: string): number {
  const s = parseTime(start)
  const e = parseTime(end)
  if (!s || !e) return 0
  const sMin = s.hour * 60 + s.minute
  let eMin = e.hour * 60 + e.minute
  if (eMin <= sMin) eMin += 24 * 60
  return eMin - sMin
}

/* ────────────────────────────────────────────────────── */
/* Scroll Column (for time picker)                       */
/* ────────────────────────────────────────────────────── */

const ScrollCol = memo(function ScrollCol({
  items, selected, onSelect, label,
}: {
  items: (number | string)[]
  selected: number | string
  onSelect: (v: number | string) => void
  label: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemHeight = 32

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const idx = items.indexOf(selected)
    if (idx === -1) return
    const scrollTo = idx * itemHeight
    container.scrollTo({ top: scrollTo, behavior: "smooth" })
  }, [selected, items, itemHeight])

  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
      <div ref={containerRef} className="h-20 overflow-y-auto scrollbar-hide relative w-12 snap-y snap-mandatory">
        <div className="py-6">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={`w-full h-8 flex items-center justify-center text-xs rounded-md snap-center transition-all duration-150 ${
                selected === item
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {typeof item === "number" && label !== "AM/PM" ? String(item).padStart(2, "0") : item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Time Range Picker — Side-by-side 24h scroll           */
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
  const s = parseTime(startTime) || { hour: 9, minute: 0 }
  const e = parseTime(endTime) || { hour: 9, minute: 30 }

  const [startHour, setStartHour] = useState(s.hour)
  const [startMin, setStartMin] = useState(s.minute)
  const [endHour, setEndHour] = useState(e.hour)
  const [endMin, setEndMin] = useState(e.minute)

  useEffect(() => {
    const sStr = formatTimeSelection(startHour, startMin)
    const eStr = formatTimeSelection(endHour, endMin)
    const dur = calcDurationFromRange(sStr, eStr)
    onChange(sStr, eStr, dur > 0 ? dur : 0)
  }, [startHour, startMin, endHour, endMin, onChange])

  return (
    <div className="flex items-start gap-4">
      {/* Start Time */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Start Time</p>
        <div className="flex items-center justify-center gap-1 p-2 rounded-xl bg-muted/30 border">
          <ScrollCol items={hours24} selected={startHour} onSelect={(v) => setStartHour(v as number)} label="Hr" />
          <div className="text-lg font-bold text-muted-foreground/40 mt-3">:</div>
          <ScrollCol items={minutes} selected={startMin} onSelect={(v) => setStartMin(v as number)} label="Min" />
        </div>
      </div>

      {/* End Time */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium mb-1.5">End Time</p>
        <div className="flex items-center justify-center gap-1 p-2 rounded-xl bg-muted/30 border">
          <ScrollCol items={hours24} selected={endHour} onSelect={(v) => setEndHour(v as number)} label="Hr" />
          <div className="text-lg font-bold text-muted-foreground/40 mt-3">:</div>
          <ScrollCol items={minutes} selected={endMin} onSelect={(v) => setEndMin(v as number)} label="Min" />
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Compact Productivity Score                            */
/* ────────────────────────────────────────────────────── */

const ProductivityScore = memo(function ProductivityScore({ percentage }: { percentage: number }) {
  return (
    <div className="flex items-center gap-3 px-3.5 h-9 rounded-xl bg-card border">
      <Zap className="h-3.5 w-3.5 text-primary shrink-0" />
      <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">Productivity Score</span>
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[11px] font-bold tabular-nums">{percentage}%</span>
    </div>
  )
})

/* ────────────────────────────────────────────────────── */
/* Move Task Popover                                     */
/* ────────────────────────────────────────────────────── */

function MoveTaskPopover({
  taskId,
  currentDeadline,
  onMove,
  onClose,
}: {
  taskId: string
  currentDeadline: string
  onMove: (taskId: string, newDeadline: string) => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute right-0 top-full mt-1 w-44 rounded-xl border bg-background shadow-xl p-1 z-30"
    >
      <p className="px-2.5 py-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Move to</p>
      {deadlineOptions.filter((d) => d !== currentDeadline).map((option) => (
        <button
          key={option}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
          onClick={() => { onMove(taskId, option); onClose() }}
        >
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          {option}
        </button>
      ))}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Move Subtask Popover                                  */
/* ────────────────────────────────────────────────────── */

function MoveSubtaskPopover({
  subtaskId,
  currentTaskId,
  tasks,
  onMove,
  onClose,
}: {
  subtaskId: string
  currentTaskId: string
  tasks: Task[]
  onMove: (fromTaskId: string, subtaskId: string, toTaskId: string) => void
  onClose: () => void
}) {
  const otherTasks = tasks.filter((t) => t.id !== currentTaskId)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute left-0 top-full mt-1 w-56 rounded-xl border bg-background shadow-xl p-1 z-30"
    >
      <p className="px-2.5 py-1 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Move to task</p>
      {otherTasks.map((task) => (
        <button
          key={task.id}
          className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors text-left"
          onClick={() => { onMove(currentTaskId, subtaskId, task.id); onClose() }}
        >
          <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="truncate">{task.title}</span>
        </button>
      ))}
      {otherTasks.length === 0 && (
        <p className="px-2.5 py-2 text-xs text-muted-foreground">No other tasks available</p>
      )}
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────── */
/* Inline Edit Component                                 */
/* ────────────────────────────────────────────────────── */

const InlineEdit = memo(function InlineEdit({
  taskId, field, value, className, editingField, editValue, setEditingField, setEditValue, saveEditing, editInputRef,
}: {
  taskId: string; field: string; value: string; className?: string
  editingField: { taskId: string; field: string } | null; editValue: string
  setEditingField: (v: { taskId: string; field: string } | null) => void; setEditValue: (v: string) => void
  saveEditing: () => void; editInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
}) {
  const isEditing = editingField?.taskId === taskId && editingField?.field === field
  const startEditing = useCallback(() => {
    setEditingField({ taskId, field }); setEditValue(value)
    setTimeout(() => (editInputRef as React.RefObject<HTMLInputElement>)?.current?.focus(), 0)
  }, [taskId, field, value, setEditingField, setEditValue, editInputRef])

  if (isEditing) {
    return (
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
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [editingField, setEditingField] = useState<{ taskId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragType, setDragType] = useState<"task" | "subtask" | null>(null)
  const [dragSourceTaskId, setDragSourceTaskId] = useState<string | null>(null)
  const [movePopoverTaskId, setMovePopoverTaskId] = useState<string | null>(null)
  const [moveSubtaskInfo, setMoveSubtaskInfo] = useState<{ taskId: string; subtaskId: string } | null>(null)

  const { toasts, addToast, removeToast } = useToast()

  // Create form state
  const [formTitle, setFormTitle] = useState("")
  const [formWhy, setFormWhy] = useState("")
  const [formPriority, setFormPriority] = useState<TaskPriority>("progress")
  const [formStartHour, setFormStartHour] = useState(9)
  const [formStartMin, setFormStartMin] = useState(0)
  const [formEndHour, setFormEndHour] = useState(9)
  const [formEndMin, setFormEndMin] = useState(30)
  const [formRecurrence, setFormRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none")

  const completedToday = useMemo(() => tasks.filter((t) => t.completed).length, [tasks])
  const remainingToday = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks])
  const totalToday = completedToday + remainingToday
  const productivity = useMemo(() => (totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100)), [completedToday, totalToday])

  const getSubtaskProgress = useCallback((subtasks: Subtask[]) => {
    if (subtasks.length === 0) return 0
    return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
  }, [])

  const toggleExpanded = useCallback((id: string) => {
    setExpandedTasks((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }, [])

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

  const handleCreateTask = useCallback(() => {
    if (!formTitle.trim()) return
    const startStr = formatTimeSelection(formStartHour, formStartMin)
    const endStr = formatTimeSelection(formEndHour, formEndMin)
    const dur = calcDurationFromRange(startStr, endStr)
    const newTask: Task = {
      id: `new-${Date.now()}`, title: formTitle, whyItMatters: formWhy, priority: formPriority,
      deadline: "Today", dueTime: startStr, timeRange: `${startStr} \u2013 ${endStr}`,
      estimatedDuration: dur > 0 ? dur : 30, notes: "", subtasks: [], recurrence: formRecurrence,
      completed: false, order: tasks.length, createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    setFormTitle(""); setFormWhy(""); setFormPriority("progress")
    setFormStartHour(9); setFormStartMin(0)
    setFormEndHour(9); setFormEndMin(30)
    setFormRecurrence("none"); setCreateOpen(false)
  }, [formTitle, formWhy, formPriority, formStartHour, formStartMin, formEndHour, formEndMin, formRecurrence, tasks.length])

  const saveEditing = useCallback(() => {
    if (!editingField) return
    setTasks((prev) => prev.map((t) => {
      if (t.id !== editingField.taskId) return t
      switch (editingField.field) {
        case "title": return { ...t, title: editValue }
        case "whyItMatters": return { ...t, whyItMatters: editValue }
        case "timeRange": return { ...t, timeRange: editValue }
        case "estimatedDuration": return { ...t, estimatedDuration: parseInt(editValue) || t.estimatedDuration }
        case "notes": return { ...t, notes: editValue }
        default: return t
      }
    }))
    setEditingField(null); setEditValue("")
  }, [editingField, editValue])

  const cancelEditing = useCallback(() => { setEditingField(null); setEditValue("") }, [])

  const addSubtaskInline = useCallback((taskId: string) => {
    const newSub: Subtask = { id: `sub-${Date.now()}`, title: "New subtask", completed: false }
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t)))
    setExpandedTasks((prev) => new Set(prev).add(taskId))
  }, [])

  /* ─── Task drag & drop ─── */
  const handleTaskDragStart = useCallback((id: string) => {
    setDraggedId(id)
    setDragType("task")
    setDragSourceTaskId(null)
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

  /* ─── Subtask drag & drop ─── */
  const handleSubtaskDragStart = useCallback((e: React.DragEvent, taskId: string, subtaskId: string) => {
    e.stopPropagation()
    setDraggedId(subtaskId)
    setDragType("subtask")
    setDragSourceTaskId(taskId)
  }, [])

  const handleSubtaskDragOver = useCallback((e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragType === "subtask") setDragOverId(taskId)
  }, [dragType])

  const handleSubtaskDrop = useCallback((e: React.DragEvent, targetTaskId: string) => {
    e.stopPropagation()
    if (!draggedId || dragType !== "subtask" || !dragSourceTaskId) {
      setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null)
      return
    }
    if (dragSourceTaskId === targetTaskId) {
      setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null)
      return
    }
    moveSubtask(dragSourceTaskId, draggedId, targetTaskId)
    setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null)
  }, [draggedId, dragType, dragSourceTaskId, moveSubtask])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null); setDragOverId(null); setDragType(null); setDragSourceTaskId(null)
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { cancelEditing(); setCreateOpen(false); setMovePopoverTaskId(null); setMoveSubtaskInfo(null) } }
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h)
  }, [cancelEditing])

  useEffect(() => {
    if (editingField && editInputRef.current) {
      editInputRef.current.focus()
      if (["title", "whyItMatters", "notes"].includes(editingField.field)) (editInputRef.current as HTMLInputElement).select?.()
    }
  }, [editingField])

  /* ─── Subtask renderer ─── */
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
                <div
                  key={sub.id}
                  draggable
                  onDragStart={(e) => handleSubtaskDragStart(e, task.id, sub.id)}
                  onDragOver={(e) => handleSubtaskDragOver(e, task.id)}
                  onDrop={(e) => handleSubtaskDrop(e, task.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2.5 py-1.5 pl-4 pr-2 rounded-lg hover:bg-muted/30 transition-colors group/sub relative cursor-grab active:cursor-grabbing ${
                    isSubDragging ? "opacity-40 scale-[0.98]" : ""
                  } ${isSubDragOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
                >
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
                  {/* Move subtask */}
                  <div className="relative">
                    <button
                      className="opacity-0 group-hover/sub:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); setMoveSubtaskInfo(moveSubtaskInfo?.subtaskId === sub.id ? null : { taskId: task.id, subtaskId: sub.id }) }}
                    >
                      <ArrowRightLeft className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                    </button>
                    <AnimatePresence>
                      {moveSubtaskInfo?.subtaskId === sub.id && (
                        <MoveSubtaskPopover
                          subtaskId={sub.id} currentTaskId={task.id} tasks={tasks}
                          onMove={moveSubtask} onClose={() => setMoveSubtaskInfo(null)}
                        />
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
    if (tasks.length === 0) return <EmptyState onCreate={() => setCreateOpen(true)} />
    return (
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="sticky top-0 z-10 grid grid-cols-[minmax(200px,1fr)_minmax(120px,140px)_minmax(70px,90px)_minmax(100px,140px)_auto] gap-4 px-5 py-3 border-b bg-background/95 backdrop-blur-sm text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div>Task</div>
          <div className="hidden sm:block">Time Range</div>
          <div className="hidden sm:block">Duration</div>
          <div>Progress</div>
          <div className="text-right">Actions</div>
        </div>

        <LayoutGroup>
          {tasks.map((task, i) => {
            const progress = task.completed ? 100 : getSubtaskProgress(task.subtasks)
            const isExpanded = expandedTasks.has(task.id)
            const isDragging = draggedId === task.id && dragType === "task"
            const isDragOver = dragOverId === task.id && dragOverId !== draggedId && dragType === "task"
            const pConfig = priorityConfig[task.priority]

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015, layout: { type: "spring", stiffness: 300, damping: 30 } }}>
                <TaskRow
                  gradient={pConfig.railGradient}
                  tint={pConfig.tint}
                  isDragging={isDragging}
                  isDragOver={isDragOver}
                >
                  <div
                    draggable onDragStart={() => handleTaskDragStart(task.id)}
                    onDragOver={(e) => handleTaskDragOver(e, task.id)}
                    onDrop={() => handleTaskDrop(task.id)} onDragEnd={handleDragEnd}
                    className="grid grid-cols-[minmax(200px,1fr)_minmax(120px,140px)_minmax(70px,90px)_minmax(100px,140px)_auto] gap-4 pl-10 pr-10 py-3.5 items-center group cursor-default"
                  >
                    {/* Task Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <button onClick={() => handleToggleTask(task.id)} className="shrink-0">
                        {task.completed ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary transition-colors" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <InlineEdit taskId={task.id} field="title" value={task.title}
                            className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}
                            editingField={editingField} editValue={editValue} setEditingField={setEditingField}
                            setEditValue={setEditValue} saveEditing={saveEditing} editInputRef={editInputRef} />
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 shrink-0">
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                          )}
                          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 transition-opacity"
                            onClick={() => toggleExpanded(task.id)}>
                            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          </Button>
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] text-muted-foreground hidden group-hover:inline">
                              {isExpanded ? "Collapse" : `Show ${task.subtasks.length}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time Range */}
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <InlineEdit taskId={task.id} field="timeRange" value={task.timeRange} className="text-xs"
                          editingField={editingField} editValue={editValue} setEditingField={setEditingField}
                          setEditValue={setEditValue} saveEditing={saveEditing} editInputRef={editInputRef} />
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden sm:block">
                      <span className="text-xs text-muted-foreground">{formatDuration(task.estimatedDuration)}</span>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                    </div>

                    {/* Actions — always visible: Edit, Move, Delete */}
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted"
                        onClick={(e) => { e.stopPropagation(); setEditingField({ taskId: task.id, field: "title" }); setEditValue(task.title) }}>
                        <Pencil className="h-3.5 w-3.5" />
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10 text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
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
  }, [tasks, expandedTasks, draggedId, dragOverId, dragType, editingField, editValue, getSubtaskProgress, handleTaskDragStart, handleTaskDragOver, handleTaskDrop, handleDragEnd, handleToggleTask, toggleExpanded, renderSubtasks, saveEditing, deleteTask, moveTask, movePopoverTaskId, moveSubtask, moveSubtaskInfo])

  /* ═══════════════════════════════════════════════════════ */
  /* BOARD VIEW                                              */
  /* ═══════════════════════════════════════════════════════ */
  const renderBoardView = useCallback(() => {
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
              <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, layout: { type: "spring", stiffness: 300, damping: 30 } }}>
                <TaskRow
                  gradient={pConfig.railGradient}
                  tint={pConfig.tint}
                  className="group overflow-hidden"
                >
                  <div className="pl-10 pr-10 p-4">
                    <div className="flex items-start gap-2.5 mb-3">
                      <button onClick={() => handleToggleTask(task.id)} className="shrink-0 mt-0.5">
                        {task.completed ? (
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
                          <h3 className={`text-sm font-semibold truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>{task.title}</h3>
                          {task.subtasks.length > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 rounded-full px-1.5 py-0.5 shrink-0">{completedSubs}/{task.subtasks.length}</span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: pConfig.pastelBorder + "20", color: pConfig.pastelBorder }}>{pConfig.label}</span>
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
                          className={`h-full rounded-full ${task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                          initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                    </div>

                    {/* Actions — always visible: Edit, Move, Delete */}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-muted"
                        onClick={() => { setEditingField({ taskId: task.id, field: "title" }); setEditValue(task.title) }}>
                        <Pencil className="h-3 w-3" />
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
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-destructive/10 text-destructive" onClick={() => deleteTask(task.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TaskRow>
              </motion.div>
            )
          })}
        </LayoutGroup>
      </div>
    )
  }, [tasks, expandedTasks, getSubtaskProgress, handleToggleTask, toggleExpanded, toggleSubtask, deleteTask, moveTask, movePopoverTaskId])

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm font-bold text-foreground mt-0.5 tracking-tight">
              <span style={{ color: "var(--brand-primary)" }}>{totalToday}</span> <span className="text-foreground">Tasks</span>{" \u00B7 "}
              <span style={{ color: "var(--color-success)" }}>{completedToday}</span> <span className="text-foreground">Completed</span>{" \u00B7 "}
              <span style={{ color: "var(--color-error)" }}>{remainingToday}</span> <span className="text-foreground">To Go</span>
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

            <Button className="glow h-9" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>

        {activeView === "list" ? renderListView() : renderBoardView()}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>{completedToday} completed today</span>
          <span>{remainingToday} remaining</span>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {createOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setCreateOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-background rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">New Task</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCreateOpen(false)}><X className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Task Name</label>
                    <Input placeholder="What needs to be done?" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="mt-1" autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                    <div className="flex gap-2 mt-1">
                      {(["priority", "progress", "maintenance"] as TaskPriority[]).map((p) => (
                        <Button key={p} variant={formPriority === p ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setFormPriority(p)}>
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
                        startTime={formatTimeSelection(formStartHour, formStartMin)}
                        endTime={formatTimeSelection(formEndHour, formEndMin)}
                        onChange={(start, end) => {
                          const s = parseTime(start); const e = parseTime(end)
                          if (s) { setFormStartHour(s.hour); setFormStartMin(s.minute) }
                          if (e) { setFormEndHour(e.hour); setFormEndMin(e.minute) }
                        }} />
                      <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                        Duration: {formatDuration(calcDurationFromRange(formatTimeSelection(formStartHour, formStartMin), formatTimeSelection(formEndHour, formEndMin)))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recurrence</label>
                    <div className="flex gap-1 mt-1">
                      {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
                        <Button key={r} variant={formRecurrence === r ? "default" : "outline"} size="sm" className="flex-1 text-[10px] px-1" onClick={() => setFormRecurrence(r)}>
                          {r === "none" ? "None" : r.charAt(0).toUpperCase() + r.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>Cancel</Button>
                  <Button className="flex-1 glow" onClick={handleCreateTask} disabled={!formTitle.trim()}>Add Task</Button>
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
      <Button onClick={onCreate} className="glow"><Plus className="mr-1 h-4 w-4" /> Add Task</Button>
    </div>
  )
}
