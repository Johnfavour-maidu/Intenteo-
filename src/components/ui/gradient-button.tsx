"use client"

import React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface GradientButtonProps extends ButtonProps {
  loading?: boolean
  loadingText?: string
  gradient?: "primary" | "danger" | "orange"
}

export function GradientButton({
  children,
  loading = false,
  loadingText,
  gradient = "primary",
  disabled,
  className,
  ...props
}: GradientButtonProps) {
  const isDisabled = disabled || loading

  return (
    <Button
      disabled={isDisabled}
      className={cn(
        "px-6 shadow-sm transition-all duration-200",
        gradient === "primary" && "bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white shadow-[#1E0E6B]/20",
        gradient === "danger" && "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-500/90 hover:to-red-600/90 text-white",
        gradient === "orange" && "bg-gradient-to-r from-[#E8873A] via-[#EB9E5B] to-[#F0B97A] hover:from-[#D97A30] hover:via-[#E8934E] hover:to-[#EDAE6A] text-white shadow-[#EB9E5B]/30 shadow-md",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || "Saving..."}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
