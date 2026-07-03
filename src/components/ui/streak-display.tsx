"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface StreakDisplayProps {
  count: number
  label?: string
  className?: string
}

export function StreakDisplay({ count, label = "day streak", className }: StreakDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-500/25">
        <span className="text-lg">🔥</span>
      </div>
      <div>
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
