"use client"

import { cn } from "@/lib/utils"
import { TableOfContents } from "./table-of-contents"
import { ReadingProgress } from "./reading-progress"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface TocItem {
  id: string
  label: string
}

interface LegalPageLayoutProps {
  title: string
  subtitle: string
  lastUpdated: string
  tocItems: TocItem[]
  tocTitle: string
  children: React.ReactNode
  otherPageLabel: string
  otherPageHref: string
  contactLabel: string
}

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  tocItems,
  tocTitle,
  children,
  otherPageLabel,
  otherPageHref,
  contactLabel,
}: LegalPageLayoutProps) {
  return (
    <>
      <ReadingProgress />
      <section className="pt-24 pb-12 md:pt-28 md:pb-16 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
            <p className="mt-3 text-sm text-muted-foreground/70">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex gap-12">
            <TableOfContents items={tocItems} title={tocTitle} />
            <article className="flex-1 min-w-0 max-w-[800px] prose prose-gray dark:prose-invert prose-headings:scroll-mt-24 prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:font-semibold prose-h3:text-foreground prose-h3:mt-8 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-li:text-muted-foreground prose-li:leading-relaxed prose-strong:text-foreground prose-a:text-[#1E0E6B] prose-a:no-underline hover:prose-a:underline">
              {children}
            </article>
          </div>

          <div className="max-w-[800px] mx-auto lg:ml-[calc(50%-400px+14rem+3rem)] mt-12 pt-8 border-t border-[#1E0E6B]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
              <Link
                href={otherPageHref}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1E0E6B] transition-colors"
              >
                See our {otherPageLabel} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1E0E6B] transition-colors"
              >
                {contactLabel} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
