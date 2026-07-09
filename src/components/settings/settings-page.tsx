"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassCard } from "@/components/ui/glass-card"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  User, Bell, Shield, Globe, Moon, Sun, Monitor,
  Lock, Key, Download, Trash2, Mail, Smartphone, Check, Camera,
  Edit, Star, BookOpen, CheckSquare, Repeat, Trophy, Target,
  Zap, Award, Sparkles, Brain, Database, Info,
  ChevronDown, ChevronRight, ExternalLink, Copy, MessageSquare,
  Video, HelpCircle, FileText, LifeBuoy, Users, Send,
  Heart, MapPin, Clock, Calendar, Palette, Eye, EyeOff,
  Fingerprint, Laptop, Smartphone as Phone, Tablet, Monitor as MonitorIcon,
  Wifi, Cloud, RefreshCw, AlertTriangle, Lightbulb,
} from "lucide-react"
import { useTheme } from "next-themes"

// ──────────────────── Types ────────────────────
type SettingsTab = "profile" | "security" | "help"

// ──────────────────── Collapsible Section ────────────────────
function Section({ id, title, children, isOpen, onToggle, isHighlighted = false }: {
  id: string; title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; isHighlighted?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} id={id} className={`rounded-xl border transition-all duration-300 ${isHighlighted ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border"}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-xl">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

// ──────────────────── Toggle Row ────────────────────
function ToggleRow({ label, desc, defaultChecked = false }: { label: string; desc?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

// ──────────────────── Field Row ────────────────────
function FieldRow({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input defaultValue={value} placeholder={placeholder || value} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ══════════════════════ MAIN COMPONENT ═══════════════════════
// ══════════════════════════════════════════════════════════════
export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as SettingsTab | null
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || "profile")
  const [openSection, setOpenSection] = useState<string | null>("personal-info")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })

  useEffect(() => { if (tabParam) setActiveTab(tabParam) }, [tabParam])

  const stats = [
    { label: "Current Streak", value: "32 Days", icon: "🔥" },
    { label: "Intent Score", value: "85", icon: "✦" },
    { label: "Goals Completed", value: "12", icon: "🎯" },
    { label: "Journal Entries", value: "156", icon: "📖" },
    { label: "Tasks Completed", value: "423", icon: "✅" },
    { label: "Habits Built", value: "28", icon: "💪" },
    { label: "Projects Completed", value: "8", icon: "🚀" },
    { label: "Achievements", value: "24", icon: "🏆" },
  ]

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your Intenteo experience</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTab)} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile & Personalization</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Privacy & Security</TabsTrigger>
          <TabsTrigger value="help"><LifeBuoy className="mr-2 h-4 w-4" />Help & Support</TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ════════ TAB 1: PROFILE & PERSONALIZATION ════════ */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="profile" className="mt-6 space-y-4">

          {/* Section 1: Personal Information */}
          <Section id="personal-info" title="Personal Information" isOpen={openSection === "personal-info"} onToggle={() => toggleSection("personal-info")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <UserAvatar size="lg" fallback="JD" />
                )}
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Camera className="h-3.5 w-3.5" /></button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (ev) => setProfileImage(ev.target?.result as string)
                  reader.readAsDataURL(file)
                }} />
              </div>
              <div>
                <p className="font-semibold">Profile Picture</p>
                <p className="text-xs text-muted-foreground">Click to change</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldRow label="Name" value="John Doe" />
              <FieldRow label="Username" value="johndoe" />
              <FieldRow label="Email" value="john@example.com" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Language</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>English</option><option>French</option><option>Spanish</option></select>
              </div>
              <FieldRow label="Birthday" placeholder="dd/mm/yyyy" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Week Starts On</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>Monday</option><option>Sunday</option></select>
              </div>
            </div>
          </Section>

          {/* Section 2: Appearance */}
          <Section id="appearance" title="Appearance" isOpen={openSection === "appearance"} onToggle={() => toggleSection("appearance")}>
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", icon: <Sun className="h-5 w-5" />, label: "Light" },
                  { value: "dark", icon: <Moon className="h-5 w-5" />, label: "Dark" },
                  { value: "system", icon: <Monitor className="h-5 w-5" />, label: "System" },
                ].map((t) => (
                  <Button key={t.value} variant={theme === t.value ? "default" : "outline"} className="h-auto py-3 flex flex-col items-center gap-1.5" onClick={() => setTheme(t.value)}>
                    {t.icon}<span className="text-xs">{t.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Accent Colour</label>
              <div className="flex gap-2.5">
                {["var(--brand-primary)", "var(--brand-secondary)", "#16A34A", "#F59E0B", "#EF4444", "#EC4899"].map((c) => (
                  <button key={c} className="h-9 w-9 rounded-full border-2 border-transparent hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <ToggleRow label="Glass Mode" desc="Enable glassmorphism effects" defaultChecked />
            <ToggleRow label="Animations" desc="Enable smooth transitions" defaultChecked />
            <ToggleRow label="Compact Mode" desc="Reduce spacing for more content" />
            <ToggleRow label="Reduced Motion" desc="Minimize animations" />
            <ToggleRow label="High Contrast" desc="Increase contrast for accessibility" />
          </Section>

          {/* Section 3: Calendar Preferences */}
          <Section id="calendar-prefs" title="Calendar Preferences" isOpen={openSection === "calendar-prefs"} onToggle={() => toggleSection("calendar-prefs")}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Default Date Format</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>dd/mm/yyyy</option><option>mm/dd/yyyy</option><option>yyyy-mm-dd</option></select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Default Time Format</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>12 Hour</option><option>24 Hour</option></select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Week Starts</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>Monday</option><option>Sunday</option></select>
              </div>
              <FieldRow label="Default Reminder Time" placeholder="9:00 AM" />
              <FieldRow label="Default Task Duration" placeholder="30 mins" />
              <FieldRow label="Timezone" placeholder="WAT (UTC+1)" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Working Days</label>
                <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>Monday - Friday</option><option>Monday - Saturday</option><option>Custom</option></select>
              </div>
            </div>
          </Section>

          {/* Section 4: Notification Preferences */}
          <Section id="notif-prefs" title="Notification Preferences" isOpen={openSection === "notif-prefs"} onToggle={() => toggleSection("notif-prefs")}>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reminders</p>
              <ToggleRow label="Daily Review" desc="Morning and evening prompts" defaultChecked />
              <ToggleRow label="Habits" desc="Habit completion reminders" defaultChecked />
              <ToggleRow label="Goals" desc="Goal progress updates" defaultChecked />
              <ToggleRow label="Projects" desc="Project deadline alerts" defaultChecked />
              <ToggleRow label="Calendar" desc="Upcoming events and reminders" defaultChecked />
              <ToggleRow label="Téo" desc="AI coach notifications" defaultChecked />
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Marketing</p>
              <ToggleRow label="Push" desc="Product updates and tips" />
              <ToggleRow label="Email" desc="Newsletter and announcements" />
              <ToggleRow label="SMS" desc="Critical alerts only" />
            </div>
          </Section>

          {/* Section 5: Téo Preferences */}
          <Section id="teo-prefs" title="Téo Preferences" isOpen={openSection === "teo-prefs"} onToggle={() => toggleSection("teo-prefs")}>
            <ToggleRow label="Enable Téo" desc="Receive personalized guidance from Téo" defaultChecked />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Coach Style</label>
              <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>Friendly</option><option>Direct</option><option>Motivational</option><option>Analytical</option></select>
            </div>
            <ToggleRow label="Morning Briefing" desc="Daily morning insights from Téo" defaultChecked />
            <ToggleRow label="Evening Review" desc="End-of-day reflection prompts" defaultChecked />
            <ToggleRow label="Weekly Insights" desc="Weekly progress summaries" defaultChecked />
            <ToggleRow label="Voice Replies" desc="Téo can respond with voice" />
            <ToggleRow label="Proactive Suggestions" desc="Téo suggests actions proactively" defaultChecked />
            <ToggleRow label="Auto Summaries" desc="Automatic daily and weekly summaries" defaultChecked />
            <ToggleRow label="Context Memory" desc="Téo remembers your preferences" defaultChecked />
          </Section>

          {/* Section 6: Focus & Productivity */}
          <Section id="focus-productivity" title="Focus & Productivity" isOpen={openSection === "focus-productivity"} onToggle={() => toggleSection("focus-productivity")}>
            <ToggleRow label="Automatically Enter Focus Mode" desc="Activate Focus Mode when a scheduled session begins" />
            <ToggleRow label="Play Completion Sound" desc="Play a subtle sound when a task or habit is completed" defaultChecked />
            <ToggleRow label="Confirm Before Deleting" desc="Ask before permanently deleting items" defaultChecked />
            <ToggleRow label="Carry Unfinished Tasks Forward" desc="Automatically move incomplete tasks to the next day" />
            <ToggleRow label="Enable Daily Review" desc="Show the end-of-day Review Today experience" defaultChecked />
            <ToggleRow label="Show Productivity Score" desc="Display your daily score throughout the app" defaultChecked />
            <ToggleRow label="Show Streak Celebrations" desc="Celebrate streak milestones and achievements" defaultChecked />
          </Section>

          {/* Section 7: Personal Statistics */}
          <Section id="personal-stats" title="Personal Statistics" isOpen={openSection === "personal-stats"} onToggle={() => toggleSection("personal-stats")}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="p-3 rounded-xl border text-center">
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-lg font-bold mt-1">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = "/journey"}>
              <Sparkles className="mr-2 h-4 w-4" />View My Journey
            </Button>
          </Section>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ═══════════ TAB 2: PRIVACY & SECURITY ═══════════ */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="security" className="mt-6 space-y-4">

          {/* Password */}
          <Section id="password" title="Password" isOpen={openSection === "password"} onToggle={() => toggleSection("password")}>
            <div className="space-y-3 max-w-md">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Current Password</label>
                <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <Button size="sm"><Key className="mr-1 h-3.5 w-3.5" />Change Password</Button>
            </div>
          </Section>

          {/* PIN */}
          <Section id="pin" title="PIN" isOpen={openSection === "pin"} onToggle={() => toggleSection("pin")}>
            <ToggleRow label="Enable PIN" desc="Require PIN to open the app" />
            <Button size="sm" variant="outline"><Lock className="mr-1 h-3.5 w-3.5" />Change PIN</Button>
          </Section>

          {/* Biometric */}
          <Section id="biometric" title="Biometric" isOpen={openSection === "biometric"} onToggle={() => toggleSection("biometric")}>
            <ToggleRow label="Fingerprint" desc="Use fingerprint to unlock" />
            <ToggleRow label="Face ID" desc="Use face recognition to unlock" />
            <ToggleRow label="Windows Hello" desc="Use Windows biometric auth" />
            <ToggleRow label="Touch ID" desc="Use macOS biometric auth" />
          </Section>

          {/* Active Devices */}
          <Section id="devices" title="Active Devices" isOpen={openSection === "devices"} onToggle={() => toggleSection("devices")}>
            <div className="space-y-3">
              {[
                { name: "Windows Laptop", location: "Lagos, Nigeria", lastActive: "Now", icon: <Laptop className="h-4 w-4" /> },
                { name: "Android Phone", location: "Lagos, Nigeria", lastActive: "2h ago", icon: <Phone className="h-4 w-4" /> },
                { name: "iPad", location: "Abuja, Nigeria", lastActive: "3 days ago", icon: <Tablet className="h-4 w-4" /> },
              ].map((d) => (
                <div key={d.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">{d.icon}</div>
                    <div>
                      <p className="text-sm font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.location} &middot; {d.lastActive}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 text-xs">Remove</Button>
                </div>
              ))}
            </div>
          </Section>

          {/* Sessions */}
          <Section id="sessions" title="Sessions" isOpen={openSection === "sessions"} onToggle={() => toggleSection("sessions")}>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">Windows Laptop &middot; Lagos, Nigeria &middot; Active now</p>
              </div>
              <div className="p-3 rounded-lg border">
                <p className="text-sm font-medium">Android Phone</p>
                <p className="text-xs text-muted-foreground">Lagos, Nigeria &middot; 2 hours ago</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-red-500"><AlertTriangle className="mr-1 h-3.5 w-3.5" />Sign out other devices</Button>
          </Section>

          {/* Connected Accounts */}
          <Section id="connected-accounts" title="Connected Accounts" isOpen={openSection === "connected-accounts"} onToggle={() => toggleSection("connected-accounts")}>
            <div className="space-y-3">
              {[
                { name: "Google", connected: true },
                { name: "Apple", connected: false },
                { name: "Microsoft", connected: false },
                { name: "GitHub", connected: false },
                { name: "Notion", connected: false, coming: true },
                { name: "Slack", connected: false, coming: true },
              ].map((a) => (
                <div key={a.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Globe className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      {a.coming && <p className="text-[10px] text-muted-foreground">Coming Soon</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.connected && <Badge variant="outline" className="text-emerald-500 border-emerald-500/30"><Check className="mr-1 h-3 w-3" />Connected</Badge>}
                    <Button variant={a.connected ? "outline" : "default"} size="sm" disabled={a.coming}>
                      {a.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Backup & Sync */}
          <Section id="backup" title="Backup & Sync" isOpen={openSection === "backup"} onToggle={() => toggleSection("backup")}>
            <ToggleRow label="Automatic Backup" desc="Daily cloud backup" defaultChecked />
            <div className="flex gap-2">
              <Button size="sm" variant="outline"><Cloud className="mr-1 h-3.5 w-3.5" />Manual Backup</Button>
              <Button size="sm" variant="outline"><RefreshCw className="mr-1 h-3.5 w-3.5" />Restore Backup</Button>
            </div>
            <p className="text-xs text-muted-foreground">Last backup: Today, 8:00 AM &middot; Cloud status: <span className="text-emerald-500">Synced</span></p>
          </Section>

          {/* Export Data */}
          <Section id="export" title="Export Data" isOpen={openSection === "export"} onToggle={() => toggleSection("export")}>
            <div className="grid gap-2 md:grid-cols-2">
              {["Journal", "Habits", "Tasks", "Goals", "Projects", "Entire Account"].map((item) => (
                <Button key={item} variant="outline" size="sm" className="justify-start"><Download className="mr-1 h-3.5 w-3.5" />Export {item}</Button>
              ))}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Export Format</label>
              <select className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option>PDF</option><option>CSV</option><option>JSON</option></select>
            </div>
          </Section>

          {/* Privacy Controls */}
          <Section id="privacy" title="Privacy Controls" isOpen={openSection === "privacy"} onToggle={() => toggleSection("privacy")}>
            <ToggleRow label="Personalized AI" desc="Allow Téo to learn from your patterns" defaultChecked />
            <ToggleRow label="Analytics" desc="Help improve Intenteo with usage data" defaultChecked />
            <ToggleRow label="Anonymous Usage" desc="Share anonymous usage statistics" />
            <ToggleRow label="Location Access" desc="Allow location for context" />
            <ToggleRow label="Camera Access" desc="Allow camera for photo journals" defaultChecked />
            <ToggleRow label="Microphone Access" desc="Allow mic for voice journals" defaultChecked />
            <ToggleRow label="Notifications" desc="Allow push notifications" defaultChecked />
            <ToggleRow label="Cookies" desc="Accept tracking cookies" defaultChecked />
            <ToggleRow label="Data Sharing" desc="Share data with partners" />
          </Section>

          {/* Danger Zone */}
          <Section id="danger" title="Danger Zone" isOpen={openSection === "danger"} onToggle={() => toggleSection("danger")}>
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-red-500">Irreversible Actions</p>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-500 border-red-500/30 hover:bg-red-500/10"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete all Data</Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-500 border-red-500/30 hover:bg-red-500/10"><Trash2 className="mr-2 h-3.5 w-3.5" />Delete Account</Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-500 border-red-500/30 hover:bg-red-500/10"><AlertTriangle className="mr-2 h-3.5 w-3.5" />Deactivate Account</Button>
            </div>
          </Section>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ═══════════ TAB 3: HELP & SUPPORT ════════════════ */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="help" className="mt-6 space-y-4">

          {/* Help Center */}
          <Section id="help-center" title="Help Center" isOpen={openSection === "help-center"} onToggle={() => toggleSection("help-center")}>
            <div className="grid gap-2 md:grid-cols-2">
              {["Getting Started", "Beginner Guide", "Using Tasks", "Using Habits", "Using Goals", "Using Téo"].map((item) => (
                <button key={item} className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/30 transition-colors text-left text-sm">
                  <BookOpen className="h-4 w-4 text-primary" />{item}
                </button>
              ))}
            </div>
          </Section>

          {/* Video Tutorials */}
          <Section id="video-tutorials" title="Video Tutorials" isOpen={openSection === "video-tutorials"} onToggle={() => toggleSection("video-tutorials")}>
            <div className="grid gap-3 md:grid-cols-2">
              {["Introduction", "Tasks", "Goals", "Habits", "Journal", "Téo", "Calendar", "Review Today"].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Video className="h-4 w-4 text-primary" /></div>
                  <div>
                    <p className="text-sm font-medium">{item}</p>
                    <p className="text-xs text-muted-foreground">Watch tutorial</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* FAQs */}
          <Section id="faqs" title="Frequently Asked Questions" isOpen={openSection === "faqs"} onToggle={() => toggleSection("faqs")}>
            <div className="space-y-2">
              {[
                "How do recurring tasks work?",
                "Can I recover deleted data?",
                "How does Intent Score work?",
                "Can I export journals?",
                "What is My Journey?",
                "Can I change date format?",
              ].map((q) => (
                <div key={q} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors cursor-pointer">
                  <p className="text-sm">{q}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </Section>

          {/* Contact Support */}
          <Section id="contact" title="Contact Support" isOpen={openSection === "contact"} onToggle={() => toggleSection("contact")}>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { label: "Email", icon: <Mail className="h-4 w-4" />, value: "support@intenteo.app" },
                { label: "WhatsApp", icon: <MessageSquare className="h-4 w-4" />, value: "+234 800 123 4567" },
                { label: "Website", icon: <Globe className="h-4 w-4" />, value: "intenteo.app/support" },
                { label: "Live Chat", icon: <Send className="h-4 w-4" />, value: "Coming Soon" },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">{c.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Support Hours: 24/7 &middot; Response Time: Within 24 hours</p>
          </Section>

          {/* Community */}
          <Section id="community" title="Community" isOpen={openSection === "community"} onToggle={() => toggleSection("community")}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: "Instagram", icon: <Globe className="h-4 w-4" /> },
                { name: "Facebook", icon: <Globe className="h-4 w-4" /> },
                { name: "LinkedIn", icon: <Globe className="h-4 w-4" /> },
                { name: "X", icon: <Globe className="h-4 w-4" /> },
                { name: "YouTube", icon: <Video className="h-4 w-4" /> },
                { name: "Discord", icon: <MessageSquare className="h-4 w-4" /> },
                { name: "GitHub", icon: <Globe className="h-4 w-4" /> },
              ].map((s) => (
                <button key={s.name} className="flex items-center gap-2 p-2.5 rounded-lg border hover:bg-muted/30 transition-colors text-sm">
                  {s.icon}{s.name}
                </button>
              ))}
            </div>
          </Section>

          {/* Feedback */}
          <Section id="feedback" title="Feedback" isOpen={openSection === "feedback"} onToggle={() => toggleSection("feedback")}>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { label: "Report Bug", icon: <AlertTriangle className="h-4 w-4" /> },
                { label: "Suggest Feature", icon: <Lightbulb className="h-4 w-4" /> },
                { label: "Request Integration", icon: <Zap className="h-4 w-4" /> },
                { label: "Beta Program", icon: <Sparkles className="h-4 w-4" /> },
                { label: "Rate Intenteo", icon: <Star className="h-4 w-4" /> },
              ].map((f) => (
                <button key={f.label} className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/30 transition-colors text-sm">
                  {f.icon}{f.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Legal */}
          <Section id="legal" title="Legal" isOpen={openSection === "legal"} onToggle={() => toggleSection("legal")}>
            <div className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy", "Licenses", "Open Source"].map((item) => (
                <button key={item} className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors text-sm">
                  <span>{item}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Section>

          {/* About */}
          <Section id="about" title="About Intenteo" isOpen={openSection === "about"} onToggle={() => toggleSection("about")}>
            <GlassCard className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xl font-bold">I</div>
                <div>
                  <h3 className="font-bold text-lg">Intenteo</h3>
                  <p className="text-xs text-muted-foreground">The world&apos;s first AI-powered Intentional Living Platform</p>
                </div>
              </div>
            </GlassCard>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Version</p><p className="font-medium">0.1.0</p></div>
              <div><p className="text-muted-foreground">Build</p><p className="font-medium">2026.07.09</p></div>
              <div><p className="text-muted-foreground">Release Channel</p><p className="font-medium">Stable</p></div>
              <div><p className="text-muted-foreground">Latest Update</p><p className="font-medium">July 9, 2026</p></div>
              <div className="col-span-2"><p className="text-muted-foreground">Developed by</p><p className="font-medium">Glopresc Technologies</p></div>
              <div className="col-span-2"><p className="text-muted-foreground">Copyright</p><p className="font-medium">&copy; 2026 Intenteo. All rights reserved.</p></div>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
