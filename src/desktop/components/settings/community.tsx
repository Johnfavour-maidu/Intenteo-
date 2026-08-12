"use client"

import React, { useState } from "react"
import { Globe, MessageSquare, Users, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CommunityLink {
  id: string
  label: string
  url: string | null
  icon: React.ReactNode
  available: boolean
}

const LINKS: CommunityLink[] = [
  { id: "forum", label: "Community Forum", url: null, icon: <Globe className="h-4 w-4" />, available: false },
  { id: "discord", label: "Discord", url: null, icon: <MessageSquare className="h-4 w-4" />, available: false },
  { id: "facebook", label: "Facebook Group", url: "https://facebook.com/intenteo", icon: <Globe className="h-4 w-4" />, available: true },
  { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/company/intenteo", icon: <Globe className="h-4 w-4" />, available: true },
  { id: "x", label: "X (Twitter)", url: "https://x.com/intenteo", icon: <Globe className="h-4 w-4" />, available: true },
  { id: "instagram", label: "Instagram", url: "https://instagram.com/intenteo", icon: <Globe className="h-4 w-4" />, available: true },
]

const STATS = [
  { label: "Community Members", value: "2,400+" },
  { label: "Discussions", value: "380" },
  { label: "Feature Requests", value: "124" },
]

function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg border space-y-1.5">
            <div className="h-4 w-12 rounded bg-muted mx-auto" />
            <div className="h-3 w-16 rounded bg-muted mx-auto" />
          </div>
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
          <div className="h-9 w-9 rounded-lg bg-muted" />
          <div className="h-3 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function Community() {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <SkeletonLoader />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center p-3 rounded-lg border bg-muted/20">
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {LINKS.map((link) => (
          <button
            key={link.id}
            disabled={!link.available}
            onClick={() => link.url && window.open(link.url, "_blank", "noopener,noreferrer")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              link.available ? "hover:bg-muted/30 cursor-pointer" : "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              {link.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{link.label}</p>
            </div>
            {!link.available && (
              <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                Coming Soon
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
