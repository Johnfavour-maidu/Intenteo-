import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { FaqPageContent } from "@/components/marketing/faq-page-content"

export const metadata: Metadata = {
  title: "FAQ | Frequently Asked Questions | Intenteo",
  description:
    "Find answers about Intenteo, intentional living, the Intent Score, tasks, habits, journaling, and getting started.",
}

export default function FaqPage() {
  return (
    <MarketingLayout>
      <FaqPageContent />
    </MarketingLayout>
  )
}
