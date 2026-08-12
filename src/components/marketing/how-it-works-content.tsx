import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

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

export function HowItWorksContent() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How Intenteó works
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

        <div className="mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E0E6B] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#1E0E6B]/90 transition-colors"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
