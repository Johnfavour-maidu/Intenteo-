"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface IntentScoreBadgeProps {
  score: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function IntentScoreBadge({ score, size = "md", className }: IntentScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
    if (score >= 60) return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    if (score >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
    return "text-red-500 bg-red-500/10 border-red-500/20"
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        getScoreColor(score),
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[0.6em]">✦</span>
      <span>{score}</span>
    </div>
  )
}
