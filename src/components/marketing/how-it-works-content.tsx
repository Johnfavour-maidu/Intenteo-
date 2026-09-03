import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight, Target, CheckSquare, Repeat, BookOpen, BarChart3, Brain, Calendar, Heart } from "lucide-react"

interface Step {
  step: string
  title: string
  description: string
  details: string
}

const steps: Step[] = [
  {
    step: "1",
    title: "Define your direction",
    description: "Clarify your purpose and vision.",
    details: "Start with what matters most. Define the principles that guide your life and the future you want to create.",
  },
  {
    step: "2",
    title: "Set meaningful goals",
    description: "Turn your direction into achievable objectives.",
    details: "Break your vision into concrete, measurable goals with milestones and timelines.",
  },
  {
    step: "3",
    title: "Organize your days",
    description: "Turn goals into concrete tasks.",
    details: "Each morning, set your intention and identify the priority tasks that move your goals forward.",
  },
  {
    step: "4",
    title: "Build intentional habits",
    description: "Create consistency around the person you want to become.",
    details: "Design daily habits that reinforce your identity and compound toward your vision.",
  },
  {
    step: "5",
    title: "Reflect",
    description: "Look back, learn, and adjust.",
    details: "End each day with reflection. Review what worked, what didn't, and how aligned you felt.",
  },
  {
    step: "6",
    title: "Live intentionally",
    description: "Use Intent Score and reflection to understand your alignment over time.",
    details: "Track your progress across months and quarters. Refine your approach based on real insights.",
  },
]

interface FeatureSection {
  category: string
  items: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
  }[]
}

const featureSections: FeatureSection[] = [
  {
    category: "Direction",
    items: [
      { icon: Target, title: "Purpose", description: "Clarify why your life matters and what principles guide you." },
      { icon: Target, title: "Visions", description: "Create a 10-year vision that connects to your purpose." },
      { icon: Target, title: "Goals", description: "Set meaningful, time-bound objectives with milestones and progress tracking." },
    ],
  },
  {
    category: "Daily Action",
    items: [
      { icon: CheckSquare, title: "Tasks", description: "Organize tasks by priority, deadline, and importance." },
      { icon: Calendar, title: "Today's Focus", description: "Each morning, identify 1-3 focus areas that matter most." },
      { icon: Calendar, title: "Reminders", description: "Gentle, intentional reminders that respect your time." },
    ],
  },
  {
    category: "Personal Growth",
    items: [
      { icon: Repeat, title: "Habits", description: "Build identity-based habits with streak tracking and coaching." },
      { icon: Heart, title: "Trackers", description: "Track custom metrics like meditation, water intake, or sleep." },
      { icon: Brain, title: "Mindfulness", description: "Integrate meditation and presence into your daily routine." },
    ],
  },
  {
    category: "Reflection",
    items: [
      { icon: BookOpen, title: "Journal", description: "Reflect on your day with guided prompts and free-form writing." },
      { icon: BarChart3, title: "Daily Reflection", description: "End each day reviewing what went well and what to improve." },
      { icon: BarChart3, title: "Intent Score", description: "A single score that reflects how intentionally you lived." },
    ],
  },
  {
    category: "Understanding Progress",
    items: [
      { icon: BarChart3, title: "Reports", description: "Weekly and monthly reports showing your alignment over time." },
      { icon: BarChart3, title: "Insights", description: "AI-powered insights that surface patterns in your behavior." },
      { icon: BarChart3, title: "Progress Tracking", description: "Visual progress on goals, habits, and overall intentional living." },
    ],
  },
]

export function HowItWorksContent() {
  return (
    <>
      {/* Steps Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Intentéo works
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Six simple steps to connect your everyday actions with lasting meaning.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="space-y-8">
              {steps.map((step) => (
                <div key={step.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E0E6B]/10 text-[#1E0E6B]">
                      <span className="text-sm font-bold">{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Features
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to live intentionally — organized by what matters.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-12">
            {featureSections.map((section) => (
              <div key={section.category}>
                <h3 className="text-xl font-semibold text-foreground mb-5">{section.category}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={item.title} className="rounded-xl border border-[#1E0E6B]/10 p-5">
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[#1E0E6B]/10 text-[#1E0E6B]">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E0E6B] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#1E0E6B]/90 transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
