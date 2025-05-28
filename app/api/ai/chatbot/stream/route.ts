import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { streamChatbotResponse } from "@/lib/ai/chatbot"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Parse request body
    const body = await req.json()
    const { messages, language } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or invalid messages array" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create a stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          await streamChatbotResponse(messages, language || session.user.language || "en", (chunk) => {
            controller.enqueue(encoder.encode(chunk))
          })

          controller.close()
        } catch (error) {
          console.error("Error streaming chatbot response:", error)
          controller.enqueue(encoder.encode("I'm having trouble connecting right now. Please try again later."))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error) {
    console.error("Error in chatbot stream:", error)
    return new Response(JSON.stringify({ error: "An error occurred while streaming the chatbot response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
