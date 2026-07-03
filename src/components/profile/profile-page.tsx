"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { GlassCard } from "@/components/ui/glass-card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Settings,
  Shield,
  Download,
  Trash2,
  Target,
  BookOpen,
  CheckSquare,
  Repeat,
  Trophy,
  Calendar,
  Heart,
  Zap,
  Star,
  TrendingUp,
  Award,
  Globe,
  Palette,
  Clock,
  ArrowRight,
  Edit,
  Camera,
} from "lucide-react"

const achievements = [
  { name: "Early Adopter", icon: <Star className="h-5 w-5" />, color: "from-amber-400 to-orange-500" },
  { name: "30-Day Streak", icon: <Flame className="h-5 w-5" />, color: "from-orange-400 to-red-500" },
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

export function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Your intentional living journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="relative">
            <UserAvatar size="2xl" fallback="JD" />
            <Button
              size="icon"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
            >
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
            <div className="flex items-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">85</p>
                <p className="text-xs text-muted-foreground">Intent Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">78%</p>
                <p className="text-xs text-muted-foreground">Productivity</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">32</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Life Vision */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Life Vision</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Become a successful entrepreneur who helps millions of people live with intentionality.
            I wake up each day with purpose and go to bed with gratitude. I am physically fit,
            financially free, and deeply connected with my loved ones.
          </p>
          <Button variant="link" className="mt-2 p-0">
            Edit Vision <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {stat.icon}
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${achievement.color} text-white`}>
                    {achievement.icon}
                  </div>
                  <span className="text-sm font-medium">{achievement.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Life Wheel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Life Wheel Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <ProgressRing value={77} size={120} strokeWidth={8} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Health", score: 75 },
                { name: "Career", score: 85 },
                { name: "Finance", score: 60 },
                { name: "Relationships", score: 80 },
                { name: "Faith", score: 70 },
                { name: "Learning", score: 90 },
                { name: "Mental Health", score: 75 },
                { name: "Fun", score: 65 },
              ].map((dim) => (
                <div key={dim.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{dim.name}</span>
                  <span className="font-medium">{dim.score}/100</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mood Trend (7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32">
              {[4, 5, 3, 4, 5, 4, 5].map((mood, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 rounded-t-lg bg-gradient-to-t from-primary to-primary/50"
                    style={{ height: `${mood * 20}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { label: "Security & Privacy", icon: <Shield className="h-4 w-4" /> },
              { label: "Connected Accounts", icon: <Globe className="h-4 w-4" /> },
              { label: "Theme & Appearance", icon: <Palette className="h-4 w-4" /> },
              { label: "Notifications", icon: <Bell className="h-4 w-4" /> },
              { label: "Time Zone", icon: <Clock className="h-4 w-4" /> },
              { label: "Delete Account", icon: <Trash2 className="h-4 w-4" />, danger: true },
            ].map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                className={`justify-start ${link.danger ? "text-red-500 hover:text-red-600" : ""}`}
              >
                {link.icon}
                <span className="ml-2">{link.label}</span>
                <ArrowRight className="ml-auto h-4 w-4" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Flame(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function Bell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
