import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { LearnDetailContent } from "@/components/marketing/learn-detail-content"

interface LearnTopic {
  title: string
  content: string[]
}

interface LearnCategory {
  slug: string
  title: string
  description: string
  color: string
  topics: LearnTopic[]
}

const categories: Record<string, LearnCategory> = {
  purpose: {
    slug: "purpose",
    title: "Purpose",
    description: "Finding your purpose and clarifying what matters most.",
    color: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
    topics: [
      {
        title: "What Is Purpose?",
        content: [
          "Purpose is the reason you do what you do. It's the deeper motivation behind your actions — the thing that makes you get out of bed in the morning with a sense of direction.",
          "Unlike goals, which are specific outcomes you work toward, purpose is a持续的 sense of meaning. It doesn't change when circumstances shift. Goals can be achieved, but purpose is something you live through daily.",
          "When you know your purpose, decisions become clearer. You stop second-guessing yourself. You stop living by default and start living by design. Purpose gives every action weight and meaning.",
          "At Intentéo, we believe purpose isn't something you find once and forget. It's something you return to, refine, and live through — every single day.",
        ],
      },
      {
        title: "Why Purpose Matters",
        content: [
          "Productivity without purpose is just motion. You can complete every task on your list and still end the day feeling empty if those tasks aren't connected to something meaningful.",
          "Research shows that people who have a clear sense of purpose are more resilient, more motivated, and more satisfied with their lives. They don't just accomplish more — they accomplish the right things.",
          "Purpose acts as a compass. When you're faced with a decision, your purpose tells you which direction to go. Without it, every choice feels equally important — and equally overwhelming.",
          "The most productive people aren't always the happiest. But the most intentional ones usually are. That's the difference purpose makes.",
        ],
      },
      {
        title: "How to Find Your Purpose",
        content: [
          "Start with a simple exercise: Set a timer for 30 minutes. Write down the moments in your life when you felt most alive, most proud, most yourself. Then look for patterns.",
          "What were you doing? Who were you with? What mattered in those moments? Those patterns point to your values — and your values point to your purpose.",
          "Your purpose doesn't have to be grand or dramatic. It can be as simple as 'I help people feel understood' or 'I create things that make life easier.' What matters is that it resonates with the real you.",
          "Write your purpose down. Put it somewhere you'll see it daily. Return to it when you feel lost. Purpose isn't a one-time exercise — it's a living practice.",
        ],
      },
      {
        title: "Living Your Purpose Daily",
        content: [
          "Finding your purpose is the first step. Living it daily is the real practice. This means aligning your actions, habits, and goals with what you've identified as meaningful.",
          "Start small. Each morning, ask yourself: 'What's one thing I can do today that aligns with my purpose?' It doesn't have to be dramatic. Even small, intentional actions compound over time.",
          "Track your alignment. Intentéo's Intent Score helps you measure how well your daily actions match your intentions. Over weeks and months, patterns emerge that guide meaningful change.",
          "Remember: living your purpose doesn't mean every day feels perfect. It means every day feels connected. Even hard days have meaning when they're aligned with what matters.",
        ],
      },
    ],
  },
  vision: {
    slug: "vision",
    title: "Vision",
    description: "Creating a meaningful vision and thinking long-term.",
    color: "bg-purple-500/10 text-purple-600",
    topics: [
      {
        title: "What Is Vision?",
        content: [
          "Vision is the picture of the life you want to live. It's bigger than goals — it's the overall direction you want your life to go. While goals are destinations, vision is the landscape.",
          "A clear vision helps you see beyond the immediate. It gives context to your daily actions and helps you prioritize what truly matters. Without vision, you're just checking boxes.",
          "Your vision isn't something you achieve — it's something you pursue. It evolves as you grow. The point isn't to reach a final destination, but to move consistently in a direction that matters.",
          "At Intentéo, vision sits between purpose and goals. It translates your deep why into a tangible picture of what your life could look like.",
        ],
      },
      {
        title: "Why Vision Matters",
        content: [
          "Without vision, you're reactive. You respond to whatever comes your way, letting urgency dictate your priorities. With vision, you're proactive. You choose your direction and move toward it intentionally.",
          "Vision creates motivation. When you can see where you're going, the daily grind feels purposeful. Each small step becomes meaningful because it's part of something bigger.",
          "Vision also creates resilience. When setbacks happen — and they will — a clear vision helps you recover. You know why you're doing this, so you keep going.",
          "People with a clear vision report higher levels of satisfaction, lower levels of stress, and a stronger sense of control over their lives.",
        ],
      },
      {
        title: "Creating Your Vision",
        content: [
          "Start by imagining your ideal life five years from now. Don't limit yourself. What does a typical day look like? Who are you with? What work are you doing? What does your environment feel like?",
          "Write it down in present tense, as if it's already happening. 'I wake up feeling rested. I spend the morning with my family. I do work that matters. I end the day with reflection.'",
          "Now connect it to your purpose. Does this vision align with what you've identified as meaningful? If not, adjust. Vision without purpose is just fantasy.",
          "Share your vision with someone you trust. Saying it out loud makes it real. And keep it visible — return to it regularly to stay connected.",
        ],
      },
      {
        title: "Living Your Vision",
        content: [
          "Vision isn't something you create once and file away. It's something you return to daily. Each morning, ask: 'What's one thing I can do today that moves me toward my vision?'",
          "Break your vision into smaller milestones. Where do you want to be in one year? In six months? In three months? These milestones become your goals.",
          "Track your progress. Intentéo's goal system connects your vision to your daily actions. You can see how each task and habit contributes to the bigger picture.",
          "Remember: vision is a direction, not a destination. It's okay if the picture changes. What matters is that you're moving intentionally toward something meaningful.",
        ],
      },
    ],
  },
  goals: {
    slug: "goals",
    title: "Goals",
    description: "Setting meaningful goals and tracking progress.",
    color: "bg-blue-500/10 text-blue-600",
    topics: [
      {
        title: "What Are Meaningful Goals?",
        content: [
          "Meaningful goals are goals that connect to your purpose. They're not just items on a checklist — they're expressions of what matters to you. When a goal is tied to your why, motivation becomes internal.",
          "The problem with most goal-setting frameworks is that they optimize for completion, not meaning. A goal can be perfectly structured and still feel hollow if it's not connected to something deeper.",
          "Meaningful goals start with a question: 'Why does this matter to me?' Not to your boss, not to social media, not to the version of yourself you think you should be — but to the real you.",
          "At Intentéo, goals aren't isolated lists. They connect upward to your vision and purpose, and downward to your daily tasks and habits.",
        ],
      },
      {
        title: "The Problem with SMART Goals",
        content: [
          "SMART goals — Specific, Measurable, Achievable, Relevant, Time-bound — are everywhere. They're taught in schools, recommended by coaches, and built into productivity apps.",
          "But there's a problem: they optimize for completion, not meaning. 'Read 50 books this year' is specific and measurable. But if you're reading to check a box rather than to learn, what's the point?",
          "The missing ingredient is purpose. Goals should start with why, not what. Why does this goal matter to you? What will change in your life if you achieve it?",
          "SMART goals aren't wrong. They're just incomplete. Add purpose, and they become transformative.",
        ],
      },
      {
        title: "Breaking Big Goals into Daily Actions",
        content: [
          "A big goal without daily steps is just a wish. 'Write a book' is overwhelming. 'Write 300 words today' is doable. The secret to achieving big things is making them small enough to start.",
          "Start with the goal. Then ask: what's the smallest action I can take today that moves me forward? Not the biggest. The smallest. That's your daily action.",
          "This works because of compounding. 300 words a day is a book in six months. A 15-minute walk a day is a marathon in a year. Small actions, repeated consistently, produce extraordinary results.",
          "Intentéo's goal system connects your big goals to your daily tasks. Every morning, you see which tasks move your goals forward.",
        ],
      },
      {
        title: "Tracking Goal Progress",
        content: [
          "What gets measured gets managed. But measuring the wrong things leads to the wrong results. Don't just track completion — track alignment.",
          "Ask yourself regularly: 'Is this goal still meaningful to me?' If the answer is yes, keep going. If it's no, it might be time to adjust or let go.",
          "Intentéo's goal health score considers progress, deadline alignment, habit consistency, and project completion. It gives you a holistic view of how your goals are doing.",
          "Celebrate milestones along the way. Each step forward is worth acknowledging. The compound effect of small wins is powerful.",
        ],
      },
    ],
  },
  habits: {
    slug: "habits",
    title: "Habits",
    description: "Building habits that last through identity and consistency.",
    color: "bg-emerald-500/10 text-emerald-600",
    topics: [
      {
        title: "Identity-Based Habits",
        content: [
          "Most habit advice focuses on repetition. Do it every day, build momentum, don't break the chain. But repetition alone doesn't create lasting change — identity does.",
          "The most durable habits aren't things you force yourself to do. They're expressions of who you believe you are. A person who says 'I'm trying to read more' behaves differently from someone who says 'I'm a reader.'",
          "The identity comes first; the habit follows. Instead of focusing on outcomes (read 50 books), focus on who you want to become (someone who learns daily). Each small action is a vote for that identity.",
          "At Intentéo, we track habits not just as checkboxes but as indicators of who you're becoming. Your habit health score reflects consistency, timing, and alignment with your goals.",
        ],
      },
      {
        title: "The 2-Minute Rule",
        content: [
          "Here's the rule: if a habit takes less than two minutes to start, you'll actually do it. Sounds too simple? That's exactly why it works.",
          "The hardest part of any habit is starting. Not finishing — starting. When you shrink a habit down to its first two minutes, you remove the friction. Want to run? Just put on your shoes. Want to meditate? Just sit and breathe for 120 seconds.",
          "The two-minute version isn't the habit itself — it's the gateway. Once you start, momentum takes over. Most of the time, you'll do more than two minutes. But even if you don't, you've kept the habit alive.",
          "This approach works because it builds identity. Every time you put on your shoes, you're casting a vote for 'I'm a runner.' Every time you sit to breathe, you're voting for 'I'm someone who practices mindfulness.'",
        ],
      },
      {
        title: "Why Willpower Isn't Enough",
        content: [
          "Willpower is like a muscle. It fatigues with use. By the end of a long day, your ability to resist temptation or push through discomfort is significantly depleted. That's why relying on willpower to build habits is a losing strategy.",
          "The real solution is design. Instead of relying on discipline, design your environment and routines so the right behavior becomes the easy behavior. Want to read more? Put a book on your pillow. Want to eat healthier? Prep meals on Sunday.",
          "When you change how you see yourself, willpower becomes less relevant. You don't need willpower to brush your teeth — it's just what you do. The same principle applies to any habit.",
          "Stop waiting for more willpower. Start building better systems.",
        ],
      },
      {
        title: "Building Consistency",
        content: [
          "Consistency isn't about perfection. It's about showing up most of the time. Missing one day doesn't break a habit. Missing two starts to. Missing three is a pattern.",
          "The key is to make habits easy to start and hard to skip. Reduce friction for good habits. Increase friction for bad ones. Design your environment so the right choice is the easy choice.",
          "Track your habits visually. Intentéo's habit tracking shows your consistency over time, helping you see patterns and adjust. The visual representation of streaks is motivating — but don't let a broken streak discourage you.",
          "Remember: building habits is a lifelong practice. There's no finish line. The goal is progress, not perfection.",
        ],
      },
    ],
  },
  productivity: {
    slug: "productivity",
    title: "Productivity",
    description: "Focus, prioritization, and intentional planning.",
    color: "bg-cyan-500/10 text-cyan-600",
    topics: [
      {
        title: "Intentional Productivity",
        content: [
          "There's a difference between being busy and being present. You can cross off twenty tasks and still feel like you weren't really there for any of them. Intentional productivity is about closing that gap.",
          "It starts with awareness. Before diving into your day, take a moment to set an intention. What matters most today? Not what's most urgent — what's most important. That single question can redirect your entire day.",
          "Throughout the day, practice single-tasking. Do one thing at a time. When you're writing, just write. When you're listening, just listen. It sounds simple, but it's radical in a world designed for distraction.",
          "The result isn't just better work — it's a better experience of being alive. You notice more. You enjoy more. You feel more present in the moments that matter.",
        ],
      },
      {
        title: "Why Productivity Hacks Don't Work",
        content: [
          "You've tried the Pomodoro Technique. You've color-coded your calendar. You've downloaded every app. And yet, you still feel behind. Here's why: productivity hacks optimize your system, but they don't question your direction.",
          "The problem isn't that you're not organized enough. The problem is that you might be organizing the wrong things. Without clarity on what matters, every hack just helps you do more of what doesn't matter.",
          "Real productivity starts with purpose. Before optimizing how you work, ask why you're working. Before adding another tool, ask what you're trying to achieve.",
          "Stop collecting hacks. Start building clarity.",
        ],
      },
      {
        title: "The Power of Saying No",
        content: [
          "Every yes is a no to something else. When you say yes to a meeting, you say no to focused work. When you say yes to a commitment, you say no to free time. Understanding this changes everything.",
          "Saying no isn't about being difficult. It's about being honest. Honest about your capacity, your priorities, and your values. When you say no to things that don't align, you make space for things that do.",
          "The quiet power of no is that it protects your yes. When your yes means something, it carries weight. People trust it. You trust it.",
          "Intentional refusal is the foundation of intentional living.",
        ],
      },
      {
        title: "Building Systems That Work",
        content: [
          "Systems are better than goals. A goal is a one-time target. A system is a持续的过程 that produces results over time. 'Write a book' is a goal. 'Write 300 words every morning' is a system.",
          "Good systems are designed around your life, not the other way around. They account for your energy levels, your commitments, and your values. They're flexible enough to adapt when life changes.",
          "Intentéo helps you build systems that connect your purpose to your daily actions. Each morning, you see which tasks move your goals forward. Each evening, you reflect on how intentionally you lived.",
          "The best system is one you actually use. Start simple. Adjust as you learn. And remember: the goal isn't to be perfect — it's to be intentional.",
        ],
      },
    ],
  },
  reflection: {
    slug: "reflection",
    title: "Reflection",
    description: "Journaling, prompts, and daily review practices.",
    color: "bg-orange-500/10 text-orange-600",
    topics: [
      {
        title: "Why Reflection Matters",
        content: [
          "At the end of most days, we collapse into bed and reach for our phones. But what if, instead, you spent five minutes looking back? Not judging — just observing.",
          "Daily reflection is the simplest habit with the deepest impact. It turns experience into insight. Without it, you can repeat the same mistakes for years and never notice. With it, even ordinary days become teachers.",
          "Reflection doesn't need to be complicated. Ask yourself three questions: What went well today? What didn't? How aligned did I feel? Write a few sentences. That's it.",
          "Over time, patterns emerge. You'll notice which activities energize you, which drain you, and where your time goes versus where you want it to go. This is the raw material of intentional change.",
        ],
      },
      {
        title: "The Three Questions",
        content: [
          "At the end of each day, ask yourself three questions: What went well? What didn't? How aligned did I feel? That's it. Three questions, five minutes, and a lifetime of insight.",
          "The first question celebrates progress. It reminds you that even hard days have wins. The second identifies patterns — what keeps tripping you up? The third is the most powerful: alignment is the gap between what you value and how you actually spent your time.",
          "Over weeks, these answers become a mirror. You'll see which days feel good and which don't. You'll notice that alignment, not productivity, is what determines your satisfaction.",
          "Try it tonight. Three questions. Five minutes. You'll be surprised what you learn.",
        ],
      },
      {
        title: "Journaling with Structure",
        content: [
          "Journaling is a powerful practice. It helps you process emotions, capture ideas, and make sense of your day. But without structure, it can become an outlet for venting rather than a tool for growth.",
          "The difference is in the questions you ask. Free-form writing lets you dump thoughts on paper. Structured reflection asks you to examine them. What patterns do you notice? What would you do differently?",
          "Structured reflection turns experience into insight. It's the difference between talking about your problems and actually understanding them.",
          "Intentéo combines journaling with guided reflection prompts and the Intent Score. This creates a feedback loop: you write, you reflect, you measure alignment, and you adjust.",
        ],
      },
      {
        title: "The Intent Score",
        content: [
          "The Intent Score is built on the principle of reflection. It's not a productivity metric — it's a reflection metric. It asks: how intentionally did you live today?",
          "Each day, the score considers your tasks, habits, intention, and reflection. It gives you a single number that represents how aligned your actions were with your values.",
          "Over weeks and months, patterns emerge. You'll see which days feel good and which don't. You'll notice that alignment, not productivity, is what determines your satisfaction.",
          "The Intent Score isn't about being perfect. It's about being honest. Honest about how you spend your time, and honest about the gap between your intentions and your actions.",
        ],
      },
    ],
  },
}

const categoryOrder = ["purpose", "vision", "goals", "habits", "productivity", "reflection"]

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = categories[slug]
  if (!category) return { title: "Topic Not Found" }
  return {
    title: `${category.title} — Intent&eacute;o Learn`,
    description: category.description,
    openGraph: {
      title: `${category.title} — Intent&eacute;o Learn`,
      description: category.description,
      siteName: "Intenteo",
    },
  }
}

export async function generateStaticParams() {
  return categoryOrder.map((slug) => ({ slug }))
}

export default async function LearnDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = categories[slug]
  if (!category) notFound()

  const currentIndex = categoryOrder.indexOf(slug)
  const nextSlug = categoryOrder[currentIndex + 1]
  const nextCategory = nextSlug ? categories[nextSlug] : null

  return (
    <MarketingLayout>
      <section className="pt-6 pb-16 md:pt-8 md:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[720px]">
            {/* Back link */}
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Learn
            </Link>

            {/* Header */}
            <header className="mb-10">
              <span className={cn(
                "inline-block rounded-full px-3.5 py-1 text-xs font-semibold mb-5",
                category.color
              )}>
                {category.title}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-foreground leading-[1.15]">
                {category.title}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {category.description}
              </p>
              <div className="mt-8 h-px bg-border" />
            </header>

            {/* Content */}
            <LearnDetailContent topics={category.topics} />

            {/* Next category */}
            {nextCategory && (
              <div className="mt-14 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3">Up next</p>
                <Link
                  href={`/learn/${nextSlug}`}
                  className="group flex items-center justify-between rounded-xl border border-[#1E0E6B]/10 p-5 transition-all hover:shadow-md hover:border-[#1E0E6B]/20"
                >
                  <div>
                    <span className={cn(
                      "inline-block rounded-full px-3 py-1 text-xs font-semibold mb-2",
                      nextCategory.color
                    )}>
                      {nextCategory.title}
                    </span>
                    <h3 className="font-semibold text-foreground group-hover:text-[#1E0E6B] transition-colors">
                      {nextCategory.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{nextCategory.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[#1E0E6B] group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
