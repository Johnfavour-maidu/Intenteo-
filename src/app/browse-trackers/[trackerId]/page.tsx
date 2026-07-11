"use client"

import { useParams } from "next/navigation"
import { TrackerDetailPage } from "@/components/trackers/tracker-detail-page"

export default function TrackerDetail() {
  const params = useParams()
  const trackerId = params.trackerId as string
  return <TrackerDetailPage trackerId={trackerId} />
}
