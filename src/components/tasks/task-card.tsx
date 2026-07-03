"use client"

import React, { useState } from "react"
import { Task } from "./types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2,
  Circle,
  Clock,
  Timer,
  Zap,
  Target,
  Calendar,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Paperclip,
  MessageSquare,
  Repeat,
  Sparkles,
  Play,
  PenLine,
  Copy,
  Archive,
  Trash2,
  CalendarClock,
  Expand,
} from "lucide-react"

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onExpand: (task: Task) => void
  onEdit: (task: Task) => void
  onComplete: (id: string) => void
  onDuplicate: (task: Task) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onReschedule: (task: Task) => void
  onFocus: (task: Task) => void
  selected?: boolean
  onSelect?: (id: string) => void
  compact?: boolean
}

export function TaskCard({
  task,
  onToggle,
  onExpand,
  onEdit,
  onComplete,
  onDuplicate,
  onArchive,
  onDelete,
  onReschedule,
  onFocus,
  selected,
  onSelect,
  compact,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const priorityColors: Record<string, string> = {
    high: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  }

  const energyIcons: Record<string, React.ReactNode> = {
    high: <Zap className="h-3 w-3 text-orange-500" />,
    medium: <Zap className="h-3 w-3 text-blue-500" />,
    low: <Zap className="h-3 w-3 text-emerald-500" />,
  }

  const subtaskProgress = task.subtasks.length > 0
    ? Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)
    : null

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group cursor-pointer ${
          task.completed ? "opacity-50" : ""
        } ${selected ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-muted/50"}`}
        onClick={() => onExpand(task)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id) }}
          className="shrink-0"
        >
          {task.completed ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </motion.div>
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        <span className={`text-sm flex-1 truncate ${task.completed ? "line-through text-muted-foreground" : ""}`}>
          {task.title}
        </span>
        <span className="text-xs text-muted-foreground">{task.dueTime}</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
      className={`group relative rounded-2xl border transition-all duration-200 ${
        task.completed
          ? "opacity-60 bg-muted/20"
          : "hover:shadow-md hover:border-primary/20"
      } ${selected ? "ring-2 ring-primary border-primary/30" : "border-border"} ${
        task.status === "in-progress" ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className="mt-0.5 shrink-0"
          >
            {task.completed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </motion.div>
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {task.title}
              </h3>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}>
                {task.priority}
              </Badge>
              {task.isRecurring && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                  <Repeat className="mr-0.5 h-2.5 w-2.5" />
                  {task.recurrence}
                </Badge>
              )}
              {task.status === "in-progress" && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                  In Progress
                </Badge>
              )}
            </div>

            {/* Purpose */}
            {task.purpose && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.purpose}</p>
            )}

            {/* Meta Row */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.dueTime}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Timer className="h-3 w-3" />
                {task.estimatedDuration}m
              </span>
              <span className="flex items-center gap-1 text-xs">
                {energyIcons[task.energyRequired]}
                <span className="text-muted-foreground capitalize">{task.energyRequired} energy</span>
              </span>
              {task.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {task.location}
                </span>
              )}
              {task.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments.length}
                </span>
              )}
              {task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {task.comments.length}
                </span>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                <Target className="mr-1 h-2.5 w-2.5" />
                +{task.intentScore} Intent
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/20">
                +{task.xp} XP
              </Badge>
              {task.futureSelfBadge && (
                <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                  <Sparkles className="mr-1 h-2.5 w-2.5" />
                  {task.futureSelfBadge}
                </Badge>
              )}
              {task.connectedGoal && (
                <Badge variant="outline" className="text-[10px]">
                  <Target className="mr-1 h-2.5 w-2.5" />
                  {task.connectedGoal}
                </Badge>
              )}
            </div>

            {/* Subtask Progress */}
            {subtaskProgress !== null && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${subtaskProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                </span>
              </div>
            )}

            {/* Expanded Details */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t space-y-2">
                    {task.whyItMatters && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Why it matters</span>
                        <p className="text-sm mt-0.5">{task.whyItMatters}</p>
                      </div>
                    )}
                    {task.futureSelfAlignment && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Future Self</span>
                        <p className="text-sm mt-0.5">{task.futureSelfAlignment}</p>
                      </div>
                    )}
                    {task.aiSuggestion && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1">
                          <Sparkles className="h-3 w-3" />
                          AI Suggestion
                        </div>
                        <p className="text-sm">{task.aiSuggestion}</p>
                      </div>
                    )}
                    {task.notes && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Notes</span>
                        <p className="text-sm mt-0.5">{task.notes}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side: Progress + Actions */}
          <div className="flex flex-col items-end gap-2">
            <ProgressRing value={task.completed ? 100 : task.completionPercent} size={40} strokeWidth={3} showLabel={false} />

            {/* Action Buttons (always visible on desktop, hover on mobile) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); onFocus(task) }}
                title="Start Focus"
              >
                <Play className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                title="Edit"
              >
                <PenLine className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
                title="Expand"
              >
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
                <AnimatePresence>
                  {showActions && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-full mt-1 z-50 w-44 rounded-xl border bg-background shadow-lg p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => { onComplete(task.id); setShowActions(false) }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Complete
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => { onDuplicate(task); setShowActions(false) }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Duplicate
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => { onReschedule(task); setShowActions(false) }}
                      >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Reschedule
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => { onExpand(task); setShowActions(false) }}
                      >
                        <Expand className="h-3.5 w-3.5" />
                        Open Details
                      </button>
                      <div className="h-px bg-border my-1" />
                      <button
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
                        onClick={() => { onArchive(task.id); setShowActions(false) }}
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        onClick={() => { onDelete(task.id); setShowActions(false) }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
