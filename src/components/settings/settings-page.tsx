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
  Wifi, Cloud, RefreshCw, AlertTriangle, Lightbulb, Search,
} from "lucide-react"
import { useTheme } from "next-themes"
import { BarChart3 } from "lucide-react"

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
  const [statsOpen, setStatsOpen] = useState(false)
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2 | 3>(0)
  const [deletePassword, setDeletePassword] = useState("")

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
      if (tabParam === "security") setOpenSection("auth")
    }
  }, [tabParam])

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
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as SettingsTab); if (v === "security") setOpenSection("auth") }} className="w-full">
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
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" className="bg-gradient-to-r from-[#EB9E5B] to-[#EB9E5B]/80 hover:from-[#EB9E5B]/90 hover:to-[#EB9E5B]/70 text-white px-6 shadow-sm">Save Changes</Button>
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

          {/* Section 3: Focus & Productivity */}
          <Section id="focus-productivity" title="Focus & Productivity" isOpen={openSection === "focus-productivity"} onToggle={() => toggleSection("focus-productivity")}>
            <ToggleRow label="Automatically Enter Focus Mode" desc="Activate Focus Mode when a scheduled session begins" />
            <ToggleRow label="Play Completion Sound" desc="Play a subtle sound when a task or habit is completed" defaultChecked />
            <ToggleRow label="Confirm Before Deleting" desc="Ask before permanently deleting items" defaultChecked />
            <ToggleRow label="Carry Unfinished Tasks Forward" desc="Automatically move incomplete tasks to the next day" />
            <ToggleRow label="Enable Daily Review" desc="Show the end-of-day Review Today experience" defaultChecked />
            <ToggleRow label="Show Productivity Score" desc="Display your daily score throughout the app" defaultChecked />
            <ToggleRow label="Show Streak Celebrations" desc="Celebrate streak milestones and achievements" defaultChecked />
          </Section>

          {/* Section 4: Calendar & Notifications (merged) */}
          <Section id="calendar-notif" title="Calendar & Notifications" isOpen={openSection === "calendar-notif"} onToggle={() => toggleSection("calendar-notif")}>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Calendar</p>
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
              </div>
            </div>
            <Separator />
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

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteStep(1)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete Account
            </Button>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ═══════════ TAB 2: PRIVACY & SECURITY ═══════════ */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="security" className="mt-6 space-y-4">

          {/* 1. Authentication */}
          <Section id="auth" title="Authentication" isOpen={openSection === "auth"} onToggle={() => toggleSection("auth")}>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</p>
                <div className="space-y-2 max-w-md">
                  <input type="password" placeholder="Current password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input type="password" placeholder="New password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input type="password" placeholder="Confirm password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <Button size="sm"><Key className="mr-1 h-3.5 w-3.5" />Change Password</Button>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Biometric Authentication</p>
                <ToggleRow label="Enable biometric login" desc="Use Face ID, Touch ID, or Windows Hello to unlock" defaultChecked />
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PIN Lock</p>
                <ToggleRow label="Enable App PIN" desc="Require a 4-digit PIN to open the app" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"><Lock className="mr-1 h-3.5 w-3.5" />Create PIN</Button>
                  <Button size="sm" variant="outline"><Lock className="mr-1 h-3.5 w-3.5" />Change PIN</Button>
                  <Button size="sm" variant="outline" className="text-red-500"><Lock className="mr-1 h-3.5 w-3.5" />Disable PIN</Button>
                </div>
              </div>
            </div>
          </Section>

          {/* 2. Devices & Sessions */}
          <Section id="devices" title="Devices & Sessions" isOpen={openSection === "devices"} onToggle={() => toggleSection("devices")}>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Device</p>
                <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Laptop className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-medium">Chrome</p>
                      <p className="text-xs text-muted-foreground">Windows 11 &middot; Active now</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">Current</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other Devices</p>
                {[
                  { name: "Android Phone", os: "Android 14", lastActive: "2h ago", icon: <Phone className="h-4 w-4" /> },
                  { name: "iPad", os: "iPadOS 17", lastActive: "3 days ago", icon: <Tablet className="h-4 w-4" /> },
                ].map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">{d.icon}</div>
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.os} &middot; {d.lastActive}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 text-xs">Sign Out</Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="text-red-500"><AlertTriangle className="mr-1 h-3.5 w-3.5" />Sign Out Everywhere</Button>
            </div>
          </Section>

          {/* 3. Data & Accounts */}
          <Section id="data" title="Data & Accounts" isOpen={openSection === "data"} onToggle={() => toggleSection("data")}>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connected Accounts</p>
                {[
                  { name: "Google", connected: true },
                  { name: "Apple", connected: false },
                  { name: "GitHub", connected: false },
                ].map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Globe className="h-4 w-4" /></div>
                      <p className="text-sm font-medium">{a.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.connected && <Badge variant="outline" className="text-emerald-500 border-emerald-500/30"><Check className="mr-1 h-3 w-3" />Connected</Badge>}
                      <Button variant={a.connected ? "outline" : "default"} size="sm">{a.connected ? "Disconnect" : "Connect"}</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Backup</p>
                <ToggleRow label="Cloud Backup" desc="Automatically back up my data" defaultChecked />
                <p className="text-xs text-muted-foreground">Last backup: Today, 8:00 AM</p>
                <Button size="sm" variant="outline"><Cloud className="mr-1 h-3.5 w-3.5" />Backup Now</Button>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Export Data</p>
                <Button size="sm" variant="outline"><Download className="mr-1 h-3.5 w-3.5" />Download My Data</Button>
                <p className="text-xs text-muted-foreground">Export journals, goals, habits, reminders and account information.</p>
              </div>
            </div>
          </Section>

          {/* 4. Privacy */}
          <Section id="privacy" title="Privacy" isOpen={openSection === "privacy"} onToggle={() => toggleSection("privacy")}>
            <ToggleRow label="Allow anonymous analytics" desc="Help improve Intenteo with usage data" defaultChecked />
            <ToggleRow label="Allow personalized recommendations" desc="Let Téo tailor suggestions to your patterns" defaultChecked />
            <ToggleRow label="Allow Téo to use activity history" desc="Téo references past actions for smarter guidance" defaultChecked />
            <ToggleRow label="Show profile to accountability partners" desc="Let partners see your progress" />
          </Section>

        </TabsContent>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ═══════════ TAB 3: HELP & SUPPORT ════════════════ */}
        {/* ═══════════════════════════════════════════════════ */}
        <TabsContent value="help" className="mt-6 space-y-4">

          {/* 1. Help Center */}
          <Section id="help-center" title="Help Center" isOpen={openSection === "help-center"} onToggle={() => toggleSection("help-center")}>
            <div className="space-y-1">
              {[
                { icon: <BookOpen className="h-4 w-4" />, label: "Getting Started", desc: "New to Intenteo? Start here" },
                { icon: <Search className="h-4 w-4" />, label: "Search Help Articles", desc: "Find answers to common questions" },
                { icon: <Video className="h-4 w-4" />, label: "Video Tutorials", desc: "Step-by-step video guides" },
                { icon: <HelpCircle className="h-4 w-4" />, label: "Frequently Asked Questions", desc: "Quick answers to popular questions" },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* 2. Contact Us */}
          <Section id="contact" title="Contact Us" isOpen={openSection === "contact"} onToggle={() => toggleSection("contact")}>
            <div className="space-y-1">
              {[
                { icon: <Mail className="h-4 w-4" />, label: "Email Support", desc: "support@intenteo.app" },
                { icon: <Send className="h-4 w-4" />, label: "Live Chat", desc: "Coming Soon" },
                { icon: <MessageSquare className="h-4 w-4" />, label: "WhatsApp Support", desc: "+234 800 123 4567" },
                { icon: <AlertTriangle className="h-4 w-4" />, label: "Report a Bug", desc: "Help us improve Intenteo" },
                { icon: <Lightbulb className="h-4 w-4" />, label: "Send Feedback", desc: "Share your thoughts and suggestions" },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* 3. Community */}
          <Section id="community" title="Community" isOpen={openSection === "community"} onToggle={() => toggleSection("community")}>
            <div className="space-y-1">
              {[
                { icon: <Globe className="h-4 w-4" />, label: "Facebook" },
                { icon: <Globe className="h-4 w-4" />, label: "X (Twitter)" },
                { icon: <Globe className="h-4 w-4" />, label: "Instagram" },
                { icon: <Globe className="h-4 w-4" />, label: "LinkedIn" },
                { icon: <MessageSquare className="h-4 w-4" />, label: "Discord", desc: "Coming Soon" },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* 4. About Intenteo */}
          <Section id="about" title="About Intenteo" isOpen={openSection === "about"} onToggle={() => toggleSection("about")}>
            <div className="space-y-1">
              {[
                { label: "Current App Version", value: "0.1.0" },
                { label: "What's New", value: "July 9, 2026" },
                { label: "Privacy Policy", external: true },
                { label: "Terms & Conditions", external: true },
                { label: "Open Source Licenses", external: true },
              ].map((item) => (
                <button key={item.label} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors text-left">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.value ? (
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm font-semibold">Intenteo</p>
              <p className="text-[11px] text-muted-foreground">Version 0.1.0</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Live with Intentionality.</p>
            </div>
          </Section>
        </TabsContent>
      </Tabs>

      {/* Personal Statistics Modal */}
      {statsOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setStatsOpen(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Personal Statistics</h3>
              <button onClick={() => setStatsOpen(false)} className="h-7 w-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground text-sm">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🔥", label: "Current Streak", value: "32 Days" },
                { icon: "✦", label: "Intent Score", value: "85" },
                { icon: "🎯", label: "Goals Completed", value: "12" },
                { icon: "📅", label: "Days Active", value: "156" },
              ].map(s => (
                <div key={s.label} className="text-center p-4 rounded-xl border bg-muted/20">
                  <span className="text-xl block mb-1">{s.icon}</span>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 1: Confirmation */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteStep(0); setDeletePassword("") }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Delete Account?</h3>
            <p className="text-sm text-muted-foreground">This action is permanent.</p>
            <p className="text-sm text-muted-foreground">Deleting your Intenteo account will permanently remove your goals, tasks, habits, journals, reminders, settings, and all associated data.</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Cancel</Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteStep(2)}>Delete Account</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 2: Password */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteStep(0); setDeletePassword("") }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Confirm your password</h3>
            <p className="text-sm text-muted-foreground">Enter your password to continue.</p>
            <input
              type="password"
              placeholder="Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Cancel</Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10" disabled={!deletePassword} onClick={() => setDeleteStep(3)}>Continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 3: Final Confirmation */}
      {deleteStep === 3 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteStep(0); setDeletePassword("") }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Are you absolutely sure?</h3>
            <p className="text-sm text-muted-foreground">This permanently deletes your Intenteo account and all data.</p>
            <p className="text-sm text-muted-foreground">This cannot be reversed.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Keep My Account</Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Permanently Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
