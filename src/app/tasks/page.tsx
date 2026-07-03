"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { TasksPage } from "@/components/tasks/tasks-page"

export default function Tasks() {
  return (
    <MainLayout>
      <TasksPage />
    </MainLayout>
  )
}
