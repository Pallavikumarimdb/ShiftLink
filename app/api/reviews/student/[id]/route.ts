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
    const { id: studentId } = await context.params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the student's user ID
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Users can only view their own reviews unless they're an admin
    if (session.user.id !== student.userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to view these reviews" }, { status: 403 })
    }

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

    // Calculate average rating
    const validReviews = reviews.filter((review) => review.employerRating !== null)
    const averageRating = validReviews.length > 0
      ? (validReviews.reduce((acc, review) => acc + (review.employerRating || 0), 0) / validReviews.length).toFixed(1)
      : "0.0"

    return NextResponse.json({
      reviews,
      averageRating: Number.parseFloat(averageRating),
    })
  } catch (error) {
    console.error("Error fetching student reviews:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the reviews" },
      { status: 500 }
    )
  }
} 