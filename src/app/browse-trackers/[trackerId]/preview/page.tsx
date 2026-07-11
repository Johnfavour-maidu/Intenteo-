"use client"

import { useParams } from "next/navigation"
import { TrackerPreviewPage } from "@/components/trackers/tracker-preview-page"

export default function TrackerPreview() {
  const params = useParams()
  const trackerId = params.trackerId as string
  return <TrackerPreviewPage trackerId={trackerId} />
}
