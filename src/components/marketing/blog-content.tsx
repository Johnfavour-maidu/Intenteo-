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
  {
    slug: "why-purpose-matters-more-than-productivity",
    title: "Why Purpose Matters More Than Productivity",
    excerpt: "Productivity without purpose is just motion. Discover why clarifying your 'why' is the most important step before optimizing your 'how'.",
    category: "Purpose",
    date: "Aug 28, 2026",
    readTime: "5 min read",
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
    slug: "how-daily-reflection-changes-everything",
    title: "How Daily Reflection Changes Everything",
    excerpt: "Five minutes of honest reflection at the end of your day can reshape tomorrow. Here's how to build a reflection practice that sticks.",
    category: "Reflection",
    date: "Aug 14, 2026",
    readTime: "4 min read",
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
    slug: "the-practice-of-mindful-productivity",
    title: "The Practice of Mindful Productivity",
    excerpt: "Being busy and being intentional are not the same thing. How to slow down, focus on what matters, and still get things done.",
    category: "Mindfulness",
    date: "Jul 31, 2026",
    readTime: "4 min read",
  },
  {
    slug: "building-a-life-of-intention",
    title: "Building a Life of Intention, Not Just Efficiency",
    excerpt: "Efficiency gets more done. Intention gets the right things done. Here's how to shift from doing more to living better.",
    category: "Productivity",
    date: "Jul 24, 2026",
    readTime: "5 min read",
  },
]

const allCategories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))]

export function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All")

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
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
                    : "bg-[#1E0E6B]/5 text-muted-foreground hover:bg-[#1E0E6B]/10 hover:text-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-[#1E0E6B]/10 p-6 text-left transition-all duration-300 hover:shadow-lg hover:border-[#1E0E6B]/20"
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
