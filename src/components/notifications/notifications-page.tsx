"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  Search,
  Check,
  CheckCheck,
  Trash2,
  Archive,
  Settings,
  Sparkles,
  Target,
  Calendar,
  Trophy,
  Users,
  Clock,
  Star,
  Zap,
  BookOpen,
  Filter,
  MoreHorizontal,
  BellRing,
  Mail,
  AlertCircle,
  Info,
} from "lucide-react"

interface Notification {
  id: string
  icon: React.ReactNode
  title: string
  message: string
  timestamp: string
  read: boolean
  category: string
  actionLabel?: string
  actionUrl?: string
  color: string
}

const sampleNotifications: Notification[] = [
  {
    id: "1",
    icon: <Sparkles className="h-5 w-5" />,
    title: "Téo has a plan for you",
    message: "Your AI coach has prepared today's personalized plan based on your goals and energy patterns.",
    timestamp: "2 min ago",
    read: false,
    category: "ai",
    actionLabel: "View Plan",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "2",
    icon: <Zap className="h-5 w-5" />,
    title: "Streak Extended!",
    message: "Congratulations! You've extended your morning journal streak to 13 days. Keep the momentum!",
    timestamp: "15 min ago",
    read: false,
    category: "achievements",
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    id: "3",
    icon: <Target className="h-5 w-5" />,
    title: "Goal Deadline Tomorrow",
    message: "Your 'Complete Q2 Strategy Document' goal is due tomorrow. You're 85% done.",
    timestamp: "1 hour ago",
    read: false,
    category: "reminders",
    actionLabel: "View Goal",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: "4",
    icon: <BookOpen className="h-5 w-5" />,
    title: "Reflection Reminder",
    message: "Take a moment to reflect on your day. What went well? What could be improved?",
    timestamp: "3 hours ago",
    read: true,
    category: "reminders",
    actionLabel: "Write Reflection",
    color: "text-indigo-500 bg-indigo-500/10",
  },
  {
    id: "5",
    icon: <Calendar className="h-5 w-5" />,
    title: "Meeting in 30 minutes",
    message: "Team Standup starts at 11:00 AM. Don't forget to prepare your updates.",
    timestamp: "30 min ago",
    read: false,
    category: "calendar",
    actionLabel: "Join Meeting",
    color: "text-cyan-500 bg-cyan-500/10",
  },
  {
    id: "6",
    icon: <Trophy className="h-5 w-5" />,
    title: "Challenge Completed!",
    message: "You've completed the 7-Day Meditation Challenge! Your XP has been updated.",
    timestamp: "Yesterday",
    read: true,
    category: "challenges",
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    id: "7",
    icon: <Users className="h-5 w-5" />,
    title: "Accountability Update",
    message: "Sarah completed the Morning Routine challenge. Send her a congratulation!",
    timestamp: "Yesterday",
    read: true,
    category: "accountability",
    actionLabel: "Send Message",
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    id: "8",
    icon: <Sparkles className="h-5 w-5" />,
    title: "Monthly Review Ready",
    message: "Your June monthly review is ready. See your progress and insights.",
    timestamp: "2 days ago",
    read: true,
    category: "ai",
    actionLabel: "View Review",
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    id: "9",
    icon: <Bell className="h-5 w-5" />,
    title: "System Update",
    message: "Intenteo has been updated with new features including the Decision Journal.",
    timestamp: "3 days ago",
    read: true,
    category: "system",
    color: "text-gray-500 bg-gray-500/10",
  },
  {
    id: "10",
    icon: <Star className="h-5 w-5" />,
    title: "Achievement Unlocked",
    message: "You've earned the 'Consistency King' badge for completing 30 consecutive days!",
    timestamp: "5 days ago",
    read: true,
    category: "achievements",
    color: "text-yellow-500 bg-yellow-500/10",
  },
]

const categories = [
  { id: "all", label: "All", icon: <Bell className="h-4 w-4" /> },
  { id: "unread", label: "Unread", icon: <Mail className="h-4 w-4" /> },
  { id: "mentions", label: "Mentions", icon: <AlertCircle className="h-4 w-4" /> },
  { id: "reminders", label: "Reminders", icon: <Clock className="h-4 w-4" /> },
  { id: "achievements", label: "Achievements", icon: <Trophy className="h-4 w-4" /> },
  { id: "ai", label: "AI Coach", icon: <Sparkles className="h-4 w-4" /> },
  { id: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
  { id: "challenges", label: "Challenges", icon: <Target className="h-4 w-4" /> },
  { id: "accountability", label: "Accountability", icon: <Users className="h-4 w-4" /> },
  { id: "system", label: "System", icon: <Info className="h-4 w-4" /> },
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || n.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 text-sm font-medium ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
            {cat.id === "unread" && unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <BellRing className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No notifications</h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {searchQuery ? "Try a different search term" : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${notification.color}`}>
                      {notification.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                        {notification.actionLabel && (
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
