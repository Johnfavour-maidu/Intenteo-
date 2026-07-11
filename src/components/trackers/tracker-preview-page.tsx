"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import {
  ArrowLeft, Pin, PinOff, TrendingUp, Calendar, BarChart3, Activity,
  CheckCircle2, Clock, Flame, Target, Eye, EyeOff,
} from "lucide-react"
import {
  getTrackerTemplate,
} from "./tracker-templates"
import {
  pinToQuickAccess, unpinFromQuickAccess, isInQuickAccess,
} from "@/lib/quick-access"

const PREVIEW_DATA: Record<string, {
  stats: { label: string; value: string; change: string; trend: "up" | "down" | "neutral" }[]
  chartBars: number[]
  calendarDots: number[]
  recentEntries: { date: string; value: string; note: string }[]
  streak: number
}> = {
  mood: {
    stats: [
      { label: "Current Mood", value: "7.2/10", change: "+0.8", trend: "up" },
      { label: "Weekly Avg", value: "6.8/10", change: "+1.2", trend: "up" },
      { label: "Best Day", value: "Monday", change: "", trend: "neutral" },
      { label: "Streak", value: "12 days", change: "+3", trend: "up" },
    ],
    chartBars: [6, 7, 5, 8, 7, 9, 8, 7, 6, 8, 7, 9, 8, 7],
    calendarDots: [3, 4, 2, 5, 4, 3, 5, 4, 2, 5, 3, 4, 5, 4, 3, 5, 2, 4, 5, 3, 4, 5, 2, 4, 3, 5, 4, 2],
    recentEntries: [
      { date: "Today", value: "Happy (8/10)", note: "Great workout this morning" },
      { date: "Yesterday", value: "Calm (7/10)", note: "Peaceful evening reading" },
      { date: "2 days ago", value: "Energetic (9/10)", note: "Completed all tasks early" },
    ],
    streak: 12,
  },
  weight: {
    stats: [
      { label: "Current", value: "74.2 kg", change: "-0.8", trend: "down" },
      { label: "BMI", value: "23.1", change: "-0.3", trend: "down" },
      { label: "Goal", value: "72 kg", change: "2.2 kg left", trend: "neutral" },
      { label: "Week Change", value: "-0.8 kg", change: "On track", trend: "up" },
    ],
    chartBars: [76, 75.8, 75.5, 75.2, 75, 74.8, 74.5, 74.3, 74.2, 74.1, 74, 73.8, 74, 74.2],
    calendarDots: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    recentEntries: [
      { date: "Today", value: "74.2 kg", note: "Post-workout weigh-in" },
      { date: "Yesterday", value: "74.5 kg", note: "Morning weigh-in" },
      { date: "2 days ago", value: "74.8 kg", note: "After dinner" },
    ],
    streak: 28,
  },
  exercise: {
    stats: [
      { label: "This Week", value: "5 sessions", change: "+2", trend: "up" },
      { label: "Total Time", value: "4h 30m", change: "+1h 15m", trend: "up" },
      { label: "Calories Burned", value: "2,840", change: "+680", trend: "up" },
      { label: "Streak", value: "8 days", change: "+2", trend: "up" },
    ],
    chartBars: [45, 60, 30, 50, 0, 65, 40, 55, 70, 35, 45, 60, 50, 40],
    calendarDots: [2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2],
    recentEntries: [
      { date: "Today", value: "45 min - Running", note: "5K in 28 minutes" },
      { date: "Yesterday", value: "60 min - Strength", note: "Upper body focus" },
      { date: "2 days ago", value: "30 min - Yoga", note: "Flexibility session" },
    ],
    streak: 8,
  },
  period: {
    stats: [
      { label: "Cycle Day", value: "Day 14", change: "Ovulation window", trend: "neutral" },
      { label: "Cycle Length", value: "28 days", change: "Regular", trend: "neutral" },
      { label: "Next Period", value: "14 days", change: "On track", trend: "neutral" },
      { label: "Symptoms Logged", value: "3 this week", change: "Mild", trend: "up" },
    ],
    chartBars: [28, 27, 29, 28, 28, 27, 28, 29, 28, 27, 28, 28, 29, 28],
    calendarDots: [1, 1, 2, 2, 2, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2],
    recentEntries: [
      { date: "Today", value: "Day 14", note: "Mild cramping" },
      { date: "Yesterday", value: "Day 13", note: "No symptoms" },
      { date: "2 days ago", value: "Day 12", note: "Slight headache" },
    ],
    streak: 90,
  },
  lifestyle: {
    stats: [
      { label: "Sleep", value: "7.2 hrs", change: "+0.5", trend: "up" },
      { label: "Water", value: "2.4 L", change: "+0.3", trend: "up" },
      { label: "Screen Time", value: "3.1 hrs", change: "-0.8", trend: "up" },
      { label: "Habits Done", value: "6/8", change: "75%", trend: "up" },
    ],
    chartBars: [7, 6.5, 7.5, 8, 7, 6, 7.2, 7.5, 8, 6.5, 7, 7.5, 7.2, 7],
    calendarDots: [3, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3],
    recentEntries: [
      { date: "Today", value: "7.2h sleep, 2.4L water", note: "Great sleep quality" },
      { date: "Yesterday", value: "6.5h sleep, 2.1L water", note: "Woke up early" },
      { date: "2 days ago", value: "7.5h sleep, 2.3L water", note: "Meditated 15 min" },
    ],
    streak: 15,
  },
  finance: {
    stats: [
      { label: "Income", value: "₦850K", change: "+12%", trend: "up" },
      { label: "Expenses", value: "₦420K", change: "-8%", trend: "up" },
      { label: "Savings", value: "₦430K", change: "51% saved", trend: "up" },
      { label: "Budget Left", value: "₦180K", change: "43% remaining", trend: "up" },
    ],
    chartBars: [420, 380, 350, 400, 450, 390, 410, 380, 360, 420, 400, 390, 420, 420],
    calendarDots: [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2],
    recentEntries: [
      { date: "Today", value: "₦12,500 expense", note: "Groceries" },
      { date: "Yesterday", value: "₦850,000 income", note: "Monthly salary" },
      { date: "2 days ago", value: "₦35,000 expense", note: "Transport & fuel" },
    ],
    streak: 30,
  },
  content: {
    stats: [
      { label: "Published", value: "24 posts", change: "+6", trend: "up" },
      { label: "Engagement", value: "4.2%", change: "+0.8%", trend: "up" },
      { label: "Followers", value: "2,840", change: "+180", trend: "up" },
      { label: "Drafts", value: "8", change: "3 ready", trend: "neutral" },
    ],
    chartBars: [3, 4, 2, 5, 3, 4, 6, 3, 4, 5, 2, 4, 3, 5],
    calendarDots: [2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2],
    recentEntries: [
      { date: "Today", value: "Instagram Reel", note: "Morning routine tips - 1.2K views" },
      { date: "Yesterday", value: "Blog Post", note: "Productivity hacks article published" },
      { date: "2 days ago", value: "Twitter Thread", note: "10 habits for success - 890 impressions" },
    ],
    streak: 14,
  },
  student: {
    stats: [
      { label: "GPA", value: "3.7", change: "+0.2", trend: "up" },
      { label: "Study Hours", value: "28 hrs", change: "+5 hrs", trend: "up" },
      { label: "Assignments", value: "3/4 done", change: "75%", trend: "up" },
      { label: "Attendance", value: "94%", change: "+2%", trend: "up" },
    ],
    chartBars: [4, 3, 5, 4, 2, 6, 5, 3, 4, 5, 3, 4, 5, 4],
    calendarDots: [2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2],
    recentEntries: [
      { date: "Today", value: "5h studied", note: "Data Structures - Trees & Graphs" },
      { date: "Yesterday", value: "4h studied", note: "Calculus - Integration" },
      { date: "2 days ago", value: "3h studied", note: "English - Essay draft" },
    ],
    streak: 21,
  },
  business: {
    stats: [
      { label: "Revenue", value: "₦2.4M", change: "+18%", trend: "up" },
      { label: "Leads", value: "142", change: "+28", trend: "up" },
      { label: "Conversion", value: "12.5%", change: "+2.1%", trend: "up" },
      { label: "Customers", value: "38", change: "+5", trend: "up" },
    ],
    chartBars: [180, 200, 190, 220, 250, 210, 240, 260, 230, 250, 270, 240, 260, 240],
    calendarDots: [2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2],
    recentEntries: [
      { date: "Today", value: "₦125K deal closed", note: "New enterprise client" },
      { date: "Yesterday", value: "12 leads generated", note: "LinkedIn campaign" },
      { date: "2 days ago", value: "₦85K revenue", note: "Subscription renewals" },
    ],
    streak: 45,
  },
  custom: {
    stats: [
      { label: "Current", value: "--", change: "", trend: "neutral" },
      { label: "Target", value: "--", change: "", trend: "neutral" },
      { label: "Progress", value: "0%", change: "", trend: "neutral" },
      { label: "Streak", value: "0 days", change: "", trend: "neutral" },
    ],
    chartBars: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    calendarDots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    recentEntries: [],
    streak: 0,
  },
}

export function TrackerPreviewPage({ trackerId }: { trackerId: string }) {
  const router = useRouter()
  const [isPinned, setIsPinned] = useState(false)
  const tracker = getTrackerTemplate(trackerId)
  const preview = PREVIEW_DATA[trackerId] || PREVIEW_DATA.custom

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
    if (isPinned) {
      unpinFromQuickAccess("tracker", trackerId)
    } else {
      pinToQuickAccess({
        type: "tracker",
        id: trackerId,
        title: tracker.name.replace(" Tracker", "").replace(" Calendar", ""),
        icon: tracker.icon,
        route: `/browse-trackers/${trackerId}`,
      })
    }
  }

  const barMax = Math.max(...preview.chartBars, 1)
  const days = ["M", "T", "W", "T", "F", "S", "S"]
  const weeks = 4

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/browse-trackers/${trackerId}`)}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs" style={{ color: tracker.colorHex, backgroundColor: `${tracker.colorHex}15` }}>
            Preview Mode
          </Badge>
          <Button
            variant={isPinned ? "default" : "outline"}
            size="sm"
            onClick={handleTogglePin}
            className={isPinned ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
          >
            {isPinned ? <PinOff className="h-3.5 w-3.5 mr-1" /> : <Pin className="h-3.5 w-3.5 mr-1" />}
            {isPinned ? "Unpin" : "Pin to Sidebar"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ backgroundColor: `${tracker.colorHex}15` }}
        >
          {tracker.icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tracker.name}</h1>
          <p className="text-muted-foreground text-sm">Preview — this is how your tracker will look</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {preview.stats.map((stat, i) => (
          <GlassCard key={i} className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold">{stat.value}</p>
              {stat.change && (
                <span className={`text-xs mb-1 ${stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-muted-foreground"}`}>
                  {stat.change}
                </span>
              )}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" style={{ color: tracker.colorHex }} />
          <h2 className="font-bold">Activity Overview</h2>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {preview.chartBars.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all duration-300"
                style={{
                  height: `${Math.max((val / barMax) * 100, 4)}%`,
                  backgroundColor: `${tracker.colorHex}${val > 0 ? "CC" : "33"}`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2">
          {preview.chartBars.map((_, i) => (
            <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground">
              {days[i % 7]}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" style={{ color: tracker.colorHex }} />
          <h2 className="font-bold">Calendar Heatmap</h2>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {preview.calendarDots.map((val, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm transition-colors"
              style={{
                backgroundColor: val === 0 ? "hsl(var(--muted))" :
                  val === 1 ? `${tracker.colorHex}33` :
                  val === 2 ? `${tracker.colorHex}77` :
                  `${tracker.colorHex}CC`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((v) => (
              <div
                key={v}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: v === 0 ? "hsl(var(--muted))" :
                    v === 1 ? `${tracker.colorHex}33` :
                    v === 2 ? `${tracker.colorHex}77` :
                    `${tracker.colorHex}CC`,
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5" style={{ color: tracker.colorHex }} />
            <h2 className="font-bold">Current Streak</h2>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="h-20 w-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${tracker.colorHex}15` }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: tracker.colorHex }}>{preview.streak}</p>
                <p className="text-[10px] text-muted-foreground">days</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Keep it going!</p>
              <p className="text-xs text-muted-foreground">You&apos;re doing great. Stay consistent.</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5" style={{ color: tracker.colorHex }} />
            <h2 className="font-bold">Progress</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={tracker.colorHex} strokeWidth="3"
                  strokeDasharray={`${(preview.streak / 30) * 94.25} 94.25`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm font-bold" style={{ color: tracker.colorHex }}>
                  {Math.round((preview.streak / 30) * 100)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Monthly Target</p>
              <p className="text-xs text-muted-foreground">{preview.streak}/30 days tracked</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5" style={{ color: tracker.colorHex }} />
          <h2 className="font-bold">Recent Entries</h2>
        </div>
        {preview.recentEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet. Start tracking to see your data here.</p>
        ) : (
          <div className="space-y-3">
            {preview.recentEntries.map((entry, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-white/20">
                <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" style={{ color: tracker.colorHex }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.value}</span>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pb-8">
        <Button
          size="lg"
          onClick={() => router.push("/browse-trackers")}
          className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90 px-8"
        >
          Done Previewing
        </Button>
        <Button
          size="lg"
          variant={isPinned ? "default" : "outline"}
          onClick={handleTogglePin}
          className={`px-8 ${isPinned ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}`}
        >
          {isPinned ? <><PinOff className="h-4 w-4 mr-2" /> Unpin from Sidebar</> : <><Pin className="h-4 w-4 mr-2" /> Pin to Sidebar</>}
        </Button>
      </div>
    </div>
  )
}
