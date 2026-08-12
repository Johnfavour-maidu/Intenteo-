import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { HowItWorksContent } from "@/components/marketing/how-it-works-content"

export const metadata: Metadata = {
  title: "How Intenteó Works — Live With Intention",
  description: "Intenteó connects your purpose, vision, goals, tasks, habits, and reflection into a single intentional living system.",
  openGraph: {
    title: "How Intenteó Works — Live With Intention",
    description: "Intenteó connects your purpose, vision, goals, tasks, habits, and reflection into a single intentional living system.",
    siteName: "Intenteo",
  },
}

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <HowItWorksContent />
    </MarketingLayout>
  )
}
