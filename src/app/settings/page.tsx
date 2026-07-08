"use client"

import { Suspense } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { SettingsPage } from "@/components/settings/settings-page"

export default function Settings() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-8 text-muted-foreground">Loading settings...</div>}>
        <SettingsPage />
      </Suspense>
    </MainLayout>
  )
}
