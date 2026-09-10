import Link from "next/link"
import { MarketingLogo } from "@/components/marketing/marketing-logo"
import { Download } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="space-y-3">
            <MarketingLogo size="sm" />
            <p className="text-sm text-muted-foreground">Live with intentionality.</p>
            <Link href="/download" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-[#FF5A1F]/15 hover:shadow-md hover:shadow-[#FF5A1F]/25 hover:-translate-y-0.5 transition-all">
              <Download className="h-3 w-3" />
              Download the App
            </Link>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Learn</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>&copy; 2026 Inteéntéo. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
