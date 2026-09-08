"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface TocItem {
  id: string
  label: string
}

export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
      setMobileOpen(false)
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden lg:block sticky top-24 self-start w-56 shrink-0" aria-label="Table of contents">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#EB9E5B] mb-3">{title}</p>
        <ul className="space-y-1 border-l border-[#1E0E6B]/10">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleClick(item.id)}
                className="block w-full text-left text-sm text-muted-foreground hover:text-[#1E0E6B] hover:border-l-2 hover:border-[#1E0E6B] hover:pl-3 transition-all duration-200 py-1.5 pl-3"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile dropdown */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground px-4 py-3 rounded-xl border border-[#1E0E6B]/10 w-full bg-white dark:bg-gray-950"
        >
          On this page
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen && (
          <ul className="mt-2 border border-[#1E0E6B]/10 rounded-xl bg-white dark:bg-gray-950 p-2 space-y-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.id)}
                  className="block w-full text-left text-sm text-muted-foreground hover:text-[#1E0E6B] hover:bg-[#1E0E6B]/5 rounded-lg px-3 py-2 transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
