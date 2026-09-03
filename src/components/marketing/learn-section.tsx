import Link from "next/link"
import { BookOpen, Sparkles } from "lucide-react"

const learnCategories = [
  {
    title: "Purpose",
    description: "Finding your purpose and clarifying what matters.",
    href: "/learn",
  },
  {
    title: "Habits",
    description: "Building habits that support intentional living.",
    href: "/learn",
  },
  {
    title: "Reflection",
    description: "Journaling and reflection for daily growth.",
    href: "/learn",
  },
  {
    title: "Productivity",
    description: "Focus, prioritization, and intentional planning.",
    href: "/learn",
  },
]

export function LearnSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore intentional living.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Practical guidance rooted in the Intentéo philosophy.
          </p>
        </div>

        <div className="mx-auto grid gap-6 sm:max-w-3xl md:grid-cols-2">
          {learnCategories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group flex items-start gap-4 rounded-xl border border-[#1E0E6B]/10 p-5 text-left transition-all hover:shadow-md hover:border-[#1E0E6B]/20"
            >
              <BookOpen className="mt-0.5 h-5 w-5 text-[#1E0E6B] group-hover:scale-105 transition-transform" />
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-[#1E0E6B] transition-colors">{cat.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/learn"
            className="text-sm font-medium text-[#1E0E6B] hover:text-[#1E0E6B]/80 transition-colors"
          >
            Browse all resources
          </Link>
        </div>
      </div>
    </section>
  )
}
