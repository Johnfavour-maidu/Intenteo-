import Link from "next/link"
import { TeoIcon } from "@/components/ui/teo-icon"

export function AboutContent() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-center gap-3">
            <TeoIcon size="sm" />
            <span className="text-xl font-bold text-foreground">Intenteó</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Intenteó exists
          </h1>

          <div className="mt-8 space-y-6 text-lg text-muted-foreground">
            <p>
              Intenteó exists because productivity should serve a meaningful life,
              not become the purpose itself.
            </p>
            <p>
              We noticed a quiet problem: people would follow the most effective systems,
              complete every task, track every habit, and still feel disconnected from
              what actually mattered. The tools were powerful — but they operated in
              isolation. Purpose lived in one place, goals in another, tasks in a
              third.
            </p>
            <p>
              Intenteó connects these layers. It starts with your purpose and walks
              down through your vision, your goals, your daily actions, your habits,
              and your reflection. Each layer informs the next. Each action is tied
              to meaning.
            </p>
            <p>
              The Intent Score is not a productivity score. It measures how
              intentionally you lived your day — how aligned your actions were with
              what you said mattered.
            </p>
            <p>
              We built Intenteó for anyone who wants to do less randomly and more
              meaningfully.
            </p>
          </div>

          <div className="mt-12">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#1E0E6B] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#1E0E6B]/90 transition-colors"
            >
              Start living with intention
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
