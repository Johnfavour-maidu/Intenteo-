"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Search, X, ChevronDown } from "lucide-react"
import { faqData, searchFaq, FAQ_CATEGORIES, type FaqItem, type FaqCategory } from "@/lib/faq-data"

/* ─── Accordion Item ─── */
function FaqAccordionItem({ item, isOpen, onToggle, index }: { item: FaqItem; isOpen: boolean; onToggle: () => void; index: number }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div className={cn("border border-[#1E0E6B]/10 rounded-xl overflow-hidden transition-colors", isOpen && "bg-[#FAFBFF] dark:bg-[#141220]")}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "flex items-center justify-between w-full text-left px-5 py-4 gap-4 transition-colors",
          "hover:bg-[#1E0E6B]/[0.02]",
          isOpen ? "text-foreground" : "text-foreground"
        )}
      >
        <span className="text-sm font-medium leading-snug pr-2">{item.question}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <div
        ref={contentRef}
        style={{ height: `${height}px` }}
        className="overflow-hidden transition-[height] duration-300 ease-in-out"
      >
        <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
          {item.answer}
        </div>
      </div>
    </div>
  )
}

/* ─── Category Filter ─── */
function CategoryFilter({ selected, onSelect }: { selected: string | null; onSelect: (cat: string | null) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
          selected === null
            ? "bg-[#1E0E6B] text-white border-[#1E0E6B]"
            : "border-[#1E0E6B]/15 text-muted-foreground hover:border-[#1E0E6B]/30 hover:text-foreground"
        )}
      >
        All
      </button>
      {FAQ_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
            selected === cat
              ? "bg-[#1E0E6B] text-white border-[#1E0E6B]"
              : "border-[#1E0E6B]/15 text-muted-foreground hover:border-[#1E0E6B]/30 hover:text-foreground"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

/* ─── Shared FAQ Accordion (used by both /faq and /contact) ─── */
export function FaqAccordion({ items: initialItems, limit }: { items?: FaqItem[]; limit?: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const sourceItems = initialItems || faqData
  const categoryFiltered = selectedCategory
    ? sourceItems.filter((item) => item.category === selectedCategory)
    : sourceItems
  const filtered = searchFaq(categoryFiltered, searchQuery)
  const displayItems = limit ? filtered.slice(0, limit) : filtered

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    inputRef.current?.focus()
  }, [])

  return (
    <div className="space-y-6">
      {searchQuery !== undefined && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null) }}
            placeholder="Search questions..."
            className="w-full rounded-xl border border-[#1E0E6B]/15 bg-white dark:bg-gray-950 pl-11 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1E0E6B]/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {!limit && <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />}

      {displayItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm font-medium text-foreground">No questions found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search term or browse the categories below.</p>
          {(searchQuery || selectedCategory) && (
            <button
              onClick={() => { setSearchQuery(""); setSelectedCategory(null) }}
              className="mt-4 text-sm font-medium text-[#1E0E6B] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayItems.map((item, i) => (
            <FaqAccordionItem
              key={`${item.category}-${item.question}`}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              index={i}
            />
          ))}
        </div>
      )}

      {limit && filtered.length > limit && (
        <div className="text-center pt-2">
          <a href="/faq" className="text-sm font-medium text-[#1E0E6B] hover:underline">
            View all {filtered.length} FAQs →
          </a>
        </div>
      )}
    </div>
  )
}
