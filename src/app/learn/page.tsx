import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { LearnContent } from "@/components/marketing/learn-content"

export const metadata: Metadata = {
  title: "Intenteó Learn — Resources for Intentional Living",
  description: "Guides on purpose, vision, habits, reflection, and mindfulness — plus the philosophy behind Intenteó.",
  openGraph: {
    title: "Intenteó Learn — Resources for Intentional Living",
    description: "Guides on purpose, vision, habits, reflection, and mindfulness — plus the philosophy behind Intenteó.",
    siteName: "Intenteo",
  },
}

export default function LearnPage() {
  return (
    <MarketingLayout>
      <LearnContent />
    </MarketingLayout>
  )
}
