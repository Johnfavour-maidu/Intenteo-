"use client"

import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { HomeContent } from "@/components/marketing/home-content"

const MainLayout = dynamic(
  () => import("@/components/layout/main-layout").then((m) => m.MainLayout),
  { ssr: false }
)
const TodayDashboard = dynamic(
  () => import("@/components/dashboard/today-dashboard").then((m) => m.TodayDashboard),
  { ssr: false }
)

export default function Home() {
  const { isSignedIn, isHydrated } = useAuth()

  if (!isHydrated) return null

  if (!isSignedIn) {
    return (
      <MarketingLayout>
        <HomeContent />
      </MarketingLayout>
    )
  }

  return (
    <MainLayout>
      <TodayDashboard />
    </MainLayout>
  )
}
