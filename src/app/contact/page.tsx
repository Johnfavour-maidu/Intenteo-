import type { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { ContactContent } from "@/components/marketing/contact-content"

export const metadata: Metadata = {
  title: "Contact Inteénteo — We're Here to Help",
  description:
    "Have a question about Inteénteo, need help getting started, or want to share feedback? Get in touch with the Inteénteo team.",
}

export default function ContactPage() {
  return (
    <MarketingLayout>
      <ContactContent />
    </MarketingLayout>
  )
}
