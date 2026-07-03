"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface MoodSelectorProps {
  value?: number
  onChange?: (value: number) => void
  className?: string
}

const moods = [
  { value: 1, emoji: "😔", label: "Terrible" },
  { value: 2, emoji: "😟", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
]

export function MoodSelector({ value, onChange, className }: MoodSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange?.(mood.value)}
          className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
            value === mood.value
              ? "bg-primary/10 scale-110"
              : "hover:bg-muted/50 hover:scale-105"
          )}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-[10px] text-muted-foreground">{mood.label}</span>
        </button>
      ))}
    </div>
  )
}
