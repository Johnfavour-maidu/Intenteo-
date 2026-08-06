"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  calculateIntentScore,
  saveDailyIntentScore,
  type IntentScoreBreakdown,
} from "@/lib/intent-score"
import { isIntentScoreVisible } from "@/lib/settings-actions"

interface IntentScorePanelProps {
  habitPercent: number
  totalTasksToday: number
  completedTasksToday: number
  habits: any[]
  intention: string
}

export function IntentScorePanel({
  habitPercent,
  totalTasksToday,
  completedTasksToday,
  habits,
  intention,
}: IntentScorePanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [breakdown, setBreakdown] = useState<IntentScoreBreakdown | null>(null)
  const [showScore, setShowScore] = useState(true)

  useEffect(() => {
    setShowScore(isIntentScoreVisible())
  }, [])

  const score = useMemo(() => {
    const bd = calculateIntentScore()
    setBreakdown(bd)
    return bd.total
  }, [intention, habitPercent, totalTasksToday, completedTasksToday, habits])

  useEffect(() => {
    if (breakdown) saveDailyIntentScore(breakdown)
  }, [breakdown])

  if (!showScore) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#1E0E6B]/5 to-[#1E0E6B]/10 border border-[#1E0E6B]/10 hover:from-[#1E0E6B]/10 hover:to-[#1E0E6B]/15 transition-all"
      >
        <ProgressRing
          value={score}
          size={48}
          strokeWidth={4}
          showLabel={true}
          indicatorClassName="text-[#1E0E6B]"
        />
        <div className="flex-1 text-left">
          <span className="text-sm font-bold text-[#1E0E6B]">Intent Score</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            How intentionally you lived today
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && breakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 rounded-xl border border-border/50 bg-background space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Today&apos;s Breakdown
              </p>

              {breakdown.components.map((comp) => (
                <div
                  key={comp.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm",
                        comp.complete ? "text-emerald-500" : "text-red-400"
                      )}
                    >
                      {comp.complete ? "✅" : "❌"}
                    </span>
                    <span className="text-xs">{comp.label}</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">
                    <span
                      className={
                        comp.earnedPercent > 0
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }
                    >
                      {comp.earnedPercent}%
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      of {comp.maxPercent}%
                    </span>
                  </span>
                </div>
              ))}

              <div className="border-t border-border/50 pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Today&apos;s Insight
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {breakdown.insight}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
