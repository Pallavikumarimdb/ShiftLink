import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const studentIdParam = url.searchParams.get("studentId")
    const jobId = url.searchParams.get("jobId")
    const employerId = url.searchParams.get("employerId")
    const status = url.searchParams.get("status")
    const isCompleted = url.searchParams.get("isCompleted")

    console.log("Query params:", { studentIdParam, jobId, employerId, status, isCompleted })

    const filter: any = {}

    // STUDENT: see only own applications
    if (session.user.role === "STUDENT") {
      filter.studentId = session.user.studentId
    }

    // EMPLOYER: handle different filtering scenarios
    if (session.user.role === "EMPLOYER") {
      console.log("Processing employer request")
      // If employerId is specified and matches current user, or no employerId specified
      if (!employerId || employerId === session.user.employerId) {
        const employerJobs = await prisma.job.findMany({
          where: { employerId: session.user.employerId },
          select: { id: true },
        })
        console.log("Found employer jobs:", employerJobs)

        const jobIds = employerJobs.map((job) => job.id)
        filter.jobId = { in: jobIds }
      } else {
        console.log("Employer ID mismatch")
        return NextResponse.json([])
      }
    }

    // Additional filters if provided
    if (studentIdParam && session.user.role !== "STUDENT") {
      filter.studentId = studentIdParam
    }

    if (jobId) {
      filter.jobId = jobId
    }

    if (status) {
      filter.status = status.toUpperCase()
    }

    if (isCompleted !== null) {
      filter.isCompleted = isCompleted === "true"
    }

    console.log("Final filter:", filter)

    const applications = await prisma.application.findMany({
      where: filter,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            employerId: true,
            employer: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        review: true,
      },
      orderBy: {
        appliedAt: "desc",
      },
    })

    console.log("Found applications:", applications.length)

    const formattedApplications = applications.map((app) => {
      const baseApplication = {
        id: app.id,
        jobId: app.jobId,
        studentId: app.studentId,
        studentName: app.student.user.name,
        status: app.status.toLowerCase(),
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
        notes: app.notes,
        isCompleted: app.isCompleted,
        completedAt: app.completedAt,
        jobTitle: app.job.title, // Always include job title
      }

      // For completed applications, include review status
      if (isCompleted === "true") {
        return {
          ...baseApplication,
          hasEmployerReview: !!app.review,
        }
      }

      // For regular applications, include full job and student details
      return {
        ...baseApplication,
        job: {
          id: app.job.id,
          title: app.job.title,
          employerId: app.job.employerId,
          employerName: app.job.employer.user.name,
        },
        student: {
          id: app.student.id,
          name: app.student.user.name,
          email: app.student.user.email,
        },
        hasReview: !!app.review,
      }
    })

    return NextResponse.json(formattedApplications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching applications" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized. Only students can apply for jobs." }, { status: 401 })
    }

    const body = await req.json()
    const { jobId, notes } = body

    const studentId = session.user.studentId
    if (!studentId) {
      return NextResponse.json({ error: "Student ID not found in session." }, { status: 400 })
    }


    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        studentId: studentId,
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

  
    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: studentId,
        notes,
      },
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "An error occurred while creating the application" }, { status: 500 })
  }
}