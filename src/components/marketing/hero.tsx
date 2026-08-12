import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export function MarketingHero() {
  return (
    <section className="relative pt-24 pb-20 md:pt-28 md:pb-24 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Live with intention.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Intenteó connects your purpose, goals, tasks, habits, and reflection
            so your everyday actions move you toward the life you want to live.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#1E0E6B] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#1E0E6B]/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#1E0E6B]/20 bg-white/80 px-8 py-3.5 text-base font-semibold text-foreground hover:bg-muted/30 transition-colors dark:bg-gray-950/40"
            >
              See How It Works
            </Link>
          </div>
        </div>

        {/* Product Visual — Today Dashboard mockup */}
        <div className="mt-16 mx-auto max-w-5xl">
          <div className="relative rounded-2xl border border-[#1E0E6B]/10 bg-white dark:bg-gray-950 shadow-2xl shadow-[#1E0E6B]/10 dark:shadow-[#1E0E6B]/5 overflow-hidden">
            {/* Browser-style header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E0E6B]/10 bg-[#F8F6FF]">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
            </div>
            {/* Mock Today Dashboard */}
            <div className="p-6">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-foreground">Today's Intention</h3>
                  <p className="text-sm text-muted-foreground mt-1">Focus deeply on priorities that matter today.</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">82%</div>
                    <p className="text-xs text-muted-foreground">Intent Score</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">3/5</div>
                    <p className="text-xs text-muted-foreground">Tasks</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">4/5</div>
                    <p className="text-xs text-muted-foreground">Habits</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 rounded-xl border border-[#1E0E6B]/10 bg-[#F8F6FF]/50 flex items-center px-4">
                    <span className="text-sm font-medium text-foreground">Plan weekly review with team</span>
                  </div>
                  <div className="h-12 rounded-xl border border-[#1E0E6B]/10 flex items-center px-4">
                    <span className="text-sm text-muted-foreground">Morning meditation (10 min)</span>
                  </div>
                  <div className="h-12 rounded-xl border border-[#1E0E6B]/10 flex items-center px-4">
                    <span className="text-sm text-muted-foreground">Update Q3 goal progress</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
