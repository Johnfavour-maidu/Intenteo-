"use client"

import { useEffect, useState } from "react"

type Platform = "desktop" | "mobile"

function detectPlatform(userAgent: string | null): Platform {
  if (!userAgent) return "desktop"
  const mobileKeywords = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
  return mobileKeywords.test(userAgent) ? "mobile" : "desktop"
}

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("desktop")

  useEffect(() => {
    setPlatform(detectPlatform(navigator.userAgent))
  }, [])

  return platform
}
