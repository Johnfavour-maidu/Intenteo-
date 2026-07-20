import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LearnMoreSectionProps {
  title: string
  description: string
  onOpen: () => void
}

export function LearnMoreSection({ title, description, onOpen }: LearnMoreSectionProps) {
  return (
    <div className="mt-8 mb-4">
      <div className="rounded-xl border border-[#1E0E6B]/10 bg-gradient-to-br from-[#1E0E6B]/[0.02] to-[#1E0E6B]/[0.06] dark:from-[#1E0E6B]/10 dark:to-[#1E0E6B]/20 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E0E6B]/10">
          <BookOpen className="h-5 w-5 text-[#1E0E6B]" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpen}
          className="mt-5 gap-1.5 border-[#1E0E6B]/20 text-[#1E0E6B] hover:bg-[#1E0E6B]/5"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Learn More
        </Button>
      </div>
    </div>
  )
}
