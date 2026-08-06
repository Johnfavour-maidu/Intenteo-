"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, ArrowRight, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Goal } from "@/shared/types"

interface GoalsPanelProps {
  goals?: Goal[]
}

export function GoalsPanel({ goals: propGoals }: GoalsPanelProps) {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>(propGoals || [])

  useEffect(() => {
    if (propGoals) {
      setGoals(propGoals)
      return
    }
    try {
      const stored = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
      if (Array.isArray(stored)) setGoals(stored.filter((g: Goal) => g.status !== "archived"))
    } catch {}
  }, [propGoals])

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status !== "archived" && g.status !== "completed").slice(0, 4),
    [goals]
  )

  const avgProgress = useMemo(() => {
    if (activeGoals.length === 0) return 0
    return Math.round(
      activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length
    )
  }, [activeGoals])

  if (activeGoals.length === 0) return null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Active Goals
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeGoals.length} goal{activeGoals.length !== 1 ? "s" : ""} in progress
              {avgProgress > 0 && (
                <span className="ml-1.5 text-primary font-medium">
                  ({avgProgress}% avg)
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => router.push("/goals")}
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="space-y-2">
          {activeGoals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-all duration-200"
            >
              <span className="text-lg">{goal.icon || "🎯"}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block truncate">
                  {goal.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${goal.progress || 0}%`,
                        backgroundColor: goal.colorHex || "#1E0E6B",
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {goal.progress || 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
