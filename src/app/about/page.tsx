import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { AboutContent } from "@/components/marketing/about-content"

export const metadata: Metadata = {
  title: "About Inteénteo — Why We Exist, Our Philosophy & Beliefs",
  description:
    "Learn why Inteénteo exists, our philosophy on intentional living, and the beliefs that guide how we build the product.",
}

export default function AboutPage() {
  return (
    <MarketingLayout>
      <AboutContent />
    </MarketingLayout>
  )
}
