import Link from "next/link"
import { TeoIcon } from "@/components/ui/teo-icon"

export function MarketingFooter() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Logo + Statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <TeoIcon size="sm" />
              <span className="text-xl font-bold">Intenteo</span>
            </div>
            <p className="text-sm text-muted-foreground">Live with intention.</p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Product</h3>
            <div className="flex flex-col gap-2">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
            </div>
          </div>

          {/* Learn */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Learn</h3>
            <div className="flex flex-col gap-2">
              <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
              <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Purpose</Link>
              <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Habits</Link>
              <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reflection</Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <a href="mailto:hello@intenteo.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Intenteo. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
