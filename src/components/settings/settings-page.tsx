"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GlassCard } from "@/components/ui/glass-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Separator } from "@/components/ui/separator"
import {
  User, Bell, Palette, Shield, Globe, Moon, Sun, Monitor,
  Lock, Key, Download, Trash2, Mail, Smartphone, Check, Camera,
  Edit, Star, BookOpen, CheckSquare, Repeat, Trophy, Target,
  Zap, Award, Sparkles, Brain, Database, Info,
} from "lucide-react"
import { useTheme } from "next-themes"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "appearance")

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam)
  }, [tabParam])

  const achievements = [
    { name: "Early Adopter", icon: <Star className="h-5 w-5" />, color: "from-amber-400 to-orange-500" },
    { name: "30-Day Streak", icon: <Zap className="h-5 w-5" />, color: "from-orange-400 to-red-500" },
    { name: "Goal Crusher", icon: <Target className="h-5 w-5" />, color: "from-emerald-400 to-green-500" },
    { name: "Journal Master", icon: <BookOpen className="h-5 w-5" />, color: "from-blue-400 to-cyan-500" },
  ]

  const stats = [
    { label: "Journal Entries", value: 156, icon: <BookOpen className="h-4 w-4" /> },
    { label: "Tasks Completed", value: 423, icon: <CheckSquare className="h-4 w-4" /> },
    { label: "Habits Built", value: 28, icon: <Repeat className="h-4 w-4" /> },
    { label: "Challenges Won", value: 12, icon: <Trophy className="h-4 w-4" /> },
  ]

  const values = ["Growth", "Integrity", "Creativity", "Compassion", "Excellence"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your Intenteo experience</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security & Privacy
          </TabsTrigger>
          <TabsTrigger value="account">
            <Globe className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative">
                <UserAvatar size="2xl" fallback="JD" />
                <Button size="icon" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">John Doe</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mt-1">
                  Building products that help people live with intentionality.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {values.map((value) => (
                    <Badge key={value} variant="outline">{value}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-muted-foreground">John Doe</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">john@example.com</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <p className="text-muted-foreground">San Francisco, CA</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <p className="text-muted-foreground">PST (UTC-8)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((a) => (
                  <div key={a.name} className={`p-4 rounded-xl bg-gradient-to-br ${a.color} text-white text-center`}>
                    <div className="flex justify-center mb-2">{a.icon}</div>
                    <p className="text-sm font-medium">{a.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-xl bg-muted/30">
                    <div className="flex justify-center text-muted-foreground mb-2">{s.icon}</div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appearance Tab ── */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Button variant={theme === "light" ? "default" : "outline"} className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setTheme("light")}>
                  <Sun className="h-6 w-6" /><span>Light</span>
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setTheme("dark")}>
                  <Moon className="h-6 w-6" /><span>Dark</span>
                </Button>
                <Button variant={theme === "system" ? "default" : "outline"} className="h-auto py-4 flex flex-col items-center gap-2" onClick={() => setTheme("system")}>
                  <Monitor className="h-6 w-6" /><span>System</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Accent Color</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {["var(--brand-primary)", "var(--brand-secondary)", "#16A34A", "#F59E0B", "#EF4444", "#EC4899"].map((color) => (
                  <button key={color} className="h-10 w-10 rounded-full border-2 border-transparent hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Glass Mode", desc: "Enable glassmorphism effects", default: true },
                { label: "Animations", desc: "Enable smooth transitions", default: true },
                { label: "Compact Mode", desc: "Reduce spacing for more content", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: <Bell className="h-5 w-5" />, label: "Push Notifications", desc: "Receive alerts on your device", default: true },
                { icon: <Mail className="h-5 w-5" />, label: "Email Notifications", desc: "Daily digest and important alerts", default: true },
                { icon: <Smartphone className="h-5 w-5" />, label: "SMS Notifications", desc: "Critical reminders only", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">{item.icon}</div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Daily Reminders", desc: "Morning intention and evening reflection", default: true },
                { label: "Habit Alerts", desc: "Reminders to complete your habits", default: true },
                { label: "Goal Updates", desc: "Progress on your goals", default: true },
                { label: "AI Insights", desc: "Personalized recommendations from Téo", default: true },
                { label: "Social Updates", desc: "Accountability partner activity", default: false },
                { label: "Marketing", desc: "Product updates and tips", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security & Privacy Tab ── */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: <Lock className="h-5 w-5" />, label: "PIN Lock", desc: "Require PIN to open the app" },
                { icon: <Key className="h-5 w-5" />, label: "Biometric Auth", desc: "Use fingerprint or face ID" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">{item.icon}</div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" /> Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" /> Backup to Cloud
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Account Tab ── */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "Google", connected: true },
                { name: "Apple", connected: false },
                { name: "GitHub", connected: false },
              ].map((account) => (
                <div key={account.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <Globe className="h-5 w-5" />
                    </div>
                    <p className="font-medium">{account.name}</p>
                  </div>
                  <Button variant={account.connected ? "outline" : "default"} size="sm">
                    {account.connected ? <><Check className="mr-2 h-4 w-4" /> Connected</> : "Connect"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Enable AI Coach", desc: "Receive personalized guidance from Téo", default: true },
                { label: "Coach Frequency", desc: "Daily check-ins", default: true },
                { label: "Share Mood Data", desc: "Allow AI to use mood patterns", default: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About Intenteo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Version 0.1.0</p>
                <p className="text-muted-foreground">Built with Next.js 16.2</p>
                <p className="text-muted-foreground">The world&apos;s first AI-powered Intentional Living Platform.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
