"use client"

import React from "react"
import { Task } from "../types"
import { TaskCard } from "../task-card"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Calendar } from "lucide-react"

interface CalendarViewProps {
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

export function CalendarView({
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
}: CalendarViewProps) {
  const today = new Date()
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const currentDay = today.getDay()

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - currentDay + i)
    return {
      name: daysOfWeek[date.getDay()],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      tasks: tasks.filter((t) => {
        const taskDate = new Date(t.deadline)
        return taskDate.toDateString() === date.toDateString()
      }),
    }
  })

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">This Week</h3>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`min-h-[200px] ${day.isToday ? "ring-2 ring-primary" : ""}`}>
              <CardContent className="p-2">
                <div className="text-center mb-2">
                  <span className="text-xs text-muted-foreground">{day.name}</span>
                  <div className={`text-lg font-bold ${day.isToday ? "text-primary" : ""}`}>
                    {day.date}
                  </div>
                </div>
                <div className="space-y-1">
                  {day.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-[10px] p-1 rounded truncate cursor-pointer transition-colors ${
                        task.completed
                          ? "bg-primary/10 text-primary line-through"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => onExpand(task)}
                    >
                      {task.title}
                    </div>
                  ))}
                  {day.tasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground block text-center">
                      +{day.tasks.length - 3} more
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
