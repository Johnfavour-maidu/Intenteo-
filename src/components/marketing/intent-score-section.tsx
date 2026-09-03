import Link from "next/link"
import { CheckSquare, Repeat, CalendarHeart, BookOpen } from "lucide-react"

export function IntentScoreSection() {
  return (
    <section className="py-16 md:py-20 bg-[#F8F6FF]/30 dark:bg-[#0F0D1A]/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Measure alignment, not just productivity.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Intent Score reflects how intentionally you lived your day based on
            the activities that matter within Intentéo.
          </p>

          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="text-5xl font-bold text-[#1E0E6B] leading-tight">82%</div>
            <span className="text-sm text-muted-foreground">Intent Score</span>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#1E0E6B]" />
              <span className="text-muted-foreground">Tasks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Habits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">Daily Intention</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Reflection</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground italic">
            It&apos;s not about doing more. It&apos;s about living more intentionally.
          </p>
        </div>
      </div>
    </section>
  )
}
