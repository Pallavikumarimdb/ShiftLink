import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
  params: Promise<{ id: string }>
}


export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: jobId } = await params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }


    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
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
        applications: {
          select: {
            id: true,
            studentId: true,
            status: true,
            appliedAt: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }


    const formattedJob = {
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
    }

    return NextResponse.json(formattedJob)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "An error occurred while fetching the job" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const jobId = params.id

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingJob = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (session.user.role === "EMPLOYER" && existingJob.employerId !== session.user.employerId) {
      return NextResponse.json({ error: "You can only update your own jobs" }, { status: 403 })
    }

    // Allow admins to update any job
    if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only employers or admins can update jobs" }, { status: 403 })
    }

    const body = await req.json()
    const {
      title,
      location,
      description,
      requirements,
      hourlyRate,
      hoursPerWeek,
      shiftTimes,
      isPremium,
      isActive,
      country,
    } = body


    const updatedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        title,
        location,
        description,
        requirements,
        hourlyRate: Number.parseFloat(hourlyRate),
        hoursPerWeek: Number.parseInt(hoursPerWeek),
        shiftTimes,
        isPremium: isPremium !== undefined ? isPremium : existingJob.isPremium,
        isActive: isActive !== undefined ? isActive : existingJob.isActive,
        country: country || existingJob.country,
      },
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "An error occurred while updating the job" }, { status: 500 })
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobId = params.id
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Get the job to verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Verify the user owns the job
    if (job.employer.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this job" },
        { status: 403 }
      )
    }

    await prisma.job.delete({
      where: { id: jobId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting the job" },
      { status: 500 }
    )
  }
}
