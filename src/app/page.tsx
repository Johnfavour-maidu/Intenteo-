"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { TodayDashboard } from "@/components/dashboard/today-dashboard"

export default function Home() {
  return (
    <MainLayout>
      <TodayDashboard />
    </MainLayout>
  )
}
