"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Send,
  Lightbulb,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  BookOpen,
  Heart,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  BarChart3,
  ListChecks,
  Zap,
} from "lucide-react"
import { TeoIcon } from "@/components/ui/teo-icon"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const promptChips = [
  { icon: <Calendar className="h-4 w-4" />, label: "Plan my day", color: "from-blue-400 to-cyan-500" },
  { icon: <RefreshCw className="h-4 w-4" />, label: "Review my habits", color: "from-emerald-400 to-green-500" },
  { icon: <Target className="h-4 w-4" />, label: "Help me reach my goals", color: "from-amber-400 to-orange-500" },
  { icon: <BookOpen className="h-4 w-4" />, label: "Summarize my journal", color: "from-violet-400 to-purple-500" },
  { icon: <Zap className="h-4 w-4" />, label: "What's my next best action?", color: "from-rose-400 to-red-500" },
  { icon: <BarChart3 className="h-4 w-4" />, label: "How can I improve my Intent Score?", color: "from-indigo-400 to-blue-500" },
  { icon: <Brain className="h-4 w-4" />, label: "Help me build a better routine", color: "from-cyan-400 to-teal-500" },
  { icon: <ListChecks className="h-4 w-4" />, label: "Review my week", color: "from-pink-400 to-rose-500" },
]

const quickActions = [
  { icon: <Calendar className="h-4 w-4" />, label: "Plan My Day" },
  { icon: <RefreshCw className="h-4 w-4" />, label: "Review Habits" },
  { icon: <MessageSquare className="h-4 w-4" />, label: "Weekly Reflection" },
  { icon: <Target className="h-4 w-4" />, label: "Goal Check-in" },
  { icon: <Zap className="h-4 w-4" />, label: "Next Best Action" },
  { icon: <BookOpen className="h-4 w-4" />, label: "Journal Review" },
]

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: `Hi, I'm Téo.

I'm here to help you live more intentionally—not just get more done.

I can help you:

• Plan your day
• Build lasting habits
• Reach your goals
• Reflect through journaling
• Make better decisions
• Stay aligned with your Life Vision`,
  timestamp: new Date(),
}

const insights = [
  {
    title: "Mood Pattern Detected",
    description: "Your mood tends to be 23% higher on days when you complete your morning journal and exercise.",
    action: "View Analysis",
  },
  {
    title: "Goal Alignment Alert",
    description: "You haven't worked on your 'Read 24 Books' goal this week. Would you like to adjust the timeline?",
    action: "Adjust Goal",
  },
  {
    title: "Energy Optimization",
    description: "Based on your data, your peak focus hours are 9-11 AM. Consider scheduling deep work during this time.",
    action: "Optimize Schedule",
  },
]

export function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [inputValue, setInputValue] = useState("")
  const [showWelcome, setShowWelcome] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (text?: string) => {
    const content = text || inputValue
    if (!content.trim()) return

    setShowWelcome(false)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "That's a great question. Based on your recent patterns and goals, here's what I recommend: focus on aligning your daily actions with your long-term vision. Your Intent Score has been improving steadily—keep up the intentional living! What else can I help you with?",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1500)
  }

  const handleChipClick = (label: string) => {
    setInputValue(label)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Talk with Téo</h1>
          <p className="text-muted-foreground">Your personal guide for intentional living.</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <TeoIcon size="xs" className="mr-2" />
          Téo
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
                  <TeoIcon size="sm" />
                </div>
                <div>
                  <CardTitle className="text-lg">Téo</CardTitle>
                  <p className="text-sm text-muted-foreground">Your intentional living companion</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div ref={scrollRef} className="p-4 space-y-4">
                  {messages.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4 overflow-hidden">
                        <TeoIcon size="xl" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Every intentional life starts with one conversation.</h3>
                      <p className="text-muted-foreground">What would you like to work on today?</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.role === "assistant" && (
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white text-xs">
                              T
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Prompt Chips (when only welcome or empty) */}
                {messages.length <= 1 && showWelcome && (
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {promptChips.map((chip, i) => (
                        <button
                          key={i}
                          onClick={() => handleChipClick(chip.label)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border bg-background hover:bg-muted transition-colors"
                        >
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${chip.color} text-white`}>
                            {chip.icon}
                          </div>
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Téo anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={() => handleSend()} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                    onClick={() => handleChipClick(action.label)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary">
                      {action.icon}
                    </div>
                    <span className="text-xs text-center">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Téo&apos;s Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2">
                          {insight.action} <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Téo's Status */}
          <GlassCard variant="primary" className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden">
                <TeoIcon size="sm" />
              </div>
              <div>
                <p className="font-medium">Téo is learning</p>
                <p className="text-xs text-muted-foreground">
                  Analyzing your patterns to provide better insights
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
