import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { AboutContent } from "@/components/marketing/about-content"

export const metadata: Metadata = {
  title: "About Intenteó — Productivity Should Serve a Meaningful Life",
  description: "Intenteó exists because productivity should serve a meaningful life, not become the purpose itself. Learn the philosophy behind intentional living.",
  openGraph: {
    title: "About Intenteó — Productivity Should Serve a Meaningful Life",
    description: "Intenteó exists because productivity should serve a meaningful life, not become the purpose itself. Learn the philosophy behind intentional living.",
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
