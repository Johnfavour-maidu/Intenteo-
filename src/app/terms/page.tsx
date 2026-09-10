import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { TermsContent } from "@/components/marketing/legal/terms-content"

export const metadata: Metadata = {
  title: "Terms of Service | Intentéo",
  description: "Review the terms governing your use of Intentéo.",
}

export default function TermsPage() {
  return (
    <MarketingLayout>
      <TermsContent />
    </MarketingLayout>
  )
}
