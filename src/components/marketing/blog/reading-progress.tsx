"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ReadingProgressBarProps {
  targetId?: string
  className?: string
}

export function ReadingProgressBar({ targetId = "article-content", className }: ReadingProgressBarProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const handleScroll = () => {
      const rect = target.getBoundingClientRect()
      const totalHeight = target.offsetHeight
      const windowHeight = window.innerHeight
      const scrolled = -rect.top + windowHeight * 0.3
      const pct = Math.max(0, Math.min(100, (scrolled / totalHeight) * 100))
      setProgress(pct)
    }

    if (prefersReduced) {
      setProgress(0)
      return
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [targetId])

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent", className)}>
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #1E0E6B 0%, #EB9E5B 100%)",
        }}
      />
    </div>
  )
}
