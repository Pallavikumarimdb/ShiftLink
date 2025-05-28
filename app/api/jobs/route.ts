import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"


export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    // Parse query parameters for filtering
    const search = url.searchParams.get("search") || ""
    const location = url.searchParams.get("location") || ""
    const minWage = url.searchParams.get("minWage") ? Number.parseFloat(url.searchParams.get("minWage")!) : 0
    const maxHours = url.searchParams.get("maxHours") ? Number.parseInt(url.searchParams.get("maxHours")!) : 100
    const country = url.searchParams.get("country") || undefined


    const filter: any = {
      isActive: true,
      hourlyRate: {
        gte: minWage,
      },
      hoursPerWeek: {
        lte: maxHours,
      },
    }

    if (search) {
      filter.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }


    if (location) {
      filter.location = { contains: location, mode: "insensitive" }
    }

  
    if (country) {
      filter.country = country
    }


    const jobs = await prisma.job.findMany({
      where: filter,
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
        applications: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })


    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      hourlyRate: job.hourlyRate,
      hoursPerWeek: job.hoursPerWeek,
      shiftTimes: job.shiftTimes,
      createdAt: job.createdAt,
      employerId: job.employerId,
      employerName: job.employer.user.name,
      isVerified: job.employer.isVerified,
      isPremium: job.isPremium,
      applicantsCount: job.applications.length,
      country: job.country,
    }))

    return NextResponse.json(formattedJobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "An error occurred while fetching jobs" }, { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Unauthorized. Only employers can post jobs." }, { status: 401 })
    }

    const body = await req.json()
    const { title, location, description, requirements, hourlyRate, hoursPerWeek, shiftTimes, isPremium, country } =
      body


    const job = await prisma.job.create({
      data: {
        title,
        location,
        description,
        requirements,
        hourlyRate: Number(hourlyRate), 
        hoursPerWeek: Number(hoursPerWeek), 
        shiftTimes,
        isPremium: Boolean(isPremium), 
        employerId: session.user.employerId as string, 
        country: country ?? session.user.country ?? "Unknown", 
      },
    })

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "An error occurred while creating the job" }, { status: 500 })
  }
}
