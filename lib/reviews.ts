import prisma from "@/lib/prisma"

export interface Review {
  id: string
  employerRating: number | null
  employerComment: string | null
  employerReviewedAt: Date | null
  studentRating: number | null
  studentComment: string | null
  studentReviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface FormattedReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewerName: string
  jobTitle: string
}

export async function getReviewsByStudentId(studentId: string): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: {
      studentId,
    },
    select: {
      id: true,
      employerRating: true,
      employerComment: true,
      employerReviewedAt: true,
      studentRating: true,
      studentComment: true,
      studentReviewedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return reviews
}

export function calculateAverageRating(reviews: Review[], type: "student" | "employer"): string {
  const validReviews = reviews.filter((review) => {
    if (type === "student") {
      return review.employerRating !== null
    }
    return review.studentRating !== null
  })

  if (validReviews.length === 0) return "0.0"

  const sum = validReviews.reduce((acc, review) => {
    if (type === "student") {
      return acc + (review.employerRating || 0)
    }
    return acc + (review.studentRating || 0)
  }, 0)

  return (sum / validReviews.length).toFixed(1)
} 