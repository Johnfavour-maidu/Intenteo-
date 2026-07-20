"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, Check, Trash2, Calendar, Clock, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  type Reminder,
  type ReminderFrequency,
  type ReminderSource,
  loadReminders,
  saveReminders,
  deleteReminder,
  getSmartDateLabel,
  formatDateKey,
} from "@/lib/reminder-types"

interface ReminderModalProps {
  open: boolean
  onClose: () => void
  /** Pre-fill source when creating from a specific module */
  defaultSource?: ReminderSource
  defaultSourceId?: string
  defaultTitle?: string
  defaultDate?: string
}

export function ReminderModal({
  open,
  onClose,
  defaultSource = "task",
  defaultSourceId,
  defaultTitle = "",
  defaultDate,
}: ReminderModalProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState(defaultTitle)
  const [newDate, setNewDate] = useState(defaultDate || formatDateKey(new Date()))
  const [newTime, setNewTime] = useState("")
  const [newFrequency, setNewFrequency] = useState<ReminderFrequency>("one-time")

  const refresh = useCallback(() => {
    setReminders(loadReminders())
  }, [])

  useEffect(() => {
    if (open) {
      refresh()
      setShowCreate(false)
      setNewTitle(defaultTitle)
      setNewDate(defaultDate || formatDateKey(new Date()))
      setNewTime("")
      setNewFrequency("one-time")
    }
  }, [open, defaultTitle, defaultDate, refresh])

  const today = formatDateKey(new Date())
  const todayReminders = reminders.filter(r => r.date === today && !r.completed)
  const upcomingReminders = reminders.filter(r => r.date > today && !r.completed)
  const completedReminders = reminders.filter(r => r.completed)

  const handleCreate = () => {
    if (!newTitle.trim() || !newDate) return
    const all = loadReminders()
    all.push({
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      date: newDate,
      time: newTime,
      frequency: newFrequency,
      completed: false,
      source: defaultSource,
      sourceId: defaultSourceId,
      createdAt: new Date().toISOString(),
    })
    saveReminders(all)
    refresh()
    setNewTitle("")
    setNewDate(formatDateKey(new Date()))
    setNewTime("")
    setNewFrequency("one-time")
    setShowCreate(false)
  }

  const handleToggleDone = (id: string) => {
    const all = loadReminders()
    saveReminders(all.map(r => r.id === id ? { ...r, completed: !r.completed } : r))
    refresh()
  }

  const handleDelete = (id: string) => {
    deleteReminder(id)
    refresh()
  }

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const smart = getSmartDateLabel(reminder.date)
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="flex items-start gap-3 p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow group"
      >
        <button
          onClick={() => handleToggleDone(reminder.id)}
          className={`mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            reminder.completed
              ? "bg-green-500 border-green-500 text-white"
              : "border-muted-foreground/30 hover:border-green-500"
          }`}
        >
          {reminder.completed && <Check className="h-3 w-3" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${reminder.completed ? "line-through text-muted-foreground" : ""}`}>
            {reminder.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className={`text-xs font-medium ${smart.color}`}>{smart.label}</span>
            </div>
            {reminder.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{reminder.time}</span>
              </div>
            )}
            {reminder.frequency !== "one-time" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] font-medium">
                {reminder.frequency}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => handleToggleDone(reminder.id)}
            className="p-1 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleDelete(reminder.id)}
            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    )
  }

  const FrequencyButton = ({ freq, label }: { freq: ReminderFrequency; label: string }) => (
    <button
      type="button"
      onClick={() => setNewFrequency(freq)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
        newFrequency === freq
          ? "border-[#1E0E6B] bg-[#1E0E6B]/10 text-[#1E0E6B]"
          : "border-white/20 hover:border-white/40 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#1E0E6B]" />
            <h2 className="text-lg font-semibold">Reminders</h2>
            {reminders.filter(r => !r.completed).length > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-[#1E0E6B] text-white text-[10px] font-medium flex items-center justify-center">
                {reminders.filter(r => !r.completed).length}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">
          {/* Today's Reminders */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Today&apos;s Reminders</p>
            {todayReminders.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-2">No reminders for today</p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {todayReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Upcoming Reminders */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Upcoming</p>
            {upcomingReminders.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic py-2">No upcoming reminders</p>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {upcomingReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Completed</p>
              <div className="space-y-2">
                <AnimatePresence>
                  {completedReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Empty State */}
          {reminders.length === 0 && !showCreate && (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No reminders yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Create your first reminder.</p>
            </div>
          )}

          {/* Create Form */}
          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl border border-[#1E0E6B]/20 bg-[#1E0E6B]/5 space-y-3">
                  <p className="text-xs font-semibold text-[#1E0E6B]">New Reminder</p>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What would you like to be reminded about?"
                    className="h-9 text-sm"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate() }}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Date</label>
                      <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground">Time (optional)</label>
                      <Input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Frequency</label>
                    <div className="flex flex-wrap gap-1.5">
                      <FrequencyButton freq="one-time" label="One-time" />
                      <FrequencyButton freq="daily" label="Daily" />
                      <FrequencyButton freq="weekly" label="Weekly" />
                      <FrequencyButton freq="monthly" label="Monthly" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="h-8 text-xs glow" onClick={handleCreate} disabled={!newTitle.trim()}>
                      Create Reminder
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowCreate(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-3 border-t flex items-center justify-between">
          <Button variant="ghost" size="sm" className="text-xs h-8" onClick={onClose}>
            Close
          </Button>
          {!showCreate && (
            <Button size="sm" className="h-8 text-xs gap-1.5 glow" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" />
              Create Reminder
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
