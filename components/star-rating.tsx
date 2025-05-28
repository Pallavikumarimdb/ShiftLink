import { Star, StarHalf } from "lucide-react"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

export function StarRating({ rating, maxRating = 5, size = "md", showValue = true, className = "" }: StarRatingProps) {
  // Convert rating to a number if it's a string
  const numericRating = typeof rating === "string" ? Number.parseFloat(rating) : rating

  // Calculate the number of full stars, half stars, and empty stars
  const fullStars = Math.floor(numericRating)
  const hasHalfStar = numericRating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  // Determine star size based on the size prop
  const starSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4"
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm"

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={`${starSize} fill-yellow-400 text-yellow-400`} />
        ))}

        {/* Half star */}
        {hasHalfStar && <StarHalf className={`${starSize} fill-yellow-400 text-yellow-400`} />}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={`${starSize} text-gray-300 dark:text-gray-600`} />
        ))}
      </div>

      {showValue && <span className={`font-medium ${textSize}`}>{numericRating.toFixed(1)}</span>}
    </div>
  )
}
