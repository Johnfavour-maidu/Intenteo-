"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { TodayDashboard } from "@/components/dashboard/today-dashboard"
import { MarketingLayout } from "@/components/layout/marketing-layout"
import { MarketingHero } from "@/components/marketing/hero"
import { ProblemSection } from "@/components/marketing/problem-section"
import { IntentFramework } from "@/components/marketing/intent-framework"
import { TodaySection } from "@/components/marketing/today-section"
import { IntentScoreSection } from "@/components/marketing/intent-score-section"
import { Capabilities } from "@/components/marketing/capabilities"
import { LearnSection } from "@/components/marketing/learn-section"
import { FinalCTA } from "@/components/marketing/final-cta"

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
