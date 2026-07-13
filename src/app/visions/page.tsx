"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { VisionsPage } from "@/components/visions/visions-page"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function Visions() {
  return (
    <MainLayout>
      <ErrorBoundary>
        <VisionsPage />
      </ErrorBoundary>
    </MainLayout>
  )
}
