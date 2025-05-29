import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateText } from "ai"


const geminiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const DEFAULT_MODEL = "gemini-1.5-flash"


export async function generateGeminiText(prompt: string, systemPrompt?: string) {
  try {
    const { text } = await generateText({
      model: geminiClient(DEFAULT_MODEL),
      prompt,
      system: systemPrompt,
    })

    return { text, error: null }
  } catch (error) {
    console.error("Error generating text with Gemini:", error)
    return {
      text: null,
      error: "Failed to generate text. Please try again later.",
    }
  }
}


export async function generateResume(userData: {
  name: string
  education: string
  experience: string
  skills: string
  languages: string
  additionalInfo?: string
}) {
  const systemPrompt = `
    You are a professional resume writer for international students seeking part-time work.
    Create a concise, well-structured resume that highlights relevant skills and experience.
    Format the resume in a clean, professional way that's appropriate for part-time job applications.
    Focus on transferable skills and relevant experience.
    Keep the resume to one page in length.
  `

  const prompt = `
    Please create a professional resume for ${userData.name} based on the following information:
    
    Education: ${userData.education}
    
    Experience: ${userData.experience}
    
    Skills: ${userData.skills}
    
    Languages: ${userData.languages}
    
    ${userData.additionalInfo ? `Additional Information: ${userData.additionalInfo}` : ""}
    
    Format the resume in a clean, professional structure with clear sections.
  `

  return generateGeminiText(prompt, systemPrompt)
}


export async function summarizeJobDescription(jobDescription: string) {
  const systemPrompt = `
    You are an expert at summarizing job descriptions for busy students.
    Create a concise, bullet-point summary of the key aspects of the job.
    Focus on responsibilities, requirements, benefits, and any special notes.
    Keep the summary brief but comprehensive.
  `

  const prompt = `
    Please summarize the following job description into a concise, easy-to-scan format with bullet points:
    
    ${jobDescription}
    
    Include sections for:
    - Key Responsibilities
    - Requirements
    - Benefits/Perks
    - Special Notes (if any)
  `

  return generateGeminiText(prompt, systemPrompt)
}


export async function generateJobRecommendations(
  studentProfile: {
    skills: string
    experience: string
    availability: string
    preferences: string
  },
  availableJobs: Array<{
    id: string
    title: string
    description: string
    requirements: string
    hourlyRate: number
    hoursPerWeek: number
  }>,
) {
  const systemPrompt = `
    You are an expert job matching assistant for international students.
    Analyze the student's profile and the available jobs to find the best matches.
    For each recommended job, explain why it's a good fit based on skills, experience, availability, and preferences.
    Rank the jobs from most suitable to least suitable.
    Provide 3-5 recommendations.
  `

  const jobsText = availableJobs
    .map(
      (job) => `
    Job ID: ${job.id}
    Title: ${job.title}
    Description: ${job.description}
    Requirements: ${job.requirements}
    Hourly Rate: $${job.hourlyRate}
    Hours Per Week: ${job.hoursPerWeek}
  `,
    )
    .join("\n\n")

  const prompt = `
    Please recommend the best job matches for a student with the following profile:
    
    Skills: ${studentProfile.skills}
    Experience: ${studentProfile.experience}
    Availability: ${studentProfile.availability}
    Preferences: ${studentProfile.preferences}
    
    Available Jobs:
    ${jobsText}
    
    For each recommendation, explain why it's a good match and provide a brief personalized note.
  `

  return generateGeminiText(prompt, systemPrompt)
}


export async function analyzeSentiment(reviewText: string) {
  const systemPrompt = `
    You are an expert at analyzing sentiment in text.
    Analyze the given review and determine if it's positive, negative, or neutral.
    Provide a sentiment score from -1.0 (very negative) to 1.0 (very positive).
    Also identify any specific issues or praise mentioned in the review.
  `

  const prompt = `
    Please analyze the sentiment of the following review:
    
    "${reviewText}"
    
    Provide:
    1. Overall sentiment (positive, negative, or neutral)
    2. Sentiment score from -1.0 to 1.0
    3. Key positive points mentioned (if any)
    4. Key negative points or issues mentioned (if any)
    5. Any specific actionable feedback
    
    Format your response as JSON.
  `

  const { text, error } = await generateGeminiText(prompt, systemPrompt)

  if (error) return { sentiment: null, error }

  try {
    // Parse the JSON response
    if (!text) {
      throw new Error("No text to parse for sentiment analysis.")
    }
    const sentimentData = JSON.parse(text)
    return { sentiment: sentimentData, error: null }
  } catch (e) {
    console.error("Error parsing sentiment analysis:", e)
    return {
      sentiment: null,
      error: "Failed to parse sentiment analysis. Please try again.",
    }
  }
}
