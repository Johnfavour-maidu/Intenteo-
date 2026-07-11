"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { GlassCard } from "@/components/ui/glass-card"
import {
  ArrowLeft, Save, Plus, X, Settings,
} from "lucide-react"
import {
  TRACKER_CATEGORIES, MEASUREMENT_UNITS, CHART_OPTIONS,
  type CustomTrackerConfig, type TrackerCategory, type MeasurementUnit, type ChartType, type Frequency,
} from "./tracker-templates"

const ICON_OPTIONS = ["📊", "📈", "🎯", "📝", "💡", "🔑", "🏆", "⭐", "🔥", "💎", "📌", "🗂️", "📋", "🔍", "🛠️", "⚙️"]
const COLOR_OPTIONS = [
  { name: "Indigo", hex: "#1E0E6B" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Orange", hex: "#F97316" },
  { name: "Red", hex: "#EF4444" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Gray", hex: "#6B7280" },
]
const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
]

const defaultConfig: CustomTrackerConfig = {
  name: "",
  category: "Custom",
  icon: "📊",
  colorHex: "#1E0E6B",
  unit: "points",
  frequency: "daily",
  targetValue: 100,
  reminderEnabled: false,
  notes: "",
  preferredCharts: ["line", "bar"],
  showOnDashboard: true,
  enableNotifications: false,
}

export function CustomTrackerBuilderPage() {
  const router = useRouter()
  const [config, setConfig] = useState<CustomTrackerConfig>(defaultConfig)
  const [customUnit, setCustomUnit] = useState("")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const finalConfig = {
      ...config,
      customUnit: config.unit === "custom" ? customUnit : undefined,
    }
    const existing = JSON.parse(localStorage.getItem("intenteo-custom-trackers") || "[]")
    existing.push({ ...finalConfig, id: `custom-${Date.now()}`, createdAt: new Date().toISOString() })
    localStorage.setItem("intenteo-custom-trackers", JSON.stringify(existing))
    setSaved(true)
    setTimeout(() => router.push("/browse-trackers"), 1500)
  }

  const toggleChart = (chart: ChartType) => {
    setConfig(prev => ({
      ...prev,
      preferredCharts: prev.preferredCharts.includes(chart)
        ? prev.preferredCharts.filter(c => c !== chart)
        : [...prev.preferredCharts, chart],
    }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/browse-trackers/custom")}
        className="gap-1 text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div>
        <div className="flex items-center gap-3 mb-1">
          <Settings className="h-7 w-7 text-[#1E0E6B]" />
          <h1 className="text-3xl font-bold tracking-tight">Custom Tracker Builder</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          Configure your own tracker. Set the name, metrics, charts, and preferences.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
          Tracker created successfully! Redirecting...
        </div>
      )}

      <GlassCard className="p-6 space-y-6">
        <h2 className="font-bold text-lg">Basic Information</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tracker Name</label>
          <Input
            placeholder="e.g., Reading Log, Prayer Time, Coding Hours..."
            value={config.name}
            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <div className="flex flex-wrap gap-2">
            {TRACKER_CATEGORIES.filter(c => c !== "All").map((cat) => (
              <Button
                key={cat}
                variant={config.category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, category: cat as TrackerCategory }))}
                className={config.category === cat ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                onClick={() => setConfig(prev => ({ ...prev, icon }))}
                className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  config.icon === icon
                    ? "ring-2 ring-[#1E0E6B] bg-[#1E0E6B]/10"
                    : "bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Accent Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color.hex}
                onClick={() => setConfig(prev => ({ ...prev, colorHex: color.hex }))}
                className={`h-8 w-8 rounded-full transition-all ${
                  config.colorHex === color.hex ? "ring-2 ring-offset-2 ring-[#1E0E6B]" : ""
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-6">
        <h2 className="font-bold text-lg">Measurement</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Measurement Unit</label>
          <div className="flex flex-wrap gap-2">
            {MEASUREMENT_UNITS.map((u) => (
              <Button
                key={u.value}
                variant={config.unit === u.value ? "default" : "outline"}
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, unit: u.value }))}
                className={config.unit === u.value ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
              >
                {u.label}
              </Button>
            ))}
          </div>
          {config.unit === "custom" && (
            <Input
              placeholder="Enter custom unit (e.g., reps, laps, chapters...)"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Frequency</label>
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <Button
                key={f.value}
                variant={config.frequency === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, frequency: f.value }))}
                className={config.frequency === f.value ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Value (optional)</label>
          <Input
            type="number"
            placeholder="e.g., 100, 30, 1000..."
            value={config.targetValue || ""}
            onChange={(e) => setConfig(prev => ({ ...prev, targetValue: e.target.value ? Number(e.target.value) : undefined }))}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-6">
        <h2 className="font-bold text-lg">Charts & Dashboard</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preferred Chart Types</label>
          <div className="flex flex-wrap gap-2">
            {CHART_OPTIONS.map((c) => (
              <Button
                key={c.value}
                variant={config.preferredCharts.includes(c.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleChart(c.value)}
                className={config.preferredCharts.includes(c.value) ? "bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90" : ""}
              >
                {c.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Show on Dashboard</p>
            <p className="text-xs text-muted-foreground">Display this tracker on your main dashboard</p>
          </div>
          <Switch
            checked={config.showOnDashboard}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showOnDashboard: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable Notifications</p>
            <p className="text-xs text-muted-foreground">Get reminded to log your data</p>
          </div>
          <Switch
            checked={config.enableNotifications}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableNotifications: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Reminder Schedule</p>
            <p className="text-xs text-muted-foreground">Send a daily reminder to track</p>
          </div>
          <Switch
            checked={config.reminderEnabled}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, reminderEnabled: checked }))}
          />
        </div>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <h2 className="font-bold text-lg">Notes</h2>
        <textarea
          placeholder="Add any notes about this tracker..."
          value={config.notes}
          onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all"
        />
      </GlassCard>

      <div className="flex gap-4 justify-end pb-8">
        <Button variant="outline" onClick={() => router.push("/browse-trackers")}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!config.name.trim() || saved}
          className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {saved ? "Saved!" : "Create Tracker"}
        </Button>
      </div>
    </div>
  )
}
