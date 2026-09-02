"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, Calendar, Clock } from "lucide-react"

/* ─── Scroll reveal hook ─── */
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

/* ─── Post data ─── */
interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
}

const posts: BlogPost[] = [
  {
    slug: "why-purpose-matters-more-than-productivity",
    title: "Why Purpose Matters More Than Productivity",
    excerpt: "Productivity without purpose is just motion. Discover why clarifying your 'why' is the most important step before optimizing your 'how'.",
    category: "Purpose",
    date: "Aug 28, 2026",
    readTime: "5 min read",
  },
  {
    slug: "the-difference-between-goals-and-purpose",
    title: "The Difference Between Goals and Purpose",
    excerpt: "Goals are destinations. Purpose is the compass. Understanding the distinction changes how you plan your life.",
    category: "Purpose",
    date: "Aug 15, 2026",
    readTime: "4 min read",
  },
  {
    slug: "how-to-clarify-your-values-in-30-minutes",
    title: "How to Clarify Your Values in 30 Minutes",
    excerpt: "A simple exercise to identify the principles that guide your decisions — and why it matters more than you think.",
    category: "Purpose",
    date: "Jul 30, 2026",
    readTime: "3 min read",
  },
  {
    slug: "the-architecture-of-lasting-habits",
    title: "The Architecture of Lasting Habits",
    excerpt: "Most habits fail not because of willpower, but because of poor design. Learn the identity-based approach that makes consistency inevitable.",
    category: "Habits",
    date: "Aug 21, 2026",
    readTime: "6 min read",
  },
  {
    slug: "why-you-dont-need-more-willpower",
    title: "You Don't Need More Willpower",
    excerpt: "Willpower is a finite resource. The real trick is designing habits that don't rely on it at all.",
    category: "Habits",
    date: "Aug 8, 2026",
    readTime: "4 min read",
  },
  {
    slug: "the-2-minute-rule-that-changes-everything",
    title: "The 2-Minute Rule That Changes Everything",
    excerpt: "If a habit takes less than two minutes to start, you'll actually do it. Here's how to use this to build momentum.",
    category: "Habits",
    date: "Jul 22, 2026",
    readTime: "3 min read",
  },
  {
    slug: "how-daily-reflection-changes-everything",
    title: "How Daily Reflection Changes Everything",
    excerpt: "Five minutes of honest reflection at the end of your day can reshape tomorrow. Here's how to build a reflection practice that sticks.",
    category: "Reflection",
    date: "Aug 14, 2026",
    readTime: "4 min read",
  },
  {
    slug: "the-three-questions-that-reveal-your-alignment",
    title: "The Three Questions That Reveal Your Alignment",
    excerpt: "What went well? What didn't? How aligned did I feel? These three simple questions can unlock deep self-awareness.",
    category: "Reflection",
    date: "Aug 1, 2026",
    readTime: "3 min read",
  },
  {
    slug: "why-journaling-alone-isnt-enough",
    title: "Why Journaling Alone Isn't Enough",
    excerpt: "Journaling is powerful, but without structure it becomes venting. Here's how to turn writing into genuine insight.",
    category: "Reflection",
    date: "Jul 18, 2026",
    readTime: "5 min read",
  },
  {
    slug: "setting-goals-that-actually-mean-something",
    title: "Setting Goals That Actually Mean Something",
    excerpt: "Goals tied to your purpose feel different. Learn how to set objectives that motivate you from the inside out.",
    category: "Goals",
    date: "Aug 7, 2026",
    readTime: "5 min read",
  },
  {
    slug: "the-problem-with-smart-goals",
    title: "The Problem with SMART Goals",
    excerpt: "SMART goals are everywhere, but they miss one crucial ingredient: meaning. Here's a better framework.",
    category: "Goals",
    date: "Jul 25, 2026",
    readTime: "4 min read",
  },
  {
    slug: "how-to-break-big-goals-into-daily-actions",
    title: "How to Break Big Goals into Daily Actions",
    excerpt: "A big goal without daily steps is just a wish. Here's the reverse-engineering method that actually works.",
    category: "Goals",
    date: "Jul 12, 2026",
    readTime: "5 min read",
  },
  {
    slug: "the-practice-of-mindful-productivity",
    title: "The Practice of Mindful Productivity",
    excerpt: "Being busy and being intentional are not the same thing. How to slow down, focus on what matters, and still get things done.",
    category: "Mindfulness",
    date: "Jul 31, 2026",
    readTime: "4 min read",
  },
  {
    slug: "single-tasking-in-a-multitasking-world",
    title: "Single-Tasking in a Multitasking World",
    excerpt: "Multitasking feels productive but destroys focus. Here's why doing one thing at a time is the real superpower.",
    category: "Mindfulness",
    date: "Jul 16, 2026",
    readTime: "4 min read",
  },
  {
    slug: "the-morning-intention-practice",
    title: "The Morning Intention Practice",
    excerpt: "Before you check your phone, check in with yourself. A 2-minute morning practice that changes your entire day.",
    category: "Mindfulness",
    date: "Jul 3, 2026",
    readTime: "3 min read",
  },
  {
    slug: "building-a-life-of-intention",
    title: "Building a Life of Intention, Not Just Efficiency",
    excerpt: "Efficiency gets more done. Intention gets the right things done. Here's how to shift from doing more to living better.",
    category: "Productivity",
    date: "Jul 24, 2026",
    readTime: "5 min read",
  },
  {
    slug: "why-more-productivity-hacks-wont-save-you",
    title: "Why More Productivity Hacks Won't Save You",
    excerpt: "You don't need another app, another system, another hack. You need clarity on what actually matters.",
    category: "Productivity",
    date: "Jul 10, 2026",
    readTime: "4 min read",
  },
  {
    slug: "the-quiet-power-of-saying-no",
    title: "The Quiet Power of Saying No",
    excerpt: "Every yes is a no to something else. How intentional refusal becomes the foundation of intentional living.",
    category: "Productivity",
    date: "Jun 28, 2026",
    readTime: "4 min read",
  },
]

const allCategories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))]

const categoryColors: Record<string, string> = {
  Purpose: "bg-[#1E0E6B]/8 text-[#1E0E6B]",
  Habits: "bg-emerald-500/8 text-emerald-700",
  Reflection: "bg-orange-500/8 text-orange-700",
  Goals: "bg-blue-500/8 text-blue-700",
  Mindfulness: "bg-purple-500/8 text-purple-700",
  Productivity: "bg-cyan-500/8 text-cyan-700",
}

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All")

  const { ref: heroRef, visible: heroVis } = useReveal()
  const { ref: filtersRef, visible: filtersVis } = useReveal()
  const { ref: featuredRef, visible: featuredVis } = useReveal(0.1)

  const featured = posts[0]
  const filtered = activeCategory === "All"
    ? posts.slice(1)
    : posts.filter((p) => p.category === activeCategory && p.slug !== featured.slug)

  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Hero ─── */}
        <div
          ref={heroRef}
          className={cn("mx-auto max-w-2xl text-center mb-10 reveal", heroVis && "visible")}
        >
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Thoughts on purpose, habits, reflection, and living intentionally.
          </p>
        </div>

        {/* ─── Category Filters ─── */}
        <div
          ref={filtersRef}
          className={cn("mx-auto max-w-3xl mb-12 reveal", filtersVis && "visible")}
        >
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-250 border",
                  activeCategory === cat
                    ? "bg-[#1E0E6B] text-white border-[#1E0E6B] shadow-sm"
                    : "bg-white text-muted-foreground border-[#1E0E6B]/10 hover:border-[#1E0E6B]/25 hover:text-foreground hover:bg-[#1E0E6B]/[0.02]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Featured Article ─── */}
        {activeCategory === "All" && (
          <div
            ref={featuredRef}
            className={cn("mx-auto max-w-4xl mb-14 reveal", featuredVis && "visible")}
          >
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-3xl border border-[#1E0E6B]/10 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730] dark:border-[#1E0E6B]/15 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#1E0E6B]/[0.06] hover:-translate-y-1"
            >
              <div className="grid lg:grid-cols-5 gap-0">
                {/* Visual */}
                <div className="lg:col-span-2 relative h-48 lg:h-auto bg-gradient-to-br from-[#1E0E6B] via-[#2A1480] to-[#3D1FA0] flex items-center justify-center p-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/5 rounded-3xl rotate-6 scale-95" />
                    <div className="absolute inset-0 bg-white/5 rounded-3xl -rotate-3 scale-105" />
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
                      <span className="text-5xl font-bold text-white/90">i</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#EB9E5B]">
                      Featured
                    </span>
                    <span className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      categoryColors[featured.category] || "bg-[#1E0E6B]/10 text-[#1E0E6B]"
                    )}>
                      {featured.category}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-[#1E0E6B] transition-colors duration-300 leading-snug">
                    {featured.title}
                  </h2>

                  <p className="mt-3 text-base text-muted-foreground leading-relaxed line-clamp-2">
                    {featured.excerpt}
                  </p>

                  <div className="mt-5 flex items-center gap-5">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {featured.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {featured.readTime}
                      </span>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#1E0E6B] group-hover:gap-2.5 transition-all duration-300">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ─── Article Grid ─── */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ─── Blog Card Component ─── */
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const { ref, visible } = useReveal(0.05)

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        visible && "visible"
      )}
      style={{ transitionDelay: `${Math.min(index * 60, 300)}ms` }}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group block h-full rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-card p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#1E0E6B]/[0.06] hover:-translate-y-1 hover:border-[#1E0E6B]/20"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <span className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            categoryColors[post.category] || "bg-[#1E0E6B]/10 text-[#1E0E6B]"
          )}>
            {post.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground group-hover:text-[#1E0E6B] transition-colors duration-300 leading-snug line-clamp-2">
          {post.title}
        </h3>

        <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {post.excerpt}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1E0E6B] opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300">
            Read <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </div>
  )
}
