"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  BookOpen,
  Sun,
  Target,
  Repeat,
  BarChart3,
  CheckSquare,
  Eye,
  Heart,
  Brain,
  Calendar,
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

/* ─── Category cards data ─── */
interface Category {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  topics: string[]
  slug: string
  color: string
  iconBg: string
}

const categories: Category[] = [
  {
    icon: Sun,
    title: "Purpose",
    description: "Finding your purpose and clarifying what matters.",
    topics: ["Finding your purpose", "Clarifying your values", "Defining what matters"],
    slug: "purpose",
    color: "border-[#1E0E6B]/20 hover:border-[#1E0E6B]/40",
    iconBg: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
  },
  {
    icon: Eye,
    title: "Vision",
    description: "Creating a meaningful vision and thinking long-term.",
    topics: ["Creating a meaningful vision", "Thinking long term", "Connecting vision to goals"],
    slug: "vision",
    color: "border-purple-500/20 hover:border-purple-500/40",
    iconBg: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Target,
    title: "Goals",
    description: "Setting meaningful goals and tracking progress.",
    topics: ["Setting meaningful goals", "Milestones", "Planning"],
    slug: "goals",
    color: "border-blue-500/20 hover:border-blue-500/40",
    iconBg: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Repeat,
    title: "Habits",
    description: "Building habits that last through identity and consistency.",
    topics: ["Building habits", "Consistency", "Identity-based habits"],
    slug: "habits",
    color: "border-emerald-500/20 hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: BookOpen,
    title: "Productivity",
    description: "Focus, prioritization, and intentional planning.",
    topics: ["Focus", "Prioritization", "Intentional planning"],
    slug: "productivity",
    color: "border-cyan-500/20 hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: BarChart3,
    title: "Reflection",
    description: "Journaling, prompts, and daily review practices.",
    topics: ["Journaling", "Reflection prompts", "Reviewing your day"],
    slug: "reflection",
    color: "border-orange-500/20 hover:border-orange-500/40",
    iconBg: "bg-orange-500/10 text-orange-600",
  },
]

/* ─── Philosophy cards ─── */
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

/* ─── Framework data ─── */
interface FrameworkItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  short: string
  color: string
}

const framework: FrameworkItem[] = [
  { icon: Sun, label: "Purpose", short: "Why it matters.", color: "bg-[#1E0E6B]/10 text-[#1E0E6B]" },
  { icon: Eye, label: "Vision", short: "Where you're going.", color: "bg-purple-500/10 text-purple-600" },
  { icon: Target, label: "Goals", short: "What you want to achieve.", color: "bg-blue-500/10 text-blue-600" },
  { icon: CheckSquare, label: "Tasks", short: "What you need to do.", color: "bg-cyan-500/10 text-cyan-600" },
  { icon: Repeat, label: "Habits", short: "Who you're becoming.", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: BookOpen, label: "Reflection", short: "What you're learning.", color: "bg-orange-500/10 text-orange-600" },
]

export function LearnContent() {
  const { ref: whyTitleRef, visible: whyTitleVis } = useReveal()
  const { ref: whyCardsRef, visible: whyCardsVis } = useReveal(0.1)
  const { ref: fwRef, visible: fwVis } = useReveal(0.1)
  const { ref: scoreVisualRef, visible: scoreVisualVis } = useReveal()
  const { ref: scoreTextRef, visible: scoreTextVis } = useReveal()
  const { ref: ctaRef, visible: ctaVis } = useReveal()
  const [animatedPercent, setAnimatedPercent] = useState(0)
  const targetPercent = 78

  useEffect(() => {
    if (!scoreVisualVis) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setAnimatedPercent(targetPercent); return }
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
  }, [scoreVisualVis])

  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (animatedPercent / 100) * circumference

  return (
    <>
      {/* ─── Categories Section ─── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Learn
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Practical guidance rooted in the Intent&eacute;o philosophy of intentional living.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.title}
                  href={`/learn/${cat.slug}`}
                  className={cn(
                    "group rounded-xl border p-5 text-left transition-all hover:shadow-md",
                    cat.color
                  )}
                >
                  <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-lg", cat.iconBg)}>
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-[#1E0E6B] transition-colors">{cat.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  <div className="mt-3 space-y-1">
                    {cat.topics.map((topic) => (
                      <div key={topic} className="text-xs text-muted-foreground/70">
                        &bull; {topic}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1E0E6B] group-hover:gap-2 transition-all duration-300">
                    Learn More <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Intent&eacute;o Exists ─── */}
      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div
              ref={whyTitleRef}
              className={cn("reveal", whyTitleVis && "visible")}
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
                Why we built Intent&eacute;o
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Intent&eacute;o exists
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
              <p>
                We built Intent&eacute;o for anyone who wants to do less randomly and more
                meaningfully.
              </p>
            </div>

            <div
              ref={whyCardsRef}
              className={cn("mt-10 grid gap-4 sm:grid-cols-3 reveal", whyCardsVis && "visible")}
            >
              {philosophyCards.map((card, i) => (
                <div
                  key={card.title}
                  className={cn(
                    "rounded-2xl border-2 border-[#1E0E6B]/20 p-5 text-center transition-all duration-300 hover:shadow-md hover:border-[#1E0E6B]/40 reveal",
                    whyCardsVis && "visible",
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

      {/* ─── Framework ─── */}
      <section className="py-14 md:py-18 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">
              The Intent&eacute;o Framework
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              From what matters to what you do
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Intent&eacute;o connects the bigger picture with the actions of everyday life.
            </p>
          </div>

          {/* Desktop: horizontal */}
          <div className="hidden lg:block mx-auto max-w-5xl">
            <div ref={fwRef} className={cn("reveal", fwVis && "visible")}>
              <div className="relative flex items-start justify-between">
                <div className="absolute top-8 left-[8%] right-[8%] h-[2px] bg-gradient-to-r from-[#1E0E6B]/20 via-[#1E0E6B]/30 to-[#1E0E6B]/20" />
                {framework.map((item, i) => (
                  <div
                    key={item.label}
                    className={cn(
                      "relative flex flex-col items-center text-center w-[14%] reveal",
                      fwVis && "visible",
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
        </div>
      </section>

      {/* ─── Intent Score ─── */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Mobile */}
            <div className="lg:hidden">
              <div
                ref={scoreVisualRef}
                className={cn("flex justify-center mb-6 reveal", scoreVisualVis && "visible")}
              >
                <div className="relative">
                  <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-[#1E0E6B]/5" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#lsScoreGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-100"
                    />
                    <defs>
                      <linearGradient id="lsScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
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

              <div ref={scoreTextRef} className={cn("text-center reveal", scoreTextVis && "visible")}>
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

            {/* Desktop */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
              <div
                ref={scoreVisualRef}
                className={cn("flex justify-center reveal", scoreVisualVis && "visible")}
              >
                <div className="relative">
                  <svg width="200" height="200" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-[#1E0E6B]/5" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke="url(#lsScoreGradDesk)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      className="transition-all duration-100"
                    />
                    <defs>
                      <linearGradient id="lsScoreGradDesk" x1="0%" y1="0%" x2="100%" y2="0%">
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

              <div ref={scoreTextRef} className={cn("reveal reveal-delay-1", scoreTextVis && "visible")}>
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

      {/* ─── Final CTA ─── */}
      <section className="py-8 md:py-10 bg-[#1E0E6B]">
        <div
          ref={ctaRef}
          className={cn("container mx-auto px-4 sm:px-6 lg:px-8 reveal", ctaVis && "visible")}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Your day has a direction.
            </h2>
            <p className="mt-3 text-base text-white/70">
              Intent&eacute;o helps you turn what matters into how you live.
            </p>
            <div className="mt-6">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Start Living With Intention
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
