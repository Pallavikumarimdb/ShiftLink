import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// This endpoint is meant to be called by a cron job to record daily analytics
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key")

    // Verify API key (this should be a secure, environment-specific key)
    if (apiKey !== process.env.ANALYTICS_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Count new students
    const newStudents = await prisma.student.count({
      where: {
        user: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      },
    })

    // Count new employers
    const newEmployers = await prisma.employer.count({
      where: {
        user: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
        },
      },
    })

    // Count new jobs
    const newJobs = await prisma.job.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    // Count new applications
    const applications = await prisma.application.count({
      where: {
        appliedAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    // Count completed jobs
    const completedJobs = await prisma.application.count({
      where: {
        completedAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    // Get countries with activity
    const countries = await prisma.user.groupBy({
      by: ["country"],
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    })

    // Create analytics records for each country and a global record
    const analyticsRecords = []

    // Global record
    analyticsRecords.push(
      await prisma.analytics.create({
        data: {
          date: yesterday,
          newStudents,
          newEmployers,
          newJobs,
          applications,
          completedJobs,
          country: "global",
        },
      }),
    )

    // Country-specific records
    for (const country of countries) {
      // Count new students for this country
      const countryNewStudents = await prisma.student.count({
        where: {
          user: {
            createdAt: {
              gte: yesterday,
              lt: today,
            },
            country: country.country,
          },
        },
      })

      // Count new employers for this country
      const countryNewEmployers = await prisma.employer.count({
        where: {
          user: {
            createdAt: {
              gte: yesterday,
              lt: today,
            },
            country: country.country,
          },
        },
      })

      // Count new jobs for this country
      const countryNewJobs = await prisma.job.count({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today,
          },
          country: country.country,
        },
      })

      // Create country-specific record
      analyticsRecords.push(
        await prisma.analytics.create({
          data: {
            date: yesterday,
            newStudents: countryNewStudents,
            newEmployers: countryNewEmployers,
            newJobs: countryNewJobs,
            applications: 0, // We don't track applications by country yet
            completedJobs: 0, // We don't track completed jobs by country yet
            country: country.country,
          },
        }),
      )
    }

    return NextResponse.json({
      success: true,
      recordsCreated: analyticsRecords.length,
    })
  } catch (error) {
    console.error("Error recording analytics data:", error)
    return NextResponse.json({ error: "An error occurred while recording analytics data" }, { status: 500 })
  }
}
