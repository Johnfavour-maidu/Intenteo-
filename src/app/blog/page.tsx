import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { BlogContent } from "@/components/marketing/blog-content"

export const metadata: Metadata = {
  title: "Blog — Intentéo | Thoughts on Intentional Living",
  description: "Thoughts on purpose, habits, reflection, and living intentionally — from the Intentéo team.",
  openGraph: {
    title: "Blog — Intentéo | Thoughts on Intentional Living",
    description: "Thoughts on purpose, habits, reflection, and living intentionally — from the Intentéo team.",
    siteName: "Inteénteo",
  },
}

export default function BlogPage() {
  return (
    <MarketingLayout>
      <BlogContent />
    </MarketingLayout>
  )
}
