"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowRight, Calendar, Clock } from "lucide-react"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
}

const posts: BlogPost[] = [
  // Purpose (3)
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
  // Habits (3)
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
  // Reflection (3)
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
  // Goals (3)
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
  // Mindfulness (3)
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
  // Productivity (3)
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

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  return (
    <section className="pt-8 pb-16 md:pt-10 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Thoughts on purpose, habits, reflection, and living intentionally.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mx-auto max-w-3xl mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "bg-[#1E0E6B] text-white shadow-sm"
                    : "bg-white text-muted-foreground border-2 border-transparent hover:text-foreground",
                  cat !== "All" && activeCategory !== cat && "border-transparent",
                  cat !== "All" && activeCategory !== cat && "hover:border-[#FF7A00]/40"
                )}
                style={
                  cat !== "All" && activeCategory !== cat
                    ? { borderImage: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%) 1", borderImageSlice: 1, borderRadius: "9999px", borderWidth: "2px", borderStyle: "solid" }
                    : undefined
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border-2 border-[#1E0E6B]/15 p-6 text-left transition-all duration-300 hover:shadow-lg hover:border-[#1E0E6B]/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="rounded-full bg-[#1E0E6B]/10 px-3 py-1 text-xs font-semibold text-[#1E0E6B]">
                    {post.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-[#1E0E6B] transition-colors leading-snug">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#1E0E6B] opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
