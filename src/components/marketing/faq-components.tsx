"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    q: "What is Intenteo?",
    a: "Intenteo is an intentional living platform that connects your purpose, vision, goals, tasks, habits, and reflection into a single system — so every action moves you forward.",
  },
  {
    q: "How does the Intent Score work?",
    a: "The Intent Score is a daily metric that weighs task completion, habit consistency, goal alignment, and reflection quality into a single number (0–100%). It tells you how intentionally you lived today.",
  },
  {
    q: "Is Intenteo free?",
    a: "Yes. Intenteo is free to use with core features including purpose, vision, goals, tasks, habits, and journaling.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Intenteo stores all data locally in your browser using localStorage. Nothing is sent to a server unless you explicitly enable cloud sync.",
  },
  {
    q: "Can I use Intenteo on my phone?",
    a: "Yes. Intenteo has a dedicated Android app available for download. The web version also works on mobile browsers.",
  },
  {
    q: "How is Intenteo different from a to-do list?",
    a: "A to-do list helps you manage tasks. Intenteo connects those tasks to your purpose, vision, and goals — so you're not just productive, you're intentional.",
  },
  {
    q: "Can I track habits in Intenteo?",
    a: "Yes. Intenteo includes a full habit tracking system with health scores, streak tracking, completion quality, trend analysis, and coaching insights.",
  },
  {
    q: "What platforms does Intenteo support?",
    a: "Intenteo is available as a web app (all browsers) and as an Android app (APK download). iOS support is planned for the future.",
  },
]

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className={cn(
              "rounded-xl border transition-colors duration-200",
              isOpen
                ? "border-[#1E0E6B]/20 bg-[#1E0E6B]/[0.02]"
                : "border-[#1E0E6B]/10 bg-white dark:bg-card hover:border-[#1E0E6B]/15"
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-foreground">{faq.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
