"use client"

import React, { Suspense } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { LibraryPage } from "@/components/library/library-page"

export default function LibraryRoute() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
        <LibraryPage />
      </Suspense>
    </MainLayout>
  )
}
