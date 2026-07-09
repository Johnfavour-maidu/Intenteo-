"use client"
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  FileText,
  Target,
  Repeat,
  CheckSquare,
  BookOpen,
  ArrowRight,
  Bell,
  Calendar,
  Settings,
  Home,
  LayoutGrid,
  Zap,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  category: string
  type: "task" | "habit" | "goal" | "journal" | "project" | "reminder" | "review" | "page" | "command"
  icon: React.ReactNode
  href?: string
  action?: () => void
}

interface UniversalSearchProps {
  open: boolean
  onClose: () => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  Tasks: <CheckSquare className="h-4 w-4" />,
  Habits: <Repeat className="h-4 w-4" />,
  Goals: <Target className="h-4 w-4" />,
  Journal: <BookOpen className="h-4 w-4" />,
  Projects: <FileText className="h-4 w-4" />,
  Milestones: <FileText className="h-4 w-4" />,
  Reminders: <Bell className="h-4 w-4" />,
  Reviews: <Calendar className="h-4 w-4" />,
  Pages: <LayoutGrid className="h-4 w-4" />,
  Commands: <Zap className="h-4 w-4" />,
}

function loadSearchData(): SearchResult[] {
  const results: SearchResult[] = []

  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        results.push({
          id: `task-${task.id}`,
          title: task.title || task.name || "Untitled Task",
          category: "Tasks",
          type: "task",
          icon: <CheckSquare className="h-4 w-4" />,
          href: `/tasks?highlight=${task.id}`,
        })
      }
    }
  } catch {}

  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
    if (Array.isArray(habits)) {
      for (const habit of habits) {
        results.push({
          id: `habit-${habit.id}`,
          title: habit.name || habit.title || "Untitled Habit",
          category: "Habits",
          type: "habit",
          icon: <Repeat className="h-4 w-4" />,
          href: `/habits?highlight=${habit.id}`,
        })
      }
    }
  } catch {}

  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        results.push({
          id: `goal-${goal.id}`,
          title: goal.title || goal.name || "Untitled Goal",
          category: "Goals",
          type: "goal",
          icon: <Target className="h-4 w-4" />,
          href: `/goals?highlight=${goal.id}`,
        })
        if (Array.isArray(goal.projects)) {
          for (const project of goal.projects) {
            results.push({
              id: `project-${project.id}`,
              title: project.title || project.name || "Untitled Project",
              category: "Projects",
              type: "project",
              icon: <FileText className="h-4 w-4" />,
              href: `/goals?tab=projects&highlight=${project.id}`,
            })
            if (Array.isArray(project.milestones)) {
              for (const milestone of project.milestones) {
                results.push({
                  id: `milestone-${milestone.id}`,
                  title: milestone.title || "Untitled Milestone",
                  category: "Milestones",
                  type: "goal",
                  icon: <FileText className="h-4 w-4" />,
                  href: `/goals?tab=projects&highlight=${project.id}`,
                })
              }
            }
          }
        }
      }
    }
  } catch {}

  try {
    const entries = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]")
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        results.push({
          id: `journal-${entry.id}`,
          title: entry.title || entry.prompt || "Journal Entry",
          category: "Journal",
          type: "journal",
          icon: <BookOpen className="h-4 w-4" />,
          href: `/journal?highlight=${entry.id}`,
        })
      }
    }
  } catch {}

  try {
    const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
    if (Array.isArray(reminders)) {
      for (const reminder of reminders) {
        results.push({
          id: `reminder-${reminder.id}`,
          title: reminder.title || "Reminder",
          category: "Reminders",
          type: "reminder",
          icon: <Bell className="h-4 w-4" />,
          href: `/calendar`,
        })
      }
    }
  } catch {}

  try {
    const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
    if (Array.isArray(reviews)) {
      for (const review of reviews) {
        results.push({
          id: `review-${review.date}`,
          title: `Review — ${review.date}`,
          category: "Reviews",
          type: "review",
          icon: <Calendar className="h-4 w-4" />,
          href: `/calendar`,
        })
      }
    }
  } catch {}

  results.push(
    {
      id: "page-today",
      title: "Today",
      category: "Pages",
      type: "page",
      icon: <Home className="h-4 w-4" />,
      href: "/",
    },
    {
      id: "page-tasks",
      title: "Tasks",
      category: "Pages",
      type: "page",
      icon: <CheckSquare className="h-4 w-4" />,
      href: "/tasks",
    },
    {
      id: "page-habits",
      title: "Habits",
      category: "Pages",
      type: "page",
      icon: <Repeat className="h-4 w-4" />,
      href: "/habits",
    },
    {
      id: "page-goals",
      title: "Goals",
      category: "Pages",
      type: "page",
      icon: <Target className="h-4 w-4" />,
      href: "/goals",
    },
    {
      id: "page-journal",
      title: "Journal",
      category: "Pages",
      type: "page",
      icon: <BookOpen className="h-4 w-4" />,
      href: "/journal",
    },
    {
      id: "page-calendar",
      title: "Calendar",
      category: "Pages",
      type: "page",
      icon: <Calendar className="h-4 w-4" />,
      href: "/calendar",
    },
    {
      id: "page-settings",
      title: "Settings",
      category: "Pages",
      type: "page",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
    }
  )

  return results
}

const categoryOrder = [
  "Pages",
  "Commands",
  "Tasks",
  "Habits",
  "Goals",
  "Projects",
  "Milestones",
  "Journal",
  "Reminders",
  "Reviews",
]

export function UniversalSearch({ open, onClose }: UniversalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)

  const data = useMemo(() => (open ? loadSearchData() : []), [open])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    let items = data

    if (q) {
      items = data.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      )
    }

    return items
  }, [data, query])

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const result of filtered) {
      if (!groups[result.category]) groups[result.category] = []
      groups[result.category].push(result)
    }
    return groups
  }, [filtered])

  const flatResults = useMemo(() => filtered, [filtered])

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const selectItem = useCallback(
    (result: SearchResult) => {
      if (result.action) {
        result.action()
      } else if (result.href) {
        router.push(result.href)
      }
      onClose()
    },
    [router, onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        const item = flatResults[selectedIndex]
        if (item) selectItem(item)
      } else if (e.key === "Escape") {
        onClose()
      }
    },
    [flatResults, selectedIndex, selectItem, onClose]
  )

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  useEffect(() => {
    if (!dropdownRef.current) return
    const items = dropdownRef.current.querySelectorAll("[data-result]")
    items[selectedIndex]?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  let runningIndex = -1

  return (
    <div className="relative">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => open && undefined}
          placeholder="Search anything..."
          className={cn(
            "w-full border-2 border-[#1E0E6B]/20 rounded-xl bg-background pl-10 pr-4 py-2.5 text-sm outline-none",
            "placeholder:text-muted-foreground transition-all duration-200",
            "focus:border-[#1E0E6B]/40 focus:ring-2 focus:ring-[#1E0E6B]/10",
            "hover:border-[#1E0E6B]/30"
          )}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setSelectedIndex(0)
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showTooltip && !open && !query && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50"
          >
            <div className="flex items-center gap-1.5 rounded-lg bg-foreground text-background px-2.5 py-1 text-[11px] font-medium shadow-lg">
              Press{" "}
              <kbd className="rounded bg-background/20 px-1 py-0.5 text-[10px] font-semibold">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="rounded bg-background/20 px-1 py-0.5 text-[10px] font-semibold">
                K
              </kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-[50vh] overflow-y-auto">
              {flatResults.length === 0 ? (
                <div className="py-12 text-center">
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No results found
                  </p>
                </div>
              ) : (
                categoryOrder.map((category) => {
                  const items = grouped[category]
                  if (!items || items.length === 0) return null
                  return (
                    <div key={category}>
                      <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground border-b border-border/50">
                        {categoryIcons[category]}
                        {category}
                        <span className="ml-auto text-muted-foreground/60">
                          {items.length}
                        </span>
                      </div>
                      {items.map((result) => {
                        runningIndex++
                        const idx = runningIndex
                        const isSelected = idx === selectedIndex
                        return (
                          <button
                            key={result.id}
                            data-result
                            onClick={() => selectItem(result)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                              isSelected
                                ? "bg-[#1E0E6B]/10 text-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <span
                              className={cn(
                                "shrink-0",
                                isSelected
                                  ? "text-[#1E0E6B]"
                                  : "text-muted-foreground"
                              )}
                            >
                              {result.icon}
                            </span>
                            <span className="flex-1 truncate text-left">
                              {result.title}
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                isSelected
                                  ? "bg-[#1E0E6B]/15 text-[#1E0E6B]"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {result.category}
                            </span>
                            {isSelected && (
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#1E0E6B]" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>

            <div className="flex items-center gap-4 px-4 py-2 border-t text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5">
                  ↑↓
                </kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5">
                  ↵
                </kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1 py-0.5">
                  esc
                </kbd>
                close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
