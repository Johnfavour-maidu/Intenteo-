"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const avatarVariants = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-20 w-20 text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface UserAvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  status?: "online" | "offline" | "away" | "busy"
}

const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ className, size, src, alt, fallback, status, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      <div className={cn(avatarVariants({ size }), "bg-gradient-to-br from-primary to-purple-600 text-white font-medium")}>
        {src ? (
          <img src={src} alt={alt || ""} className="h-full w-full object-cover" />
        ) : (
          <span>{fallback || "?"}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            status === "online" && "bg-emerald-500",
            status === "offline" && "bg-gray-400",
            status === "away" && "bg-amber-500",
            status === "busy" && "bg-red-500"
          )}
        />
      )}
    </div>
  )
)
UserAvatar.displayName = "UserAvatar"

export { UserAvatar, avatarVariants }
