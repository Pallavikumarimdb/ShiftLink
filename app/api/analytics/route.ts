import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET analytics data (admin only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Only admins can view analytics data." }, { status: 401 })
    }

    const url = new URL(req.url)
    const period = url.searchParams.get("period") || "week"
    const country = url.searchParams.get("country") || "global"

    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "day":
        startDate.setDate(now.getDate() - 1)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "year":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7) // Default to week
    }

    // Get analytics data
    const analyticsData = await prisma.analytics.findMany({
      where: {
        date: {
          gte: startDate,
        },
        country: country === "global" ? undefined : country,
      },
      orderBy: {
        date: "asc",
      },
    })

    // Get user counts
    const studentCount = await prisma.student.count()
    const employerCount = await prisma.employer.count()
    const jobCount = await prisma.job.count()
    const applicationCount = await prisma.application.count()
    const completedJobCount = await prisma.application.count({
      where: {
        isCompleted: true,
      },
    })

    // Get country distribution
    const countryDistribution = await prisma.user.groupBy({
      by: ["country"],
      _count: {
        id: true,
      },
    })

    // Format country distribution
    const formattedCountryDistribution = countryDistribution.map((item) => ({
      country: item.country,
      count: item._count.id,
    }))

    // Get job category distribution
    const jobCategoryDistribution = await prisma.job.groupBy({
      by: ["title"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    })

    // Format job category distribution
    const formattedJobCategoryDistribution = jobCategoryDistribution.map((item) => ({
      category: item.title,
      count: item._count.id,
    }))

    // Compile response
    const response = {
      timeSeries: analyticsData,
      summary: {
        studentCount,
        employerCount,
        jobCount,
        applicationCount,
        completedJobCount,
      },
      countryDistribution: formattedCountryDistribution,
      jobCategoryDistribution: formattedJobCategoryDistribution,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return NextResponse.json({ error: "An error occurred while fetching analytics data" }, { status: 500 })
  }
}

// POST to record analytics data (internal use)
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key")

    // Verify API key (this should be a secure, environment-specific key)
    if (apiKey !== process.env.ANALYTICS_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { newStudents, newEmployers, newJobs, applications, completedJobs, country } = body

    // Create analytics record
    const analytics = await prisma.analytics.create({
      data: {
        newStudents: newStudents || 0,
        newEmployers: newEmployers || 0,
        newJobs: newJobs || 0,
        applications: applications || 0,
        completedJobs: completedJobs || 0,
        country: country || "global",
      },
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error recording analytics data:", error)
    return NextResponse.json({ error: "An error occurred while recording analytics data" }, { status: 500 })
  }
}
