"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface TasksPanelProps {
  tasks: any[]
  onToggleTask: (id: string) => void
}

export function TasksPanel({ tasks, onToggleTask }: TasksPanelProps) {
  const router = useRouter()

  const priorityTasks = useMemo(
    () =>
      tasks
        .filter((t: any) => t.priority === "priority" && !t.completed)
        .slice(0, 3),
    [tasks]
  )

  const remainingTasks = tasks.filter((t: any) => !t.completed).length

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today&apos;s Focus
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => router.push("/tasks")}
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        {priorityTasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No priority tasks for today. Well done!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {priorityTasks.map((task: any) => (
              <motion.div
                key={task.id}
                layout
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-all duration-200"
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="shrink-0"
                >
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  </div>
                  {task.timeRange && task.timeRange !== "Anytime" && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {task.timeRange}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {remainingTasks > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                + {remainingTasks - 3} more task
                {remainingTasks - 3 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
