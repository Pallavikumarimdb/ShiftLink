import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CheckCircle2 } from "lucide-react"

interface VerificationBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function VerificationBadge({ className = "", size = "md", showTooltip = true }: VerificationBadgeProps) {
  const badgeContent = (
    <Badge
      className={`bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 flex items-center gap-1 ${
        size === "sm" ? "px-1.5 py-0.5 text-xs" : size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
      } ${className}`}
    >
      <CheckCircle2 className={size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span>Verified</span>
    </Badge>
  )

  if (!showTooltip) {
    return badgeContent
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent>
          <p>This employer has been verified by ShiftLink</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
