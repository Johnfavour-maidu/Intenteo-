"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Search, Pin, PinOff, Eye, ChevronRight, Compass, Sparkles,
} from "lucide-react"
import {
  TRACKER_TEMPLATES, TRACKER_CATEGORIES,
  getPinnedTrackers, pinTracker, unpinTracker, isTrackerPinned,
  type TrackerCategory, type TrackerTemplate,
} from "./tracker-templates"

export function BrowseTrackersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<TrackerCategory>("All")
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updatePinned = () => {
      const pinned = getPinnedTrackers()
      setPinnedIds(new Set(pinned.map(p => p.trackerId)))
    }
    updatePinned()
    window.addEventListener("pinned-trackers-changed", updatePinned)
    return () => window.removeEventListener("pinned-trackers-changed", updatePinned)
  }, [])

  const filteredTrackers = useMemo(() => {
    let results = TRACKER_TEMPLATES
    if (activeCategory !== "All") {
      results = results.filter(t => t.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }
    return results
  }, [searchQuery, activeCategory])

  const handleTogglePin = (e: React.MouseEvent, trackerId: string) => {
    e.stopPropagation()
    if (isTrackerPinned(trackerId)) {
      unpinTracker(trackerId)
    } else {
      pinTracker(trackerId)
    }
  }

  const categoryColors: Record<string, string> = {
    "All": "#1E0E6B",
    "Mental Wellness": "#8B5CF6",
    "Health": "#EC4899",
    "Fitness": "#22C55E",
    "Lifestyle": "#10B981",
    "Business": "#14B8A6",
    "Finance": "#EAB308",
    "Education": "#6366F1",
    "Content Creation": "#F97316",
    "Custom": "#6B7280",
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Compass className="h-7 w-7 text-[#1E0E6B]" />
          <h1 className="text-3xl font-bold tracking-tight">Browse Trackers</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Discover tracker templates to help you live intentionally.
          <br />
          Choose a tracker, customize it, and pin it to your workspace.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Trackers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TRACKER_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className={activeCategory === cat ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
          >
            {cat}
          </Button>
        ))}
      </div>

      {filteredTrackers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No trackers found</p>
          <p className="text-sm text-muted-foreground/70">Try a different search term or category</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTrackers.map((tracker) => (
            <TrackerCard
              key={tracker.id}
              tracker={tracker}
              isPinned={pinnedIds.has(tracker.id)}
              onTogglePin={(e) => handleTogglePin(e, tracker.id)}
              onPreview={() => router.push(`/browse-trackers/${tracker.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TrackerCard({
  tracker,
  isPinned,
  onTogglePin,
  onPreview,
}: {
  tracker: TrackerTemplate
  isPinned: boolean
  onTogglePin: (e: React.MouseEvent) => void
  onPreview: () => void
}) {
  return (
    <GlassCard className="group relative p-5 flex flex-col hover:shadow-lg hover:shadow-black/5 transition-all duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: `${tracker.colorHex}15` }}
        >
          {tracker.icon}
        </div>
        <Badge variant="secondary" className="text-[10px] font-medium" style={{ color: tracker.colorHex, backgroundColor: `${tracker.colorHex}15` }}>
          {tracker.category}
        </Badge>
      </div>

      <h3 className="font-bold text-base mb-1">{tracker.name}</h3>
      <p className="text-xs text-muted-foreground mb-4 flex-1 line-clamp-2">{tracker.description}</p>

      <div className="flex items-center gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs"
          onClick={onPreview}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          Preview
        </Button>
        <Button
          variant={isPinned ? "default" : "outline"}
          size="sm"
          className={`h-8 text-xs ${isPinned ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}`}
          onClick={onTogglePin}
        >
          {isPinned ? (
            <><PinOff className="h-3.5 w-3.5 mr-1" /> Unpin</>
          ) : (
            <><Pin className="h-3.5 w-3.5 mr-1" /> Pin</>
          )}
        </Button>
      </div>
    </GlassCard>
  )
}
