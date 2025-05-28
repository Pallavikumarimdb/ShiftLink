import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Global search endpoint for jobs, employers, etc.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("q") || ""
    const type = url.searchParams.get("type") || "all"
    const limit = Number(url.searchParams.get("limit") || "10")

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results: any = {}

    // Search jobs
    if (type === "all" || type === "jobs") {
      const jobs = await prisma.job.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
          isActive: true,
        },
        include: {
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        take: limit,
      })

      results.jobs = jobs.map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location,
        hourlyRate: job.hourlyRate,
        employerName: job.employer.user.name,
        type: "job",
      }))
    }

    // Search employers
    if (type === "all" || type === "employers") {
      const employers = await prisma.employer.findMany({
        where: {
          OR: [
            { companyName: { contains: query, mode: "insensitive" } },
            { industry: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        take: limit,
      })

      results.employers = employers.map((employer) => ({
        id: employer.id,
        companyName: employer.companyName,
        industry: employer.industry,
        isVerified: employer.isVerified,
        type: "employer",
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json({ error: "An error occurred while searching" }, { status: 500 })
  }
}
