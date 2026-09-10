import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ArticleCTA() {
  return (
    <section className="relative mt-10 overflow-hidden rounded-2xl bg-[#1E0E6B]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E0E6B] via-[#2A1480] to-[#1E0E6B]" />

      <div className="relative px-6 py-8 sm:px-8 sm:py-10 text-center">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
          Ready to live with more intention?
        </h2>
        <p className="mt-2 text-sm sm:text-base text-white/70">
          Intentéo helps you connect your purpose to your everyday actions.
        </p>
        <div className="mt-5">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-300 hover:bg-[#F0B97A] hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
          >
            Get Started For Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
