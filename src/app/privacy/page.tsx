import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { PrivacyContent } from "@/components/marketing/legal/privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy | Inteénteo",
  description: "Learn how Inteénteo collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <PrivacyContent />
    </MarketingLayout>
  )
}
