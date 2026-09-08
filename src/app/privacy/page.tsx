import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { PrivacyContent } from "@/components/marketing/privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy — Intenteo",
  description:
    "Intenteo's Privacy Policy. Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <PrivacyContent />
    </MarketingLayout>
  )
}
