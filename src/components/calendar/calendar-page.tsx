"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Target,
  BookOpen,
  Repeat,
  Bell,
  CheckCircle2,
  Flag,
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time?: string
  category: "task" | "goal" | "habit" | "journal" | "reminder" | "milestone" | "review"
}

const TYPE_CONFIG: Record<CalendarEvent["category"], { label: string; icon: React.ReactNode }> = {
  task: { label: "Tasks", icon: <Target className="h-3.5 w-3.5" /> },
  habit: { label: "Habits", icon: <Repeat className="h-3.5 w-3.5" /> },
  goal: { label: "Goals", icon: <Flag className="h-3.5 w-3.5" /> },
  journal: { label: "Journal", icon: <BookOpen className="h-3.5 w-3.5" /> },
  reminder: { label: "Reminders", icon: <Bell className="h-3.5 w-3.5" /> },
  milestone: { label: "Milestones", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  review: { label: "Review", icon: <CalendarIcon className="h-3.5 w-3.5" /> },
}

function loadAllEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const today = new Date()

  try {
    const tasks = JSON.parse(localStorage.getItem("intenteo-tasks") || "[]")
    if (Array.isArray(tasks)) {
      for (const task of tasks) {
        if (task.dueDate) {
          const parts = task.dueDate.split("-")
          events.push({
            id: `task-${task.id}`,
            title: task.title || "Untitled Task",
            date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
            time: task.time || undefined,
            category: "task",
          })
        }
      }
    }
  } catch {}

  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
    if (Array.isArray(habits)) {
      for (const habit of habits) {
        if (habit.schedule && Array.isArray(habit.schedule)) {
          for (const dateStr of habit.schedule) {
            if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              const parts = dateStr.split("-")
              events.push({
                id: `habit-${habit.id}-${dateStr}`,
                title: habit.name || "Habit",
                date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
                time: habit.time || undefined,
                category: "habit",
              })
            }
          }
        }
      }
    }
  } catch {}

  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    if (Array.isArray(goals)) {
      for (const goal of goals) {
        if (goal.deadline) {
          const parts = goal.deadline.split("-")
          events.push({
            id: `goal-${goal.id}`,
            title: goal.title || "Goal Deadline",
            date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
            category: "goal",
          })
        }
        if (Array.isArray(goal.milestones)) {
          for (const ms of goal.milestones) {
            if (ms.dueDate) {
              const parts = ms.dueDate.split("-")
              events.push({
                id: `milestone-${ms.id || Math.random().toString(36).slice(2)}`,
                title: ms.title || "Milestone",
                date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
                category: "milestone",
              })
            }
          }
        }
      }
    }
  } catch {}

  try {
    const reminders = JSON.parse(localStorage.getItem("intenteo-reminders") || "[]")
    if (Array.isArray(reminders)) {
      for (const reminder of reminders) {
        if (reminder.date) {
          const parts = reminder.date.split("-")
          events.push({
            id: `reminder-${reminder.id}`,
            title: reminder.title || "Reminder",
            date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
            time: reminder.time || undefined,
            category: "reminder",
          })
        }
      }
    }
  } catch {}

  try {
    const reviews = JSON.parse(localStorage.getItem("intenteo-reviews") || "[]")
    if (Array.isArray(reviews)) {
      for (const review of reviews) {
        if (review.date) {
          const parts = review.date.split("-")
          events.push({
            id: `review-${review.date}`,
            title: "Daily Review",
            date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
            category: "review",
          })
        }
      }
    }
  } catch {}

  try {
    const entries = JSON.parse(localStorage.getItem("intenteo-journal-entries") || "[]")
    if (Array.isArray(entries)) {
      for (const entry of entries) {
        if (entry.date) {
          const parts = String(entry.date).split("-")
          if (parts.length === 3) {
            events.push({
              id: `journal-${entry.id}`,
              title: entry.title || entry.prompt || "Journal Entry",
              date: new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])),
              category: "journal",
            })
          }
        }
      }
    }
  } catch {}

  if (events.length === 0) {
    events.push(
      { id: "demo-1", title: "Morning Journal", date: today, time: "7:00 AM", category: "habit" },
      { id: "demo-2", title: "Deep Work", date: today, time: "9:00 AM", category: "task" },
      { id: "demo-3", title: "Exercise", date: today, time: "6:00 PM", category: "habit" },
      { id: "demo-4", title: "Evening Reflection", date: today, time: "9:30 PM", category: "journal" },
    )
  }

  return events
}

export function CalendarPage() {
  const allEvents = useMemo(() => loadAllEvents(), [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("month")

  const today = new Date()
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDay = firstDay.getDay()
    const days: (Date | null)[] = []
    for (let i = 0; i < startingDay; i++) days.push(null)
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i))
    return days
  }

  const getEventsForDate = (date: Date) =>
    allEvents.filter(
      (e) =>
        e.date.getDate() === date.getDate() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getFullYear() === date.getFullYear()
    )

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

  const navigateMonth = (direction: number) =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1))

  const navigateWeek = (direction: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + direction * 7)
    setCurrentDate(d)
  }

  const navigateDay = (direction: number) => {
    const d = new Date(currentDate)
    d.setDate(d.getDate() + direction)
    setCurrentDate(d)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const selectedDayEvents = useMemo(() => getEventsForDate(selectedDate), [selectedDate, allEvents])

  const groupedEvents = useMemo(() => {
    const groups: Record<string, CalendarEvent[]> = {}
    for (const event of selectedDayEvents) {
      if (!groups[event.category]) groups[event.category] = []
      groups[event.category].push(event)
    }
    return groups
  }, [selectedDayEvents])

  const tasks = selectedDayEvents.filter((e) => e.category === "task")
  const habits = selectedDayEvents.filter((e) => e.category === "habit")

  const formatSelectedDate = (date: Date) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Day Planner</h1>
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
              {/* Month View */}
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
                                  className="text-xs p-1 rounded bg-muted truncate"
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

              {/* Week View */}
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
                            className="text-xs p-1.5 rounded-lg bg-muted"
                          >
                            <p className="font-medium truncate">{event.title}</p>
                            {event.time && <p className="text-muted-foreground">{event.time}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Day View */}
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
                              className="p-2 rounded-lg bg-muted mb-1"
                            >
                              <p className="font-medium text-sm">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.time || "All day"}</p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Agenda View */}
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
                          {isSameDay(date, today)
                            ? "Today"
                            : `${dayNames[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`}
                        </h3>
                        <div className="space-y-2">
                          {dayEvents.map((event) => (
                            <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="text-muted-foreground">
                                {TYPE_CONFIG[event.category]?.icon}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-sm text-muted-foreground">{event.time || "All day"}</p>
                              </div>
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

        {/* Daily Overview Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {formatSelectedDate(selectedDate)}
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Nothing scheduled</p>
              ) : (
                Object.entries(TYPE_CONFIG).map(([type, config]) => {
                  const items = groupedEvents[type]
                  if (!items || items.length === 0) return null
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        {config.icon}
                        <h4 className="text-xs font-medium uppercase tracking-wider">
                          {config.label}
                        </h4>
                      </div>
                      <div className="space-y-1 ml-5">
                        {items
                          .sort((a, b) => (a.time || "ZZ").localeCompare(b.time || "ZZ"))
                          .map((event) => (
                            <div key={event.id} className="flex items-center justify-between text-sm">
                              <span className="truncate">{event.title}</span>
                              {event.time && (
                                <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                  {event.time}
                                </span>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })
              )}

              {selectedDayEvents.length > 0 && (
                <div className="pt-3 border-t text-xs text-muted-foreground">
                  {tasks.length > 0 && `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
                  {tasks.length > 0 && habits.length > 0 && ", "}
                  {habits.length > 0 && `${habits.length} habit${habits.length !== 1 ? "s" : ""}`}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
