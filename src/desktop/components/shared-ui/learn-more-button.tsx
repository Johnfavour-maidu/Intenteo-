import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LearnMoreButtonProps {
  onOpen: () => void
}

export function LearnMoreButton({ onOpen }: LearnMoreButtonProps) {
  return (
    <div className="flex justify-end mt-6 mb-8">
      <Button
        variant="outline"
        size="sm"
        onClick={onOpen}
        className="gap-1.5 bg-white dark:bg-gray-950 border border-[#1E0E6B] text-[#1E0E6B] hover:bg-[#1E0E6B]/5 hover:border-[#1E0E6B]"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Learn More
      </Button>
    </div>
  )
}
