import type { Metadata } from "next"
import { Suspense } from "react"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { FaqPageContent } from "@/components/marketing/faq-components"

export const metadata: Metadata = {
  title: "Inteénteo FAQ — Frequently Asked Questions",
  description:
    "Find answers to frequently asked questions about Inteénteo, Intent Score, intentional living, features, mobile access, privacy, accounts and getting started.",
  openGraph: {
    title: "Inteénteo FAQ — Frequently Asked Questions",
    description:
      "Find answers to frequently asked questions about Inteénteo, Intent Score, intentional living, features, mobile access, privacy, accounts and getting started.",
    type: "website",
  },
}

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Inteénteo?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inteénteo is an intentional living platform that connects your purpose, vision, goals, tasks, habits, and reflection into a single system. It helps you move from what matters to what you do every day, so your actions align with the life you want to live.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Intent Score work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Intent Score is a daily measure of how intentionally you lived. It weighs task completion, habit consistency, goal alignment, and reflection quality into a single percentage — giving you a clear pulse on your day.",
      },
    },
    {
      "@type": "Question",
      name: "Is Inteénteo free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Inteénteo is free to use with core features including purpose, vision, goals, tasks, habits, and journaling. No credit card required.",
      },
    },
    {
      "@type": "Question",
      name: "Is Inteénteo available on mobile?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Inteénteo is available as a mobile app for iOS and Android. You can also use Inteénteo directly from your web browser on any device.",
      },
    },
    {
      "@type": "Question",
      name: "How is my data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We take your privacy seriously. Inteénteo primarily stores your data in your browser's local storage, meaning your data stays on your device. We do not sell your personal information.",
      },
    },
  ],
}

export default function FaqPage() {
  return (
    <MarketingLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <Suspense>
        <FaqPageContent />
      </Suspense>
    </MarketingLayout>
  )
}
