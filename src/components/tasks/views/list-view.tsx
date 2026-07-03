"use client"

import React from "react"
import { Task } from "../types"
import { TaskCard } from "../task-card"
import { motion } from "framer-motion"
import { CheckCircle2, Sparkles, Target, Flame, Clock } from "lucide-react"

interface ListViewProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onExpand: (task: Task) => void
  onEdit: (task: Task) => void
  onComplete: (id: string) => void
  onDuplicate: (task: Task) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onReschedule: (task: Task) => void
  onFocus: (task: Task) => void
}

export function ListView({
  tasks,
  onToggle,
  onExpand,
  onEdit,
  onComplete,
  onDuplicate,
  onArchive,
  onDelete,
  onReschedule,
  onFocus,
}: ListViewProps) {
  const pending = tasks.filter((t) => !t.completed && t.status !== "archived")
  const inProgress = tasks.filter((t) => t.status === "in-progress" && !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const sections = [
    {
      title: "In Progress",
      icon: <Clock className="h-4 w-4 text-primary" />,
      tasks: inProgress,
      show: inProgress.length > 0,
    },
    {
      title: "Today's Tasks",
      icon: <Target className="h-4 w-4 text-amber-500" />,
      tasks: pending.filter((t) => t.status !== "in-progress"),
      show: true,
    },
    {
      title: "Completed",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      tasks: completedTasks,
      show: completedTasks.length > 0,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Today's Intention Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Today&apos;s Intention</span>
        </div>
        <p className="text-sm">Review Q2 strategy and prepare for the board meeting. Every task below connects to this goal.</p>
      </motion.div>

      {/* Task Sections */}
      {sections.filter((s) => s.show).map((section) => (
        <div key={section.title}>
          <div className="flex items-center gap-2 mb-3">
            {section.icon}
            <h3 className="font-semibold text-sm">{section.title}</h3>
            <span className="text-xs text-muted-foreground">({section.tasks.length})</span>
          </div>
          <div className="space-y-2">
            {section.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onExpand={onExpand}
                onEdit={onEdit}
                onComplete={onComplete}
                onDuplicate={onDuplicate}
                onArchive={onArchive}
                onDelete={onDelete}
                onReschedule={onReschedule}
                onFocus={onFocus}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
