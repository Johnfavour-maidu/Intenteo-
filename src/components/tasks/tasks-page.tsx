"use client"

import React, { useState, useMemo, useCallback, useRef } from "react"
import { Task, TaskPriority, TaskView, Subtask } from "./types"
import { sampleTasks } from "./task-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
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
} from "lucide-react"

const priorityConfig: Record<TaskPriority, { icon: string; label: string; color: string }> = {
  priority: { icon: "⭐", label: "Priority", color: "text-amber-500" },
  progress: { icon: "📈", label: "Progress", color: "text-blue-500" },
  maintenance: { icon: "🌱", label: "Maintenance", color: "text-emerald-500" },
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks)
  const [activeView, setActiveView] = useState<TaskView>("table")
  const [createOpen, setCreateOpen] = useState(false)
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [contextMenu, setContextMenu] = useState<{ taskId: string; x: number; y: number } | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Create form state
  const [formTitle, setFormTitle] = useState("")
  const [formWhy, setFormWhy] = useState("")
  const [formPriority, setFormPriority] = useState<TaskPriority>("progress")
  const [formDuration, setFormDuration] = useState(30)
  const [formRecurrence, setFormRecurrence] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none")
  const [formNotes, setFormNotes] = useState("")

  const sortedTasks = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed).sort((a, b) => a.order - b.order)
    const completed = tasks.filter((t) => t.completed).sort((a, b) => a.order - b.order)
    return [...pending, ...completed]
  }, [tasks])

  const completedToday = useMemo(() => tasks.filter((t) => t.completed).length, [tasks])
  const remainingToday = useMemo(() => tasks.filter((t) => !t.completed).length, [tasks])

  const getSubtaskProgress = useCallback((subtasks: Subtask[]) => {
    if (subtasks.length === 0) return 0
    return Math.round((subtasks.filter((s) => s.completed).length / subtasks.length) * 100)
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
      order: 0,
      subtasks: task.subtasks.map((s) => ({ ...s, id: `s-${Date.now()}-${s.id}`, completed: false })),
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
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
      dueTime: "Anytime",
      estimatedDuration: formDuration,
      notes: formNotes,
      subtasks: [],
      recurrence: formRecurrence,
      completed: false,
      order: 0,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [newTask, ...prev])
    setFormTitle("")
    setFormWhy("")
    setFormPriority("progress")
    setFormDuration(30)
    setFormRecurrence("none")
    setFormNotes("")
    setCreateOpen(false)
  }, [formTitle, formWhy, formPriority, formDuration, formRecurrence, formNotes])

  const handleEditTask = useCallback(() => {
    if (!editingTask || !formTitle.trim()) return
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editingTask.id
          ? { ...t, title: formTitle, whyItMatters: formWhy, priority: formPriority, estimatedDuration: formDuration, recurrence: formRecurrence, notes: formNotes }
          : t
      )
    )
    setEditingTask(null)
    setFormTitle("")
    setFormWhy("")
    setFormPriority("progress")
    setFormDuration(30)
    setFormRecurrence("none")
    setFormNotes("")
  }, [editingTask, formTitle, formWhy, formPriority, formDuration, formRecurrence, formNotes])

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setFormTitle(task.title)
    setFormWhy(task.whyItMatters)
    setFormPriority(task.priority)
    setFormDuration(task.estimatedDuration)
    setFormRecurrence(task.recurrence)
    setFormNotes(task.notes)
    setContextMenu(null)
  }, [])

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

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {completedToday} of {completedToday + remainingToday} completed today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={activeView === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setActiveView("table")}
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={activeView === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setActiveView("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
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
            <div className="grid grid-cols-[40px_1fr_100px_80px_80px_40px] gap-2 px-4 py-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground">
              <div></div>
              <div>Task</div>
              <div className="hidden md:block">Subtasks</div>
              <div>Time</div>
              <div>Progress</div>
              <div></div>
            </div>

            {/* Table Rows */}
            {sortedTasks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold mb-1">No tasks yet.</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first intentional task.</p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            ) : (
              sortedTasks.map((task, i) => {
                const progress = task.completed ? 100 : getSubtaskProgress(task.subtasks)
                const isExpanded = expandedTask === task.id
                const isDragging = draggedId === task.id
                const isDragOver = dragOverId === task.id && dragOverId !== draggedId

                return (
                  <div key={task.id}>
                    {/* Main Row */}
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      onDragOver={(e) => handleDragOver(e, task.id)}
                      onDrop={() => handleDrop(task.id)}
                      onDragEnd={handleDragEnd}
                      className={`grid grid-cols-[40px_1fr_100px_80px_80px_40px] gap-2 px-4 py-3 border-b last:border-0 items-center group transition-all duration-150 cursor-default ${
                        task.completed ? "opacity-50" : ""
                      } ${isDragging ? "opacity-40" : ""} ${
                        isDragOver ? "border-t-2 border-t-primary" : ""
                      } ${i % 2 === 0 ? "bg-background" : "bg-muted/10"} hover:bg-muted/30`}
                    >
                      {/* Drag Handle */}
                      <div className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Task */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => toggleTask(task.id)} className="shrink-0">
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
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                            <span className="text-xs shrink-0">{priorityConfig[task.priority].icon}</span>
                            {task.recurrence !== "none" && (
                              <Repeat className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                          </div>
                        </div>
                        {task.subtasks.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Subtasks Count */}
                      <div className="hidden md:block text-xs text-muted-foreground">
                        {task.subtasks.length > 0 ? (
                          <span>{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks</span>
                        ) : (
                          <span>—</span>
                        )}
                      </div>

                      {/* Time */}
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.dueTime}
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-7 text-right">{progress}%</span>
                      </div>

                      {/* Actions */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            const rect = e.currentTarget.getBoundingClientRect()
                            setContextMenu({ taskId: task.id, x: rect.right, y: rect.bottom })
                          }}
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </div>
                    </motion.div>

                    {/* Expanded Subtasks */}
                    <AnimatePresence>
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-muted/10"
                        >
                          <div className="pl-12 pr-4 py-2 space-y-1">
                            {task.subtasks.map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center gap-2 py-1"
                              >
                                <button onClick={() => toggleSubtask(task.id, sub.id)}>
                                  {sub.completed ? (
                                    <div className="h-4 w-4 rounded bg-primary flex items-center justify-center">
                                      <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                                  )}
                                </button>
                                <span className={`text-xs ${sub.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* List View */}
        {activeView === "list" && (
          <div className="space-y-1">
            {sortedTasks.length === 0 ? (
              <div className="py-20 text-center">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-semibold mb-1">No tasks yet.</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first intentional task.</p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Task
                </Button>
              </div>
            ) : (
              sortedTasks.map((task, i) => {
                const progress = task.completed ? 100 : getSubtaskProgress(task.subtasks)
                const isExpanded = expandedTask === task.id

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`rounded-xl transition-all duration-150 ${
                      task.completed ? "opacity-50" : ""
                    } hover:bg-muted/30`}
                  >
                    {/* Main Row */}
                    <div className="flex items-center gap-3 px-3 py-2.5">
                      <button onClick={() => toggleTask(task.id)} className="shrink-0">
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </span>
                          <span className="text-xs">{priorityConfig[task.priority].icon}</span>
                          {task.recurrence !== "none" && (
                            <Repeat className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {task.whyItMatters && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.whyItMatters}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.dueTime}
                        </span>
                        {task.subtasks.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                          </span>
                        )}
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.completed ? "bg-emerald-500" : progress > 0 ? "bg-primary" : "bg-muted-foreground/20"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {task.subtasks.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                          >
                            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            setContextMenu({ taskId: task.id, x: rect.right, y: rect.bottom })
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
                          className="overflow-hidden"
                        >
                          <div className="pl-11 pr-3 pb-2 space-y-1">
                            {task.subtasks.map((sub) => (
                              <div key={sub.id} className="flex items-center gap-2 py-1">
                                <button onClick={() => toggleSubtask(task.id, sub.id)}>
                                  {sub.completed ? (
                                    <div className="h-4 w-4 rounded bg-primary flex items-center justify-center">
                                      <svg className="h-2.5 w-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    </div>
                                  ) : (
                                    <div className="h-4 w-4 rounded border border-muted-foreground/30" />
                                  )}
                                </button>
                                <span className={`text-xs ${sub.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed z-50 w-44 rounded-xl border bg-background shadow-lg p-1"
              style={{ left: contextMenu.x - 180, top: contextMenu.y }}
            >
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  const task = tasks.find((t) => t.id === contextMenu.taskId)
                  if (task) openEdit(task)
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                onClick={() => {
                  const task = tasks.find((t) => t.id === contextMenu.taskId)
                  if (task) duplicateTask(task)
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                onClick={() => archiveTask(contextMenu.taskId)}
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
              <div className="h-px bg-border my-1" />
              <button
                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                onClick={() => deleteTask(contextMenu.taskId)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {(createOpen || editingTask) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => { setCreateOpen(false); setEditingTask(null) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-2xl border shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-semibold">{editingTask ? "Edit Task" : "New Task"}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setCreateOpen(false); setEditingTask(null) }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Task Name */}
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

                  {/* Why does this matter? */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Why does this matter?</label>
                    <Textarea
                      placeholder="How does this connect to your purpose?"
                      value={formWhy}
                      onChange={(e) => setFormWhy(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  {/* Priority */}
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
                          {priorityConfig[p].icon} {priorityConfig[p].label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Recurrence */}
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
                            {r === "none" ? "—" : r.slice(0, 3)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
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
                  <Button variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); setEditingTask(null) }}>
                    Cancel
                  </Button>
                  <Button className="flex-1 glow" onClick={editingTask ? handleEditTask : handleCreateTask} disabled={!formTitle.trim()}>
                    {editingTask ? "Save Changes" : "Add Task"}
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
