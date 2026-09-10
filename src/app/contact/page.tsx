import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ContactContent } from "@/components/marketing/contact-content"

export const metadata: Metadata = {
  title: "Contact Inteéntéo — We're Here to Help",
  description:
    "Have a question about Inteéntéo, need help getting started, or want to share feedback? Get in touch with the Inteéntéo team.",
}

export default function ContactPage() {
  return (
    <MarketingLayout>
      <ContactContent />
    </MarketingLayout>
  )
}
