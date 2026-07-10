"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Plus, Star, X, Search, Trash2, ChevronRight, ChevronDown,
  Target, Folder, ListChecks, Zap, ExternalLink, Eye,
} from "lucide-react"
import { useUndoRedo } from "@/components/providers/undo-redo-provider"
import { getTodayISO } from "@/components/goals/types"
import type { Vision, VisionBoardItem, Goal, Project, Habit } from "@/components/goals/types"
import { VISION_CATEGORIES } from "@/components/goals/types"

const VisionDrawer = ({ isOpen, onClose, vision, onSave, onDelete, goals, projects, habits, onAddGoal }: {
  isOpen: boolean; onClose: () => void; vision: Vision | null
  onSave: (v: Vision) => void; onDelete?: (id: string) => void
  goals: Goal[]; projects: Project[]; habits: Habit[]
  onAddGoal?: (visionId: string) => void
}) => {
  const [data, setData] = useState<Vision | null>(vision)
  const [newBoardItemContent, setNewBoardItemContent] = useState("")
  const [newBoardItemType, setNewBoardItemType] = useState<VisionBoardItem["type"]>("note")
  const [activeTab, setActiveTab] = useState<"board" | "goals" | "projects" | "habits">("board")
  useEffect(() => { setData(vision) }, [vision])
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [isOpen, onClose])
  if (!isOpen || !data) return null

  const inputCls = "mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all"

  const addBoardItem = () => {
    if (!newBoardItemContent.trim()) return
    const item: VisionBoardItem = {
      id: Date.now().toString(), type: newBoardItemType, content: newBoardItemContent.trim(),
      createdAt: getTodayISO(),
    }
    setData({ ...data, boardItems: [...data.boardItems, item] })
    setNewBoardItemContent("")
  }

  const removeBoardItem = (id: string) => {
    setData({ ...data, boardItems: data.boardItems.filter(i => i.id !== id) })
  }

  const linkedGoals = goals.filter(g => g.visionId === data.id)
  const linkedProjectIds = new Set(projects.filter(p => linkedGoals.some(g => g.id === p.goalId)).map(p => p.id))
  const linkedProjects = projects.filter(p => linkedProjectIds.has(p.id))
  const linkedHabitNames = new Set(linkedGoals.flatMap(g => g.linkedHabits))
  const linkedHabits = habits.filter(h => linkedHabitNames.has(h.name))

  const tabs = [
    { id: "board" as const, label: "Vision Board", count: data.boardItems.length },
    { id: "goals" as const, label: "Goals", count: linkedGoals.length },
    { id: "projects" as const, label: "Projects", count: linkedProjects.length },
    { id: "habits" as const, label: "Habits", count: linkedHabits.length },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-white/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{data.icon}</span>
            <div>
              <h2 className="text-xl font-bold">{data.title}</h2>
              <Badge variant="outline" className="text-[10px]">{data.category}</Badge>
            </div>
          </div>
          <div className="flex gap-1">
            {onDelete && <Button variant="ghost" size="icon" onClick={() => { onDelete(data.id); onClose() }} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>}
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div><label className="text-sm font-medium">Description</label>
            <textarea value={data.description} onChange={e => setData({...data, description: e.target.value})} className={inputCls + " min-h-[80px]"} placeholder="Describe your vision..." /></div>

          <div className="flex gap-2 border-b border-white/20 pb-2">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? "bg-[#1E0E6B] text-white" : "text-muted-foreground hover:bg-muted"}`}>
                {t.label} <span className="ml-1 text-xs opacity-70">({t.count})</span>
              </button>
            ))}
          </div>

          {activeTab === "board" && (
            <div>
              <label className="text-sm font-medium">Vision Board</label>
              <p className="text-xs text-muted-foreground mb-2">Add images, quotes, Bible verses, videos, links, or notes for inspiration</p>
              {data.boardItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {data.boardItems.map(item => (
                    <div key={item.id} className="p-3 rounded-lg bg-white/50 dark:bg-white/5 border border-white/20 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase">{item.type.replace("-", " ")}</span>
                          {item.type === "quote" || item.type === "bible-verse" ? (
                            <p className="text-sm italic mt-1 line-clamp-3">&ldquo;{item.content}&rdquo;</p>
                          ) : item.type === "link" || item.type === "video" ? (
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 truncate">{item.content}</p>
                          ) : item.type === "image" ? (
                            <p className="text-sm mt-1 truncate">{item.content}</p>
                          ) : (
                            <p className="text-sm mt-1 line-clamp-3">{item.content}</p>
                          )}
                        </div>
                        <button onClick={() => removeBoardItem(item.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all ml-1"><X className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <select value={newBoardItemType} onChange={e => setNewBoardItemType(e.target.value as VisionBoardItem["type"])}
                  className="px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm appearance-none pr-8 cursor-pointer">
                  <option value="note">Note</option>
                  <option value="quote">Quote</option>
                  <option value="bible-verse">Bible Verse</option>
                  <option value="link">Link</option>
                  <option value="video">Video</option>
                  <option value="image">Image URL</option>
                </select>
                <Input value={newBoardItemContent} onChange={e => setNewBoardItemContent(e.target.value)}
                  placeholder={newBoardItemType === "link" || newBoardItemType === "video" || newBoardItemType === "image" ? "Enter URL..." : "Enter content..."}
                  className="flex-1" onKeyDown={e => e.key === "Enter" && addBoardItem()} />
                <Button size="sm" onClick={addBoardItem}>Add</Button>
              </div>
            </div>
          )}

          {activeTab === "goals" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Linked Goals ({linkedGoals.length})</label>
                {onAddGoal && <Button size="sm" variant="outline" onClick={() => onAddGoal(data.id)}><Plus className="h-3 w-3 mr-1" /> Add Goal</Button>}
              </div>
              {linkedGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No goals linked to this vision yet.</p>
              ) : (
                <div className="space-y-2">
                  {linkedGoals.map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
                      <span className="text-lg">{g.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{g.title}</p>
                        <p className="text-[10px] text-muted-foreground">{g.category} · {g.timeHorizon || "This Year"}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{g.progress}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div>
              <label className="text-sm font-medium mb-3 block">Linked Projects ({linkedProjects.length})</label>
              {linkedProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No projects linked to this vision.</p>
              ) : (
                <div className="space-y-2">
                  {linkedProjects.map(p => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
                      <span className="text-lg">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">{p.status} · {p.tasks.filter(t => t.completed).length}/{p.tasks.length} tasks</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{p.progress}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "habits" && (
            <div>
              <label className="text-sm font-medium mb-3 block">Linked Habits ({linkedHabits.length})</label>
              {linkedHabits.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No habits linked to this vision.</p>
              ) : (
                <div className="space-y-2">
                  {linkedHabits.map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-white/5 rounded-xl border border-white/20">
                      <span className="text-lg">{h.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{h.name}</p>
                        <p className="text-[10px] text-muted-foreground">Streak: {h.streak} days · Score: {h.habitScore}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Button onClick={() => { onSave({...data, updatedAt: getTodayISO()}); onClose() }} className="w-full bg-[#1E0E6B] text-white">Save Vision</Button>
        </div>
      </div>
    </div>
  )
}

export function VisionsPage() {
  const { showUndoSnackbar } = useUndoRedo()
  const [visions, setVisions] = useState<Vision[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const sv = localStorage.getItem("intenteo-visions")
      const sg = localStorage.getItem("intenteo-goals")
      const sp = localStorage.getItem("intenteo-projects")
      const sh = localStorage.getItem("intenteo-habits")
      const sold = localStorage.getItem("intenteo-vision")
      if (sv) { try { setVisions(JSON.parse(sv)) } catch { /* fallback */ } }
      else if (sold) {
        try {
          const old = JSON.parse(sold)
          const migrated: Vision = {
            id: "v1", title: "Life Vision", description: old.vision || "", category: "Personal Growth",
            icon: "\u{1F3AF}", archived: false, boardItems: [],
            createdAt: old.startDate || getTodayISO(), updatedAt: getTodayISO(),
          }
          setVisions([migrated])
        } catch { /* keep empty */ }
      }
      if (sg) { try { setGoals(JSON.parse(sg)) } catch { /* keep empty */ } }
      if (sp) { try { setProjects(JSON.parse(sp)) } catch { /* keep empty */ } }
      if (sh) { try { setHabits(JSON.parse(sh)) } catch { /* keep empty */ } }
    } catch {
      /* keep defaults */
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { if (!isLoading) localStorage.setItem("intenteo-visions", JSON.stringify(visions)) }, [visions, isLoading])

  const saveVision = useCallback((v: Vision) => {
    setVisions(prev => {
      const exists = prev.find(x => x.id === v.id)
      if (exists) return prev.map(x => x.id === v.id ? v : x)
      return [...prev, v]
    })
  }, [])

  const deleteVision = useCallback((id: string) => {
    const vision = visions.find(v => v.id === id)
    if (!vision) return
    const deleted = { ...vision }
    setVisions(prev => prev.filter(v => v.id !== id))
    setGoals(prev => prev.map(g => g.visionId === id ? { ...g, visionId: undefined } : g))
    showUndoSnackbar("Vision deleted.", () => {
      setVisions(prev => {
        if (prev.some(v => v.id === deleted.id)) return prev
        return [...prev, deleted]
      })
    })
  }, [visions, goals, showUndoSnackbar])

  const filteredVisions = useMemo(() => {
    if (!searchQuery) return visions.filter(v => !v.archived)
    const q = searchQuery.toLowerCase()
    return visions.filter(v => !v.archived && (
      v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)
    ))
  }, [visions, searchQuery])

  const visionStats = useMemo(() => {
    return filteredVisions.map(v => {
      const vGoals = goals.filter(g => g.visionId === v.id)
      const vProjectIds = new Set(projects.filter(p => vGoals.some(g => g.id === p.goalId)).map(p => p.id))
      const vProjects = projects.filter(p => vProjectIds.has(p.id))
      const vHabitNames = new Set(vGoals.flatMap(g => g.linkedHabits))
      const vHabits = habits.filter(h => vHabitNames.has(h.name))
      return { ...v, goalCount: vGoals.length, projectCount: vProjects.length, habitCount: vHabits.length, boardCount: v.boardItems.length }
    })
  }, [filteredVisions, goals, projects, habits])

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading visions...</div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visions</h1>
          <p className="text-muted-foreground">Your future begins with clarity.</p>
        </div>
        <Button onClick={() => {
          const newVision: Vision = {
            id: Date.now().toString(), title: "New Vision", description: "", category: "Personal Growth",
            icon: "\u2B50", archived: false, boardItems: [], createdAt: getTodayISO(), updatedAt: getTodayISO(),
          }
          setVisions(prev => [...prev, newVision])
          setSelectedVision(newVision)
          setIsDrawerOpen(true)
        }} className="glow h-9"><Plus className="mr-1 h-4 w-4" /> Add Vision</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search visions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="pl-9 bg-white/50 dark:bg-white/5 border-2 border-[#1E0E6B]/60 focus:border-[#1E0E6B]" />
      </div>

      {visionStats.length === 0 ? (
        <div className="text-center py-16">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Create Your First Vision</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Define who you want to become. Visions are your long-term direction and inspiration.
          </p>
          <Button onClick={() => {
            const newVision: Vision = {
              id: Date.now().toString(), title: "Life Vision", description: "Become a successful entrepreneur who helps millions live with intentionality", category: "Personal Growth",
              icon: "\u{1F3AF}", archived: false, boardItems: [], createdAt: getTodayISO(), updatedAt: getTodayISO(),
            }
            setVisions([newVision])
            setSelectedVision(newVision)
            setIsDrawerOpen(true)
          }} className="glow text-white"><Plus className="mr-2 h-4 w-4" /> Create Vision</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visionStats.map(v => {
            const cat = VISION_CATEGORIES.find(c => c.name === v.category)
            const catColor = cat?.color || "#1E0E6B"
            return (
              <div key={v.id} onClick={() => { setSelectedVision(v); setIsDrawerOpen(true) }}
                className="cursor-pointer group p-5 bg-white dark:bg-gray-950 rounded-2xl hover:shadow-lg hover:shadow-black/5 transition-all duration-200 hover:-translate-y-0.5"
                style={{ border: `2px solid ${catColor}40` }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: catColor + "15" }}>
                      {v.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{v.title}</h3>
                      <Badge variant="outline" className="text-[10px]" style={{ borderColor: catColor + "40", color: catColor }}>{v.category}</Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#1E0E6B] transition-colors" />
                </div>
                {v.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{v.description}</p>}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10">
                  {[
                    { icon: <Target className="h-3.5 w-3.5" />, count: v.goalCount, label: "Goals" },
                    { icon: <Folder className="h-3.5 w-3.5" />, count: v.projectCount, label: "Projects" },
                    { icon: <Zap className="h-3.5 w-3.5" />, count: v.habitCount, label: "Habits" },
                    { icon: <Eye className="h-3.5 w-3.5" />, count: v.boardCount, label: "Board" },
                  ].map((s, i) => (
                    <div key={i} className="text-center">
                      <div className="flex justify-center text-muted-foreground mb-1">{s.icon}</div>
                      <p className="text-sm font-bold">{s.count}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <VisionDrawer isOpen={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); setSelectedVision(null) }}
        vision={selectedVision} onSave={saveVision} onDelete={deleteVision}
        goals={goals} projects={projects} habits={habits} />
    </div>
  )
}
