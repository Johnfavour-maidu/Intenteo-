"use client"

import React from "react"
import { Task } from "./types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CheckCircle2,
  Circle,
  Clock,
  Timer,
  Zap,
  Target,
  Calendar,
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
  Link,
  Activity,
  Bot,
  FileText,
  ChevronRight,
} from "lucide-react"

interface TaskDetailsDrawerProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onComplete: (id: string) => void
  onDuplicate: (task: Task) => void
  onArchive: (id: string) => void
  onDelete: (id: string) => void
  onReschedule: (task: Task) => void
  onFocus: (task: Task) => void
}

export function TaskDetailsDrawer({
  task,
  open,
  onClose,
  onToggle,
  onEdit,
  onComplete,
  onDuplicate,
  onArchive,
  onDelete,
  onReschedule,
  onFocus,
}: TaskDetailsDrawerProps) {
  if (!task) return null

  const subtaskProgress = task.subtasks.length > 0
    ? Math.round((task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100)
    : 0

  const sections = [
    {
      title: "Overview",
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Purpose</span>
            <p className="text-sm mt-0.5">{task.purpose}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Why it matters</span>
            <p className="text-sm mt-0.5">{task.whyItMatters}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs font-medium text-muted-foreground">Category</span>
              <p className="text-sm mt-0.5">{task.category}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Energy</span>
              <p className="text-sm mt-0.5 capitalize">{task.energyRequired}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Duration</span>
              <p className="text-sm mt-0.5">{task.estimatedDuration}m</p>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">Deadline</span>
              <p className="text-sm mt-0.5">{task.deadline} {task.dueTime}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Purpose & Future Self",
      icon: <Sparkles className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-xs font-medium text-primary">Future Self Badge</span>
            <p className="text-sm mt-0.5 font-medium">{task.futureSelfBadge}</p>
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground">Life Vision Alignment</span>
            <p className="text-sm mt-0.5">{task.futureSelfAlignment}</p>
          </div>
          {task.connectedGoal && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Connected Goal</span>
              <p className="text-sm mt-0.5 flex items-center gap-1">
                <Target className="h-3 w-3" />
                {task.connectedGoal}
              </p>
            </div>
          )}
          {task.projectName && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Project</span>
              <p className="text-sm mt-0.5">{task.projectName}</p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Subtasks",
      icon: <CheckCircle2 className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          {task.subtasks.length > 0 ? (
            <>
              <div className="flex items-center gap-3">
                <ProgressRing value={subtaskProgress} size={48} strokeWidth={4} showLabel={false} />
                <div>
                  <span className="text-sm font-medium">{subtaskProgress}% complete</span>
                  <p className="text-xs text-muted-foreground">
                    {task.subtasks.filter((s) => s.completed).length} of {task.subtasks.length} done
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                {task.subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 py-1">
                    {sub.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={`text-sm ${sub.completed ? "line-through text-muted-foreground" : ""}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No subtasks yet</p>
          )}
          <Button variant="outline" size="sm" className="w-full">
            <Circle className="mr-1 h-3.5 w-3.5" />
            Add Subtask
          </Button>
        </div>
      ),
    },
    {
      title: "Attachments & Voice Notes",
      icon: <Paperclip className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          {task.attachments.length > 0 ? (
            <div className="space-y-1">
              {task.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm flex-1">{att.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attachments</p>
          )}
          {task.voiceNotes.length > 0 ? (
            <div className="space-y-1">
              {task.voiceNotes.map((note, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Play className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">Voice note {i + 1}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No voice notes</p>
          )}
          <Button variant="outline" size="sm" className="w-full">
            <Paperclip className="mr-1 h-3.5 w-3.5" />
            Upload File
          </Button>
        </div>
      ),
    },
    {
      title: "Comments",
      icon: <MessageSquare className="h-4 w-4" />,
      content: (
        <div className="space-y-3">
          {task.comments.length > 0 ? (
            <div className="space-y-2">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          )}
          <div className="flex gap-2">
            <input
              placeholder="Add a comment..."
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-background"
            />
            <Button size="sm">Send</Button>
          </div>
        </div>
      ),
    },
    {
      title: "Activity Timeline",
      icon: <Activity className="h-4 w-4" />,
      content: (
        <div className="space-y-2">
          {task.activity.map((act) => (
            <div key={act.id} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div>
                <p className="text-sm">{act.action}</p>
                <span className="text-xs text-muted-foreground">
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "AI Suggestions",
      icon: <Bot className="h-4 w-4" />,
      content: (
        <div className="space-y-2">
          {task.aiSuggestion ? (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1">
                <Sparkles className="h-3 w-3" />
                AI Insight
              </div>
              <p className="text-sm">{task.aiSuggestion}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No suggestions available</p>
          )}
          <Button variant="outline" size="sm" className="w-full">
            <Bot className="mr-1 h-3.5 w-3.5" />
            Get AI Breakdown
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
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
                <div className="flex items-center gap-3">
                  <button onClick={() => onToggle(task.id)} className="shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div>
                    <h2 className={`text-lg font-semibold ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px]">
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.category}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <ProgressRing value={task.completed ? 100 : task.completionPercent} size={40} strokeWidth={3} showLabel={false} />
                      <span className="text-[10px] text-muted-foreground mt-1 block">Progress</span>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <span className="text-lg font-bold text-primary">+{task.intentScore}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 block">Intent</span>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <span className="text-lg font-bold text-amber-500">+{task.xp}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 block">XP</span>
                    </div>
                    <div className="text-center p-2 rounded-xl bg-muted/50">
                      <span className="text-lg font-bold">{task.estimatedDuration}m</span>
                      <span className="text-[10px] text-muted-foreground mt-1 block">Duration</span>
                    </div>
                  </div>

                  {/* Sections */}
                  {sections.map((section, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-primary">{section.icon}</span>
                        <h3 className="font-semibold text-sm">{section.title}</h3>
                      </div>
                      {section.content}
                      {i < sections.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Tags</span>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {task.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dependencies */}
                  {task.dependencies.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Dependencies</span>
                      <div className="space-y-1 mt-1">
                        {task.dependencies.map((dep) => (
                          <div key={dep.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <Link className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{dep.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onFocus(task)}>
                    <Play className="mr-1 h-3.5 w-3.5" />
                    Focus
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(task)}>
                    <PenLine className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onReschedule(task)}>
                    <CalendarClock className="mr-1 h-3.5 w-3.5" />
                    Reschedule
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onDuplicate(task)}>
                    <Copy className="mr-1 h-3.5 w-3.5" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => onArchive(task.id)}>
                    <Archive className="mr-1 h-3.5 w-3.5" />
                    Archive
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
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
