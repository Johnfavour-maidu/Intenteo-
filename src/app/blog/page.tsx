import { Metadata } from "next"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { BlogContent } from "@/components/marketing/blog-content"

export const metadata: Metadata = {
  title: "Blog — Intenteó | Thoughts on Intentional Living",
  description: "Thoughts on purpose, habits, reflection, and living intentionally — from the Intenteó team.",
  openGraph: {
    title: "Blog — Intenteó | Thoughts on Intentional Living",
    description: "Thoughts on purpose, habits, reflection, and living intentionally — from the Intenteó team.",
    siteName: "Intenteo",
  },
}

export default function BlogPage() {
  return (
    <MarketingLayout>
      <BlogContent />
    </MarketingLayout>
  )
}
