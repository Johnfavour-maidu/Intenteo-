"use client"

import React from "react"
import { Task } from "../types"
import { TaskCard } from "../task-card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"

interface TimelineViewProps {
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

export function TimelineView({
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
}: TimelineViewProps) {
  const pendingTasks = tasks.filter((t) => !t.completed && t.status !== "archived")
  const completedTasks = tasks.filter((t) => t.completed)

  const sortTasks = (t: Task[]) => [...t].sort((a, b) => {
    const timeA = a.dueTime.includes("AM") || a.dueTime.includes("PM")
      ? parseTime(a.dueTime)
      : 999
    const timeB = b.dueTime.includes("AM") || b.dueTime.includes("PM")
      ? parseTime(b.dueTime)
      : 999
    return timeA - timeB
  })

  return (
    <div className="space-y-6">
      {/* Timeline Line */}
      <div className="relative">
        {/* Pending Tasks */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today&apos;s Timeline
            <Badge variant="secondary" className="text-[10px]">{pendingTasks.length}</Badge>
          </h3>
          {sortTasks(pendingTasks).map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="relative pl-6 pb-2"
            >
              {/* Timeline Dot */}
              <div className="absolute left-0 top-3 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />
              {/* Timeline Line */}
              {i < pendingTasks.length - 1 && (
                <div className="absolute left-[4px] top-6 bottom-0 w-px bg-border" />
              )}
              {/* Time Label */}
              <div className="text-[10px] text-muted-foreground mb-1 font-medium">{task.dueTime}</div>
              {/* Task Card */}
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
              />
            </motion.div>
          ))}
        </div>

        {/* Completed */}
        {completedTasks.length > 0 && (
          <div className="mt-8 space-y-1">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              Completed
              <Badge variant="secondary" className="text-[10px]">{completedTasks.length}</Badge>
            </h3>
            {sortTasks(completedTasks).map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="relative pl-6 pb-2"
              >
                <div className="absolute left-0 top-3 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
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
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function parseTime(time: string): number {
  const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 999
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const period = match[3].toUpperCase()
  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0
  return hours * 60 + minutes
}
