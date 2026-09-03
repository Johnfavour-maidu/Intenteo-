"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ArticleImageProps {
  src?: string
  alt?: string
  title: string
  category: string
  className?: string
  priority?: boolean
}

export function ArticleImage({ src, alt, title, category, className, priority = false }: ArticleImageProps) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  if (!src || imgError) {
    return (
      <div className={cn(
        "relative w-full aspect-[16/9] rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-[#1E0E6B] via-[#2A1480] to-[#3D1FA0]",
        className
      )}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/5 rounded-3xl rotate-6 scale-95" />
            <div className="absolute inset-0 bg-white/5 rounded-3xl -rotate-3 scale-105" />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/10">
              <span className="text-4xl sm:text-5xl font-bold text-white/90">i</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full px-3 py-1 text-xs font-semibold bg-white/10 text-white/80 backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-[#1E0E6B]/5",
      className
    )}>
      {!imgLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E0E6B]/10 via-[#1E0E6B]/5 to-transparent animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt || title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "object-cover transition-opacity duration-500",
          imgLoaded ? "opacity-100" : "opacity-0"
        )}
        priority={priority}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
      />
    </div>
  )
}
