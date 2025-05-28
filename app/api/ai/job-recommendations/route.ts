import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateJobRecommendations } from "@/lib/ai/gemini-client"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get student profile
    const student = await prisma.student.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    // Get student's skills, availability, etc.
    const studentProfile = {
      skills: student.skills || "",
      experience: "", // This would come from a more detailed profile
      availability: student.availability || "",
      preferences: "", // This would come from a more detailed profile
    }

    // Get available jobs
    const jobs = await prisma.job.findMany({
      where: {
        isActive: true,
        country: session.user.country,
      },
      take: 20, // Limit to 20 jobs for performance
      orderBy: {
        createdAt: "desc",
      },
    })

    if (jobs.length === 0) {
      return NextResponse.json({ recommendations: "No jobs available at this time." })
    }

    // Format jobs for the AI
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || "",
      hourlyRate: job.hourlyRate,
      hoursPerWeek: job.hoursPerWeek,
    }))

    // Generate recommendations
    const { text, error } = await generateJobRecommendations(studentProfile, formattedJobs)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ recommendations: text })
  } catch (error) {
    console.error("Error generating job recommendations:", error)
    return NextResponse.json({ error: "An error occurred while generating job recommendations" }, { status: 500 })
  }
}
