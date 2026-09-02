"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { MarketingHero } from "@/components/marketing/hero"
import { ProblemSection } from "@/components/marketing/problem-section"
import { IntentFramework } from "@/components/marketing/intent-framework"
import { TodaySection } from "@/components/marketing/today-section"
import { IntentScoreSection } from "@/components/marketing/intent-score-section"
import { Capabilities } from "@/components/marketing/capabilities"
import { LearnSection } from "@/components/marketing/learn-section"
import { FinalCTA } from "@/components/marketing/final-cta"

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
        <MarketingHero />
        <ProblemSection />
        <IntentFramework />
        <TodaySection />
        <IntentScoreSection />
        <Capabilities />
        <LearnSection />
        <FinalCTA />
      </MarketingLayout>
    )
  }

  return (
    <MainLayout>
      <TodayDashboard />
    </MainLayout>
  )
}
