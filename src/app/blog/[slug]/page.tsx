import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

interface BlogPost {
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  content: string[]
}

const posts: Record<string, BlogPost> = {
  "why-purpose-matters-more-than-productivity": {
    slug: "why-purpose-matters-more-than-productivity",
    title: "Why Purpose Matters More Than Productivity",
    category: "Purpose",
    date: "Aug 28, 2026",
    readTime: "5 min read",
    content: [
      "We live in a culture that celebrates efficiency. We optimize our mornings, automate our workflows, and track every minute. But somewhere along the way, many of us stopped asking the most important question: why?",
      "Productivity without purpose is just motion. You can complete every task on your list and still end the day feeling empty if those tasks aren't connected to something meaningful. The most productive people aren't always the happiest — but the most intentional ones usually are.",
      "Purpose gives your actions weight. When you know why you're doing something, the how becomes clearer. Decisions get easier. Motivation becomes internal rather than forced. You stop chasing completion and start building a life that reflects your values.",
      "At Intenteó, we believe purpose isn't something you find once and forget. It's something you return to, refine, and live through — daily. That's why purpose sits at the top of our framework. Everything else flows from it.",
      "If you've been feeling busy but unfulfilled, start here. Not with another productivity system, but with a honest look at what actually matters to you.",
    ],
  },
  "the-architecture-of-lasting-habits": {
    slug: "the-architecture-of-lasting-habits",
    title: "The Architecture of Lasting Habits",
    category: "Habits",
    date: "Aug 21, 2026",
    readTime: "6 min read",
    content: [
      "Most habit advice focuses on repetition. Do it every day, build momentum, don't break the chain. But repetition alone doesn't create lasting change — identity does.",
      "The most durable habits aren't things you force yourself to do. They're expressions of who you believe you are. A person who says 'I'm trying to read more' behaves differently from someone who says 'I'm a reader.' The identity comes first; the habit follows.",
      "This is the core of identity-based habits. Instead of focusing on outcomes (read 50 books), focus on who you want to become (someone who learns daily). Each small action is a vote for that identity.",
      "At Intenteó, we track habits not just as checkboxes but as indicators of who you're becoming. Your habit health score reflects consistency, timing, and alignment with your goals — not just completion.",
      "The architecture of lasting habits starts with purpose, is built through small daily actions, and is reinforced through reflection. That's the Intenteó way.",
    ],
  },
  "how-daily-reflection-changes-everything": {
    slug: "how-daily-reflection-changes-everything",
    title: "How Daily Reflection Changes Everything",
    category: "Reflection",
    date: "Aug 14, 2026",
    readTime: "4 min read",
    content: [
      "At the end of most days, we collapse into bed and reach for our phones. But what if, instead, you spent five minutes looking back? Not judging — just observing.",
      "Daily reflection is the simplest habit with the deepest impact. It turns experience into insight. Without it, you can repeat the same mistakes for years and never notice. With it, even ordinary days become teachers.",
      "Reflection doesn't need to be complicated. Ask yourself three questions: What went well today? What didn't? How aligned did I feel? Write a few sentences. That's it.",
      "Over time, patterns emerge. You'll notice which activities energize you, which drain you, and where your time goes versus where you want it to go. This is the raw material of intentional change.",
      "Intenteó's Intent Score is built on this principle. It's not a productivity metric — it's a reflection metric. It asks: how intentionally did you live today? And it helps you track that answer over weeks and months.",
    ],
  },
  "setting-goals-that-actually-mean-something": {
    slug: "setting-goals-that-actually-mean-something",
    title: "Setting Goals That Actually Mean Something",
    category: "Goals",
    date: "Aug 7, 2026",
    readTime: "5 min read",
    content: [
      "We've all set goals that felt important at the time but quietly died within weeks. The problem isn't ambition — it's disconnection. Goals that aren't tied to your purpose become obligations.",
      "Meaningful goals start with a question: why does this matter to me? Not to your boss, not to social media, not to the version of yourself you think you should be — but to the real you.",
      "When a goal connects to your purpose, motivation shifts. You no longer need external pressure to stay on track. The goal pulls you forward because it represents something you genuinely care about.",
      "At Intenteó, goals aren't isolated lists. They connect upward to your vision and purpose, and downward to your daily tasks and habits. This chain of connection is what makes goals meaningful — and achievable.",
      "If your goals feel like items on a checklist rather than chapters in your story, it might be time to reconnect them to your purpose.",
    ],
  },
  "the-practice-of-mindful-productivity": {
    slug: "the-practice-of-mindful-productivity",
    title: "The Practice of Mindful Productivity",
    category: "Mindfulness",
    date: "Jul 31, 2026",
    readTime: "4 min read",
    content: [
      "There's a difference between being busy and being present. You can cross off twenty tasks and still feel like you weren't really there for any of them. Mindful productivity is about closing that gap.",
      "It starts with awareness. Before diving into your day, take a moment to set an intention. What matters most today? Not what's most urgent — what's most important. That single question can redirect your entire day.",
      "Throughout the day, practice single-tasking. Do one thing at a time. When you're writing, just write. When you're listening, just listen. It sounds simple, but it's radical in a world designed for distraction.",
      "Mindfulness isn't about doing less — it's about doing what you do with full attention. The result isn't just better work; it's a better experience of being alive.",
      "Intenteó's daily focus feature and reflection tools are designed around this principle. They help you pause, choose intentionally, and end the day with awareness.",
    ],
  },
  "building-a-life-of-intention": {
    slug: "building-a-life-of-intention",
    title: "Building a Life of Intention, Not Just Efficiency",
    category: "Productivity",
    date: "Jul 24, 2026",
    readTime: "5 min read",
    content: [
      "Efficiency is about doing more with less. Intention is about doing the right things in the first place. Both have value, but only one leads to a life you actually want to live.",
      "We've been taught that optimization is the answer. Optimize your morning routine, your inbox, your commute. But optimization without direction just makes you更快 at going nowhere meaningful.",
      "A life of intention starts with clarity. What kind of person do you want to be? What relationships matter? What work feels meaningful? What does a good day look like for you?",
      "From there, you build systems that support that vision — not generic productivity hacks, but personalized structures that reflect your values. That's what Intenteó is designed to do.",
      "It's not about being perfect. It's about being honest. Honest about what matters, honest about how you spend your time, and honest about the gap between the two. Then closing that gap, one intentional day at a time.",
    ],
  },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = posts[slug]
  if (!post) return { title: "Post Not Found" }
  return {
    title: `${post.title} — Intenteó Blog`,
    description: post.content[0],
    openGraph: {
      title: `${post.title} — Intenteó Blog`,
      description: post.content[0],
      siteName: "Intenteo",
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = posts[slug]
  if (!post) notFound()

  return (
    <MarketingLayout>
      <article className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            {/* Back link */}
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* Header */}
            <div className="mb-8">
              <span className="inline-block rounded-full bg-[#1E0E6B]/10 px-3 py-1 text-xs font-semibold text-[#1E0E6B] mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
                {post.title}
              </h1>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {post.content.map((paragraph, i) => (
                <p key={i} className="text-base text-muted-foreground leading-relaxed mb-6">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-12 rounded-2xl bg-[#1E0E6B] p-8 text-center">
              <h2 className="text-xl font-bold text-white">
                Ready to live with more intention?
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Intenteó helps you connect your purpose to your daily actions.
              </p>
              <Link
                href="/signup"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </article>
    </MarketingLayout>
  )
}
