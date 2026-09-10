import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { LearnContent } from "@/components/marketing/learn-content"

export const metadata: Metadata = {
  title: "Intentéo Learn — Resources for Intentional Living",
  description: "Guides on purpose, vision, habits, reflection, and mindfulness — plus the philosophy behind Intentéo.",
  openGraph: {
    title: "Intentéo Learn — Resources for Intentional Living",
    description: "Guides on purpose, vision, habits, reflection, and mindfulness — plus the philosophy behind Intentéo.",
    siteName: "Inteéntéo",
  },
}

export default function LearnPage() {
  return (
    <MarketingLayout>
      <LearnContent />
    </MarketingLayout>
  )
}
