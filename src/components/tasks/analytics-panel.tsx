"use client"

import React from "react"
import { Task } from "./types"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Zap,
  Target,
  BarChart3,
  Flame,
} from "lucide-react"

interface AnalyticsPanelProps {
  tasks: Task[]
  open: boolean
  onToggle: () => void
}

export function AnalyticsPanel({ tasks, open, onToggle }: AnalyticsPanelProps) {
  const completedTasks = tasks.filter((t) => t.completed)
  const totalXP = completedTasks.reduce((a, b) => a + b.xp, 0)
  const avgIntentScore = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((a, b) => a + b.intentScore, 0) / completedTasks.length)
    : 0
  const deepWorkMinutes = completedTasks
    .filter((t) => t.category === "Deep Work")
    .reduce((a, b) => a + b.estimatedDuration, 0)
  const avgCompletionTime = completedTasks.length > 0
    ? Math.round(completedTasks.reduce((a, b) => a + b.estimatedDuration, 0) / completedTasks.length)
    : 0

  const stats = [
    { label: "Completed", value: completedTasks.length, icon: <Target className="h-4 w-4" />, color: "text-primary" },
    { label: "Intent Score", value: avgIntentScore, icon: <TrendingUp className="h-4 w-4" />, color: "text-emerald-500" },
    { label: "Deep Work", value: `${deepWorkMinutes}m`, icon: <Clock className="h-4 w-4" />, color: "text-blue-500" },
    { label: "Avg Duration", value: `${avgCompletionTime}m`, icon: <BarChart3 className="h-4 w-4" />, color: "text-amber-500" },
    { label: "Total XP", value: totalXP, icon: <Flame className="h-4 w-4" />, color: "text-orange-500" },
  ]

  const productivityScore = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={onToggle}
      >
        {open ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      <motion.div
        initial={false}
        animate={{ width: open ? 260 : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="w-[260px] space-y-4">
          {/* Productivity Score */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Today&apos;s Analytics</h3>
              </div>
              <div className="flex items-center justify-center">
                <ProgressRing value={productivityScore} size={100} strokeWidth={6} label="Productivity" />
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className="p-4 space-y-3">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-sm">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Most Productive Hour */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Most Productive Hour</h4>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full" style={{ width: "73%" }} />
                </div>
                <span className="text-sm font-medium">9-11 AM</span>
              </div>
            </CardContent>
          </Card>

          {/* Focus Trend */}
          <Card>
            <CardContent className="p-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Focus Trend (7 days)</h4>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 55, 80, 70, 90, 73].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="w-full bg-primary/20 rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                    <span className="text-[8px] text-muted-foreground">
                      {["M", "T", "W", "T", "F", "S", "S"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
