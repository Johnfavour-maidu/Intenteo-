"use client"

import React from "react"
import { Task } from "../types"
import { TaskCard } from "../task-card"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, Target, TrendingUp } from "lucide-react"

interface MatrixViewProps {
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

export function MatrixView({
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
}: MatrixViewProps) {
  const pending = tasks.filter((t) => !t.completed && t.status !== "archived")

  const quadrants = [
    {
      title: "Do First",
      subtitle: "High Priority, High Energy",
      color: "border-red-500/30 bg-red-500/5",
      icon: <Zap className="h-4 w-4 text-red-500" />,
      tasks: pending.filter((t) => t.priority === "high" && t.energyRequired === "high"),
    },
    {
      title: "Schedule",
      subtitle: "High Priority, Low Energy",
      color: "border-amber-500/30 bg-amber-500/5",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      tasks: pending.filter((t) => t.priority === "high" && t.energyRequired !== "high"),
    },
    {
      title: "Delegate",
      subtitle: "Low Priority, High Energy",
      color: "border-blue-500/30 bg-blue-500/5",
      icon: <Target className="h-4 w-4 text-blue-500" />,
      tasks: pending.filter((t) => t.priority !== "high" && t.energyRequired === "high"),
    },
    {
      title: "Do Later",
      subtitle: "Low Priority, Low Energy",
      color: "border-emerald-500/30 bg-emerald-500/5",
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
      tasks: pending.filter((t) => t.priority !== "high" && t.energyRequired !== "high"),
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {quadrants.map((q, qi) => (
        <motion.div
          key={qi}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: qi * 0.1 }}
        >
          <Card className={`h-full ${q.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {q.icon}
                  <div>
                    <h3 className="font-semibold text-sm">{q.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{q.subtitle}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{q.tasks.length}</Badge>
              </div>
              <div className="space-y-2">
                {q.tasks.map((task) => (
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
                    compact
                  />
                ))}
                {q.tasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No tasks</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
