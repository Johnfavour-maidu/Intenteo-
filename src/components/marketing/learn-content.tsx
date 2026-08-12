import Link from "next/link"
import { BookOpen, Sun, Target, Repeat, BarChart3 } from "lucide-react"

interface Category {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  topics: string[]
}

const categories: Category[] = [
  {
    icon: Sun,
    title: "Purpose",
    description: "Finding your purpose and clarifying what matters.",
    topics: ["Finding your purpose", "Clarifying your values", "Defining what matters"],
  },
  {
    icon: Target,
    title: "Vision",
    description: "Creating a meaningful vision and thinking long-term.",
    topics: ["Creating a meaningful vision", "Thinking long term", "Connecting vision to goals"],
  },
  {
    icon: Target,
    title: "Goals",
    description: "Setting meaningful goals and tracking progress.",
    topics: ["Setting meaningful goals", "Milestones", "Planning"],
  },
  {
    icon: Repeat,
    title: "Habits",
    description: "Building habits that last through identity and consistency.",
    topics: ["Building habits", "Consistency", "Identity-based habits"],
  },
  {
    icon: BookOpen,
    title: "Productivity",
    description: "Focus, prioritization, and intentional planning.",
    topics: ["Focus", "Prioritization", "Intentional planning"],
  },
  {
    icon: BookOpen,
    title: "Reflection",
    description: "Journaling, prompts, and daily review practices.",
    topics: ["Journaling", "Reflection prompts", "Reviewing your day"],
  },
  {
    icon: Sun,
    title: "Mindfulness",
    description: "Meditation, presence, and awareness in daily life.",
    topics: ["Meditation", "Presence", "Awareness"],
  },
]

export function LearnContent() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Learn
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Practical guidance rooted in the Intenteó philosophy of intentional living.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href="/learn"
                className="group rounded-xl border border-[#1E0E6B]/10 p-5 text-left transition-all hover:shadow-md hover:border-[#1E0E6B]/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E0E6B]/10 text-[#1E0E6B]">
                  <cat.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-[#1E0E6B] transition-colors">{cat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                <div className="mt-3 space-y-1">
                  {cat.topics.map((topic) => (
                    <div key={topic} className="text-xs text-muted-foreground/70">
                      • {topic}
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              New resources are added regularly. Check back often for fresh
              insights on living intentionally.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
