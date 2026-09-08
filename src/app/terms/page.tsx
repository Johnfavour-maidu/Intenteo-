import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { TermsContent } from "@/components/marketing/terms-content"

export const metadata: Metadata = {
  title: "Terms of Service — Intenteo",
  description:
    "Intenteo's Terms of Service. Read the terms governing your use of the Intenteo platform.",
}

export default function TermsPage() {
  return (
    <MarketingLayout>
      <TermsContent />
    </MarketingLayout>
  )
}
