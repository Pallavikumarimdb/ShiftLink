import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { analyzeSentiment } from "@/lib/ai/gemini-client"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { reviewText, reviewId } = body

    // Validate required fields
    if (!reviewText) {
      return NextResponse.json({ error: "Missing required field: reviewText" }, { status: 400 })
    }

    // Analyze sentiment
    const { sentiment, error } = await analyzeSentiment(reviewText)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // If a reviewId was provided, store the sentiment analysis in the database
    if (reviewId) {
      // This would be implemented in a real application
      // await prisma.reviewAnalysis.create({
      //   data: {
      //     reviewId,
      //     sentiment: sentiment.score,
      //     analysis: JSON.stringify(sentiment),
      //   }
      // })
    }

    return NextResponse.json({ sentiment })
  } catch (error) {
    console.error("Error in sentiment analysis:", error)
    return NextResponse.json({ error: "An error occurred while analyzing sentiment" }, { status: 500 })
  }
}
