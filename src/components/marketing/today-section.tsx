import Link from "next/link"
import { cn } from "@/lib/utils"

const todayElements = [
  {
    title: "Today's Intention",
    description: "Who do you want to be today?",
  },
  {
    title: "What needs attention",
    description: "What deserves your focus right now?",
  },
  {
    title: "What should you focus on",
    description: "The 1-3 most important actions.",
  },
  {
    title: "What habits you reinforce",
    description: "Building the person you aspire to be.",
  },
  {
    title: "How intentionally did you live",
    description: "End-of-day reflection and Intent Score.",
  },
]

export function TodaySection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Start each day with intention.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The Today page brings your direction, action, and reflection together
            into one calm daily guide.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="space-y-3 mb-8">
            {todayElements.map((el, i) => (
              <div key={el.title} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E0E6B]/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#1E0E6B]">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{el.title}</h3>
                  <p className="text-sm text-muted-foreground">{el.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Product visual placeholder */}
          <div className="relative mx-auto rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950 shadow-xl overflow-hidden">
            <div className="p-6 space-y-3">
              <div className="h-8 bg-gradient-to-r from-[#1E0E6B]/10 to-purple-100/50 dark:from-[#1E0E6B]/20 dark:to-purple-900/20 rounded-lg animate-pulse" />
              <div className="h-5 bg-[#1E0E6B]/5 rounded-lg w-3/4 animate-pulse" />
              <div className="h-5 bg-[#1E0E6B]/5 rounded-lg w-1/2 animate-pulse" />
              <div className="h-5 bg-[#1E0E6B]/5 rounded-lg w-4/5 animate-pulse" />
              <div className="h-5 bg-[#1E0E6B]/5 rounded-lg w-2/3 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl bg-[#1E0E6B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E0E6B]/90 transition-colors"
          >
            Start your intentional days
          </Link>
        </div>
      </div>
    </section>
  )
}
