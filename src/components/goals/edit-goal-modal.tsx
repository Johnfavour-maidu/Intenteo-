"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ChevronDown, Plus, CheckCircle2 } from "lucide-react"
import { DateInput } from "@/components/ui/date-input"
import { VisionImagesSection } from "./goals-page"
import { CoreValueLibrary } from "./goals-page"
import { GOAL_CATEGORIES, GOAL_COLORS, GOAL_ICONS } from "./goals-page"
import { TIME_HORIZONS, REVIEW_FREQUENCY_CONFIG } from "./goals-page"
import { loadCoreValues, addCoreValue } from "@/lib/vision-framework"
import { getTodayISO } from "./types"
import type { Goal, Milestone, GoalProjectTimeline, LinkedHabitWeight, TimeHorizon, ReviewFrequency, Habit, Vision, CoreValue } from "./goals-page"

interface EditGoalModalProps {
  isOpen: boolean; onClose: () => void; goal: Goal | null
  habits: Habit[]; visions: Vision[]; values: CoreValue[]
  onValuesAdded: () => void; onSave: (g: Goal) => void
}

export function EditGoalModal({ isOpen, onClose, goal, habits, visions, values, onValuesAdded, onSave }: EditGoalModalProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Personal Growth")
  const [customCategory, setCustomCategory] = useState("")
  const [priority, setPriority] = useState<"none" | "low" | "medium" | "high">("none")
  const [deadline, setDeadline] = useState("")
  const [startDate, setStartDate] = useState("")
  const [whyItMatters, setWhyItMatters] = useState("")
  const [icon, setIcon] = useState("")
  const [colorIdx, setColorIdx] = useState(0)
  const [showIconDropdown, setShowIconDropdown] = useState(false)
  const [showColorDropdown, setShowColorDropdown] = useState(false)
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("this-year")
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [habitWeights, setHabitWeights] = useState<Record<string, number>>({})
  const [customizeContributions, setCustomizeContributions] = useState(false)
  const [projectTimelines, setProjectTimelines] = useState<GoalProjectTimeline[]>([])
  const [selectedVisionId, setSelectedVisionId] = useState<string>("")
  const [heroImage, setHeroImage] = useState<string | undefined>(undefined)
  const [supportingImages, setSupportingImages] = useState<string[] | undefined>(undefined)
  const [reviewFrequency, setReviewFrequency] = useState<ReviewFrequency>("monthly")
  const [linkedValueIds, setLinkedValueIds] = useState<string[]>([])
  const [showValueLibrary, setShowValueLibrary] = useState(false)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [newMilestone, setNewMilestone] = useState("")
  const [habitSearch, setHabitSearch] = useState("")
  const [habitsOpen, setHabitsOpen] = useState(false)
  const [visionSearch, setVisionSearch] = useState("")
  const [visionsOpen, setVisionsOpen] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const habitSearchRef = useRef<HTMLDivElement>(null)
  const visionSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (goal) {
      setTitle(goal.title)
      setCategory(goal.category)
      setCustomCategory(goal.customCategory || "")
      setPriority(goal.priority)
      setDeadline(goal.deadline)
      setStartDate(goal.startDate)
      setWhyItMatters(goal.whyItMatters)
      setIcon(goal.icon)
      const ci = GOAL_COLORS.findIndex(c => c.name === goal.color)
      setColorIdx(ci >= 0 ? ci : 0)
      setTimeHorizon(goal.timeHorizon || "this-year")
      setSelectedHabits(goal.linkedHabits || [])
      setHabitWeights(goal.linkedHabitWeights ? Object.fromEntries(goal.linkedHabitWeights.map(w => [w.habitName, w.weight])) : {})
      setProjectTimelines(goal.projectTimelines || [])
      setSelectedVisionId(goal.visionId || "")
      setReviewFrequency(goal.reviewFrequency || "monthly")
      setLinkedValueIds(goal.linkedValueIds || [])
      setHeroImage(goal.heroImage)
      setSupportingImages(goal.supportingImages)
      setMilestones(goal.milestones || [])
      setHasChanges(false)
    }
  }, [goal])

  useEffect(() => {
    if (!habitsOpen) return
    const handler = (e: MouseEvent) => { if (habitSearchRef.current && !habitSearchRef.current.contains(e.target as Node)) setHabitsOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [habitsOpen])

  useEffect(() => {
    if (!visionsOpen) return
    const handler = (e: MouseEvent) => { if (visionSearchRef.current && !visionSearchRef.current.contains(e.target as Node)) setVisionsOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [visionsOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [isOpen, hasChanges])

  useEffect(() => {
    if (!customizeContributions && selectedHabits.length > 0) {
      const equalWeight = Math.floor(100 / selectedHabits.length)
      const remainder = 100 - (equalWeight * selectedHabits.length)
      const newWeights: Record<string, number> = {}
      selectedHabits.forEach((name, i) => { newWeights[name] = equalWeight + (i === 0 ? remainder : 0) })
      setHabitWeights(newWeights)
    }
  }, [selectedHabits, customizeContributions])

  if (!isOpen || !goal) return null

  const handleClose = () => {
    if (hasChanges) { setShowUnsavedWarning(true) } else { onClose() }
  }

  const markChanged = () => { if (!hasChanges) setHasChanges(true) }

  const toggleHabit = (name: string) => {
    setSelectedHabits(prev => prev.includes(name) ? prev.filter(h => h !== name) : [...prev, name])
    markChanged()
  }

  const redistributeEvenly = () => {
    if (selectedHabits.length === 0) return
    const equalWeight = Math.floor(100 / selectedHabits.length)
    const remainder = 100 - (equalWeight * selectedHabits.length)
    const newWeights: Record<string, number> = {}
    selectedHabits.forEach((name, i) => { newWeights[name] = equalWeight + (i === 0 ? remainder : 0) })
    setHabitWeights(newWeights)
  }

  const totalContribution = Object.values(habitWeights).reduce((sum, w) => sum + (w || 0), 0)
  const isValidContribution = totalContribution === 100

  const filteredHabits = habits.filter(h => h.name.toLowerCase().includes(habitSearch.toLowerCase()))
  const filteredVisions = visions.filter(v => !v.archived && v.title.toLowerCase().includes(visionSearch.toLowerCase()))
  const selectedVision = visions.find(v => v.id === selectedVisionId)

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones(prev => [...prev, { id: Date.now().toString(), title: newMilestone.trim(), completed: false }])
      setNewMilestone("")
      markChanged()
    }
  }

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m))
    markChanged()
  }

  const deleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
    markChanged()
  }

  const handleSave = () => {
    if (!title.trim() || !deadline) return
    const c = GOAL_COLORS[colorIdx]
    const lhw: LinkedHabitWeight[] = selectedHabits.map(name => ({ habitId: name, habitName: name, weight: habitWeights[name] || 0 }))
    const updatedGoal: Goal = {
      ...goal,
      title, description: goal.description, category: category === "Custom" ? "Custom" : category,
      customCategory: category === "Custom" ? customCategory : undefined,
      priority, deadline, startDate, whyItMatters, milestones,
      linkedHabits: selectedHabits, linkedHabitWeights: lhw, projectTimelines,
      color: c.name, colorHex: c.hex, icon, timeHorizon,
      visionId: selectedVisionId || undefined, reviewFrequency, linkedValueIds,
      heroImage, supportingImages, updatedAt: getTodayISO(),
    }
    onSave(updatedGoal)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Edit Goal</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{goal.title}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div><label className="text-sm font-medium">Goal Name</label><Input value={title} onChange={e => { setTitle(e.target.value); markChanged() }} placeholder="e.g., Read 24 Books" className="mt-1" /></div>
          <div><label className="text-sm font-medium">Why It Matters</label><textarea value={whyItMatters} onChange={e => { setWhyItMatters(e.target.value); markChanged() }} placeholder="What drives this goal?" className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all" /></div>

          <div>
            <label className="text-sm font-medium">Milestones</label>
            <p className="text-xs text-muted-foreground mb-2">Track key achievements for this goal</p>
            {milestones.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-white/10">
                    <button onClick={() => toggleMilestone(m.id)}>{m.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />}</button>
                    <span className={`flex-1 text-sm ${m.completed ? "line-through text-muted-foreground" : ""}`}>{m.title}</span>
                    <button onClick={() => deleteMilestone(m.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2"><Input value={newMilestone} onChange={e => setNewMilestone(e.target.value)} placeholder="Add milestone and press Enter" onKeyDown={e => e.key === "Enter" && addMilestone()} className="text-sm" /><Button size="sm" variant="outline" onClick={addMilestone}>Add</Button></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Category</label>
              <div className="relative">
                <select value={category} onChange={e => { setCategory(e.target.value); markChanged() }} className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm hover:border-[#1E0E6B]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer appearance-none pr-8">
                  {GOAL_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>
              {category === "Custom" && <Input value={customCategory} onChange={e => { setCustomCategory(e.target.value); markChanged() }} placeholder="Custom category" className="mt-2" />}
            </div>
            <div><label className="text-sm font-medium">Priority</label>
              <div className="relative">
                <select value={priority} onChange={e => { setPriority(e.target.value as any); markChanged() }} className="mt-1 w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm hover:border-[#1E0E6B]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer appearance-none pr-8">
                  <option value="none">None</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div></div>
          </div>
          <div><label className="text-sm font-medium">Time Horizon</label><div className="flex gap-2 mt-1">
            {TIME_HORIZONS.map(th => (
              <Button key={th.value} variant={timeHorizon === th.value ? "default" : "outline"} size="sm" onClick={() => { setTimeHorizon(th.value); markChanged() }} className={timeHorizon === th.value ? "bg-[#1E0E6B] text-white" : ""}>{th.label}</Button>
            ))}</div></div>
          <div className="grid grid-cols-2 gap-4">
            <div><DateInput label="Start Date" value={startDate} onChange={(v) => { setStartDate(v); markChanged() }} /></div>
            <div><DateInput label="Target Date" value={deadline} onChange={(v) => { setDeadline(v); markChanged() }} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative"><label className="text-sm font-medium">Icon</label>
              <button type="button" onClick={() => { setShowIconDropdown(!showIconDropdown); setShowColorDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer text-sm">
                <div className="flex items-center gap-2">
                  {icon ? <span className="text-lg">{icon}</span> : <span className="text-muted-foreground">None</span>}
                  <span>Icon</span>
                </div>
                <svg className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showIconDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 max-h-[200px] overflow-y-auto">
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => { setIcon(""); setShowIconDropdown(false); markChanged() }}
                      className={`text-sm p-2 rounded-lg transition-all text-center ${icon === "" ? "bg-[#EB9E5B]/20 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>None</button>
                    {GOAL_ICONS.map(ic => (
                      <button key={ic} onClick={() => { setIcon(ic); setShowIconDropdown(false); markChanged() }}
                        className={`text-lg p-2 rounded-lg transition-all text-center ${icon === ic ? "bg-[#EB9E5B]/20 ring-1 ring-[#EB9E5B]" : "hover:bg-muted"}`}>{ic}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative"><label className="text-sm font-medium">Colour</label>
              <button type="button" onClick={() => { setShowColorDropdown(!showColorDropdown); setShowIconDropdown(false) }}
                className="mt-1 w-full flex items-center justify-between gap-2 px-3 py-2 border border-white/20 rounded-lg bg-white/50 dark:bg-white/5 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-gray-300" style={{backgroundColor: GOAL_COLORS[colorIdx].hex}} />
                  <span>{GOAL_COLORS[colorIdx].name}</span>
                </div>
                <svg className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showColorDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-white/20 rounded-lg shadow-lg p-2 space-y-1">
                  {GOAL_COLORS.map((c, i) => (
                    <button key={c.name} onClick={() => { setColorIdx(i); setShowColorDropdown(false); markChanged() }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${colorIdx === i ? "bg-[#1E0E6B]/10" : "hover:bg-muted"}`}>
                      <div className="w-4 h-4 rounded-full border border-gray-300" style={{backgroundColor: c.hex}} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Linked Habits</label>
            <p className="text-xs text-muted-foreground mb-2">Select habits that support this goal</p>
            {selectedHabits.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedHabits.map(name => (
                  <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] font-medium">
                    {name}
                    <button onClick={() => toggleHabit(name)} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
            {habits.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No habits created yet</p>
            ) : (
              <div className="relative" ref={habitSearchRef}>
                <button onClick={() => setHabitsOpen(!habitsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-[#1E0E6B]/30 bg-white/50 dark:bg-white/5 text-left text-muted-foreground hover:border-[#1E0E6B]/50 transition-colors">
                  <span>Select Supporting Habits</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${habitsOpen ? "rotate-180" : ""}`} />
                </button>
                {habitsOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-900 border border-[#1E0E6B]/20 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-[#1E0E6B]/10">
                      <input value={habitSearch} onChange={(e) => setHabitSearch(e.target.value)} placeholder="Search habits..." className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#1E0E6B]/20 bg-white/50 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#1E0E6B]" autoFocus />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      {filteredHabits.map(h => (
                        <button key={h.id} onClick={() => toggleHabit(h.name)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${selectedHabits.includes(h.name) ? "bg-[#1E0E6B]/10 text-[#1E0E6B]" : "hover:bg-muted"}`}>
                          <input type="checkbox" checked={selectedHabits.includes(h.name)} onChange={() => toggleHabit(h.name)} className="accent-[#1E0E6B]" />
                          <span>{h.icon}</span>
                          <span className="flex-1 truncate">{h.name}</span>
                        </button>
                      ))}
                      {filteredHabits.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No habits found.</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedHabits.length > 0 && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={customizeContributions} onChange={(e) => setCustomizeContributions(e.target.checked)} className="accent-[#1E0E6B]" />
                    Customize Goal Contributions
                  </label>
                  <button type="button" onClick={redistributeEvenly} className="text-[10px] text-[#1E0E6B] hover:underline">Redistribute Evenly</button>
                </div>
                {customizeContributions ? (
                  <div className="space-y-2">
                    {selectedHabits.map(name => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-xs flex-1">{name}</span>
                        <div className="flex items-center gap-1">
                          <input type="number" min="1" max="100" value={habitWeights[name] || 0}
                            onChange={(e) => { setHabitWeights(prev => ({...prev, [name]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))})); markChanged() }}
                            className="w-16 text-xs text-center border border-[#1E0E6B]/30 rounded px-1 py-1" />
                          <span className="text-[10px] text-muted-foreground">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedHabits.map(name => (
                      <div key={name} className="flex items-center gap-2 text-xs">
                        <span className="flex-1">{name}</span>
                        <span className="font-medium text-muted-foreground">Goal Contribution: {habitWeights[name] || 0}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className={`flex items-center gap-1.5 text-xs ${isValidContribution ? "text-emerald-600" : "text-amber-600"}`}>
                  {isValidContribution ? (
                    <><span className="font-medium">✓ Total = 100%</span><span className="text-muted-foreground ml-1">Automatically Distributed</span></>
                  ) : (
                    <><span>⚠ Total Goal Contribution must equal 100%.</span><span className="ml-1">Current Total: {totalContribution}%</span></>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Linked Vision</label>
            <p className="text-xs text-muted-foreground mb-2">Connect this goal to a life vision</p>
            {selectedVision && (
              <div className="flex items-center gap-1 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full bg-[#EB9E5B]/10 text-[#EB9E5B] font-medium">
                   {selectedVision.title}
                  <button onClick={() => { setSelectedVisionId(""); markChanged() }} className="hover:text-red-500"><X className="h-2.5 w-2.5" /></button>
                </span>
              </div>
            )}
            {visions.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No Vision created yet. <span className="text-[#1E0E6B]">Create one from the Vision page.</span></p>
            ) : (
              <div className="relative" ref={visionSearchRef}>
                <button onClick={() => setVisionsOpen(!visionsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border border-[#1E0E6B]/30 bg-white/50 dark:bg-white/5 text-left text-muted-foreground hover:border-[#1E0E6B]/50 transition-colors">
                  <span>{selectedVision ? selectedVision.title : "Select Vision"}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${visionsOpen ? "rotate-180" : ""}`} />
                </button>
                {visionsOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-900 border border-[#1E0E6B]/20 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-[#1E0E6B]/10">
                      <input value={visionSearch} onChange={(e) => setVisionSearch(e.target.value)} placeholder="Search visions..." className="w-full px-3 py-1.5 text-sm rounded-lg border border-[#1E0E6B]/20 bg-white/50 dark:bg-white/5 focus:outline-none focus:ring-1 focus:ring-[#1E0E6B]" autoFocus />
                    </div>
                    <div className="max-h-48 overflow-y-auto p-1">
                      <button onClick={() => { setSelectedVisionId(""); setVisionsOpen(false); markChanged() }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${selectedVisionId === "" ? "bg-[#1E0E6B]/10 text-[#1E0E6B]" : "hover:bg-muted"}`}>
                        <span className="text-muted-foreground">None</span>
                      </button>
                      {filteredVisions.map(v => (
                        <button key={v.id} onClick={() => { setSelectedVisionId(v.id); setVisionsOpen(false); markChanged() }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${selectedVisionId === v.id ? "bg-[#EB9E5B]/10 text-[#EB9E5B]" : "hover:bg-muted"}`}>
                          <span className="flex-1 truncate">{v.title}</span>
                        </button>
                      ))}
                      {filteredVisions.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No visions found.</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Review Frequency</label>
            <p className="text-xs text-muted-foreground mb-2">How often should this goal be reviewed?</p>
            <div className="relative">
              <select value={reviewFrequency} onChange={e => { setReviewFrequency(e.target.value as ReviewFrequency); markChanged() }} className="w-full px-3 py-2 border border-[#1E0E6B]/30 rounded-lg bg-white/50 dark:bg-white/5 text-sm hover:border-[#1E0E6B]/50 focus:outline-none focus:ring-2 focus:ring-[#1E0E6B] focus:border-[#1E0E6B] transition-all cursor-pointer appearance-none pr-8">
                {(Object.entries(REVIEW_FREQUENCY_CONFIG) as [ReviewFrequency, { label: string; days: number }][]).map(([key, cfg]) => (
                  <option key={key} value={key}>{cfg.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Core Values</label>
            <p className="text-xs text-muted-foreground mb-2">Which values does this goal align with?</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {values.filter(v => linkedValueIds.includes(v.id)).map(v => (
                <span key={v.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] text-xs font-medium">
                   {v.name}
                  <button onClick={() => { setLinkedValueIds(prev => prev.filter(id => id !== v.id)); markChanged() }} className="hover:text-red-500"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowValueLibrary(true)} className="text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Values
            </Button>
          </div>
          <VisionImagesSection heroImage={heroImage} supportingImages={supportingImages} onChange={(hero, supporting) => { setHeroImage(hero); setSupportingImages(supporting); markChanged() }} />
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || !deadline} className="flex-1 glow text-white">Save Changes</Button>
        </div>
      </div>

      {showUnsavedWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Unsaved Changes</h3>
            <p className="text-sm text-muted-foreground">You have unsaved changes. Are you sure you want to discard them?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowUnsavedWarning(false)}>Continue Editing</Button>
              <Button size="sm" variant="destructive" onClick={() => { setShowUnsavedWarning(false); onClose() }}>Discard Changes</Button>
            </div>
          </div>
        </div>
      )}

      {showValueLibrary && (
        <CoreValueLibrary existingValues={values} onAddValues={(newVals) => {
          newVals.forEach(v => addCoreValue(v as any))
          onValuesAdded()
          const updated = loadCoreValues()
          const newIds = updated.filter(u => newVals.some(n => n.name === u.name)).map(u => u.id)
          setLinkedValueIds(prev => [...prev, ...newIds])
          markChanged()
        }} onClose={() => setShowValueLibrary(false)} />
      )}
    </div>
  )
}
