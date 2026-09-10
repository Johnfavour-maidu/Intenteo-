"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  Search,
  X,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { faqData, getActiveCategories, type FaqItem } from "@/lib/faq-data"
import { searchFaqSmart, highlightFaqText } from "@/lib/faq-search"

const ITEMS_PER_CATEGORY = 4

/* ═══════════════════════════════════ HOOKS ═══════════════════════════════════ */

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

/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */

function FaqHero() {
  const { ref, visible } = useReveal(0.05)
  return (
    <section className="relative pt-24 pb-8 md:pt-28 md:pb-10 overflow-hidden bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#1E0E6B]/[0.03] blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#F3F0FF] blur-2xl" />
      </div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("text-center max-w-2xl mx-auto", visible && "visible")}>
          <span
            className={cn(
              "inline-block text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3 reveal",
              visible && "visible"
            )}
          >
            Frequently Asked Questions
          </span>
          <h1
            className={cn(
              "text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] leading-tight reveal reveal-delay-1",
              visible && "visible"
            )}
          >
            Questions? We&apos;ve got answers.
          </h1>
          <p
            className={cn(
              "mt-3.5 text-base sm:text-lg text-muted-foreground leading-relaxed reveal reveal-delay-2",
              visible && "visible"
            )}
          >
            Find answers about Intenteo, how it works, and how it can help you live with more intention.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════ SEARCH ═══════════════════════════════════ */

function FaqSearch({ query, onQueryChange }: { query: string; onQueryChange: (q: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { ref, visible } = useReveal(0.1)

  return (
    <div ref={ref} className={cn("reveal", visible && "visible")}>
      <div className="relative max-w-[680px] mx-auto rounded-xl gradient-border-animated">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search frequently asked questions..."
          aria-label="Search frequently asked questions"
          className="w-full rounded-xl bg-white dark:bg-card pl-11 pr-10 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:ring-0"
        />
        {query && (
          <button
            onClick={() => {
              onQueryChange("")
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-[#1E0E6B]/5 transition-colors z-10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ CATEGORIES ═══════════════════════════════════ */

function CategoryFilters({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: string
  onCategoryChange: (cat: string) => void
}) {
  const categories = useMemo(() => getActiveCategories(), [])
  const { ref, visible } = useReveal(0.1)

  return (
    <div ref={ref} className={cn("reveal", visible && "visible")}>
      <div className="flex gap-2.5 flex-wrap justify-center">
        {categories.map((cat) => {
          const isActive = cat === activeCategory
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={cn(
                "shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-250 relative z-[1]",
                isActive
                  ? "bg-[#1E0E6B] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#1E0E6B]/[0.02]"
              )}
              style={
                !isActive
                  ? {
                      background: "white",
                      border: "2px solid transparent",
                      backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)",
                      backgroundOrigin: "border-box",
                      backgroundClip: "padding-box, border-box",
                    }
                  : undefined
              }
              aria-pressed={isActive}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ FEEDBACK ═══════════════════════════════════ */

function WasThisHelpful({ faqId }: { faqId: string }) {
  const [feedback, setFeedback] = useState<"yes" | "no" | null>(null)
  const storageKey = `intenteo-faq-feedback-${faqId}`

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as "yes" | "no" | null
    if (stored) setFeedback(stored)
  }, [storageKey])

  const handleFeedback = (value: "yes" | "no") => {
    if (feedback) return
    setFeedback(value)
    try {
      localStorage.setItem(storageKey, value)
    } catch {}
  }

  return (
    <div className="mt-4 pt-4 border-t border-[#1E0E6B]/5">
      {feedback ? (
        <p className="text-xs text-muted-foreground italic">Thanks for your feedback.</p>
      ) : (
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <button
            onClick={() => handleFeedback("yes")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E0E6B]/10 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-green-300 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
            aria-label="Yes, this was helpful"
          >
            <ThumbsUp className="h-3 w-3" /> Yes
          </button>
          <button
            onClick={() => handleFeedback("no")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E0E6B]/10 px-2.5 py-1.5 text-xs text-muted-foreground hover:border-red-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
            aria-label="No, this was not helpful"
          >
            <ThumbsDown className="h-3 w-3" /> No
          </button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════ ACCORDION ═══════════════════════════════════ */

function FaqAccordionItem({
  faq,
  isOpen,
  onToggle,
  searchQuery,
}: {
  faq: FaqItem
  isOpen: boolean
  onToggle: () => void
  searchQuery: string
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen])

  const questionHtml = searchQuery ? highlightFaqText(faq.question, searchQuery) : faq.question

  return (
    <div
      id={`faq-${faq.id}`}
      className={cn(
        "faq-item group relative rounded-2xl border transition-all duration-250",
        isOpen
          ? "border-transparent faq-gradient-border-open"
          : "border-[#1E0E6B]/8 bg-white dark:bg-card hover:border-transparent hover:faq-gradient-border"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span
          className="text-sm sm:text-[0.9375rem] font-semibold text-foreground leading-snug"
          dangerouslySetInnerHTML={{ __html: questionHtml }}
        />
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-250 ease-out",
            isOpen && "rotate-180 text-[#1E0E6B]"
          )}
        />
      </button>
      <div
        id={`faq-answer-${faq.id}`}
        role="region"
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? height : 0 }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-[65ch]">
            {faq.answer}
          </p>
          <WasThisHelpful faqId={faq.id} />
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ CATEGORY SECTION ═══════════════════════════════════ */

function CategorySection({
  category,
  faqs,
  openId,
  onFaqClick,
  searchQuery,
}: {
  category: string
  faqs: FaqItem[]
  openId: string | null
  onFaqClick: (id: string) => void
  searchQuery: string
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleFaqs = showAll ? faqs : faqs.slice(0, ITEMS_PER_CATEGORY)
  const hiddenCount = faqs.length - ITEMS_PER_CATEGORY

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground/70 uppercase tracking-wider px-1">{category}</h3>
      <div className="space-y-3">
        {visibleFaqs.map((faq, i) => (
          <div
            key={faq.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${Math.min(i * 30, 200)}ms` }}
          >
            <FaqAccordionItem
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => onFaqClick(faq.id)}
              searchQuery={searchQuery}
            />
          </div>
        ))}
      </div>
      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E0E6B] hover:underline transition-colors px-1"
        >
          Show {hiddenCount} more {hiddenCount === 1 ? "question" : "questions"} <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      {showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(false)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E0E6B] hover:underline transition-colors px-1"
        >
          Show less <ChevronDown className="h-3.5 w-3.5 rotate-180" />
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════ EMPTY STATE ═══════════════════════════════════ */

function EmptySearchState({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E0E6B]/5">
        <Search className="h-6 w-6 text-[#1E0E6B]/40" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">We couldn&apos;t find an answer.</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
        Try another search or contact our team and we&apos;ll be happy to help.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-xl border border-[#1E0E6B]/15 bg-white dark:bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:border-[#1E0E6B]/25 hover:bg-[#1E0E6B]/[0.02] transition-all duration-200"
        >
          Clear Search
        </button>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all duration-200"
        >
          Contact Us <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ ACCORDION LIST ═══════════════════════════════════ */

export function FaqAccordion() {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.replace("#faq-", "")
    if (hash && faqData.some((f) => f.id === hash)) {
      setOpenId(hash)
      setTimeout(() => {
        const el = document.getElementById(`faq-${hash}`)
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 100)
    }
  }, [])

  const filteredFaqs = useMemo(() => {
    return searchFaqSmart(query, faqData, activeCategory)
  }, [query, activeCategory])

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, FaqItem[]> = {}
    for (const faq of filteredFaqs) {
      if (!groups[faq.category]) groups[faq.category] = []
      groups[faq.category].push(faq)
    }
    return groups
  }, [filteredFaqs])

  const handleFaqClick = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id))
    setTimeout(() => {
      const el = document.getElementById(`faq-${id}`)
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 50)
  }, [])

  const handleClear = useCallback(() => {
    setQuery("")
    setActiveCategory("All")
  }, [])

  return (
    <div className="space-y-6">
      <FaqSearch query={query} onQueryChange={setQuery} />
      <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {filteredFaqs.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([category, faqs]) => (
            <CategorySection
              key={category}
              category={category}
              faqs={faqs}
              openId={openId}
              onFaqClick={handleFaqClick}
              searchQuery={query}
            />
          ))}
        </div>
      ) : (
        <EmptySearchState onClear={handleClear} />
      )}
    </div>
  )
}

/* ═══════════════════════════════════ CTA ═══════════════════════════════════ */

function StillHaveQuestions() {
  const { ref, visible } = useReveal(0.15)
  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-[#1E0E6B] to-[#0F0A3A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center max-w-2xl mx-auto", visible && "visible")}>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Still have questions?</h2>
          <p className="mt-4 text-white/70">
            Can&apos;t find what you&apos;re looking for? Our team would be happy to help.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all"
            >
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-7 py-3.5 text-base font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Download the App
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════ EXPORT ═══════════════════════════════════ */

export function FaqPageContent() {
  return (
    <>
      <FaqHero />
      <section className="py-6 md:py-8 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[880px] mx-auto">
            <FaqAccordion />
          </div>
        </div>
      </section>
      <StillHaveQuestions />
    </>
  )
}
