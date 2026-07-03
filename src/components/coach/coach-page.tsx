"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sparkles,
  Send,
  Lightbulb,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  Zap,
  BookOpen,
  Heart,
  ArrowRight,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm Téo, your AI intentional living coach. I'm here to help you become the person you aspire to be. How can I support you today?",
    timestamp: new Date(Date.now() - 60000),
  },
]

const suggestions = [
  { icon: <Target className="h-4 w-4" />, label: "Review my goals", color: "from-blue-400 to-cyan-500" },
  { icon: <Brain className="h-4 w-4" />, label: "Help me make a decision", color: "from-purple-400 to-pink-500" },
  { icon: <TrendingUp className="h-4 w-4" />, label: "Analyze my patterns", color: "from-emerald-400 to-green-500" },
  { icon: <Calendar className="h-4 w-4" />, label: "Plan my week", color: "from-amber-400 to-orange-500" },
  { icon: <Heart className="h-4 w-4" />, label: "Check my wellbeing", color: "from-rose-400 to-red-500" },
  { icon: <Lightbulb className="h-4 w-4" />, label: "Give me an insight", color: "from-violet-400 to-purple-500" },
]

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
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand. Let me think about that... Based on your recent patterns and goals, here's what I suggest: focus on aligning your daily actions with your long-term vision. Your Intent Score has been improving steadily. Keep up the intentional living!",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
    }, 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Coach</h1>
          <p className="text-muted-foreground">Your personal intentional living guide</p>
        </div>
        <Badge variant="outline" className="w-fit">
          <Sparkles className="mr-2 h-4 w-4 text-primary" />
          Powered by Téo
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Téo</CardTitle>
                  <p className="text-sm text-muted-foreground">Always here to help</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8">
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
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask Téo anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1"
                />
                <Button onClick={handleSend} size="icon">
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
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center gap-2"
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${suggestion.color} text-white`}>
                      {suggestion.icon}
                    </div>
                    <span className="text-xs text-center">{suggestion.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI Insights</CardTitle>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
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
