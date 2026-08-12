import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { AboutContent } from "@/components/marketing/about-content"

export const metadata: Metadata = {
  title: "About Intenteó — Why We Built Intentional Living",
  description: "Intenteó exists because productivity should serve a meaningful life, not become the purpose itself.",
  openGraph: {
    title: "About Intenteó — Why We Built Intentional Living",
    description: "Intenteó exists because productivity should serve a meaningful life, not become the purpose itself.",
    siteName: "Intenteo",
  },
}

export default function AboutPage() {
  return (
    <MarketingLayout>
      <AboutContent />
    </MarketingLayout>
  )
}
