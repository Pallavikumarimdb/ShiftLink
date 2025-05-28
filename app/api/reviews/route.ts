import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET reviews (filtered by student, employer, or application)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const studentId = url.searchParams.get("studentId")
    const employerId = url.searchParams.get("employerId")
    const applicationId = url.searchParams.get("applicationId")

    // Build filter
    const filter: any = {}

    if (studentId) {
      filter.studentId = studentId
    }

    if (employerId) {
      filter.employerId = employerId
    }

    if (applicationId) {
      filter.applicationId = applicationId
    }

    // Get reviews with related data
    const reviews = await prisma.review.findMany({
      where: filter,
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
        employer: {
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
        createdAt: "desc",
      },
    })


    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      applicationId: review.applicationId,
      jobTitle: review.application.job.title,
      studentId: review.studentId,
      studentName: review.student.user.name,
      employerId: review.employerId,
      employerName: review.employer.user.name,
      studentRating: review.studentRating,
      studentComment: review.studentComment,
      studentReviewedAt: review.studentReviewedAt,
      employerRating: review.employerRating,
      employerComment: review.employerComment,
      employerReviewedAt: review.employerReviewedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      isFlagged: review.isFlagged,
      flagReason: review.flagReason,
    }))

    return NextResponse.json(formattedReviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "An error occurred while fetching reviews" }, { status: 500 })
  }
}

// POST a new review or update an existing one
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { applicationId, rating, comment, type } = body

    // Check if application exists and is completed
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (!application.isCompleted) {
      return NextResponse.json({ error: "Only completed applications can be reviewed" }, { status: 400 })
    }

    // Check permissions
    if (
      (type === "student" && (session.user.role !== "STUDENT" || application.studentId !== session.user.studentId)) ||
      (type === "employer" &&
        (session.user.role !== "EMPLOYER" || application.job.employerId !== session.user.employerId))
    ) {
      return NextResponse.json({ error: "You don't have permission to submit this review" }, { status: 403 })
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        applicationId,
      },
    })

    if (existingReview) {
      // Update existing review
      const updateData: any = {}

      if (type === "student") {
        updateData.studentRating = Number.parseFloat(rating)
        updateData.studentComment = comment
        updateData.studentReviewedAt = new Date()
      } else {
        updateData.employerRating = Number.parseFloat(rating)
        updateData.employerComment = comment
        updateData.employerReviewedAt = new Date()
      }

      const updatedReview = await prisma.review.update({
        where: {
          id: existingReview.id,
        },
        data: updateData,
      })

      return NextResponse.json(updatedReview)
    } else {
      // Create new review
      const reviewData: any = {
        applicationId,
        studentId: application.studentId,
        employerId: application.job.employerId,
      }

      if (type === "student") {
        reviewData.studentRating = Number.parseFloat(rating)
        reviewData.studentComment = comment
        reviewData.studentReviewedAt = new Date()
      } else {
        reviewData.employerRating = Number.parseFloat(rating)
        reviewData.employerComment = comment
        reviewData.employerReviewedAt = new Date()
      }

      const newReview = await prisma.review.create({
        data: reviewData,
      })

      return NextResponse.json(newReview)
    }
  } catch (error) {
    console.error("Error creating/updating review:", error)
    return NextResponse.json({ error: "An error occurred while submitting the review" }, { status: 500 })
  }
}
