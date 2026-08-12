import { MarketingNavbar } from "./marketing-navbar"
import { MarketingFooter } from "./marketing-footer"

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingNavbar />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </>
  )
}
