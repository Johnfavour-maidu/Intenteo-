"use client"

import { Suspense } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { JournalPage } from "@/components/journal/journal-page"

export default function Journal() {
  return (
    <MainLayout>
      <Suspense>
        <JournalPage />
      </Suspense>
    </MainLayout>
  )
}
