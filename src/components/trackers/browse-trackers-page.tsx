"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Search, Pin, PinOff, Eye, Compass, ChevronDown, LayoutGrid, List,
} from "lucide-react"
import {
  TRACKER_TEMPLATES,
  getTrackerTemplate,
  type TrackerCategory, type TrackerTemplate,
} from "./tracker-templates"
import {
  pinToQuickAccess,
  unpinFromQuickAccess,
  isInQuickAccess,
} from "@/lib/quick-access"

export function BrowseTrackersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<TrackerCategory | "All">("All")
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<"board" | "list">("board")

  const refreshPinned = useCallback(() => {
    const items = JSON.parse(localStorage.getItem("intenteo-quick-access") || "[]") as { type: string; id: string }[]
    setPinnedIds(new Set(items.filter((i) => i.type === "tracker").map((i) => i.id)))
  }, [])

  useEffect(() => {
    refreshPinned()
    window.addEventListener("quick-access-changed", refreshPinned)
    return () => window.removeEventListener("quick-access-changed", refreshPinned)
  }, [refreshPinned])

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
    const tmpl = getTrackerTemplate(trackerId)
    if (!tmpl) return
    if (isInQuickAccess("tracker", trackerId)) {
      unpinFromQuickAccess("tracker", trackerId)
    } else {
      pinToQuickAccess({
        type: "tracker",
        id: trackerId,
        title: tmpl.name.replace(" Tracker", "").replace(" Calendar", ""),
        icon: tmpl.icon,
        route: `/browse-trackers/${trackerId}`,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Compass className="h-7 w-7 text-[#1E0E6B]" />
            <h1 className="text-3xl font-bold tracking-tight">Browse Trackers</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Discover tracker templates to help you live intentionally.
            Choose a tracker, customize it, and pin it to your workspace.
          </p>
        </div>
        <div className="flex items-center border border-[#1E0E6B]/60 rounded-lg overflow-hidden shrink-0">
          <Button
            variant={viewMode === "board" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("board")}
            className={viewMode === "board" ? "bg-[#1E0E6B] text-white rounded-none" : "rounded-none"}
          >
            <LayoutGrid className="h-4 w-4 mr-1" /> Board
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-[#1E0E6B] text-white rounded-none" : "rounded-none"}
          >
            <List className="h-4 w-4 mr-1" /> List
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Trackers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border border-[#1E0E6B]/30"
          />
        </div>
        <div className="relative shrink-0 sm:w-56">
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as TrackerCategory | "All")}
            className="w-full appearance-none pl-8 pr-8 py-2 text-sm border border-[#1E0E6B]/60 rounded-lg bg-white/50 dark:bg-white/5 focus:border-[#1E0E6B] focus:ring-1 focus:ring-[#1E0E6B] cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Mental Wellness">Mental Wellness</option>
            <option value="Health">Health</option>
            <option value="Fitness">Fitness</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Business">Business</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Content Creation">Content Creation</option>
            <option value="Custom">Custom</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
        </div>
      </div>

      {filteredTrackers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No trackers found</p>
          <p className="text-sm text-muted-foreground/70">Try a different search term or category</p>
        </div>
      ) : viewMode === "board" ? (
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
      ) : (
        <div className="space-y-2">
          {filteredTrackers.map((tracker) => (
            <TrackerListItem
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
            <><Pin className="h-3.5 w-3.5 mr-1" /> Pin to Sidebar</>
          )}
        </Button>
      </div>
    </GlassCard>
  )
}

function TrackerListItem({
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
    <GlassCard className="flex items-center gap-4 p-4 hover:shadow-md hover:shadow-black/5 transition-all duration-200">
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: `${tracker.colorHex}15` }}
      >
        {tracker.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-sm truncate">{tracker.name}</h3>
          <Badge variant="secondary" className="text-[10px] font-medium shrink-0" style={{ color: tracker.colorHex, backgroundColor: `${tracker.colorHex}15` }}>
            {tracker.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{tracker.description}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
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
            <><Pin className="h-3.5 w-3.5 mr-1" /> Pin to Sidebar</>
          )}
        </Button>
      </div>
    </GlassCard>
  )
}
