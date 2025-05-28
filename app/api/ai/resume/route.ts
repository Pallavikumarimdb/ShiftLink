import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateResume } from "@/lib/ai/gemini-client"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { name, education, experience, skills, languages, additionalInfo } = body

    // Validate required fields
    if (!name || !education || !skills) {
      return NextResponse.json(
        { error: "Missing required fields: name, education, and skills are required" },
        { status: 400 },
      )
    }

    // Generate resume
    const { text, error } = await generateResume({
      name,
      education,
      experience,
      skills,
      languages,
      additionalInfo,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ resume: text })
  } catch (error) {
    console.error("Error in resume generation:", error)
    return NextResponse.json({ error: "An error occurred while generating the resume" }, { status: 500 })
  }
}
