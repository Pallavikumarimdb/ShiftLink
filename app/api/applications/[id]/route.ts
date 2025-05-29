import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
  params: { id: string }
}


export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: applicationId } = params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: {
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
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Check permissions
    if (
      (session.user.role === "STUDENT" && application.studentId !== session.user.studentId) ||
      (session.user.role === "EMPLOYER" && application.job.employerId !== session.user.employerId)
    ) {
      return NextResponse.json({ error: "You don't have permission to view this application" }, { status: 403 })
    }

    // Format the response
    const formattedApplication = {
      id: application.id,
      jobId: application.jobId,
      studentId: application.studentId,
      status: application.status,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt,
      notes: application.notes,
      isCompleted: application.isCompleted,
      completedAt: application.completedAt,
      job: {
        id: application.job.id,
        title: application.job.title,
        location: application.job.location,
        hourlyRate: application.job.hourlyRate,
        hoursPerWeek: application.job.hoursPerWeek,
        shiftTimes: application.job.shiftTimes,
        employerId: application.job.employerId,
        employerName: application.job.employer.user.name,
        isVerified: application.job.employer.isVerified,
      },
      student: {
        id: application.student.id,
        name: application.student.user.name,
        email: application.student.user.email,
      },
      review: application.review,
    }

    return NextResponse.json(formattedApplication)
  } catch (error) {
    console.error("Error fetching application:", error)
    return NextResponse.json({ error: "An error occurred while fetching the application" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: applicationId } = params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status, isCompleted } = body

    if (status && session.user.role === "EMPLOYER") {
      if (application.job.employerId !== session.user.employerId) {
        return NextResponse.json({ error: "You can only update applications for your own jobs" }, { status: 403 })
      }
    } else if (status && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only employers or admins can update application status" }, { status: 403 })
    }

    if (isCompleted !== undefined && session.user.role === "EMPLOYER") {
      if (application.job.employerId !== session.user.employerId) {
        return NextResponse.json({ error: "You can only complete applications for your own jobs" }, { status: 403 })
      }

      if (application.status !== "APPROVED") {
        return NextResponse.json({ error: "Only approved applications can be marked as completed" }, { status: 400 })
      }
    } else if (isCompleted !== undefined && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only employers or admins can mark applications as completed" },
        { status: 403 },
      )
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status.toUpperCase()
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted
      if (isCompleted) {
        updateData.completedAt = new Date()
      } else {
        updateData.completedAt = null
      }
    }

    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: updateData,
    })

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "An error occurred while updating the application" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id: applicationId } = params


    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }


    if (
      (session.user.role === "STUDENT" && application.studentId !== session.user.studentId) ||
      (session.user.role === "EMPLOYER" && application.job.employerId !== session.user.employerId)
    ) {
      return NextResponse.json({ error: "You don't have permission to delete this application" }, { status: 403 })
    }

    await prisma.application.delete({
      where: {
        id: applicationId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "An error occurred while deleting the application" }, { status: 500 })
  }
}