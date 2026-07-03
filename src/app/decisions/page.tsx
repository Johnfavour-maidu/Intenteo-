"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { DecisionJournalPage } from "@/components/decisions/decision-journal-page"

export default function DecisionJournal() {
  return (
    <MainLayout>
      <DecisionJournalPage />
    </MainLayout>
  )
}
