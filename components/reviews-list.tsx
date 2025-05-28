import { StarRating } from "@/components/star-rating"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewerName: string
  jobTitle: string
}

interface ReviewsListProps {
  reviews: Review[]
  emptyMessage?: string
}

export function ReviewsList({ reviews, emptyMessage = "No reviews yet" }: ReviewsListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-medium">{review.reviewerName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
              </div>
              <p className="text-sm text-muted-foreground">Job: {review.jobTitle}</p>
              <p className="text-sm mt-2">{review.comment}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
