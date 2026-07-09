"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { formatDateDDMMYYYY } from "@/lib/date-utils"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Calendar as CalendarIcon,
  Clock,
  Target,
  BookOpen,
  Repeat,
  Users,
  MapPin,
  Sun,
  Cloud,
  Rainbow,
  Bell,
  CheckCircle2,
  Flag,
  AlertCircle,
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time?: string
  endTime?: string
  category: "task" | "goal" | "habit" | "journal" | "meeting" | "personal" | "challenge" | "reminder" | "milestone" | "deadline" | "review"
  color: string
  description?: string
  location?: string
}

const categoryColors: Record<string, string> = {
  task: "bg-blue-500",
  goal: "bg-indigo-500",
  habit: "bg-amber-500",
  journal: "bg-violet-500",
  meeting: "bg-purple-500",
  personal: "bg-rose-500",
  challenge: "bg-orange-500",
  reminder: "bg-amber-500",
  milestone: "bg-emerald-500",
  deadline: "bg-red-500",
  review: "bg-cyan-500",
}

const categoryLabels: Record<string, string> = {
  task: "Task",
  goal: "Goal",
  habit: "Habit",
  journal: "Journal",
  meeting: "Meeting",
  personal: "Personal",
  challenge: "Challenge",
  reminder: "Reminder",
  milestone: "Milestone",
  deadline: "Deadline",
  review: "Review",
}

function loadAllEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const today = new Date()

  // Tasks from localStorage
  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        if (task.dueDate) {
          const dateParts = task.dueDate.split("-")
          const date = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]))
          events.push({
            id: `task-${task.id}`,
            title: task.title || "Untitled Task",
            date,
            time: task.time || undefined,
            category: "task",
            color: "bg-blue-500",
            location: task.location || undefined,
          })
        }
      }
    }
  } catch {}

  // Habits from localStorage
  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
    if (Array.isArray(habits)) {
      for (const habit of habits) {
        if (habit.schedule && Array.isArray(habit.schedule)) {
          for (const dateStr of habit.schedule) {
            if (typeof dateStr === "string" && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const dateParts = dateStr.split("-")
              events.push({
                id: `habit-${habit.id}-${dateStr}`,
                title: habit.name || "Habit",
                date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
                time: habit.time || undefined,
                category: "habit",
                color: "bg-amber-500",
              })
            }
          }
        }
      }
    }
  } catch {}

  // Goals with deadlines
  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        if (goal.deadline) {
          const dateParts = goal.deadline.split("-")
          events.push({
            id: `goal-${goal.id}`,
            title: goal.title || "Goal Deadline",
            date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
            category: "deadline",
            color: "bg-red-500",
          })
        }
        // Goal milestones
        if (Array.isArray(goal.milestones)) {
          for (const milestone of goal.milestones) {
            if (milestone.dueDate) {
              const dateParts = milestone.dueDate.split("-")
              events.push({
                id: `milestone-${milestone.id || Math.random().toString(36).slice(2)}`,
                title: milestone.title || "Milestone",
                date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
                category: "milestone",
                color: "bg-emerald-500",
              })
            }
          }
        }
        // Goal projects with deadlines
        if (Array.isArray(goal.projects)) {
          for (const project of goal.projects) {
            if (project.deadline) {
              const dateParts = project.deadline.split("-")
              events.push({
                id: `project-${project.id || Math.random().toString(36).slice(2)}`,
                title: project.title || "Project Deadline",
                date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
                category: "deadline",
                color: "bg-red-500",
              })
            }
          }
        }
      }
    }
  } catch {}

  // Reminders from localStorage
  try {
    const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
    if (Array.isArray(reminders)) {
      for (const reminder of reminders) {
        if (reminder.date) {
          const dateParts = reminder.date.split("-")
          events.push({
            id: `reminder-${reminder.id}`,
            title: reminder.title || "Reminder",
            date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
            time: reminder.time || undefined,
            category: "reminder",
            color: "bg-amber-500",
          })
        }
      }
    }
  } catch {}

  // Daily reviews from localStorage
  try {
    const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
    if (Array.isArray(reviews)) {
      for (const review of reviews) {
        if (review.date) {
          const dateParts = review.date.split("-")
          events.push({
            id: `review-${review.date}`,
            title: "Daily Review",
            date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
            category: "review",
            color: "bg-cyan-500",
          })
        }
      }
    }
  } catch {}

  // Journal entries from localStorage
  try {
    const entries = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]")
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (entry.date) {
          const dateParts = String(entry.date).split("-")
          if (dateParts.length === 3) {
            events.push({
              id: `journal-${entry.id}`,
              title: entry.title || entry.prompt || "Journal Entry",
              date: new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2])),
              category: "journal",
              color: "bg-violet-500",
            })
          }
        }
      }
    }
  } catch {}

  // Add some demo events for today and coming days if no real data exists
  if (events.length === 0) {
    events.push(
      { id: "demo-1", title: "Deep Work Block", date: today, time: "9:00 AM", endTime: "11:00 AM", category: "task", color: "bg-blue-500", location: "Focus mode" },
      { id: "demo-2", title: "Team Standup", date: today, time: "11:00 AM", endTime: "11:30 AM", category: "meeting", color: "bg-purple-500", location: "Zoom" },
      { id: "demo-3", title: "Morning Journal", date: today, time: "7:00 AM", category: "habit", color: "bg-amber-500" },
      { id: "demo-4", title: "Exercise", date: today, time: "6:00 PM", category: "habit", color: "bg-emerald-500" },
      { id: "demo-5", title: "Read 30 Minutes", date: today, time: "9:00 PM", category: "habit", color: "bg-cyan-500" },
      { id: "demo-6", title: "Complete Q2 Strategy", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), time: "2:00 PM", category: "goal", color: "bg-indigo-500" },
      { id: "demo-7", title: "Weekly Planning", date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), time: "10:00 AM", category: "task", color: "bg-blue-500" },
      { id: "demo-8", title: "Evening Reflection", date: today, time: "9:30 PM", category: "journal", color: "bg-violet-500" },
    )
  }

  return events
}

export function CalendarPage() {
  const allEvents = useMemo(() => loadAllEvents(), [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const today = new Date()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const events = useMemo(() => {
    if (filterCategory === "all") return allEvents
    return allEvents.filter((e) => e.category === filterCategory)
  }, [allEvents, filterCategory])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (e) =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
    )
  }

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))
  }

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction * 7)
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()

  const getWeekDates = () => {
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay())
    const dates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      dates.push(d)
    }
    return dates
  }

  const selectedDayEvents = useMemo(() => getEventsForDate(selectedDate), [selectedDate, events])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Your complete timeline — tasks, habits, milestones, reminders & more</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button className="glow">
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
          className="h-7 text-xs"
        >
          All
        </Button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={filterCategory === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(key)}
            className="h-7 text-xs"
          >
            <div className={`h-2 w-2 rounded-full ${categoryColors[key]} mr-1.5`} />
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => view === "month" ? navigateMonth(-1) : view === "week" ? navigateWeek(-1) : navigateDay(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-[200px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => view === "month" ? navigateMonth(1) : view === "week" ? navigateWeek(1) : navigateDay(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Tabs value={view} onValueChange={(v) => setView(v as any)}>
                  <TabsList>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="agenda">Agenda</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {view === "month" && (
                <div className="grid grid-cols-7 gap-px bg-muted rounded-xl overflow-hidden">
                  {dayNames.map((day) => (
                    <div key={day} className="bg-card p-2 text-center text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth(currentDate).map((day, index) => (
                    <div
                      key={index}
                      className={`bg-card p-2 min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors ${
                        day && isSameDay(day, today) ? "bg-primary/5" : ""
                      } ${day && isSameDay(day, selectedDate) ? "ring-2 ring-primary" : ""}`}
                      onClick={() => day && setSelectedDate(day)}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-sm font-medium ${
                              isSameDay(day, today)
                                ? "bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center"
                                : ""
                            }`}
                          >
                            {day.getDate()}
                          </span>
                          <div className="mt-1 space-y-1">
                            {getEventsForDate(day)
                              .slice(0, 3)
                              .map((event) => (
                                <div
                                  key={event.id}
                                  className={`text-xs p-1 rounded ${categoryColors[event.category]} text-white truncate`}
                                >
                                  {event.title}
                                </div>
                              ))}
                            {getEventsForDate(day).length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{getEventsForDate(day).length - 3} more
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {view === "week" && (
                <div className="grid grid-cols-7 gap-2">
                  {getWeekDates().map((date, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border p-2 ${
                        isSameDay(date, today) ? "border-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs text-muted-foreground">{dayNames[date.getDay()]}</p>
                        <p
                          className={`text-lg font-semibold ${
                            isSameDay(date, today)
                              ? "bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center mx-auto"
                              : ""
                          }`}
                        >
                          {date.getDate()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {getEventsForDate(date).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1.5 rounded-lg ${categoryColors[event.category]} text-white`}
                          >
                            <p className="font-medium truncate">{event.title}</p>
                            {event.time && <p className="opacity-80">{event.time}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "day" && (
                <div className="space-y-2">
                  {Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => (
                    <div key={hour} className="flex items-start gap-4">
                      <span className="text-xs text-muted-foreground w-16 shrink-0 pt-1">
                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                      </span>
                      <div className="flex-1 min-h-[60px] rounded-xl border border-dashed p-2">
                        {getEventsForDate(currentDate)
                          .filter((e) => {
                            if (!e.time) return hour === 9
                            const eventHour = parseInt(e.time.split(":")[0])
                            const isPM = e.time.includes("PM")
                            const hour24 = isPM && eventHour !== 12 ? eventHour + 12 : eventHour
                            return hour24 === hour
                          })
                          .map((event) => (
                            <div
                              key={event.id}
                              className={`p-2 rounded-lg ${categoryColors[event.category]} text-white mb-1`}
                            >
                              <p className="font-medium text-sm">{event.title}</p>
                              <p className="text-xs opacity-80">{event.time || "All day"} · {categoryLabels[event.category]}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "agenda" && (
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                    const date = new Date()
                    date.setDate(date.getDate() + dayOffset)
                    const dayEvents = getEventsForDate(date)
                    if (dayEvents.length === 0) return null
                    return (
                      <div key={dayOffset}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          {isSameDay(date, today) ? "Today" : formatDateDDMMYYYY(date.toISOString().split("T")[0])}
                        </h3>
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className={`h-3 w-3 rounded-full ${categoryColors[event.category]}`} />
                              <div className="flex-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.time || "All day"}</p>
                              </div>
                              <Badge variant="outline">{categoryLabels[event.category]}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Day Detail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {isSameDay(selectedDate, today) ? "Today" : formatDateDDMMYYYY(selectedDate.toISOString().split("T")[0])}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedDayEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing scheduled</p>
                ) : (
                  selectedDayEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`h-2 w-2 rounded-full ${categoryColors[event.category]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time || "All day"} · {categoryLabels[event.category]}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .filter((e) => e.date >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 8)
                  .map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`h-2 w-2 rounded-full ${categoryColors[event.category]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">{event.time || "All day"}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {isSameDay(event.date, today) ? "Today" : `${event.date.getDate()}/${event.date.getMonth() + 1}`}
                      </span>
                    </div>
                  ))}
                {events.filter((e) => e.date >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).length === 0 && (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${categoryColors[key]}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
