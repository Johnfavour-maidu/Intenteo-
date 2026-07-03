"use client"

import React, { useState } from "react"
import { Task, TaskPriority, TaskEnergy, Recurrence } from "./types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Sparkles,
  Target,
  Clock,
  Timer,
  Zap,
  MapPin,
  Paperclip,
  Mic,
  Repeat,
  Bell,
  Calendar,
  Plus,
  Circle,
} from "lucide-react"

interface CreateTaskPanelProps {
  open: boolean
  onClose: () => void
  onSave: (task: Partial<Task>) => void
}

export function CreateTaskPanel({ open, onClose, onSave }: CreateTaskPanelProps) {
  const [title, setTitle] = useState("")
  const [purpose, setPurpose] = useState("")
  const [whyItMatters, setWhyItMatters] = useState("")
  const [futureSelf, setFutureSelf] = useState("")
  const [connectedGoal, setConnectedGoal] = useState("")
  const [projectName, setProjectName] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [deadline, setDeadline] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState(30)
  const [energyRequired, setEnergyRequired] = useState<TaskEnergy>("medium")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [recurrence, setRecurrence] = useState<Recurrence>("none")
  const [reminder, setReminder] = useState("")
  const [calendarSync, setCalendarSync] = useState(false)
  const [intentScoreWeight, setIntentScoreWeight] = useState(50)

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title,
      purpose,
      whyItMatters,
      futureSelfAlignment: futureSelf,
      futureSelfBadge: futureSelf ? futureSelf.split(" ").slice(0, 2).join(" ") : "",
      connectedGoal,
      projectName,
      priority,
      deadline: deadline || "Today",
      dueTime: "Anytime",
      estimatedDuration,
      energyRequired,
      tags,
      location,
      notes,
      isRecurring: recurrence !== "none",
      recurrence,
      calendarSync,
      intentScore: intentScoreWeight,
      xp: Math.round(intentScoreWeight * 0.3),
      status: "pending",
      completed: false,
      completionPercent: 0,
      subtasks: [],
      attachments: [],
      comments: [],
      activity: [{ id: "ac-new", action: "Created task", timestamp: new Date().toISOString() }],
      dependencies: [],
      voiceNotes: [],
      reminder,
    })
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTitle("")
    setPurpose("")
    setWhyItMatters("")
    setFutureSelf("")
    setConnectedGoal("")
    setProjectName("")
    setPriority("medium")
    setDeadline("")
    setEstimatedDuration(30)
    setEnergyRequired("medium")
    setTags([])
    setLocation("")
    setNotes("")
    setRecurrence("none")
    setReminder("")
    setCalendarSync(false)
    setIntentScoreWeight(50)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-background border-l shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">Create Task</h2>
                  <p className="text-xs text-muted-foreground">What matters today?</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-5">
                  {/* Task Name */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Task Name</label>
                    <Input
                      placeholder="What do you want to accomplish?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Why does this matter? */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Why does this matter?
                    </label>
                    <Textarea
                      placeholder="How does this connect to your bigger vision?"
                      value={whyItMatters}
                      onChange={(e) => setWhyItMatters(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  {/* Future Self & Goal */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Future Self</label>
                      <Input
                        placeholder="e.g., Becoming a leader"
                        value={futureSelf}
                        onChange={(e) => setFutureSelf(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Connected Goal</label>
                      <Input
                        placeholder="e.g., Q2 Revenue Growth"
                        value={connectedGoal}
                        onChange={(e) => setConnectedGoal(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Project & Category */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Project</label>
                      <Input
                        placeholder="Project name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Priority</label>
                      <div className="flex gap-1 mt-1">
                        {(["high", "medium", "low"] as TaskPriority[]).map((p) => (
                          <Button
                            key={p}
                            variant={priority === p ? "default" : "outline"}
                            size="sm"
                            className="flex-1 capitalize text-xs"
                            onClick={() => setPriority(p)}
                          >
                            {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Deadline & Duration */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Deadline
                      </label>
                      <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Duration (min)
                      </label>
                      <Input
                        type="number"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                        className="mt-1"
                        min={5}
                        step={5}
                      />
                    </div>
                  </div>

                  {/* Energy */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Energy Required
                    </label>
                    <div className="flex gap-1 mt-1">
                      {(["high", "medium", "low"] as TaskEnergy[]).map((e) => (
                        <Button
                          key={e}
                          variant={energyRequired === e ? "default" : "outline"}
                          size="sm"
                          className="flex-1 capitalize text-xs"
                          onClick={() => setEnergyRequired(e)}
                        >
                          {e === "high" ? "🔥" : e === "medium" ? "⚡" : "🌊"} {e}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Tags */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Tags</label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={handleAddTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                            <button
                              className="ml-1 hover:text-destructive"
                              onClick={() => setTags(tags.filter((t) => t !== tag))}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </label>
                    <Input
                      placeholder="Where will you do this?"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Notes</label>
                    <Textarea
                      placeholder="Additional details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <Separator />

                  {/* Recurrence */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Repeat className="h-3 w-3" />
                      Recurrence
                    </label>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {(["none", "daily", "weekly", "monthly", "yearly"] as Recurrence[]).map((r) => (
                        <Button
                          key={r}
                          variant={recurrence === r ? "default" : "outline"}
                          size="sm"
                          className="capitalize text-xs"
                          onClick={() => setRecurrence(r)}
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Calendar Sync & Reminder */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        Reminder
                      </label>
                      <Input
                        type="time"
                        value={reminder}
                        onChange={(e) => setReminder(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant={calendarSync ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        onClick={() => setCalendarSync(!calendarSync)}
                      >
                        <Calendar className="mr-1 h-3.5 w-3.5" />
                        {calendarSync ? "Synced" : "Sync to Calendar"}
                      </Button>
                    </div>
                  </div>

                  {/* Intent Score Weight */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Intent Score Weight: {intentScoreWeight}
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={intentScoreWeight}
                      onChange={(e) => setIntentScoreWeight(Number(e.target.value))}
                      className="w-full mt-2 accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Low Intent</span>
                      <span>High Intent</span>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1 glow" onClick={handleSave} disabled={!title.trim()}>
                    <Sparkles className="mr-1 h-4 w-4" />
                    Create Task
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
