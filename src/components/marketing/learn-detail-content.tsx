"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface LearnTopic {
  title: string
  content: string[]
}

interface LearnDetailContentProps {
  topics: LearnTopic[]
}

export function LearnDetailContent({ topics }: LearnDetailContentProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {topics.map((topic, i) => (
        <div
          key={topic.title}
          className="rounded-xl border border-[#1E0E6B]/10 overflow-hidden transition-all duration-200"
        >
          <button
            onClick={() => toggle(i)}
            className={cn(
              "w-full flex items-center justify-between p-5 text-left transition-colors duration-200",
              openIndex === i
                ? "bg-[#1E0E6B]/5"
                : "bg-white dark:bg-card hover:bg-[#1E0E6B]/[0.02]"
            )}
            aria-expanded={openIndex === i}
          >
            <h3 className={cn(
              "font-semibold text-base transition-colors",
              openIndex === i ? "text-[#1E0E6B]" : "text-foreground"
            )}>
              {topic.title}
            </h3>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0 ml-4",
                openIndex === i && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openIndex === i ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="px-5 pb-5 space-y-4">
              {topic.content.map((paragraph, j) => (
                <p
                  key={j}
                  className="text-[17px] text-foreground/80 leading-[1.8]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
