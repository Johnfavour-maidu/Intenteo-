import { Target, Sun, CheckSquare, Repeat, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface FrameworkStep {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  color: string
}

const steps: FrameworkStep[] = [
  {
    icon: Sun,
    label: "Purpose",
    description: "Why does your life matter to you?",
    color: "bg-[#1E0E6B]/10 text-[#1E0E6B]",
  },
  {
    icon: Target,
    label: "Vision",
    description: "What kind of future are you trying to create?",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: CheckSquare,
    label: "Goals",
    description: "What are you working toward?",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: CheckSquare,
    label: "Tasks",
    description: "What needs to happen today?",
    color: "bg-cyan-500/10 text-cyan-600",
  },
  {
    icon: Repeat,
    label: "Habits",
    description: "Who are you becoming through repetition?",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: BookOpen,
    label: "Reflection",
    description: "What are you learning about how you live?",
    color: "bg-orange-500/10 text-orange-600",
  },
]

export function IntentFramework() {
  return (
    <section className="py-20 md:py-24 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your intentional living framework
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each layer connects to the next, creating a path from who you are to
            who you want to become.
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {steps.map((step, index) => (
            <div key={step.label} className="relative mb-6 last:mb-0">
              {/* Connector line (except first) */}
              {index > 0 && (
                <div className="absolute -top-3 left-8 w-0.5 h-full border-l-2 border-dashed border-[#1E0E6B]/20" />
              )}
              {/* Step row */}
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <div className={cn("h-16 w-16 rounded-xl flex items-center justify-center transition-transform", step.color)}>
                    <step.icon className="h-7 w-7" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{step.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
