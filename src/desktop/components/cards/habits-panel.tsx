"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, CheckCircle2, Circle, Flame, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HabitsPanelProps {
  habits: any[]
  completedCount: number
  totalCount: number
  percent: number
  onToggleHabit: (id: string) => void
}

export function HabitsPanel({
  habits,
  completedCount,
  totalCount,
  percent,
  onToggleHabit,
}: HabitsPanelProps) {
  const router = useRouter()

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Today&apos;s Habits
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {totalCount} completed
              {totalCount > 0 && (
                <span className="ml-1.5 text-primary font-medium">
                  ({percent}%)
                </span>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => router.push("/habits")}
          >
            View All <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
        {habits.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              No habits yet. Start building consistency!
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {habits.slice(0, 5).map((habit: any) => (
              <motion.div
                key={habit.id}
                layout
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200",
                  habit.completedToday ? "bg-primary/5" : "hover:bg-muted/30"
                )}
              >
                <button
                  onClick={() => onToggleHabit(habit.id)}
                  className="shrink-0"
                >
                  {habit.completedToday ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <span className="text-lg">{habit.icon || "🎯"}</span>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      habit.completedToday &&
                        "line-through text-muted-foreground"
                    )}
                  >
                    {habit.name}
                  </span>
                </div>
                {(habit.streak || 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Flame className="h-3 w-3 text-orange-400" />
                    {habit.streak}
                  </div>
                )}
              </motion.div>
            ))}
            {habits.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                + {habits.length - 5} more habit
                {habits.length - 5 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
