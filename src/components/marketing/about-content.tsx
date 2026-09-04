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
  Brain,
  Heart,
  Compass,
  BarChart3,
  Lightbulb,
  Zap,
} from "lucide-react"

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
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

const framework = [
  { icon: Sun, label: "Purpose", short: "Define what matters most.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]" },
  { icon: Eye, label: "Vision", short: "See the life you are building.", color: "bg-purple-500/10 text-purple-600" },
  { icon: Target, label: "Goals", short: "Set meaningful milestones.", color: "bg-blue-500/10 text-blue-600" },
  { icon: CheckSquare, label: "Tasks", short: "Take purposeful action daily.", color: "bg-cyan-500/10 text-cyan-600" },
  { icon: Repeat, label: "Habits", short: "Build routines that last.", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: BookOpen, label: "Reflection", short: "Learn and grow from experience.", color: "bg-orange-500/10 text-orange-600" },
]

const principles = [
  { icon: Compass, title: "Intentionality over busyness", text: "Do what matters, not simply what is urgent." },
  { icon: Heart, title: "Meaning over metrics", text: "Numbers should help you understand your life, not define it." },
  { icon: BarChart3, title: "Progress over perfection", text: "Small, consistent actions matter more than flawless plans." },
  { icon: Brain, title: "Reflection over autopilot", text: "Pause, learn, adjust, and move forward intentionally." },
  { icon: Zap, title: "Consistency over intensity", text: "Build a life through sustainable actions rather than short bursts." },
]

const forPeople = [
  "Get clear about what matters",
  "Turn values into meaningful goals",
  "Organize days around priorities",
  "Build habits that support who they want to become",
  "Reflect and learn from their experiences",
  "Understand progress beyond simple productivity metrics",
]

function HeroSection() {
  const { ref, visible } = useReveal()
  return (
    <section className="relative pt-24 pb-14 md:pt-28 md:pb-18 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center max-w-3xl mx-auto", visible && "visible")}>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
            About Intenteo
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            We believe productivity should serve a meaningful life.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Intenteo helps you connect what matters most to how you spend your time,
            pursue your goals, build your habits, and reflect on the life you are creating.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all"
            >
              Start Living With Intention
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E0E6B]/20 bg-white/80 px-7 py-3.5 text-base font-semibold text-foreground hover:bg-muted/30 transition-colors dark:bg-gray-950/40"
            >
              Explore How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  const { ref: titleRef, visible: titleVis } = useReveal()
  const { ref: cardsRef, visible: cardsVis } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div ref={titleRef} className={cn("reveal", titleVis && "visible")}>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
              Why we built Intenteo
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Intenteo exists
            </h2>
          </div>

          <div className="mt-8 space-y-5 text-base text-muted-foreground leading-relaxed">
            <p>
              Intenteo exists because productivity should serve a meaningful life —
              not become the purpose itself.
            </p>
            <p>
              We noticed a quiet problem. People would follow the most effective
              systems, complete every task, track every habit, and still feel
              disconnected from what actually mattered. The tools were powerful —
              but they operated in isolation. Purpose lived in one place, goals in
              another, tasks in a third.
            </p>
            <p>
              Intenteo connects these layers. It starts with your purpose and walks
              down through your vision, your goals, your daily actions, your habits,
              and your reflection. Each layer informs the next. Each action is tied
              to meaning.
            </p>
          </div>

          <div
            ref={cardsRef}
            className={cn("mt-10 grid gap-4 sm:grid-cols-3 reveal", cardsVis && "visible")}
          >
            {[
              { icon: Target, title: "Purpose", text: "Know what truly matters.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]" },
              { icon: Eye, title: "Alignment", text: "Connect daily actions to the bigger picture.", color: "bg-purple-500/10 text-purple-600" },
              { icon: BookOpen, title: "Reflection", text: "Learn from how you actually live.", color: "bg-orange-500/10 text-orange-600" },
            ].map((card, i) => (
              <div
                key={card.title}
                className={cn(
                  "rounded-2xl border-2 border-[#1E0E6B]/20 p-5 text-center transition-all duration-300 hover:shadow-md hover:border-[#1E0E6B]/40 reveal",
                  cardsVis && "visible",
                  `reveal-delay-${i + 1}`
                )}
              >
                <div className={cn("mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl", card.color)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function PhilosophySection() {
  const { ref, visible } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-[#FAFBFF] dark:bg-[#0F0D1A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center mb-10", visible && "visible")}>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
            The Intenteo Philosophy
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A different way to think about productivity
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Intenteo is not about doing more for the sake of doing more.
          </p>
        </div>

        <div ref={ref} className={cn("reveal reveal-delay-2", visible && "visible")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {principles.map((p, i) => (
              <div
                key={p.title}
                className={cn(
                  "rounded-xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all",
                  `reveal-delay-${(i % 3) + 1}`
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1E0E6B]/10 flex items-center justify-center text-[#1E0E6B]">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FrameworkSection() {
  const { ref: fwRef, visible: fwVis } = useReveal(0.1)
  const { ref: fwDeskRef, visible: fwDeskVis } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
              The Intenteo Framework
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From what matters to what you do
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Each layer informs the next, helping you move from what matters to what you do every day.
            </p>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden lg:block">
            <div ref={fwDeskRef} className={cn("reveal", fwDeskVis && "visible")}>
              <div className="relative flex items-start justify-between">
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
          <div className="lg:hidden">
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
        </div>
      </div>
    </section>
  )
}

function ForWhomSection() {
  const { ref, visible } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-[#FAFBFF] dark:bg-[#0F0D1A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal max-w-3xl mx-auto", visible && "visible")}>
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
              Who Intenteo Is For
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for people who want to live with intention
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
            {forPeople.map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950 p-4 reveal",
                  visible && "visible",
                  `reveal-delay-${(i % 3) + 1}`
                )}
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#1E0E6B]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1E0E6B] text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BeliefSection() {
  const { ref, visible } = useReveal(0.15)
  return (
    <section className="py-14 md:py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center max-w-2xl mx-auto", visible && "visible")}>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Your productivity should reflect the life you want to live.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            The goal is not to fill every hour, complete the longest task list, or
            constantly optimize. The goal is to make your actions increasingly aligned
            with what matters.
          </p>
        </div>
      </div>
    </section>
  )
}

function FinalCTA() {
  const { ref, visible } = useReveal(0.15)
  return (
    <section className="py-10 md:py-14 bg-[#1E0E6B]">
      <div ref={ref} className={cn("container mx-auto px-4 sm:px-6 lg:px-8 reveal", visible && "visible")}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Start living with intention.
          </h2>
          <p className="mt-3 text-base text-white/70">
            Connect what matters to how you live every day.
          </p>
          <div className="mt-6">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function AboutContent() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <PhilosophySection />
      <FrameworkSection />
      <ForWhomSection />
      <BeliefSection />
      <FinalCTA />
    </>
  )
}
