"use client"

import React, { useState, useMemo, useCallback } from "react"
import { Search, ArrowLeft, BookOpen, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Article {
  id: string
  title: string
  category: string
  content: string
}

const ARTICLES: Article[] = [
  { id: "create-goal", title: "How to create your first Goal", category: "Getting Started", content: "Goals help you track meaningful outcomes over time. To create a goal, navigate to the Goals page and tap the + button. Give your goal a clear title, set a target date, and optionally link it to habits or projects. You can track progress manually or let linked habits update it automatically. Goals with a health score above 75% are considered On Track." },
  { id: "reminders-work", title: "How reminders work", category: "Getting Started", content: "Reminders let you schedule quick notes for specific dates. Use the Quick Reminder on the Today page or the bell icon in the toolbar. Reminders appear in the Reminders panel with smart labels like Today, Tomorrow, or Overdue. You can convert any reminder into a task with one tap." },
  { id: "intent-score", title: "Understanding Intent Score", category: "Getting Started", content: "Your Intent Score is a composite metric (0–100) that reflects how intentionally you're living. It considers task completion, habit consistency, goal progress, and journal reflection. A score above 80 indicates strong alignment with your life vision." },
  { id: "managing-habits", title: "Managing habits", category: "Habits", content: "Habits are recurring actions you want to build. Create them from the Habits page, set a frequency (daily, weekly, custom), and track completions. Each habit has a streak counter, health indicator, and trend arrow. Use the recovery system if you miss a day — you can Recover Streak or Accept Miss with a penalty." },
  { id: "recover-deleted", title: "Recovering deleted tasks", category: "Tasks", content: "When you delete a task, it's moved to a soft-delete state for 30 days. During this period, you can recover it from the task history. After 30 days, it's permanently removed. Enable the Confirm Before Deleting toggle in Settings > Focus & Productivity for extra safety." },
  { id: "review-today", title: "Using Review Today", category: "Tasks", content: "Review Today is your end-of-day reflection. It shows what you accomplished, what's left, and provides insights. Open it from the Today page or let Téo prompt you at your preferred time. Completing a review earns you reflection points and improves your Intent Score." },
  { id: "customizing-teo", title: "Customizing Téo", category: "Téo AI", content: "Téo is your AI coach. Customize its personality in Settings > Téo Preferences. Choose from Friendly, Direct, Motivational, or Analytical styles. Enable Morning Briefing for daily insights, Evening Review for reflection prompts, and Proactive Suggestions for context-aware recommendations." },
  { id: "focus-mode", title: "Using Focus Mode", category: "Tasks", content: "Focus Mode helps you concentrate on one task at a time. Start it from any task's menu. You'll get a timer, ambient sounds, and distraction-free interface. Focus sessions are tracked and contribute to your productivity score." },
  { id: "calendar-overview", title: "How Calendar works", category: "Calendar", content: "The Calendar page shows your tasks, habits, and reminders in a unified view. Switch between day, week, and month views. Tasks with due dates appear on their scheduled day. Habit completions are marked with checkmarks. Reminders show as notification pins." },
  { id: "reports-exports", title: "Understanding Reports & Exports", category: "Getting Started", content: "Reports & Exports is your reflection and analytics workspace. It provides overview stats, reports on goals/habits/visions, insights into your progress, and export tools for your data. Use it to review your intentional living journey and generate reports." },
  { id: "life-vision", title: "Setting your Life Vision", category: "Getting Started", content: "Your Visions are defined in the Visions page. Create multiple visions for different areas of your life (Career, Family, Finance, Health, Impact, etc.). Each vision can have a Vision Board with images, quotes, Bible verses, videos, links, and notes for inspiration. Link goals to visions in the Goals page to see how your actions connect to your long-term purpose." },
  { id: "task-priorities", title: "Understanding task priorities", category: "Tasks", content: "Tasks have three priority levels: Must (critical), Should (important), and Progress (nice to have). Priorities affect sorting and how Téo suggests your daily focus. Use Must for time-sensitive items and Progress for background improvements." },
]

const CATEGORIES = ["All", "Getting Started", "Tasks", "Habits", "Calendar", "Téo AI"]

function ArticleReader({ article, onBack }: { article: Article; onBack: () => void }) {
  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3 w-3" />
        Back to articles
      </button>
      <div className="p-4 rounded-xl border bg-muted/20">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{article.category}</span>
        <h3 className="text-sm font-semibold mt-1 mb-2">{article.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{article.content}</p>
      </div>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-2.5 w-1/2 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HelpCenter() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchesCategory = selectedCategory === "All" || a.category === selectedCategory
      const matchesSearch = !search.trim() || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, selectedCategory])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    setSelectedArticle(null)
  }, [])

  if (loading) return <SkeletonLoader />

  if (selectedArticle) {
    return <ArticleReader article={selectedArticle} onBack={() => setSelectedArticle(null)} />
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search Help..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedArticle(null) }}
            className={cn(
              "px-2.5 py-1 text-[11px] font-medium rounded-full whitespace-nowrap transition-colors shrink-0",
              selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        {filteredArticles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No articles found matching &quot;{search}&quot;</p>
        ) : (
          filteredArticles.map((article) => (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors text-left"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{article.title}</p>
                <p className="text-[11px] text-muted-foreground">{article.category}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
