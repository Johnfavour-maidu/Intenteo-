"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TeoIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "fab"
  className?: string
  priority?: boolean
}

const sizeMap = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
  fab: "h-12 w-12",
}

export function TeoIcon({ size = "md", className, priority = false }: TeoIconProps) {
  return (
    <img
      src="/teo icon.png"
      alt="Téo"
      className={cn("rounded-full object-contain", sizeMap[size], className)}
      draggable={false}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  )
}
