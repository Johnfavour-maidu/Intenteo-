"use client"

import React from "react"
import { Task } from "../types"
import { TaskCard } from "../task-card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { CheckCircle2, Circle, Target, Flame } from "lucide-react"

interface CompactViewProps {
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

export function CompactView({
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
}: CompactViewProps) {
  const pending = tasks.filter((t) => !t.completed && t.status !== "archived")
  const completed = tasks.filter((t) => t.completed)

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Target className="h-3.5 w-3.5" />
          {pending.length} remaining
        </span>
        <span className="flex items-center gap-1.5 text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {completed.length} completed
        </span>
        <span className="flex items-center gap-1.5 text-amber-500">
          <Flame className="h-3.5 w-3.5" />
          {completed.reduce((a, b) => a + b.xp, 0)} XP earned
        </span>
      </div>

      {/* Pending Tasks - Minimal */}
      <div className="space-y-0.5">
        {pending.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <TaskCard
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
              compact
            />
          </motion.div>
        ))}
      </div>

      {/* Completed Tasks */}
      {completed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Completed ({completed.length})</span>
          </div>
          <div className="space-y-0.5">
            {completed.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                <TaskCard
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
                  compact
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
