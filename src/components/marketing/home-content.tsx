"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Sun,
  Eye,
  Target,
  CheckSquare,
  Repeat,
  BookOpen,
  BarChart3,
  Sparkles,
  Zap,
  Heart,
} from "lucide-react"

/* ─── Scroll reveal ─── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

/* ─── Framework data ─── */
const framework = [
  { icon: Sun, label: "Purpose", short: "Why it matters.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]" },
  { icon: Eye, label: "Vision", short: "Where you're going.", color: "bg-purple-500/10 text-purple-600" },
  { icon: Target, label: "Goals", short: "What you aim for.", color: "bg-blue-500/10 text-blue-600" },
  { icon: CheckSquare, label: "Tasks", short: "What you do today.", color: "bg-cyan-500/10 text-cyan-600" },
  { icon: Repeat, label: "Habits", short: "Who you're becoming.", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: BookOpen, label: "Reflection", short: "What you're learning.", color: "bg-orange-500/10 text-orange-600" },
]

/* ─── Capabilities data ─── */
const capabilities = [
  { icon: Target, title: "Direction", description: "Define your purpose, vision, and meaningful goals.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]", border: "border-[#1E0E6B]/20 hover:border-[#1E0E6B]/40" },
  { icon: CheckSquare, title: "Daily Action", description: "Organize tasks, focus, and intentional reminders.", color: "bg-blue-500/10 text-blue-600", border: "border-blue-500/20 hover:border-blue-500/40" },
  { icon: Repeat, title: "Personal Growth", description: "Build habits, track progress, and grow intentionally.", color: "bg-emerald-500/10 text-emerald-600", border: "border-emerald-500/20 hover:border-emerald-500/40" },
  { icon: BookOpen, title: "Reflection", description: "Journal, reflect, and understand your intentional living.", color: "bg-purple-500/10 text-purple-600", border: "border-purple-500/20 hover:border-purple-500/40" },
]

/* ─── Browser Frame ─── */
function BrowserFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950 shadow-2xl shadow-[#1E0E6B]/8 overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E0E6B]/8 bg-[#F8F6FF]/80 dark:bg-[#1A1730]/80">
        <span className="w-3 h-3 rounded-full bg-red-400/80" />
        <span className="w-3 h-3 rounded-full bg-amber-400/80" />
        <span className="w-3 h-3 rounded-full bg-green-400/80" />
        <div className="flex-1 mx-4">
          <div className="mx-auto max-w-xs h-6 rounded-md bg-[#1E0E6B]/5 flex items-center justify-center">
            <span className="text-[10px] text-muted-foreground/60 font-medium">intenteo.app</span>
          </div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

/* ─── Stat Pill ─── */
function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1E0E6B]/8 bg-[#F8F6FF]/50 px-4 py-3">
      <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
        <span className="text-sm font-bold text-white">{value}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}

export function HomeContent() {
  const { ref: heroRef, visible: heroVis } = useReveal(0.05)
  const { ref: fwRef, visible: fwVis } = useReveal(0.1)
  const { ref: fwDeskRef, visible: fwDeskVis } = useReveal(0.1)
  const { ref: actionRef, visible: actionVis } = useReveal()
  const { ref: scoreRef, visible: scoreVis } = useReveal()
  const { ref: scoreDeskRef, visible: scoreDeskVis } = useReveal()
  const { ref: capsRef, visible: capsVis } = useReveal()
  const { ref: ctaRef, visible: ctaVis } = useReveal()

  const [animPercent, setAnimPercent] = useState(0)
  const targetPercent = 78

  useEffect(() => {
    if (!scoreVis && !scoreDeskRef) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setAnimPercent(targetPercent); return }
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setAnimPercent(Math.round(eased * targetPercent))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [scoreVis, scoreDeskRef])

  const circ = 2 * Math.PI * 54
  const dash = circ - (animPercent / 100) * circ

  return (
    <>
      {/* ═══════════════════════════════════════════ 1. HERO ═══════════════════════════════════════════ */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
        {/* Subtle decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#1E0E6B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#EB9E5B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div ref={heroRef} className={cn("mx-auto max-w-4xl text-center reveal", heroVis && "visible")}>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Live with intention.
              <br />
              <span className="bg-gradient-to-r from-[#1E0E6B] to-[#3D1FA0] bg-clip-text text-transparent">Do what matters.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Intente&oacute; connects your purpose, goals, tasks, habits, and reflection
              so your everyday actions move you toward the life you want to live.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#1E0E6B]/15 bg-white/80 px-8 py-3.5 text-base font-semibold text-foreground hover:bg-[#F8F6FF] hover:border-[#1E0E6B]/25 transition-all duration-300 dark:bg-gray-950/40"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* Hero Product Visual */}
          <div className={cn("mt-16 mx-auto max-w-5xl reveal", heroVis && "visible")} style={{ transitionDelay: "0.2s" }}>
            <BrowserFrame className="transform transition-all duration-700 hover:scale-[1.01]">
              <div className="p-6 md:p-8">
                {/* Today header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#EB9E5B]">Today</p>
                    <h3 className="text-xl font-bold text-foreground mt-0.5">Today&apos;s Intention</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Focus deeply on what matters most today.</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2.5 py-1 rounded-full bg-[#1E0E6B]/5 font-medium">Wednesday, Sep 3</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <StatPill label="Intent Score" value={`${targetPercent}%`} color="bg-[#1E0E6B]" />
                  <StatPill label="Tasks Done" value="3/5" color="bg-blue-500" />
                  <StatPill label="Habits" value="4/5" color="bg-emerald-500" />
                </div>

                {/* Task cards */}
                <div className="space-y-2.5">
                  {[
                    { text: "Plan weekly review with team", tag: "Priority", tagColor: "bg-[#1E0E6B]/10 text-[#1E0E6B]" },
                    { text: "Write project proposal draft", tag: null, tagColor: "" },
                    { text: "Review Q3 goal progress", tag: null, tagColor: "" },
                  ].map((task) => (
                    <div key={task.text} className="flex items-center gap-3 h-12 rounded-xl border border-[#1E0E6B]/8 bg-[#F8F6FF]/40 px-4">
                      <div className="h-5 w-5 rounded-md border-2 border-[#1E0E6B]/20 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground flex-1">{task.text}</span>
                      {task.tag && (
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", task.tagColor)}>
                          {task.tag}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Habits row */}
                <div className="mt-5 flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Habits</span>
                  <div className="flex gap-2">
                    {["Morning journal", "Read 20 min", "Exercise", "Gratitude"].map((h) => (
                      <span key={h} className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium hidden sm:inline-block">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ 3. FRAMEWORK ═══════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-2">The Intente&oacute; Framework</span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Your intentional living framework
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              From what matters to what you do.
            </p>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden lg:block mx-auto max-w-5xl">
            <div ref={fwDeskRef} className={cn("reveal", fwDeskVis && "visible")}>
              <div className="relative flex items-start justify-between">
                {/* Connector segments between boxes */}
                <div className="absolute top-8 left-[15%] w-[1.2%] h-[2px] bg-[#1E0E6B]/20" />
                <div className="absolute top-8 left-[32.2%] w-[1.2%] h-[2px] bg-[#1E0E6B]/25" />
                <div className="absolute top-8 left-[49.4%] w-[1.2%] h-[2px] bg-[#1E0E6B]/30" />
                <div className="absolute top-8 left-[66.6%] w-[1.2%] h-[2px] bg-[#1E0E6B]/25" />
                <div className="absolute top-8 left-[83.8%] w-[1.2%] h-[2px] bg-[#1E0E6B]/20" />

                {framework.map((item, i) => (
                  <div
                    key={item.label}
                    className={cn(
                      "relative flex flex-col items-center text-center w-[14%] reveal",
                      fwDeskVis && "visible",
                      `reveal-delay-${i + 1}`
                    )}
                  >
                    <div className={cn("relative z-10 mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-white shadow-sm", item.color)}>
                      <item.icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{item.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{item.short}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: vertical */}
          <div className="lg:hidden mx-auto max-w-md">
            <div ref={fwRef} className={cn("relative", fwVis && "visible")}>
              <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-gradient-to-b from-[#1E0E6B]/20 via-[#1E0E6B]/30 to-[#1E0E6B]/20" />
              <div className="space-y-6">
                {framework.map((item, i) => (
                  <div
                    key={item.label}
                    className={cn(
                      "relative flex items-start gap-4 reveal",
                      fwVis && "visible",
                      `reveal-delay-${i + 1}`
                    )}
                  >
                    <div className={cn("relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white shadow-sm", item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="pt-1">
                      <h3 className="font-semibold text-foreground">{item.label}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.short}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E0E6B]/15 bg-white/80 px-7 py-3 text-sm font-semibold text-[#1E0E6B] hover:bg-[#F8F6FF] hover:border-[#1E0E6B]/25 transition-all duration-300 dark:bg-gray-950/40">
              Explore how it works <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ 4. SEE INTENTEO IN ACTION ═══════════════════════════ */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              See Intente&oacute; in action.
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything is connected&nbsp;&mdash; from the direction you set to the actions you take today.
            </p>
          </div>

          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-5">
            {/* Large: Today */}
            <div className="lg:col-span-3">
              <BrowserFrame>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-[#1E0E6B]/10 flex items-center justify-center">
                      <Sun className="h-4 w-4 text-[#1E0E6B]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#EB9E5B]">Today</p>
                      <h4 className="text-sm font-bold text-foreground">Today&apos;s Intention</h4>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Be present and focused in every conversation.</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-[#1E0E6B]/5">
                      <div className="text-lg font-bold text-[#1E0E6B]">{targetPercent}%</div>
                      <p className="text-[10px] text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-500/5">
                      <div className="text-lg font-bold text-blue-600">3/5</div>
                      <p className="text-[10px] text-muted-foreground">Tasks</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-emerald-500/5">
                      <div className="text-lg font-bold text-emerald-600">4/5</div>
                      <p className="text-[10px] text-muted-foreground">Habits</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {["Team weekly review", "Write proposal draft", "Evening reflection"].map((t) => (
                      <div key={t} className="flex items-center gap-2 h-9 rounded-lg border border-[#1E0E6B]/6 px-3">
                        <div className="h-4 w-4 rounded border-[1.5px] border-[#1E0E6B]/20 flex-shrink-0" />
                        <span className="text-xs font-medium text-foreground">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </BrowserFrame>
            </div>

            {/* Small stack: Habits + Goals */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <BrowserFrame className="flex-1">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Repeat className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Habits</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: "Morning Journal", streak: "12 days", pct: 85 },
                      { name: "Read 20 min", streak: "8 days", pct: 70 },
                      { name: "Exercise", streak: "5 days", pct: 55 },
                      { name: "Gratitude", streak: "15 days", pct: 92 },
                    ].map((h) => (
                      <div key={h.name} className="p-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                        <p className="text-xs font-semibold text-foreground">{h.name}</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">{h.streak} streak</p>
                        <div className="mt-1.5 h-1.5 rounded-full bg-emerald-500/10 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${h.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BrowserFrame>

              <BrowserFrame className="flex-1">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Target className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Goals</h4>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: "Launch side project", pct: 72, color: "bg-blue-500" },
                      { name: "Read 24 books this year", pct: 58, color: "bg-purple-500" },
                      { name: "Run a half marathon", pct: 35, color: "bg-emerald-500" },
                    ].map((g) => (
                      <div key={g.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-foreground">{g.name}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground">{g.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1E0E6B]/5 overflow-hidden">
                          <div className={cn("h-full rounded-full", g.color)} style={{ width: `${g.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BrowserFrame>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════ 5. START EACH DAY WITH INTENTION ═════════════════════════ */}
      <section className="py-14 md:py-20 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={actionRef} className={cn("mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center reveal", actionVis && "visible")}>
            {/* Left: Screenshot */}
            <div>
              <BrowserFrame>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-[#EB9E5B]" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#EB9E5B]">Your Day, With Purpose</p>
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-1">Good morning. What matters today?</h4>
                  <p className="text-xs text-muted-foreground mb-4">Wednesday, September 3, 2025</p>

                  <div className="space-y-3">
                    {/* Intention */}
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#1E0E6B]/5 to-purple-500/5 border border-[#1E0E6B]/10">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1E0E6B] mb-1">Today&apos;s Intention</p>
                      <p className="text-sm font-medium text-foreground">Be present and focused in every conversation.</p>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg bg-[#1E0E6B]/5">
                        <div className="text-base font-bold text-[#1E0E6B]">78%</div>
                        <p className="text-[9px] text-muted-foreground">Score</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-blue-500/5">
                        <div className="text-base font-bold text-blue-600">2/4</div>
                        <p className="text-[9px] text-muted-foreground">Tasks</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-emerald-500/5">
                        <div className="text-base font-bold text-emerald-600">3/5</div>
                        <p className="text-[9px] text-muted-foreground">Habits</p>
                      </div>
                    </div>

                    {/* Focus tasks */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Focus Tasks</p>
                      <div className="space-y-1.5">
                        {["Prepare presentation slides", "Call dentist for appointment"].map((t) => (
                          <div key={t} className="flex items-center gap-2 h-8 rounded-lg border border-[#1E0E6B]/6 px-3">
                            <div className="h-3.5 w-3.5 rounded border-[1.5px] border-[#1E0E6B]/20" />
                            <span className="text-xs font-medium text-foreground">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </BrowserFrame>
            </div>

            {/* Right: Text */}
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">Your Day, With Purpose</span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Know what matters before the day gets busy.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                The Today page brings your direction, priorities, habits, and reflection
                together into one calm daily guide.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Set your daily intention",
                  "Identify focus areas and priority tasks",
                  "Track the habits that matter",
                  "Reflect and measure your day",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-1 h-5 w-5 rounded-full bg-[#1E0E6B]/10 flex items-center justify-center flex-shrink-0">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#1E0E6B]" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E0E6B]/15 bg-white/80 px-6 py-3 text-sm font-semibold text-[#1E0E6B] hover:bg-[#F8F6FF] hover:border-[#1E0E6B]/25 transition-all duration-300">
                  Explore your day <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════ 6. INTENT SCORE ═════════════════════════════ */}
      <section className="py-14 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
            {/* Score circle — Mobile */}
            <div className="lg:hidden" ref={scoreRef}>
              <div className={cn("flex justify-center reveal", scoreVis && "visible")}>
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-[#1E0E6B]/5" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGradM)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash} className="transition-all duration-100" />
                    <defs>
                      <linearGradient id="scoreGradM" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1E0E6B" />
                        <stop offset="100%" stopColor="#3D1FA0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-foreground">{animPercent}%</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Intent Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score circle — Desktop */}
            <div className="hidden lg:block" ref={scoreDeskRef}>
              <div className={cn("flex justify-center reveal", scoreDeskVis && "visible")}>
                <div className="relative">
                  <svg width="260" height="260" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-[#1E0E6B]/5" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGradD)" strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash} className="transition-all duration-100" />
                    <defs>
                      <linearGradient id="scoreGradD" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1E0E6B" />
                        <stop offset="100%" stopColor="#3D1FA0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-foreground">{animPercent}%</span>
                    <span className="text-sm text-muted-foreground mt-1">Intent Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Measure intention, not just productivity.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                The Intent Score reflects how intentionally you lived your day&nbsp;&mdash; based on
                the actions and practices that matter most.
              </p>

              {/* Component dots */}
              <div className="mt-6 flex flex-wrap gap-4">
                {[
                  { label: "Purpose", color: "bg-[#1E0E6B]" },
                  { label: "Goals", color: "bg-blue-500" },
                  { label: "Tasks", color: "bg-cyan-500" },
                  { label: "Habits", color: "bg-emerald-500" },
                  { label: "Reflection", color: "bg-orange-500" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-1.5">
                    <div className={cn("w-2.5 h-2.5 rounded-full", c.color)} />
                    <span className="text-sm text-muted-foreground">{c.label}</span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-sm text-muted-foreground italic">
                It&apos;s not about doing more. It&apos;s about living more intentionally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ 7. CORE CAPABILITIES ═══════════════════════════ */}
      <section className="py-14 md:py-20 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything works together.
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Four layers of intentional living, unified in one experience.
            </p>
          </div>

          <div ref={capsRef} className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mx-auto max-w-5xl reveal", capsVis && "visible")}>
            {capabilities.map((cap, i) => (
              <div
                key={cap.title}
                className={cn(
                  "rounded-2xl border-2 bg-white/70 dark:bg-gray-950/50 p-5 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 reveal",
                  cap.border,
                  capsVis && "visible",
                  `reveal-delay-${i + 1}`
                )}
              >
                <div className={cn("mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl", cap.color)}>
                  <cap.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold text-foreground">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E0E6B]/15 bg-white/80 px-7 py-3 text-sm font-semibold text-[#1E0E6B] hover:bg-[#F8F6FF] hover:border-[#1E0E6B]/25 transition-all duration-300 dark:bg-gray-950/40">
              Explore all features <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ 8. FINAL CTA ═══════════════════════════════════ */}
      <section className="py-10 md:py-14 bg-[#1E0E6B]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={ctaRef} className={cn("mx-auto max-w-2xl text-center reveal", ctaVis && "visible")}>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to live with intention?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Connect what matters to you with what you do every day.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
