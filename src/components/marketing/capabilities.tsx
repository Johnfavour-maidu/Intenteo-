import { Target, CheckSquare, Repeat, BookOpen, BarChart3, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface Capability {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

const capabilities: Capability[] = [
  {
    icon: Target,
    title: "Direction",
    description: "Define your purpose, vision, and meaningful goals.",
    color: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
  },
  {
    icon: CheckSquare,
    title: "Daily Action",
    description: "Organize tasks, set focus, and receive gentle reminders.",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: Repeat,
    title: "Personal Growth",
    description: "Build habits, track progress, and cultivate mindfulness.",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: BookOpen,
    title: "Reflection",
    description: "Journal, reflect, and measure your intentional living.",
    color: "bg-purple-500/10 text-purple-600",
  },
]

export function Capabilities() {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Core capabilities
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap) => (
            <div key={cap.title} className="rounded-2xl border border-[#1E0E6B]/10 bg-white/50 dark:bg-gray-950/50 p-6 text-center">
              <div className={cn("mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl", cap.color)}>
                <cap.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{cap.title}</h3>
              <p className="text-sm text-muted-foreground">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
