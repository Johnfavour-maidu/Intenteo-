"use client"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { MessageCircle, ArrowRight } from "lucide-react"
import { FaqAccordion } from "@/components/marketing/faq-components"

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FaqHero() {
  const { ref, visible } = useReveal()
  return (
    <section className="pt-24 pb-10 md:pt-28 md:pb-14 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("text-center max-w-2xl mx-auto", visible && "visible")}>
          <span className={cn("inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3 reveal", visible && "visible")}>
            Frequently Asked Questions
          </span>
          <h1 className={cn("text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl reveal reveal-delay-1", visible && "visible")}>
            Questions? We&apos;ve got answers.
          </h1>
          <p className={cn("mt-4 text-lg text-muted-foreground reveal reveal-delay-2", visible && "visible")}>
            Find answers about Intenteo, how it works, and how it can help you live with more intention.
          </p>
        </div>
      </div>
    </section>
  )
}

function StillHaveQuestions() {
  const { ref, visible } = useReveal(0.15)
  return (
    <section className="py-14 md:py-20 bg-[#FAFBFF] dark:bg-[#0F0D1A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center max-w-xl mx-auto", visible && "visible")}>
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E0E6B]/10">
            <MessageCircle className="h-5 w-5 text-[#1E0E6B]" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Still have questions?</h2>
          <p className="mt-3 text-muted-foreground">
            Can&apos;t find what you&apos;re looking for? Our team would be happy to help.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all"
          >
            Contact Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function FaqPageContent() {
  return (
    <>
      <FaqHero />
      <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[850px] mx-auto">
            <FaqAccordion />
          </div>
        </div>
      </section>
      <StillHaveQuestions />
    </>
  )
}
