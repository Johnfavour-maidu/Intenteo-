import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { categoryColors } from "@/lib/blog-data"

interface ArticleMetadataProps {
  category: string
  date: string
  readTime: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ArticleMetadata({ category, date, readTime, className, size = "md" }: ArticleMetadataProps) {
  return (
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      <span className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-semibold",
        categoryColors[category] || "bg-[#1E0E6B]/10 text-[#1E0E6B]",
        size === "sm" && "px-2.5 py-0.5 text-[11px]",
        size === "lg" && "px-4 py-1.5 text-sm"
      )}>
        {category}
      </span>
      <span className={cn(
        "text-muted-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base"
      )}>
        <span className="flex items-center gap-1.5">
          <Calendar className={cn(
            size === "sm" && "h-3 w-3",
            size === "md" && "h-3.5 w-3.5",
            size === "lg" && "h-4 w-4"
          )} />
          {date}
        </span>
      </span>
      <span className="text-border">·</span>
      <span className={cn(
        "text-muted-foreground flex items-center gap-1.5",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base"
      )}>
        <Clock className={cn(
          size === "sm" && "h-3 w-3",
          size === "md" && "h-3.5 w-3.5",
          size === "lg" && "h-4 w-4"
        )} />
        {readTime}
      </span>
    </div>
  )
}
