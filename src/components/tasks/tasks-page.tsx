"use client"

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { Task, TaskPriority, TaskView, Subtask } from "./types"
import { sampleTasks } from "./task-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import {
  Plus,
  List,
  Table,
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
} from "lucide-react"
import { useToast, ToastContainer } from "./task-toast"

const priorityConfig: Record<TaskPriority, { label: string; borderColor: string; bgColor: string; dotColor: string; cssColor: string }> = {
  priority: { label: "Priority", borderColor: "border-l-orange-500", bgColor: "bg-orange-500/10", dotColor: "bg-orange-500", cssColor: "#f97316" },
  progress: { label: "Progress", borderColor: "border-l-purple-500", bgColor: "bg-purple-500/10", dotColor: "bg-purple-500", cssColor: "#a855f7" },
  maintenance: { label: "Maintenance", borderColor: "border-l-gray-400", bgColor: "bg-gray-400/10", dotColor: "bg-gray-400", cssColor: "#9ca3af" },
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} mins`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h} hr ${m} mins` : `${h} hr`
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [activeView, setActiveView] = useState<TaskView>("table")
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(["1"]))
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
  const [formDuration, setFormDuration] = useState(30)
  const [formTimeRange, setFormTimeRange] = useState("")
  const [formRecurrence, setFormRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none")
  const [formNotes, setFormNotes] = useState("")

  const completedToday = useMemo(() => tasks.filter((t) => t.completed).length, [tasks])
  const remainingToday = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks])

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

  // Handlers
  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const newCompleted = !t.completed
          return { ...t, completed: newCompleted }
        }
        return t
      })
    )
  }, [])

  const handleToggleTask = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task && !task.completed) {
      addToast()
    }
    toggleTask(id)
  }, [tasks, toggleTask, addToast])

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          )
          return { ...t, subtasks: newSubtasks }
        }
        return t
      })
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setContextMenu(null)
  }, [])

  const duplicateTask = useCallback((task: Task) => {
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
  }, [])

  const archiveTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setContextMenu(null)
  }, [])

  const handleCreateTask = useCallback(() => {
    if (!formTitle.trim()) return
    const newTask: Task = {
      id: `new-${Date.now()}`,
      title: formTitle,
      whyItMatters: formWhy,
      priority: formPriority,
      deadline: "Today",
      dueTime: formTimeRange || "Anytime",
      timeRange: formTimeRange || "Anytime",
      estimatedDuration: formDuration,
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
    setFormDuration(30)
    setFormTimeRange("")
    setFormRecurrence("none")
    setFormNotes("")
    setCreateOpen(false)
  }, [formTitle, formWhy, formPriority, formDuration, formTimeRange, formRecurrence, formNotes, tasks.length])

  // Inline editing
  const startEditing = useCallback((taskId: string, field: string, currentValue: string) => {
    setEditingField({ taskId, field })
    setEditValue(currentValue)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }, [])

  const saveEditing = useCallback(() => {
    if (!editingField) return
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== editingField.taskId) return t
        switch (editingField.field) {
          case "title":
            return { ...t, title: editValue }
          case "whyItMatters":
            return { ...t, whyItMatters: editValue }
          case "timeRange":
            return { ...t, timeRange: editValue }
          case "estimatedDuration":
            return { ...t, estimatedDuration: parseInt(editValue) || t.estimatedDuration }
          case "notes":
            return { ...t, notes: editValue }
          case "subtask":
            return t
          default:
            return t
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
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t
      )
    )
    setExpandedTasks((prev) => new Set(prev).add(taskId))
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      saveEditing()
    }
    if (e.key === "Escape") {
      cancelEditing()
    }
  }, [saveEditing, cancelEditing])

  // Focus edit input
  useEffect(() => {
    if (editingField && editInputRef.current) {
      editInputRef.current.focus()
      if (editingField.field === "title" || editingField.field === "whyItMatters" || editingField.field === "notes") {
        editInputRef.current.select()
      }
    }
  }, [editingField])

  // Drag and drop
  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }, [])

  const handleDrop = useCallback((targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      setDragOverId(null)
      return
    }
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
  }, [draggedId])

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
    setDragOverId(null)
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handler = () => setContextMenu(null)
      window.addEventListener("click", handler)
      return () => window.removeEventListener("click", handler)
    }
  }, [contextMenu])

  const InlineEdit = ({ taskId, field, value, className, isTextarea = false }: { taskId: string; field: string; value: string; className?: string; isTextarea?: boolean }) => {
    const isEditing = editingField?.taskId === taskId && editingField?.field === field
    if (isEditing) {
      return isTextarea ? (
        <Textarea
          ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEditing}
          onKeyDown={handleKeyDown}
          className={`min-h-[60px] text-sm ${className || ""}`}
        />
      ) : (
        <Input
          ref={editInputRef as React.RefObject<HTMLInputElement>}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEditing}
          onKeyDown={handleKeyDown}
          className={`h-7 text-sm px-2 py-0 ${className || ""}`}
        />
      )
    }
    return (
      <span
        className={`cursor-text rounded-md px-1 -mx-1 hover:bg-muted/50 transition-colors ${className || ""}`}
        onClick={() => startEditing(taskId, field, value)}
      >
        {value || <span className="text-muted-foreground italic">Click to edit</span>}
      </span>
    )
  }

  // Close context menu on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null)
        cancelEditing()
        setCreateOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [cancelEditing])

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedToday} of {completedToday + remainingToday} completed today
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Summary Cards */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 text-xs font-medium">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{completedToday + remainingToday}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{completedToday}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-xs font-medium text-orange-600 dark:text-orange-400">
                <Flame className="h-3.5 w-3.5" />
                <span>{remainingToday}</span>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              <Button
                variant={activeView === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setActiveView("table")}
              >
                <Table className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline text-xs">Table</span>
              </Button>
              <Button
                variant={activeView === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setActiveView("list")}
              >
                <List className="h-4 w-4" />
                <span className="ml-1.5 hidden sm:inline text-xs">List</span>
              </Button>
            </div>

            {/* Add Task */}
            <Button className="glow" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Table View */}
        {activeView === "table" && (
          <div className="rounded-2xl border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_140px_90px_100px_40px] gap-2 px-4 py-2.5 border-b bg-muted/20 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <div>Task</div>
              <div className="hidden sm:block">Time Range</div>
              <div className="hidden sm:block text-right">Duration</div>
              <div>Progress</div>
              <div></div>
            </div>

            {/* Table Rows */}
            {tasks.length === 0 ? (
              <EmptyState onCreate={() => setCreateOpen(true)} />
            ) : (
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
                      {/* Main Row */}
                      <div
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        onDragOver={(e) => handleDragOver(e, task.id)}
                        onDrop={() => handleDrop(task.id)}
                        onDragEnd={handleDragEnd}
                        className={`grid grid-cols-[1fr_140px_90px_100px_40px] gap-2 px-4 py-3 items-center group transition-all duration-150 cursor-default border-b border-border/50 last:border-0 rounded-xl mx-1 my-0.5 ${
                          task.completed ? "opacity-50" : ""
                        } ${isDragging ? "opacity-40 scale-[0.98]" : ""} ${
                          isDragOver ? "border-t-2 border-t-primary" : ""
                        } hover:bg-muted/30`}
                        style={{ borderLeftWidth: "3px", borderLeftColor: pConfig.cssColor }}
                      >
                        {/* Drag Handle */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                            <GripVertical className="h-4 w-4" />
                          </div>

                          {/* Checkbox */}
                          <button onClick={() => handleToggleTask(task.id)} className="shrink-0">
                            {task.completed ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
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

                          {/* Task Title */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <InlineEdit taskId={task.id} field="title" value={task.title} className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`} />
                              {task.subtasks.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => toggleExpanded(task.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                            {task.whyItMatters && (
                              <InlineEdit taskId={task.id} field="whyItMatters" value={task.whyItMatters} className="text-[11px] text-muted-foreground truncate block mt-0.5" />
                            )}
                          </div>
                        </div>

                        {/* Time Range */}
                        <div className="hidden sm:block">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 shrink-0" />
                            <InlineEdit taskId={task.id} field="timeRange" value={task.timeRange} className="text-xs" />
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="hidden sm:block text-right">
                          <InlineEdit taskId={task.id} field="estimatedDuration" value={String(task.estimatedDuration)} className="text-xs text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground ml-1">min</span>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"
                              }`}
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
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              const rect = e.currentTarget.getBoundingClientRect()
                              setContextMenu({ taskId: task.id, x: rect.right - 180, y: rect.bottom + 4 })
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Subtasks */}
                      <AnimatePresence>
                        {isExpanded && task.subtasks.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pl-14 pr-4 py-1 space-y-0.5">
                              {task.subtasks.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-muted/30 transition-colors group/sub"
                                >
                                  <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                                    {sub.completed ? (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                      >
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
                                  <span className={`text-xs ${sub.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {sub.title}
                                  </span>
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
                    </motion.div>
                  )
                })}
              </LayoutGroup>
            )}
          </div>
        )}

        {/* List View */}
        {activeView === "list" && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <EmptyState onCreate={() => setCreateOpen(true)} />
            ) : (
              <LayoutGroup>
                {tasks.map((task, i) => {
                  const progress = task.completed ? 100 : getSubtaskProgress(task.subtasks)
                  const isExpanded = expandedTasks.has(task.id)
                  const pConfig = priorityConfig[task.priority]

                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                      className={`rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-md ${
                        task.completed ? "opacity-60" : ""
                      }`}
                      style={{ borderLeftWidth: "4px", borderLeftColor: pConfig.cssColor }}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <button onClick={() => handleToggleTask(task.id)} className="shrink-0 mt-0.5">
                            {task.completed ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
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

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <InlineEdit taskId={task.id} field="title" value={task.title} className={`text-sm font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`} />
                              {task.recurrence !== "none" && (
                                <Repeat className="h-3 w-3 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            {task.whyItMatters && (
                              <InlineEdit taskId={task.id} field="whyItMatters" value={task.whyItMatters} className="text-xs text-muted-foreground mt-1 block" />
                            )}

                            {/* Subtasks inline */}
                            {task.subtasks.length > 0 && (
                              <div className="mt-2.5 space-y-1">
                                {task.subtasks.slice(0, isExpanded ? undefined : 2).map((sub) => (
                                  <div key={sub.id} className="flex items-center gap-2">
                                    <button onClick={() => toggleSubtask(task.id, sub.id)} className="shrink-0">
                                      {sub.completed ? (
                                        <div className="h-3.5 w-3.5 rounded bg-primary flex items-center justify-center">
                                          <svg className="h-2 w-2 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        </div>
                                      ) : (
                                        <div className="h-3.5 w-3.5 rounded border border-muted-foreground/30" />
                                      )}
                                    </button>
                                    <span className={`text-xs ${sub.completed ? "line-through text-muted-foreground" : ""}`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                ))}
                                {task.subtasks.length > 2 && !isExpanded && (
                                  <button
                                    onClick={() => toggleExpanded(task.id)}
                                    className="text-xs text-primary hover:underline pl-5"
                                  >
                                    +{task.subtasks.length - 2} more
                                  </button>
                                )}
                                {isExpanded && (
                                  <button
                                    onClick={() => addSubtaskInline(task.id)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors pl-5"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Add subtask
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Meta row */}
                            <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-border/50">
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <InlineEdit taskId={task.id} field="timeRange" value={task.timeRange} className="text-xs" />
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(task.estimatedDuration)}
                              </span>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${
                                      task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"
                                    }`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => duplicateTask(task)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => archiveTask(task.id)}
                                >
                                  <Archive className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => deleteTask(task.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </LayoutGroup>
            )}
          </div>
        )}

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
                    startEditing(task.id, "title", task.title)
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setCreateOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl border shadow-2xl"
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
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="mt-1"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Why does this matter?</label>
                    <Textarea
                      placeholder="How does this connect to your purpose?"
                      value={formWhy}
                      onChange={(e) => setFormWhy(e.target.value)}
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
                          size="sm"
                          className="flex-1"
                          onClick={() => setFormPriority(p)}
                        >
                          <div className={`h-2 w-2 rounded-full ${priorityConfig[p].dotColor} mr-1.5`} />
                          {priorityConfig[p].label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Duration (min)</label>
                      <Input
                        type="number"
                        value={formDuration}
                        onChange={(e) => setFormDuration(Number(e.target.value))}
                        className="mt-1"
                        min={5}
                        step={5}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Time Range</label>
                      <Input
                        placeholder="9:00 AM \u2013 10:00 AM"
                        value={formTimeRange}
                        onChange={(e) => setFormTimeRange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recurrence</label>
                    <div className="flex gap-1 mt-1">
                      {(["none", "daily", "weekly", "monthly"] as const).map((r) => (
                        <Button
                          key={r}
                          variant={formRecurrence === r ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-[10px] px-1"
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
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
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
