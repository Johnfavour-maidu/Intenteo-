"use client"

import React from "react"
import { Task } from "../types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CheckCircle2, Circle } from "lucide-react"

interface TableViewProps {
  tasks: Task[]
  onToggle: (id: string) => void
  onExpand: (task: Task) => void
}

export function TableView({ tasks, onToggle, onExpand }: TableViewProps) {
  const priorityColors: Record<string, string> = {
    high: "text-orange-500",
    medium: "text-blue-500",
    low: "text-emerald-500",
  }

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="p-3 font-medium w-8"></th>
              <th className="p-3 font-medium">Task</th>
              <th className="p-3 font-medium">Priority</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Energy</th>
              <th className="p-3 font-medium">Duration</th>
              <th className="p-3 font-medium">Intent</th>
              <th className="p-3 font-medium">Due</th>
              <th className="p-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${
                  task.completed ? "opacity-50" : ""
                }`}
                onClick={() => onExpand(task)}
              >
                <td className="p-3">
                  <button onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}>
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </td>
                <td className="p-3">
                  <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                    {task.title}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`capitalize text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-3 text-xs text-muted-foreground">{task.category}</td>
                <td className="p-3 text-xs capitalize">{task.energyRequired}</td>
                <td className="p-3 text-xs text-muted-foreground">{task.estimatedDuration}m</td>
                <td className="p-3 text-xs font-medium text-primary">+{task.intentScore}</td>
                <td className="p-3 text-xs text-muted-foreground">{task.dueTime}</td>
                <td className="p-3">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${task.completed ? 100 : task.completionPercent}%` }}
                    />
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
