"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { MemoryTimelinePage } from "@/components/timeline/memory-timeline-page"

export default function Timeline() {
  return (
    <MainLayout>
      <MemoryTimelinePage />
    </MainLayout>
  )
}
