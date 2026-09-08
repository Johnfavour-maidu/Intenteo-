"use client"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: "0px 0px -20px 0px" }
    )
    obs.observe(el)
    const fallback = setTimeout(() => { setVisible(true); obs.disconnect() }, 800)
    return () => { obs.disconnect(); clearTimeout(fallback) }
  }, [threshold])
  return { ref, visible }
}

function useAnimatedValue(target: number, duration = 1500, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    let raf: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return value
}

const STAGES = [
  { id: "purpose", label: "Purpose", icon: "◈", desc: "Define your why" },
  { id: "vision", label: "Vision", icon: "◇", desc: "See your future" },
  { id: "goals", label: "Goals", icon: "◉", desc: "Set milestones" },
  { id: "tasks", label: "Tasks", icon: "▣", desc: "Daily actions" },
  { id: "habits", label: "Habits", icon: "◎", desc: "Build routines" },
  { id: "reflection", label: "Reflection", icon: "◐", desc: "Learn & grow" },
]

function OrangeButton({ children, className, href, ...props }: React.ButtonHTMLAttributes<HTMLSpanElement> & { href?: string }) {
  const inner = (
    <span className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all",
      className
    )}>
      {children}
    </span>
  )
  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  return inner
}

function SubtleButton({ children, className, href, ...props }: React.ButtonHTMLAttributes<HTMLSpanElement> & { href?: string }) {
  const inner = (
    <span className={cn(
      "inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E0E6B]/20 bg-white/80 px-7 py-3.5 text-base font-semibold text-foreground hover:bg-muted/30 transition-colors dark:bg-gray-950/40",
      className
    )}>
      {children}
    </span>
  )
  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  return inner
}

function BrowserFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950 shadow-2xl shadow-[#1E0E6B]/10 overflow-hidden transition-all duration-500 hover:shadow-[#1E0E6B]/20 hover:-translate-y-1", className)}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1E0E6B]/10 bg-[#F8F6FF] dark:bg-gray-900">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="ml-3 flex-1 rounded-lg bg-white/80 dark:bg-gray-800 h-6 px-3 flex items-center">
          <span className="text-[10px] text-muted-foreground">intenteo.app</span>
        </div>
      </div>
      <div className="p-0">{children}</div>
    </div>
  )
}

function ScreenPurpose() {
  return (
    <BrowserFrame>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E0E6B]/10 flex items-center justify-center text-[#1E0E6B] font-bold text-lg">◈</div>
          <div>
            <h4 className="font-semibold text-foreground">Life Purpose</h4>
            <p className="text-xs text-muted-foreground">Your guiding principle</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#1E0E6B]/10 bg-[#F8F6FF]/50 p-4">
          <p className="text-sm text-foreground leading-relaxed italic">"To use my gifts in service of others, creating lasting positive impact through compassion and excellence."</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] text-xs font-medium">Last reviewed: 2 days ago</span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">On track</span>
        </div>
      </div>
    </BrowserFrame>
  )
}

function ScreenVision() {
  return (
    <BrowserFrame>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EB9E5B]/10 flex items-center justify-center text-[#EB9E5B] font-bold text-lg">◇</div>
          <div>
            <h4 className="font-semibold text-foreground">My Visions</h4>
            <p className="text-xs text-muted-foreground">The life you are building</p>
          </div>
        </div>
        <div className="space-y-3">
          {["Financial Freedom by 2030", "Run a Marathon", "Launch a Nonprofit"].map((v, i) => (
            <div key={i} className="rounded-xl border border-[#1E0E6B]/10 p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5A1F]/10 to-[#FFB000]/10 flex items-center justify-center text-xs font-bold text-[#EB9E5B]">{i + 1}</div>
              <span className="text-sm font-medium text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  )
}

function ScreenGoals() {
  return (
    <BrowserFrame>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg">◉</div>
          <div>
            <h4 className="font-semibold text-foreground">Active Goals</h4>
            <p className="text-xs text-muted-foreground">Track progress toward milestones</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { name: "Save $10K emergency fund", progress: 65, health: "On Track" },
            { name: "Run 5K under 25 min", progress: 40, health: "Building" },
            { name: "Read 24 books this year", progress: 80, health: "Ahead" },
          ].map((g, i) => (
            <div key={i} className="rounded-xl border border-[#1E0E6B]/10 p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{g.name}</span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                  g.health === "Ahead" ? "bg-green-100 text-green-700" :
                  g.health === "On Track" ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                )}>{g.health}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-[#FF5A1F] to-[#FFB000]" style={{ width: `${g.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  )
}

function ScreenTasks() {
  return (
    <BrowserFrame>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-lg">▣</div>
          <div>
            <h4 className="font-semibold text-foreground">Today&apos;s Tasks</h4>
            <p className="text-xs text-muted-foreground">What matters most right now</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { text: "Draft project proposal", done: true, linked: "Save $10K goal" },
            { text: "Morning workout (30 min)", done: true, linked: "Run 5K goal" },
            { text: "Read Chapter 12", done: false, linked: "24 Books goal" },
            { text: "Call insurance provider", done: false, linked: null },
          ].map((t, i) => (
            <div key={i} className={cn("rounded-xl border p-3 flex items-center gap-3",
              t.done ? "border-green-200 bg-green-50/50" : "border-[#1E0E6B]/10"
            )}>
              <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center",
                t.done ? "bg-green-500 border-green-500" : "border-gray-300"
              )}>
                {t.done && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <span className={cn("text-sm", t.done ? "text-muted-foreground line-through" : "font-medium text-foreground")}>{t.text}</span>
                {t.linked && <span className="ml-2 text-[10px] text-[#1E0E6B] bg-[#1E0E6B]/10 px-1.5 py-0.5 rounded-full">{t.linked}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  )
}

function ScreenHabits() {
  return (
    <BrowserFrame>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg">◎</div>
          <div>
            <h4 className="font-semibold text-foreground">Habits</h4>
            <p className="text-xs text-muted-foreground">Build consistency that lasts</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Meditate", streak: 12, health: "Excellent" },
            { name: "Exercise", streak: 8, health: "Good" },
            { name: "Read", streak: 21, health: "Excellent" },
            { name: "Journal", streak: 3, health: "Building" },
          ].map((h, i) => (
            <div key={i} className="rounded-xl border border-[#1E0E6B]/10 p-3 text-center space-y-1">
              <div className="text-lg font-bold text-foreground">{h.streak}</div>
              <div className="text-xs text-muted-foreground">day streak</div>
              <div className="text-sm font-medium text-foreground">{h.name}</div>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full",
                h.health === "Excellent" ? "bg-green-100 text-green-700" :
                h.health === "Good" ? "bg-blue-100 text-blue-700" :
                "bg-amber-100 text-amber-700"
              )}>{h.health}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-[#1E0E6B]/10 bg-[#F8F6FF]/50 p-3 text-center">
          <span className="text-sm text-muted-foreground">Weekly consistency: </span>
          <span className="text-sm font-bold text-[#1E0E6B]">85%</span>
        </div>
      </div>
    </BrowserFrame>
  )
}

function ScreenReflection() {
  return (
    <BrowserFrame>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-lg">◐</div>
          <div>
            <h4 className="font-semibold text-foreground">Reflection Journal</h4>
            <p className="text-xs text-muted-foreground">Capture insights, track growth</p>
          </div>
        </div>
        <div className="rounded-xl border border-[#1E0E6B]/10 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Today&apos;s Entry</span>
            <span className="text-xs text-muted-foreground">Sep 3, 2026</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">Felt really focused during my morning routine. The meditation is helping me stay present throughout the day. Need to work on the afternoon energy dip.</p>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">Mood: Great</span>
            <span className="px-2 py-0.5 rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] text-[10px] font-medium">3 entries this week</span>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

const SCREENS = [
  { component: ScreenPurpose, story: { title: "Start with your why", text: "Everything begins with purpose. Intenteo helps you articulate the principles that guide your life, so every goal and action connects back to what truly matters to you." } },
  { component: ScreenVision, story: { title: "Visualize your future", text: "Turn abstract dreams into concrete visions. Set timeframes, add imagery, and link your visions to the life areas they impact. See the big picture before building the details." } },
  { component: ScreenGoals, story: { title: "Set meaningful goals", text: "Break your visions into measurable milestones. Intenteo tracks progress, health, and momentum automatically — so you always know if you are ahead, on pace, or need to adjust." } },
  { component: ScreenTasks, story: { title: "Do what matters today", text: "Your daily task list is powered by your goals. Every action you take is linked to something bigger, giving your day purpose and direction." } },
  { component: ScreenHabits, story: { title: "Build lasting routines", text: "Habits are the engine of transformation. Track streaks, monitor health, and let Intenteo surface insights on consistency and patterns you might miss." } },
  { component: ScreenReflection, story: { title: "Learn from your journey", text: "Capture daily reflections, mood, and gratitude. Over time, Intenteo helps you spot patterns between habits, mood, and goal progress — turning experience into wisdom." } },
]

function HeroSection() {
  const { ref, visible } = useReveal(0.05)
  return (
    <section className="relative pt-20 pb-10 md:pt-24 md:pb-14 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div ref={ref} className={cn("reveal text-center max-w-4xl mx-auto", visible && "visible")}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            One system.<br />Every part of your life.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Intenteo connects purpose, vision, goals, tasks, habits, and reflection
            into a single living system&nbsp;&mdash; so every action moves you forward.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <OrangeButton href="#">Download the App</OrangeButton>
            <SubtleButton href="/learn">Learn More</SubtleButton>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductSection({ index }: { index: number }) {
  const { ref, visible } = useReveal(0.1)
  const screen = SCREENS[index]
  const ScreenComponent = screen.component
  const isReversed = index % 2 === 1
  const isLast = index === SCREENS.length - 1

  return (
    <section className="relative py-10 md:py-14 bg-[#FAFBFF] dark:bg-[#0F0D1A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn(
          "reveal grid items-center gap-10 lg:gap-16",
          isReversed ? "lg:grid-cols-[1fr_1.1fr]" : "lg:grid-cols-[1.1fr_1fr]",
          visible && "visible"
        )}>
          {/* Story */}
          <div className={cn("space-y-5", isReversed ? "lg:order-2" : "lg:order-1")}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E0E6B] flex items-center justify-center text-white text-lg font-bold">
                {STAGES[index].icon}
              </div>
              <span className="text-xs font-semibold text-[#EB9E5B] uppercase tracking-wider">Step {index + 1}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{screen.story.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{screen.story.text}</p>
          </div>
          {/* Screen mockup */}
          <div className={cn(isReversed ? "lg:order-1" : "lg:order-2")}>
            <ScreenComponent />
          </div>
        </div>
      </div>
      {/* Progression connector */}
      {!isLast && (
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
          <div className="w-px h-10 bg-gradient-to-b from-[#1E0E6B]/20 to-[#1E0E6B]/5" />
          <div className="w-2 h-2 rounded-full bg-[#1E0E6B]/20 mx-auto -mt-1" />
        </div>
      )}
    </section>
  )
}

function IntentScoreSection() {
  const { ref, visible } = useReveal(0.2)
  const score = useAnimatedValue(78, 1800, visible)
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <section className="py-10 md:py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal grid lg:grid-cols-2 gap-12 items-center", visible && "visible")}>
          {/* Animated ring */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-[#1E0E6B]/5" />
                <circle
                  cx="60" cy="60" r="54" fill="none" stroke="url(#hiScoreGradient)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="hiScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF5A1F" />
                    <stop offset="100%" stopColor="#FFB000" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-foreground">{score}%</span>
                <span className="text-xs text-muted-foreground">Intent Score</span>
              </div>
            </div>
          </div>
          {/* Text */}
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Your daily pulse on intentional living</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Intent Score distills your entire day into a single number — weighing task completion, habit consistency, goal alignment, and reflection quality. See at a glance how well your actions match your intentions.
            </p>
            <div className="space-y-3">
              {[
                { label: "Tasks completed", value: "3 of 5", color: "bg-[#1E0E6B]" },
                { label: "Habits practiced", value: "4 of 5", color: "bg-[#EB9E5B]" },
                { label: "Goal alignment", value: "High", color: "bg-[#3D1FA0]" },
                { label: "Reflection logged", value: "Yes", color: "bg-green-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", item.color)} />
                  <span className="text-sm text-muted-foreground flex-1">{item.label}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  const { ref, visible } = useReveal(0.15)
  return (
    <section className="py-8 md:py-12 bg-gradient-to-br from-[#1E0E6B] to-[#0F0A3A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center max-w-2xl mx-auto", visible && "visible")}>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to live intentionally?</h2>
          <p className="mt-4 text-white/70">
            Your purpose, goals, tasks, habits, and reflections — all in one place. Start building the life you want today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all"
            >
              Get Started Free
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-7 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Download the App
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorksContent() {
  return (
    <>
      <HeroSection />
      <section className="pt-10 pb-2 md:pt-14 md:pb-4 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-semibold text-[#EB9E5B] uppercase tracking-wider mb-2">The Intenteo Journey</p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Six steps to intentional living</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Each step builds naturally on the last, connecting your purpose to your daily actions.</p>
          </div>
        </div>
      </section>
      {SCREENS.map((_, i) => (
        <ProductSection key={i} index={i} />
      ))}
      <IntentScoreSection />
      <FinalCTA />
    </>
  )
}
