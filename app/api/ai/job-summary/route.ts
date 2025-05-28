import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { summarizeJobDescription } from "@/lib/ai/gemini-client"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { jobDescription } = body

    // Validate required fields
    if (!jobDescription) {
      return NextResponse.json({ error: "Missing required field: jobDescription" }, { status: 400 })
    }

    // Summarize job description
    const { text, error } = await summarizeJobDescription(jobDescription)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error("Error in job description summarization:", error)
    return NextResponse.json({ error: "An error occurred while summarizing the job description" }, { status: 500 })
  }
}
