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
  { icon: Sun, label: "Purpose", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]" },
  { icon: Eye, label: "Vision", color: "bg-purple-500/10 text-purple-600" },
  { icon: Target, label: "Goals", color: "bg-blue-500/10 text-blue-600" },
  { icon: CheckSquare, label: "Tasks", color: "bg-cyan-500/10 text-cyan-600" },
  { icon: Repeat, label: "Habits", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: BookOpen, label: "Reflection", color: "bg-orange-500/10 text-orange-600" },
]

const principles = [
  { icon: Compass, title: "Intentionality over busyness", text: "Do what matters, not simply what is urgent.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]", border: "border-[#1E0E6B]/20 hover:border-[#1E0E6B]/40" },
  { icon: Heart, title: "Meaning over metrics", text: "Numbers should help you understand your life, not define it.", color: "bg-purple-500/10 text-purple-600", border: "border-purple-500/20 hover:border-purple-500/40" },
  { icon: BarChart3, title: "Progress over perfection", text: "Small, consistent actions matter more than flawless plans.", color: "bg-blue-500/10 text-blue-600", border: "border-blue-500/20 hover:border-blue-500/40" },
  { icon: Brain, title: "Reflection over autopilot", text: "Pause, learn, adjust, and move forward intentionally.", color: "bg-emerald-500/10 text-emerald-600", border: "border-emerald-500/20 hover:border-emerald-500/40" },
  { icon: Zap, title: "Consistency over intensity", text: "Build a life through sustainable actions rather than short bursts.", color: "bg-orange-500/10 text-orange-600", border: "border-orange-500/20 hover:border-orange-500/40" },
  { icon: Lightbulb, title: "Direction over drift", text: "Live on purpose, not by default. Know where you are headed.", color: "bg-cyan-500/10 text-cyan-600", border: "border-cyan-500/20 hover:border-cyan-500/40" },
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
            About Intent&eacute;o
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-foreground">We believe productivity</span><br />
            <span className="bg-gradient-to-r from-[#1E0E6B] via-[#3D1FA0] to-[#1E0E6B] bg-clip-text text-transparent">should serve a meaningful life.</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Intent&eacute;o helps you connect what matters most to how you spend your time,
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
              Why we built Intent&eacute;o
            </span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-[#FF5A1F] via-[#FF7A00] to-[#FFB000] bg-clip-text text-transparent">Why Intent&eacute;o exists</span>
            </h2>
          </div>

          <div className="mt-8 space-y-5 text-base text-muted-foreground leading-relaxed">
            <p>
              Intent&eacute;o exists because productivity should serve a meaningful life —
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
              Intent&eacute;o connects these layers. It starts with your purpose and walks
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
            The Intent&eacute;o Philosophy
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A different way to think about productivity
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Intent&eacute;o is not about doing more for the sake of doing more.
          </p>
        </div>

        <div ref={ref} className={cn("reveal reveal-delay-2", visible && "visible")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {principles.map((p, i) => (
              <div
                key={p.title}
                className={cn(
                  "rounded-xl border-2 bg-white dark:bg-gray-950 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all",
                  p.border,
                  `reveal-delay-${(i % 3) + 1}`
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", p.color)}>
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
  const { ref, visible } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal mx-auto max-w-3xl text-center", visible && "visible")}>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
            How we think about intentional living
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From what matters to what you do
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Intent&eacute;o connects what matters to how you live — from purpose and vision to goals,
            daily actions, habits, and reflection.
          </p>
          <div className="mt-8 hidden md:flex items-center justify-center gap-3">
            {framework.map((item, i) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white shadow-sm text-sm font-medium",
                  item.color
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {i < framework.length - 1 && (
                  <span className="text-[#1E0E6B]/30 text-lg">&rarr;</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex md:hidden flex-wrap items-center justify-center gap-2 sm:gap-3">
            {framework.map((item, i) => (
              <div key={item.label} className="flex items-center gap-2 sm:gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-white shadow-sm text-sm font-medium",
                  item.color
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
                {i < framework.length - 1 && (
                  <span className="text-[#1E0E6B]/30 text-lg">&rarr;</span>
                )}
              </div>
            ))}
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
              Who Intent&eacute;o Is For
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for people who want to live with intention
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto">
            {forPeople.map((item, i) => {
              const colors = [
                { bg: "bg-[#1E0E6B]/10", text: "text-[#1E0E6B]", border: "border-[#1E0E6B]/20 hover:border-[#1E0E6B]/40" },
                { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20 hover:border-purple-500/40" },
                { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20 hover:border-blue-500/40" },
                { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20 hover:border-emerald-500/40" },
                { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20 hover:border-orange-500/40" },
                { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20 hover:border-cyan-500/40" },
              ]
              const c = colors[i % colors.length]
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border-2 bg-white dark:bg-gray-950 p-4 transition-all duration-300 hover:shadow-md reveal",
                    c.border,
                    visible && "visible",
                    `reveal-delay-${(i % 3) + 1}`
                  )}
                >
                  <div className={cn("mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", c.bg)}>
                    <span className={cn("text-xs font-bold", c.text)}>{i + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              )
            })}
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
              Get Started For Free
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
