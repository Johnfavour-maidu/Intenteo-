"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { MarketingLogo } from "@/components/marketing/marketing-logo"

const navItems = [
  { label: "Home", href: "/" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Learn", href: "/learn" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
]

export function MarketingNavbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    if (mobileOpen) {
      window.addEventListener("keydown", handleEscape)
      return () => window.removeEventListener("keydown", handleEscape)
    }
  }, [mobileOpen])

  const isActive = (href: string) => {
    if (href === "/learn") return pathname === "/learn" || pathname.startsWith("/learn/")
    if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/")
    return pathname === href
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <MarketingLogo size="md" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  isActive(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl border border-[#1E0E6B]/20 bg-white/80 px-4 py-2 text-sm font-semibold text-[#1E0E6B] hover:bg-[#1E0E6B]/5 transition-colors"
            >
              Download App
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center rounded-xl border border-[#1E0E6B]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#1E0E6B] hover:bg-[#1E0E6B]/5 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 right-0 z-[51] h-screen w-[280px] max-w-[80vw] bg-background border-l border-border shadow-xl md:hidden flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex h-16 items-center justify-between px-4 border-b">
              <MarketingLogo size="sm" onClick={() => setMobileOpen(false)} />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                      isActive(item.href)
                        ? "bg-[#1E0E6B]/10 text-[#1E0E6B]"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
            <div className="border-t p-4 space-y-3">
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[#1E0E6B]/20 px-4 py-3 text-sm font-semibold text-[#1E0E6B] hover:bg-[#1E0E6B]/5 transition-colors"
              >
                Download App
              </Link>
              <Link
                href="/signin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl border border-[#1E0E6B]/20 px-4 py-3 text-sm font-medium text-[#1E0E6B] hover:bg-[#1E0E6B]/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
