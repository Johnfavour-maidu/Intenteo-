"use client"

import React, { useState } from "react"
import { Task } from "../types"
import { TaskCard } from "../task-card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface KanbanViewProps {
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

const columns = [
  { id: "pending", title: "To Do", color: "bg-blue-500" },
  { id: "in-progress", title: "In Progress", color: "bg-amber-500" },
  { id: "completed", title: "Done", color: "bg-emerald-500" },
  { id: "archived", title: "Archived", color: "bg-gray-400" },
]

export function KanbanView({
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
}: KanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const getColumnTasks = (status: string) => {
    if (status === "completed") return tasks.filter((t) => t.completed && t.status !== "archived")
    if (status === "archived") return tasks.filter((t) => t.status === "archived")
    return tasks.filter((t) => t.status === status && !t.completed)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = getColumnTasks(col.id)
        return (
          <div key={col.id} className="flex-shrink-0 w-72">
            {/* Column Header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={`h-2 w-2 rounded-full ${col.color}`} />
              <h3 className="font-semibold text-sm">{col.title}</h3>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {colTasks.length}
              </Badge>
            </div>

            {/* Column Content */}
            <motion.div
              layout
              className="space-y-2 min-h-[200px] p-2 rounded-xl bg-muted/30 border border-dashed"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => setDraggedTask(null)}
            >
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggedTask(task.id)}
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
                </div>
              ))}
              {colTasks.length === 0 && (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                  No tasks
                </div>
              )}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}
