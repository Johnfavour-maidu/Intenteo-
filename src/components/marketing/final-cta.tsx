import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="py-20 md:py-24 bg-[#1E0E6B]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start living with intention.
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join thousands who have connected their daily actions with what matters most.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl bg-[#EB9E5B] px-8 py-3.5 text-base font-semibold text-[#1E0E6B] hover:bg-[#EB9E5B]/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
