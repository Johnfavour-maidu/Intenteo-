"use client"

import React, { useState } from "react"
import { ExternalLink, Globe, Mail, Code, FileText } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

const RELEASE_NOTES = [
  { version: "0.1.0", date: "July 9, 2026", notes: ["Initial release", "Core features: Tasks, Visions & Goals, Habits, Journal, Calendar", "Téo AI coach", "Review Today system", "Focus Mode"] },
]

const LEGAL_LINKS = [
  { label: "Privacy Policy", url: "/privacy" },
  { label: "Terms of Service", url: "/terms" },
  { label: "Open Source Licenses", url: "/licenses" },
]

function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-muted" />
        <div className="space-y-1.5">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-40 rounded bg-muted" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-2.5 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function AboutIntenteo() {
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <SkeletonLoader />

  return (
    <div className="space-y-4">
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Intenteo"
            className="h-14 w-auto object-contain shrink-0"
            style={{ imageRendering: "auto" }}
          />
          <div>
            <h3 className="font-bold text-lg">Intenteo</h3>
            <p className="text-xs text-muted-foreground">The world&apos;s first AI-powered Intentional Living Platform</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-muted-foreground text-xs">Version</p><p className="font-medium">0.1.0</p></div>
        <div><p className="text-muted-foreground text-xs">Build</p><p className="font-medium">2026.07.09</p></div>
        <div><p className="text-muted-foreground text-xs">Release Date</p><p className="font-medium">July 9, 2026</p></div>
        <div><p className="text-muted-foreground text-xs">Environment</p><p className="font-medium">Production</p></div>
        <div className="col-span-2"><p className="text-muted-foreground text-xs">Developer</p><p className="font-medium">Glopresc Technologies</p></div>
        <div className="col-span-2"><p className="text-muted-foreground text-xs">Copyright</p><p className="font-medium">&copy; 2026 Intenteo. All rights reserved.</p></div>
      </div>

      <div className="space-y-1.5">
        {LEGAL_LINKS.map((link) => (
          <button
            key={link.label}
            onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
          >
            <span className="text-sm font-medium">{link.label}</span>
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ))}
      </div>

      <div className="pt-3 border-t">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What&apos;s New</p>
        {RELEASE_NOTES.map((release) => (
          <div key={release.version} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Version {release.version}</span>
              <span className="text-[10px] text-muted-foreground">{release.date}</span>
            </div>
            <ul className="space-y-1">
              {release.notes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 rounded-full bg-primary shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
