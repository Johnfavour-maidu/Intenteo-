"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import {
  ArrowLeft, Pin, PinOff, Eye, Check, Star, Users, BarChart3,
  Zap, Shield, TrendingUp, BookOpen,
} from "lucide-react"
import {
  getTrackerTemplate,
  type TrackerTemplate,
} from "./tracker-templates"
import {
  pinToQuickAccess, unpinFromQuickAccess, isInQuickAccess,
} from "@/lib/quick-access"
import { getResourcesByTracker, TRACKER_RESOURCE_MAP, type Resource } from "@/lib/resources"

export function TrackerDetailPage({ trackerId }: { trackerId: string }) {
  const router = useRouter()
  const [isPinned, setIsPinned] = useState(false)
  const tracker = getTrackerTemplate(trackerId)

  useEffect(() => {
    setIsPinned(isInQuickAccess("tracker", trackerId))
    const update = () => setIsPinned(isInQuickAccess("tracker", trackerId))
    window.addEventListener("quick-access-changed", update)
    return () => window.removeEventListener("quick-access-changed", update)
  }, [trackerId])

  if (!tracker) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Tracker not found</p>
        <Button variant="outline" onClick={() => router.push("/browse-trackers")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse
        </Button>
      </div>
    )
  }

  const handleTogglePin = () => {
    if (!tracker) return
    if (isPinned) {
      unpinFromQuickAccess("tracker", trackerId)
    } else {
      pinToQuickAccess({
        type: "tracker",
        id: trackerId,
        title: tracker.name,
        icon: tracker.icon,
        route: `/browse-trackers/${trackerId}`,
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/browse-trackers")}
        className="gap-1 text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Browse Trackers
      </Button>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div
          className="h-24 w-24 rounded-2xl flex items-center justify-center text-5xl shrink-0"
          style={{ backgroundColor: `${tracker.colorHex}15` }}
        >
          {tracker.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{tracker.name}</h1>
            <Badge variant="secondary" className="text-xs" style={{ color: tracker.colorHex, backgroundColor: `${tracker.colorHex}15` }}>
              {tracker.category}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg mb-4">{tracker.description}</p>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push(`/browse-trackers/${trackerId}/preview`)}
              className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90"
            >
              <Eye className="h-4 w-4 mr-2" /> View Template
            </Button>
            <Button
              variant={isPinned ? "default" : "outline"}
              onClick={handleTogglePin}
              className={isPinned ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
            >
              {isPinned ? (
                <><PinOff className="h-4 w-4 mr-2" /> Unpin from Sidebar</>
              ) : (
                <><Pin className="h-4 w-4 mr-2" /> Pin to Sidebar</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: tracker.colorHex }} />
          What this tracker helps you achieve
        </h2>
        <p className="text-muted-foreground">{tracker.whatItAchieves}</p>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-5 w-5" style={{ color: tracker.colorHex }} />
          Who it is for
        </h2>
        <p className="text-muted-foreground">{tracker.targetAudience}</p>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="h-5 w-5" style={{ color: tracker.colorHex }} />
          Key Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {tracker.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 shrink-0" style={{ color: tracker.colorHex }} />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" style={{ color: tracker.colorHex }} />
          Example Dashboard Preview
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {tracker.previewSections.map((section, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tracker.colorHex}15` }}>
                <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: tracker.colorHex }} />
              </div>
              <span className="text-sm font-medium">{section}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: tracker.colorHex }} />
          Benefits
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {tracker.benefits.map((benefit, i) => (
            <div key={i} className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" style={{ color: tracker.colorHex }} />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" style={{ color: tracker.colorHex }} />
          Resources & Learning
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Deepen your understanding with curated resources related to {tracker.name.toLowerCase()}.
        </p>
        {(() => {
          const categories = TRACKER_RESOURCE_MAP[trackerId] || []
          const resources = getResourcesByTracker(trackerId)
          if (resources.length === 0) return null
          return (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                  <span key={cat} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: `${tracker.colorHex}15`, color: tracker.colorHex }}>
                    {cat}
                  </span>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {resources.slice(0, 4).map((resource) => (
                  <div key={resource.id} className="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-foreground truncate">{resource.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{resource.type}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{resource.difficulty}</span>
                      {resource.readTime && <span className="text-[10px] text-muted-foreground">{resource.readTime}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/library?category=${categories[0] || "Purpose"}`)}
                className="gap-2"
              >
                <BookOpen className="h-3.5 w-3.5" /> View All Resources in Library
              </Button>
            </>
          )
        })()}
      </GlassCard>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
        <Button
          size="lg"
          onClick={() => router.push(`/browse-trackers/${trackerId}/preview`)}
          className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90 px-8"
        >
          <Eye className="h-4 w-4 mr-2" /> View Template
        </Button>
        <Button
          size="lg"
          variant={isPinned ? "default" : "outline"}
          onClick={handleTogglePin}
          className={`px-8 ${isPinned ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}`}
        >
          {isPinned ? (
            <><PinOff className="h-4 w-4 mr-2" /> Unpin from Sidebar</>
          ) : (
            <><Pin className="h-4 w-4 mr-2" /> Pin to Sidebar</>
          )}
        </Button>
      </div>
    </div>
  )
}
