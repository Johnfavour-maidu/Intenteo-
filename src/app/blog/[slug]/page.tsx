import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react"

interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  readTime: string
  content: string[]
}

const posts: Record<string, BlogPost> = {
  "why-purpose-matters-more-than-productivity": {
    slug: "why-purpose-matters-more-than-productivity",
    title: "Why Purpose Matters More Than Productivity",
    excerpt: "Productivity without purpose is just motion. Discover why clarifying your 'why' is the most important step.",
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
    excerpt: "Most habits fail not because of willpower, but because of poor design. Learn the identity-based approach.",
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
    excerpt: "Five minutes of honest reflection at the end of your day can reshape tomorrow.",
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
    excerpt: "Goals tied to your purpose feel different. Learn how to set objectives that motivate you from the inside out.",
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
    excerpt: "Being busy and being intentional are not the same thing. How to slow down and focus on what matters.",
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
    excerpt: "Efficiency gets more done. Intention gets the right things done. Here's how to shift from doing more to living better.",
    category: "Productivity",
    date: "Jul 24, 2026",
    readTime: "5 min read",
    content: [
      "Efficiency is about doing more with less. Intention is about doing the right things in the first place. Both have value, but only one leads to a life you actually want to live.",
      "We've been taught that optimization is the answer. Optimize your morning routine, your inbox, your commute. But optimization without direction just makes you faster at going nowhere meaningful.",
      "A life of intention starts with clarity. What kind of person do you want to be? What relationships matter? What work feels meaningful? What does a good day look like for you?",
      "From there, you build systems that support that vision — not generic productivity hacks, but personalized structures that reflect your values. That's what Intenteó is designed to do.",
      "It's not about being perfect. It's about being honest. Honest about what matters, honest about how you spend your time, and honest about the gap between the two. Then closing that gap, one intentional day at a time.",
    ],
  },
  "the-difference-between-goals-and-purpose": {
    slug: "the-difference-between-goals-and-purpose",
    title: "The Difference Between Goals and Purpose",
    excerpt: "Goals are destinations. Purpose is the compass. Understanding the distinction changes how you plan your life.",
    category: "Purpose",
    date: "Aug 15, 2026",
    readTime: "4 min read",
    content: [
      "Goals are destinations. Purpose is the compass. You can reach every goal on your list and still feel lost if those goals weren't guided by something deeper.",
      "Purpose is your north star — the reason you do what you do. It doesn't change when circumstances shift. Goals, on the other hand, are specific outcomes you're working toward. They're important, but they're not the point.",
      "When you set goals without purpose, they feel like obligations. You grind through them, check the box, and wonder why it didn't feel like enough. But when a goal is anchored to your purpose, every step forward feels meaningful.",
      "The distinction matters because purpose gives goals their shape. Without it, you're just collecting achievements. With it, you're building a life.",
      "At Intenteó, we help you connect these layers. Your purpose informs your vision. Your vision shapes your goals. And your goals drive your daily actions. That chain of connection is what makes intentional living possible.",
    ],
  },
  "how-to-clarify-your-values-in-30-minutes": {
    slug: "how-to-clarify-your-values-in-30-minutes",
    title: "How to Clarify Your Values in 30 Minutes",
    excerpt: "A simple exercise to identify the principles that guide your decisions.",
    category: "Purpose",
    date: "Jul 30, 2026",
    readTime: "3 min read",
    content: [
      "Your values are the principles that guide your decisions. They're what you stand for when no one is watching. But most people have never taken the time to name them clearly.",
      "Here's a simple exercise. Set a timer for 30 minutes. Write down the moments in your life when you felt most alive, most proud, most yourself. Then look for patterns. What were you doing? Who were you with? What mattered in those moments?",
      "Those patterns point to your values. Maybe it's creativity, connection, courage, growth, or service. Whatever they are, naming them gives you a filter for every decision you make.",
      "When you know your values, saying yes and no becomes easier. You stop second-guessing. You stop living by default and start living by design.",
      "Intenteó's Purpose section helps you document and return to these values regularly. Because values aren't a one-time exercise — they're a living practice.",
    ],
  },
  "why-you-dont-need-more-willpower": {
    slug: "why-you-dont-need-more-willpower",
    title: "You Don't Need More Willpower",
    excerpt: "Willpower is a finite resource. The real trick is designing habits that don't rely on it at all.",
    category: "Habits",
    date: "Aug 8, 2026",
    readTime: "4 min read",
    content: [
      "Willpower is like a muscle. It fatigues with use. By the end of a long day, your ability to resist temptation or push through discomfort is significantly depleted. That's why relying on willpower to build habits is a losing strategy.",
      "The real solution is design. Instead of relying on discipline, design your environment and routines so the right behavior becomes the easy behavior. Want to read more? Put a book on your pillow. Want to eat healthier? Prep meals on Sunday.",
      "This is the essence of identity-based habits. When you change how you see yourself, willpower becomes less relevant. You don't need willpower to brush your teeth — it's just what you do. The same principle applies to any habit.",
      "At Intenteó, we help you design habits that fit your life, not the other way around. Our habit tracking focuses on identity alignment and gentle coaching, not guilt-driven streaks.",
      "Stop waiting for more willpower. Start building better systems.",
    ],
  },
  "the-2-minute-rule-that-changes-everything": {
    slug: "the-2-minute-rule-that-changes-everything",
    title: "The 2-Minute Rule That Changes Everything",
    excerpt: "If a habit takes less than two minutes to start, you'll actually do it. Here's how to build momentum.",
    category: "Habits",
    date: "Jul 22, 2026",
    readTime: "3 min read",
    content: [
      "Here's the rule: if a habit takes less than two minutes to start, you'll actually do it. Sounds too simple? That's exactly why it works.",
      "The hardest part of any habit is starting. Not finishing — starting. When you shrink a habit down to its first two minutes, you remove the friction. Want to run? Just put on your shoes. Want to meditate? Just sit and breathe for 120 seconds.",
      "The two-minute version isn't the habit itself — it's the gateway. Once you start, momentum takes over. Most of the time, you'll do more than two minutes. But even if you don't, you've kept the habit alive.",
      "This approach works because it builds identity. Every time you put on your shoes, you're casting a vote for 'I'm a runner.' Every time you sit to breathe, you're voting for 'I'm someone who practices mindfulness.'",
      "Intenteó's habit system supports this principle. Start small, stay consistent, and let the compound effect do the heavy lifting.",
    ],
  },
  "the-three-questions-that-reveal-your-alignment": {
    slug: "the-three-questions-that-reveal-your-alignment",
    title: "The Three Questions That Reveal Your Alignment",
    excerpt: "What went well? What didn't? How aligned did I feel? Three simple questions that unlock self-awareness.",
    category: "Reflection",
    date: "Aug 1, 2026",
    readTime: "3 min read",
    content: [
      "At the end of each day, ask yourself three questions: What went well? What didn't? How aligned did I feel? That's it. Three questions, five minutes, and a lifetime of insight.",
      "The first question celebrates progress. It reminds you that even hard days have wins. The second identifies patterns — what keeps tripping you up? The third is the most powerful: alignment is the gap between what you value and how you actually spent your time.",
      "Over weeks, these answers become a mirror. You'll see which days feel good and which don't. You'll notice that alignment, not productivity, is what determines your satisfaction.",
      "This is the foundation of Intenteó's Intent Score. It's not about how much you did — it's about how well your actions matched your intentions.",
      "Try it tonight. Three questions. Five minutes. You'll be surprised what you learn.",
    ],
  },
  "why-journaling-alone-isnt-enough": {
    slug: "why-journaling-alone-isnt-enough",
    title: "Why Journaling Alone Isn't Enough",
    excerpt: "Journaling is powerful, but without structure it becomes venting. Here's how to turn writing into insight.",
    category: "Reflection",
    date: "Jul 18, 2026",
    readTime: "5 min read",
    content: [
      "Journaling is a powerful practice. It helps you process emotions, capture ideas, and make sense of your day. But without structure, it can become an outlet for venting rather than a tool for growth.",
      "The difference is in the questions you ask. Free-form writing lets you dump thoughts on paper. Structured reflection asks you to examine them. What patterns do you notice? What would you do differently? How did your actions align with your values?",
      "Structured reflection turns experience into insight. It's the difference between talking about your problems and actually understanding them.",
      "At Intenteó, we combine journaling with guided reflection prompts and the Intent Score. This creates a feedback loop: you write, you reflect, you measure alignment, and you adjust. That's how real growth happens.",
      "Journaling is the beginning. Reflection is the practice. And insight is the result.",
    ],
  },
  "the-problem-with-smart-goals": {
    slug: "the-problem-with-smart-goals",
    title: "The Problem with SMART Goals",
    excerpt: "SMART goals are everywhere, but they miss one crucial ingredient: meaning. Here's a better framework.",
    category: "Goals",
    date: "Jul 25, 2026",
    readTime: "4 min read",
    content: [
      "SMART goals — Specific, Measurable, Achievable, Relevant, Time-bound — are everywhere. They're taught in schools, recommended by coaches, and built into productivity apps. But there's a problem: they optimize for completion, not meaning.",
      "A SMART goal can be perfectly structured and still feel hollow. 'Read 50 books this year' is specific and measurable. But if you're reading to check a box rather than to learn, what's the point?",
      "The missing ingredient is purpose. Goals should start with why, not what. Why does this goal matter to you? What will change in your life if you achieve it? How does it connect to the person you want to become?",
      "At Intenteó, we don't just set goals — we connect them. Every goal links to a purpose, a vision, or a value. This chain of meaning is what keeps you motivated when the initial excitement fades.",
      "SMART goals aren't wrong. They're just incomplete. Add purpose, and they become transformative.",
    ],
  },
  "how-to-break-big-goals-into-daily-actions": {
    slug: "how-to-break-big-goals-into-daily-actions",
    title: "How to Break Big Goals into Daily Actions",
    excerpt: "A big goal without daily steps is just a wish. Here's the reverse-engineering method that actually works.",
    category: "Goals",
    date: "Jul 12, 2026",
    readTime: "5 min read",
    content: [
      "A big goal without daily steps is just a wish. 'Write a book' is overwhelming. 'Write 300 words today' is doable. The secret to achieving big things is making them small enough to start.",
      "Start with the goal. Then ask: what's the smallest action I can take today that moves me forward? Not the biggest. The smallest. That's your daily action.",
      "This works because of compounding. 300 words a day is a book in six months. A 15-minute walk a day is a marathon in a year. Small actions, repeated consistently, produce extraordinary results.",
      "Intenteó's goal system connects your big goals to your daily tasks. Every morning, you see which tasks move your goals forward. This connection — between the grand vision and the mundane Tuesday — is what makes goals real.",
      "Don't let the size of your goal paralyze you. Start small. Start today.",
    ],
  },
  "single-tasking-in-a-multitasking-world": {
    slug: "single-tasking-in-a-multitasking-world",
    title: "Single-Tasking in a Multitasking World",
    excerpt: "Multitasking feels productive but destroys focus. Here's why doing one thing at a time is the real superpower.",
    category: "Mindfulness",
    date: "Jul 16, 2026",
    readTime: "4 min read",
    content: [
      "Multitasking is a myth. What you're actually doing is rapid task-switching, and each switch costs you focus, time, and energy. Studies show it takes an average of 23 minutes to fully regain focus after an interruption.",
      "Single-tasking is the antidote. Do one thing at a time. When you're writing, just write. When you're in a meeting, just be there. When you're with your family, put the phone away.",
      "It sounds simple, but in a world designed for distraction, it's radical. Notifications, tabs, and multi-window setups are all engineered to pull your attention in multiple directions. Choosing focus is an act of rebellion.",
      "The result isn't just better work — it's a better experience of being alive. You notice more. You enjoy more. You feel more present in the moments that matter.",
      "Intenteó's Today feature helps you identify your focus areas each morning, so you can practice single-tasking with intention rather than guilt.",
    ],
  },
  "the-morning-intention-practice": {
    slug: "the-morning-intention-practice",
    title: "The Morning Intention Practice",
    excerpt: "Before you check your phone, check in with yourself. A 2-minute morning practice that changes your day.",
    category: "Mindfulness",
    date: "Jul 3, 2026",
    readTime: "3 min read",
    content: [
      "Before you check your phone, check in with yourself. Two minutes of morning intention-setting can change the entire trajectory of your day.",
      "Here's how: Before reaching for your device, sit quietly and ask yourself one question: What matters most today? Not what's urgent. Not what's loud. What actually matters?",
      "Write it down. One sentence. 'Today, I want to be present with my kids.' Or 'Today, I'll finish the draft.' Or 'Today, I'll take a real lunch break.' That sentence becomes your compass.",
      "When distractions arise — and they will — you have a reference point. Is this aligned with what matters today? If not, let it go.",
      "Intenteó's Today page is built around this practice. It helps you set your focus each morning and stay connected to it throughout the day.",
    ],
  },
  "why-more-productivity-hacks-wont-save-you": {
    slug: "why-more-productivity-hacks-wont-save-you",
    title: "Why More Productivity Hacks Won't Save You",
    excerpt: "You don't need another app, another system, another hack. You need clarity on what actually matters.",
    category: "Productivity",
    date: "Jul 10, 2026",
    readTime: "4 min read",
    content: [
      "You've tried the Pomodoro Technique. You've color-coded your calendar. You've downloaded every app. And yet, you still feel behind. Here's why: productivity hacks optimize your system, but they don't question your direction.",
      "The problem isn't that you're not organized enough. The problem is that you might be organizing the wrong things. Without clarity on what matters, every hack just helps you do more of what doesn't matter.",
      "Real productivity starts with purpose. Before optimizing how you work, ask why you're working. Before adding another tool, ask what you're trying to achieve. The answers might surprise you.",
      "At Intenteó, we don't teach hacks. We help you build a system rooted in purpose, guided by reflection, and measured by alignment. That's not productivity — it's intentional living.",
      "Stop collecting hacks. Start building clarity.",
    ],
  },
  "the-quiet-power-of-saying-no": {
    slug: "the-quiet-power-of-saying-no",
    title: "The Quiet Power of Saying No",
    excerpt: "Every yes is a no to something else. How intentional refusal becomes the foundation of intentional living.",
    category: "Productivity",
    date: "Jun 28, 2026",
    readTime: "4 min read",
    content: [
      "Every yes is a no to something else. When you say yes to a meeting, you say no to focused work. When you say yes to a commitment, you say no to free time. Understanding this changes everything.",
      "Saying no isn't about being difficult. It's about being honest. Honest about your capacity, your priorities, and your values. When you say no to things that don't align, you make space for things that do.",
      "Most people struggle with no because they fear missing out, disappointing others, or being seen as unhelpful. But the cost of an automatic yes is far greater: burnout, resentment, and a life shaped by other people's agendas.",
      "The quiet power of no is that it protects your yes. When your yes means something, it carries weight. People trust it. You trust it.",
      "Intenteó helps you see where your time goes. When you can see the gap between your intentions and your actions, saying no becomes easier — because you know what you're protecting.",
    ],
  },
}

/* ─── All posts list for related articles ─── */
const allPostsList = Object.values(posts)

/* ─── Related articles logic ─── */
function getRelatedArticles(currentSlug: string, currentCategory: string) {
  const sameCategory = allPostsList.filter(
    (p) => p.slug !== currentSlug && p.category === currentCategory
  )
  const otherCategory = allPostsList.filter(
    (p) => p.slug !== currentSlug && p.category !== currentCategory
  )
  const related = [...sameCategory, ...otherCategory].slice(0, 3)
  return related
}

const categoryColors: Record<string, string> = {
  Purpose: "bg-[#1E0E6B]/8 text-[#1E0E6B]",
  Habits: "bg-emerald-500/8 text-emerald-700",
  Reflection: "bg-orange-500/8 text-orange-700",
  Goals: "bg-blue-500/8 text-blue-700",
  Mindfulness: "bg-purple-500/8 text-purple-700",
  Productivity: "bg-cyan-500/8 text-cyan-700",
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

  const related = getRelatedArticles(slug, post.category)

  return (
    <MarketingLayout>
      <article className="pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px]">
            {/* ─── Back link ─── */}
            <Link
              href="/blog"
              className="reveal reveal-delay-1 visible inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {/* ─── Article Header ─── */}
            <header className="mb-10">
              <span className={cn(
                "reveal visible inline-block rounded-full px-3.5 py-1 text-xs font-semibold mb-5",
                categoryColors[post.category] || "bg-[#1E0E6B]/10 text-[#1E0E6B]"
              )}>
                {post.category}
              </span>

              <h1 className="reveal reveal-delay-1 visible text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
                {post.title}
              </h1>

              <div className="reveal reveal-delay-2 visible mt-5 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {post.date}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>

              <div className="reveal reveal-delay-2 visible mt-8 h-px bg-border" />
            </header>

            {/* ─── Article Content ─── */}
            <div className="reveal reveal-delay-3 visible">
              {post.content.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[17px] sm:text-lg text-foreground/80 leading-[1.8] mb-7"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* ─── CTA ─── */}
            <div className="mt-14 rounded-2xl bg-[#1E0E6B] p-8 sm:p-10 text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Ready to live with more intention?
              </h2>
              <p className="mt-2.5 text-sm sm:text-base text-white/70">
                Intenteó helps you connect your purpose to your daily actions.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ─── Related Articles ─── */}
          {related.length > 0 && (
            <div className="mx-auto max-w-[960px] mt-16">
              <div className="h-px bg-border mb-12" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">
                Continue Reading
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group block rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-card p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-[#1E0E6B]/[0.06] hover:-translate-y-1 hover:border-[#1E0E6B]/20"
                  >
                    <span className={cn(
                      "inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4",
                      categoryColors[rel.category] || "bg-[#1E0E6B]/10 text-[#1E0E6B]"
                    )}>
                      {rel.category}
                    </span>
                    <h3 className="text-base font-bold text-foreground group-hover:text-[#1E0E6B] transition-colors duration-300 leading-snug line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {rel.excerpt}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1E0E6B] group-hover:gap-2 transition-all duration-300">
                      Read <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </MarketingLayout>
  )
}
