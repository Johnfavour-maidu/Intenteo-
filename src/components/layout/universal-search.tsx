"use client"
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, FileText, Target, Repeat, CheckSquare, BookOpen, ArrowRight, Command } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  category: string
  type: "task" | "habit" | "goal" | "journal" | "project"
  icon: React.ReactNode
  href: string
}

interface UniversalSearchProps {
  open: boolean
  onClose: () => void
}

const categoryIcons: Record<string, React.ReactNode> = {
  tasks: <CheckSquare className="h-4 w-4" />,
  habits: <Repeat className="h-4 w-4" />,
  goals: <Target className="h-4 w-4" />,
  journal: <BookOpen className="h-4 w-4" />,
  projects: <FileText className="h-4 w-4" />,
}

const typeToIcon: Record<string, React.ReactNode> = {
  task: <CheckSquare className="h-4 w-4" />,
  habit: <Repeat className="h-4 w-4" />,
  goal: <Target className="h-4 w-4" />,
  journal: <BookOpen className="h-4 w-4" />,
  project: <FileText className="h-4 w-4" />,
}

const typeToHref: Record<string, (id: string) => string> = {
  task: (id) => `/tasks?highlight=${id}`,
  habit: (id) => `/habits?highlight=${id}`,
  goal: (id) => `/goals?highlight=${id}`,
  journal: (id) => `/journal?highlight=${id}`,
  project: (id) => `/goals?tab=projects&highlight=${id}`,
}

function loadSearchData(): SearchResult[] {
  const results: SearchResult[] = []

  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        results.push({
          id: task.id || crypto.randomUUID(),
          title: task.title || task.name || "Untitled Task",
          category: "Tasks",
          type: "task",
          icon: typeToIcon.task,
          href: typeToHref.task(task.id),
        })
      }
    }
  } catch {}

  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
    if (Array.isArray(habits)) {
      for (const habit of habits) {
        results.push({
          id: habit.id || crypto.randomUUID(),
          title: habit.name || habit.title || "Untitled Habit",
          category: "Habits",
          type: "habit",
          icon: typeToIcon.habit,
          href: typeToHref.habit(habit.id),
        })
      }
    }
  } catch {}

  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        results.push({
          id: goal.id || crypto.randomUUID(),
          title: goal.title || goal.name || "Untitled Goal",
          category: "Goals",
          type: "goal",
          icon: typeToIcon.goal,
          href: typeToHref.goal(goal.id),
        })
      }
      for (const goal of goals) {
        if (Array.isArray(goal.projects)) {
          for (const project of goal.projects) {
            results.push({
              id: project.id || crypto.randomUUID(),
              title: project.title || project.name || "Untitled Project",
              category: "Projects",
              type: "project",
              icon: typeToIcon.project,
              href: typeToHref.project(project.id),
            })
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
          id: entry.id || crypto.randomUUID(),
          title: entry.title || entry.prompt || "Journal Entry",
          category: "Journal",
          type: "journal",
          icon: typeToIcon.journal,
          href: typeToHref.journal(entry.id),
        })
      }
    }
  } catch {}

  return results
}

export function UniversalSearch({ open, onClose }: UniversalSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const data = useMemo(() => (open ? loadSearchData() : []), [open])

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    return data.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    )
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

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedIndex(0)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const selectItem = useCallback(
    (href: string) => {
      router.push(href)
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
        if (item) selectItem(item.href)
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
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll("[data-result]")
    items[selectedIndex]?.scrollIntoView({ block: "nearest" })
  }, [selectedIndex])

  const currentCategoryOrder = ["Tasks", "Habits", "Goals", "Projects", "Journal"]
  let runningIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b">
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search tasks, habits, goals, journals..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-7 w-7"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div ref={listRef} className="max-h-[50vh] overflow-y-auto">
                {flatResults.length === 0 ? (
                  <div className="py-12 text-center">
                    <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {query.trim() ? "No results found" : "Start typing to search..."}
                    </p>
                  </div>
                ) : (
                  currentCategoryOrder.map((category) => {
                    const items = grouped[category]
                    if (!items || items.length === 0) return null
                    return (
                      <div key={category}>
                        <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          {categoryIcons[category] || categoryIcons.tasks}
                          {category}
                          <span className="ml-auto text-muted-foreground/60">{items.length}</span>
                        </div>
                        {items.map((result) => {
                          runningIndex++
                          const idx = runningIndex
                          const isSelected = idx === selectedIndex
                          return (
                            <button
                              key={result.id}
                              data-result
                              onClick={() => selectItem(result.href)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                isSelected
                                  ? "bg-[#1E0E6B]/10 text-foreground"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              <span className={cn("shrink-0", isSelected ? "text-[#1E0E6B]" : "text-muted-foreground")}>
                                {result.icon}
                              </span>
                              <span className="flex-1 truncate">{result.title}</span>
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

              <div className="flex items-center gap-4 px-4 py-2.5 border-t text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-muted px-1 py-0.5">esc</kbd>
                  close
                </span>
                <span className="ml-auto flex items-center gap-1">
                  <Command className="h-3 w-3" /> K
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
