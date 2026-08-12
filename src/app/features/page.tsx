import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { FeaturesContent } from "@/components/marketing/features-content"

export const metadata: Metadata = {
  title: "Intenteó Features — Purpose, Goals, Tasks, Habits, Reflection",
  description: "Explore how Intenteó helps you live intentionally through purpose-driven goals, daily tasks, habit tracking, and reflection.",
  openGraph: {
    title: "Intenteó Features — Purpose, Goals, Tasks, Habits, Reflection",
    description: "Explore how Intenteó helps you live intentionally through purpose-driven goals, daily tasks, habit tracking, and reflection.",
    siteName: "Intenteo",
  },
}

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <FeaturesContent />
    </MarketingLayout>
  )
}
