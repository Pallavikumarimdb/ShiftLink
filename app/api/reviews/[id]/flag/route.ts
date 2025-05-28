import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"


export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const reviewId = params.id

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const review = await prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const body = await req.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({ error: "Reason for flagging is required" }, { status: 400 })
    }


    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        isFlagged: true,
        flagReason: reason,
      },
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error("Error flagging review:", error)
    return NextResponse.json({ error: "An error occurred while flagging the review" }, { status: 500 })
  }
}
