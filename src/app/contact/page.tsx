import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ContactContent } from "@/components/marketing/contact-content"

export const metadata: Metadata = {
  title: "Contact Intenteo — Get in Touch",
  description:
    "Have a question about Intenteo, need help getting started, or want to work with us? We'd love to hear from you.",
}

export default function ContactPage() {
  return (
    <MarketingLayout>
      <ContactContent />
    </MarketingLayout>
  )
}
