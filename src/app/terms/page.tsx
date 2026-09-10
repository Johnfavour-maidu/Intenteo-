import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { TermsContent } from "@/components/marketing/legal/terms-content"

export const metadata: Metadata = {
  title: "Terms of Service | Inteénteo",
  description: "Review the terms governing your use of Inteénteo.",
}

export default function TermsPage() {
  return (
    <MarketingLayout>
      <TermsContent />
    </MarketingLayout>
  )
}
