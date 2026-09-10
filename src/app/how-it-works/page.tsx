import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { HowItWorksContent } from "@/components/marketing/how-it-works-content"

export const metadata: Metadata = {
  title: "How Intentéo Works — Live With Intention",
  description: "Six steps to intentional living, plus a full breakdown of every feature — purpose, goals, tasks, habits, reflection, and more.",
  openGraph: {
    title: "How Intentéo Works — Live With Intention",
    description: "Six steps to intentional living, plus a full breakdown of every feature — purpose, goals, tasks, habits, reflection, and more.",
    siteName: "Inteéntéo",
  },
}

export default function HowItWorksPage() {
  return (
    <MarketingLayout>
      <HowItWorksContent />
    </MarketingLayout>
  )
}
