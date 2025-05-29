import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: employerId } = await context.params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the employer's user ID
    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      select: { userId: true },
    })

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 })
    }

    // Users can only view their own reviews unless they're an admin
    if (session.user.id !== employer.userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to view these reviews" }, { status: 403 })
    }

    const reviews = await prisma.review.findMany({
      where: {
        employerId,
        studentRating: { not: null },
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                title: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        studentReviewedAt: "desc",
      },
    })

    // Calculate average rating
    const validReviews = reviews.filter((review) => review.studentRating !== null)
    const averageRating = validReviews.length > 0
      ? (validReviews.reduce((acc, review) => acc + (review.studentRating || 0), 0) / validReviews.length).toFixed(1)
      : "0.0"

    // Format the response
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      applicationId: review.applicationId,
      jobTitle: review.application.job.title,
      studentId: review.studentId,
      studentName: review.student.user.name,
      rating: review.studentRating,
      comment: review.studentComment,
      reviewedAt: review.studentReviewedAt,
      createdAt: review.createdAt,
    }))

    return NextResponse.json({
      reviews: formattedReviews,
      averageRating: Number.parseFloat(averageRating),
    })
  } catch (error) {
    console.error("Error fetching employer reviews:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the reviews" },
      { status: 500 }
    )
  }
} 