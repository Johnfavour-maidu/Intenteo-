"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time?: string
  endTime?: string
  category: "task" | "goal" | "habit" | "journal" | "meeting" | "personal" | "challenge"
  color: string
  description?: string
  location?: string
}

const generateEvents = (): CalendarEvent[] => {
  const today = new Date()
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Deep Work Block",
      date: today,
      time: "9:00 AM",
      endTime: "11:00 AM",
      category: "task",
      color: "bg-blue-500",
      location: "Focus mode",
    },
    {
      id: "2",
      title: "Team Standup",
      date: today,
      time: "11:00 AM",
      endTime: "11:30 AM",
      category: "meeting",
      color: "bg-purple-500",
      location: "Zoom",
    },
    {
      id: "3",
      title: "Morning Journal",
      date: today,
      time: "7:00 AM",
      category: "habit",
      color: "bg-amber-500",
    },
    {
      id: "4",
      title: "Exercise",
      date: today,
      time: "6:00 PM",
      category: "habit",
      color: "bg-emerald-500",
    },
    {
      id: "5",
      title: "Read 30 Minutes",
      date: today,
      time: "9:00 PM",
      category: "habit",
      color: "bg-cyan-500",
    },
    {
      id: "6",
      title: "Complete Q2 Strategy",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      time: "2:00 PM",
      category: "goal",
      color: "bg-indigo-500",
    },
    {
      id: "7",
      title: "Weekly Planning",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      time: "10:00 AM",
      category: "task",
      color: "bg-blue-500",
    },
    {
      id: "8",
      title: "Date Night",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      time: "7:00 PM",
      category: "personal",
      color: "bg-rose-500",
    },
    {
      id: "9",
      title: "21-Day Reading Challenge",
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      category: "challenge",
      color: "bg-orange-500",
    },
    {
      id: "10",
      title: "Evening Reflection",
      date: today,
      time: "9:30 PM",
      category: "journal",
      color: "bg-violet-500",
    },
  ]
  return events
}

const categoryColors: Record<string, string> = {
  task: "bg-blue-500",
  goal: "bg-indigo-500",
  habit: "bg-amber-500",
  journal: "bg-violet-500",
  meeting: "bg-purple-500",
  personal: "bg-rose-500",
  challenge: "bg-orange-500",
}

const categoryLabels: Record<string, string> = {
  task: "Task",
  goal: "Goal",
  habit: "Habit",
  journal: "Journal",
  meeting: "Meeting",
  personal: "Personal",
  challenge: "Challenge",
}

export function CalendarPage() {
  const [events] = useState(generateEvents())
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Manage your time with intention</p>
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
                  {Array.from({ length: 12 }, (_, i) => i + 7).map((hour) => (
                    <div key={hour} className="flex items-start gap-4">
                      <span className="text-xs text-muted-foreground w-16 shrink-0 pt-1">
                        {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                      </span>
                      <div className="flex-1 min-h-[60px] rounded-xl border border-dashed p-2">
                        {getEventsForDate(currentDate)
                          .filter((e) => {
                            if (!e.time) return false
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
                              <p className="text-xs opacity-80">{event.time}</p>
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
                          {isSameDay(date, today) ? "Today" : date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
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
          {/* Weather */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                  <Sun className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">72°F</p>
                  <p className="text-sm text-muted-foreground">Sunny</p>
                </div>
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
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`h-2 w-2 rounded-full ${categoryColors[event.category]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.time || "All day"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mini Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {monthNames.slice(0, 12).map((month, index) => (
                  <button
                    key={month}
                    className={`p-2 text-xs rounded-lg transition-colors ${
                      currentDate.getMonth() === index
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), index, 1))}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
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
