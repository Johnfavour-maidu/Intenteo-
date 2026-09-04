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


export function LearnContent() {
  const { ref: ctaRef, visible: ctaVis } = useReveal()

  return (
    <>
      {/* ─── Categories Section ─── */}
      <section className="py-8 md:py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Learn
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
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
                    "group rounded-xl border-2 p-5 text-left transition-all hover:shadow-md",
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
