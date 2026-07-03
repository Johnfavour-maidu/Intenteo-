"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const glassCardVariants = cva(
  "rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-950/80 dark:border-gray-800/50",
  {
    variants: {
      variant: {
        default: "",
        primary: "border-primary/20 bg-primary/5",
        success: "border-emerald-500/20 bg-emerald-500/5",
        warning: "border-amber-500/20 bg-amber-500/5",
        info: "border-blue-500/20 bg-blue-500/5",
      },
      hover: {
        none: "",
        scale: "hover:scale-[1.02]",
        lift: "hover:-translate-y-1",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glassCardVariants({ variant, hover }), className)}
      {...props}
    />
  )
)
GlassCard.displayName = "GlassCard"

export { GlassCard, glassCardVariants }
