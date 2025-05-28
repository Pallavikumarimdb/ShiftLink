import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateChatbotResponse } from "@/lib/ai/chatbot"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { messages, language } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing or invalid messages array" }, { status: 400 })
    }

    // Generate chatbot response
    const { response, error } = await generateChatbotResponse(messages, language || session.user.language || "en")

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error generating chatbot response:", error)
    return NextResponse.json({ error: "An error occurred while generating the chatbot response" }, { status: 500 })
  }
}
