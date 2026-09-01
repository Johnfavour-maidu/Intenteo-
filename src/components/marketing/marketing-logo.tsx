import Link from "next/link"

interface MarketingLogoProps {
  size?: "sm" | "md"
  href?: string
  className?: string
  onClick?: () => void
}

export function MarketingLogo({ size = "md", href = "/", className, onClick }: MarketingLogoProps) {
  const height = size === "sm" ? "h-7" : "h-8"

  if (onClick) {
    return (
      <button onClick={onClick} className={`flex items-center ${className || ""}`}>
        <img
          src="/branding/logo-primary.png"
          alt="Intenteo"
          className={`${height} w-auto object-contain dark:mix-blend-multiply dark:invert`}
          draggable={false}
        />
      </button>
    )
  }

  return (
    <Link href={href || "/"} className={`flex items-center ${className || ""}`}>
      <img
        src="/branding/logo-primary.png"
        alt="Intenteo"
        className={`${height} w-auto object-contain dark:mix-blend-multiply dark:invert`}
        draggable={false}
      />
    </Link>
  )
}
