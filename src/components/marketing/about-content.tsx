"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Sun,
  Target,
  CheckSquare,
  Repeat,
  BookOpen,
  Heart,
  Lightbulb,
  Eye,
} from "lucide-react"

/* ─── Scroll reveal observer ─── */
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

/* ─── Shared CTA button ─── */
function OrangeButton({ children, className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-[#EB9E5B]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#EB9E5B]/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EB9E5B]/50 focus-visible:ring-offset-2",
        className
      )}
      style={{ background: "linear-gradient(135deg, #EB9E5B 0%, #F5A623 100%)" }}
    >
      {children}
    </Link>
  )
}

function SubtleButton({ children, className, ...props }: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E0E6B]/15 bg-white/80 px-8 py-3.5 text-base font-semibold text-foreground transition-all duration-300 hover:bg-muted/30 dark:bg-gray-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E0E6B]/30 focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </Link>
  )
}

/* ═══════════════════════════════════════════════════
   ABOUT HERO
   ═══════════════════════════════════════════════════ */
function AboutHero() {
  const { ref: r1, visible: v1 } = useReveal()
  const { ref: r2, visible: v2 } = useReveal()
  const { ref: r3, visible: v3 } = useReveal()

  return (
    <section className="relative pt-28 pb-20 md:pt-32 md:pb-28 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div ref={r1} className={cn("reveal", v1 && "visible")}>
            <span className="inline-block rounded-full bg-[#EB9E5B]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#EB9E5B]">
              About Intenteó
            </span>
          </div>

          <h1
            ref={r2}
            className={cn(
              "mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.5rem] leading-tight reveal reveal-delay-1",
              v2 && "visible"
            )}
          >
            Productivity should serve a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E0E6B] to-[#3D1FA0]">
              meaningful life
            </span>.
          </h1>

          <p
            ref={r3}
            className={cn(
              "mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed reveal reveal-delay-2",
              v3 && "visible"
            )}
          >
            Intenteó helps you connect your purpose, vision, goals, tasks, habits and
            reflection — so you can live with greater intention.
          </p>

          <div className={cn("mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 reveal reveal-delay-3", v3 && "visible")}>
            <OrangeButton href="/signup">
              Start Living With Intention
              <ArrowRight className="h-4 w-4" />
            </OrangeButton>
            <SubtleButton href="/how-it-works">
              Explore How It Works
            </SubtleButton>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   WHY INTENTEO EXISTS
   ═══════════════════════════════════════════════════ */
const philosophyCards = [
  {
    icon: Target,
    title: "Purpose",
    text: "Know what truly matters.",
    color: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
  },
  {
    icon: Eye,
    title: "Alignment",
    text: "Connect your daily actions to your bigger picture.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: BookOpen,
    title: "Reflection",
    text: "Learn from how you actually live.",
    color: "bg-orange-500/10 text-orange-600",
  },
]

function WhySection() {
  const { ref: titleRef, visible: titleVis } = useReveal()
  const { ref: cardsRef, visible: cardsVis } = useReveal(0.1)

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div
            ref={titleRef}
            className={cn("reveal", titleVis && "visible")}
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
              Why we built Intenteó
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Intenteó exists
            </h2>
          </div>

          <div className="mt-8 space-y-5 text-base text-muted-foreground leading-relaxed">
            <p>
              Intenteó exists because productivity should serve a meaningful life —
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
              Intenteó connects these layers. It starts with your purpose and walks
              down through your vision, your goals, your daily actions, your habits,
              and your reflection. Each layer informs the next. Each action is tied
              to meaning.
            </p>
            <p>
              We built Intenteó for anyone who wants to do less randomly and more
              meaningfully.
            </p>
          </div>

          {/* Philosophy cards */}
          <div
            ref={cardsRef}
            className={cn("mt-10 grid gap-4 sm:grid-cols-3 reveal", cardsVis && "visible")}
          >
            {philosophyCards.map((card, i) => (
              <div
                key={card.title}
                className={cn(
                  "rounded-2xl border border-[#1E0E6B]/8 p-5 text-center transition-all duration-300 hover:shadow-md hover:border-[#1E0E6B]/15 reveal",
                  cardsVis && "visible",
                  i === 0 && "reveal-delay-1",
                  i === 1 && "reveal-delay-2",
                  i === 2 && "reveal-delay-3"
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

/* ═══════════════════════════════════════════════════
   INTENTEO FRAMEWORK
   ═══════════════════════════════════════════════════ */
interface FrameworkItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  short: string
  color: string
  dotColor: string
}

const framework: FrameworkItem[] = [
  { icon: Sun, label: "Purpose", short: "Why it matters.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]", dotColor: "bg-[#1E0E6B]" },
  { icon: Eye, label: "Vision", short: "Where you're going.", color: "bg-purple-500/10 text-purple-600", dotColor: "bg-purple-500" },
  { icon: Target, label: "Goals", short: "What you want to achieve.", color: "bg-blue-500/10 text-blue-600", dotColor: "bg-blue-500" },
  { icon: CheckSquare, label: "Tasks", short: "What you need to do.", color: "bg-cyan-500/10 text-cyan-600", dotColor: "bg-cyan-500" },
  { icon: Repeat, label: "Habits", short: "Who you're becoming.", color: "bg-emerald-500/10 text-emerald-600", dotColor: "bg-emerald-500" },
  { icon: BookOpen, label: "Reflection", short: "What you're learning.", color: "bg-orange-500/10 text-orange-600", dotColor: "bg-orange-500" },
]

function FrameworkSection() {
  const { ref, visible } = useReveal(0.1)

  return (
    <section className="py-20 md:py-24 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
            The Intenteó Framework
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            From what matters to what you do
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Intenteó connects the bigger picture with the actions of everyday life.
          </p>
        </div>

        {/* Desktop: horizontal layout */}
        <div className="hidden lg:block mx-auto max-w-5xl">
          <div
            ref={ref}
            className={cn("reveal", visible && "visible")}
          >
            <div className="relative flex items-start justify-between">
              {/* Connecting line */}
              <div className="absolute top-8 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-[#1E0E6B]/20 via-[#1E0E6B]/30 to-[#1E0E6B]/20" />

              {framework.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    "relative flex flex-col items-center text-center w-[14%] reveal",
                    visible && "visible",
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

        {/* Mobile/Tablet: vertical layout */}
        <div className="lg:hidden mx-auto max-w-md">
          <div
            ref={ref}
            className={cn("relative", visible && "visible")}
          >
            {/* Vertical connector */}
            <div className="absolute top-0 bottom-0 left-6 w-[2px] bg-gradient-to-b from-[#1E0E6B]/20 via-[#1E0E6B]/30 to-[#1E0E6B]/20" />

            <div className="space-y-6">
              {framework.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    "relative flex items-start gap-4 reveal",
                    visible && "visible",
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
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   INTENT SCORE
   ═══════════════════════════════════════════════════ */
function IntentScoreSection() {
  const { ref: visualRef, visible: visualVis } = useReveal()
  const { ref: textRef, visible: textVis } = useReveal()
  const [animatedPercent, setAnimatedPercent] = useState(0)
  const targetPercent = 78

  useEffect(() => {
    if (!visualVis) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setAnimatedPercent(targetPercent); return }
    let start = 0
    const duration = 1200
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedPercent(Math.round(eased * targetPercent))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [visualVis])

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (animatedPercent / 100) * circumference

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Mobile: stacked */}
          <div className="lg:hidden">
            <div
              ref={visualRef}
              className={cn("flex justify-center mb-10 reveal", visualVis && "visible")}
            >
              <div className="relative">
                <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-[#1E0E6B]/5" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGradient)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-100"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1E0E6B" />
                      <stop offset="100%" stopColor="#3D1FA0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{animatedPercent}%</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Intent Score</span>
                </div>
              </div>
            </div>

            <div
              ref={textRef}
              className={cn("text-center reveal", textVis && "visible")}
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
                Intent Score
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Measure intention, not just productivity.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                The Intent Score isn&apos;t simply a measure of how much you accomplished.
                It reflects how intentionally you lived your day — based on the actions
                and practices that matter most.
              </p>
              <p className="mt-4 text-sm text-muted-foreground italic">
                How intentionally did you live today?
              </p>
            </div>
          </div>

          {/* Desktop: side by side */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
            <div
              ref={visualRef}
              className={cn("flex justify-center reveal", visualVis && "visible")}
            >
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 120 120" className="transform -rotate-90">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                    className="text-[#1E0E6B]/5" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="url(#scoreGradientDesktop)" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-100"
                  />
                  <defs>
                    <linearGradient id="scoreGradientDesktop" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1E0E6B" />
                      <stop offset="100%" stopColor="#3D1FA0" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{animatedPercent}%</span>
                  <span className="text-xs text-muted-foreground mt-0.5">Intent Score</span>
                </div>
              </div>
            </div>

            <div
              ref={textRef}
              className={cn("reveal reveal-delay-1", textVis && "visible")}
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
                Intent Score
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Measure intention, not just productivity.
              </h2>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
                The Intent Score isn&apos;t simply a measure of how much you accomplished.
                It reflects how intentionally you lived your day — based on the actions
                and practices that matter most.
              </p>
              <p className="mt-4 text-sm text-muted-foreground italic">
                How intentionally did you live today?
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════════════ */
function FinalCTA() {
  const { ref, visible } = useReveal()

  return (
    <section className="py-20 md:py-28 bg-[#1E0E6B]">
      <div
        ref={ref}
        className={cn("container mx-auto px-4 sm:px-6 lg:px-8 reveal", visible && "visible")}
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your day has a direction.
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Intenteó helps you turn what matters into how you live.
          </p>
          <div className="mt-8">
            <OrangeButton href="/signup">
              Start Living With Intention
              <ArrowRight className="h-4 w-4" />
            </OrangeButton>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════════ */
export function AboutContent() {
  return (
    <>
      <AboutHero />
      <WhySection />
      <FrameworkSection />
      <IntentScoreSection />
      <FinalCTA />
    </>
  )
}
