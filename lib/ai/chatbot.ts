import { generateText, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";


const gemini = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const DEFAULT_MODEL = "gemini-1.5-flash";

const BASE_SYSTEM_PROMPT = `
You are ShiftLink Assistant, a helpful chatbot designed to assist international students using the ShiftLink platform to find part-time jobs.

Your responsibilities:
1. Answer questions about how to use the ShiftLink platform
2. Provide guidance on job applications, interviews, and work etiquette
3. Explain visa regulations and work restrictions for international students
4. Offer advice on balancing work and studies
5. Help with resume building and job search strategies

Important guidelines:
- Be concise and friendly in your responses
- If you don't know the answer, say so and suggest contacting support
- Do not provide legal advice, but you can explain general visa information
- Respect user privacy and never ask for personal identification information
- Always be supportive and encouraging

The ShiftLink platform helps international students find part-time retail and odd jobs while studying abroad.
`;


export async function generateChatbotResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  language = "en"
) {
  try {
    const fullSystemPrompt = language !== "en"
      ? `${BASE_SYSTEM_PROMPT}\nPlease respond in ${language} language.`
      : BASE_SYSTEM_PROMPT;

    const aiMessages: Array<
      { role: "user" | "assistant" | "system"; content: string }
    > = [{ role: "system", content: fullSystemPrompt }, ...messages];

    const { text } = await generateText({
      model: gemini(DEFAULT_MODEL), 
      messages: aiMessages,
    });

    return { response: text, error: null };
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    return {
      response: null,
      error: "I'm having trouble connecting right now. Please try again later.",
    };
  }
}



export async function streamChatbotResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  language = "en",
  onChunk: (chunk: string) => void
) {
  try {
    const fullSystemPrompt = language !== "en"
      ? `${BASE_SYSTEM_PROMPT}\nPlease respond in ${language} language.`
      : BASE_SYSTEM_PROMPT;

    const aiMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      { role: "system", content: fullSystemPrompt },
      ...messages,
    ];

    const result = streamText({
      model: gemini(DEFAULT_MODEL), 
      messages: aiMessages,
      onFinish: (_res) => {
        console.log("Streaming complete.");
      },
      onError: (error) => {
        console.error("Streaming error:", error);
        onChunk("I'm having trouble connecting right now. Please try again later.");
      },
    });

    for await (const chunk of result.textStream) {
      onChunk(chunk);
    }

    return result;
  } catch (error) {
    console.error("Error streaming chatbot response:", error);
    onChunk("I'm having trouble connecting right now. Please try again later.");
    return { text: Promise.resolve("Error occurred") };
  }
}
