import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: employerId } = await params

    if (!employerId) {
      return NextResponse.json({ error: "Employer ID is required" }, { status: 400 })
    }

    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    })

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 })
    }

    const totalJobs = await prisma.job.count({ where: { employerId } })
    const jobs = await prisma.job.findMany({ where: { employerId }, select: { id: true } })
    const jobIds = jobs.map((job) => job.id)

    let totalApplications = 0
    if (jobIds.length > 0) {
      totalApplications = await prisma.application.count({ where: { jobId: { in: jobIds } } })
    }

    const profile = {
      id: employer.id,
      name: employer.user.name,
      email: employer.user.email,
      companyName: employer.companyName,
      industry: employer.industry,
      website: employer.website,
      description: employer.description,
      logo: employer.logo,
      isVerified: employer.isVerified,
      isFlagged: employer.isFlagged,
      flagReason: employer.flagReason,
      createdAt: employer.user.createdAt,
    }

    return NextResponse.json({ profile, totalJobs, totalApplications })
  } catch (error) {
    console.error("Error fetching employer profile/stats:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching employer profile/stats" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id: employerId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!employerId) {
      return NextResponse.json({ error: "Employer ID is required" }, { status: 400 })
    }

    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      select: { userId: true },
    })

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 })
    }

    if (employer.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to update this profile" }, { status: 403 })
    }

    const formData = await req.formData()
    const updates: any = {}

    // Handle text fields
    const textFields = ["companyName", "industry", "website", "description"]
    textFields.forEach((field) => {
      const value = formData.get(field)
      if (value !== null) {
        updates[field] = value.toString()
      }
    })

    // Handle logo upload if present
    const logo = formData.get("logo") as File | null
    if (logo) {
      // In a real app, upload this to a storage service later implement this something like s3 or firebase storage
      // For now, we'll just store the filename
      updates.logo = logo.name
    }

    // Update the employer profile
    const updatedEmployer = await prisma.employer.update({
      where: { id: employerId },
      data: updates,
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
      },
    })

    // Format the response
    const profile = {
      id: updatedEmployer.id,
      name: updatedEmployer.user.name,
      email: updatedEmployer.user.email,
      companyName: updatedEmployer.companyName,
      industry: updatedEmployer.industry,
      website: updatedEmployer.website,
      description: updatedEmployer.description,
      logo: updatedEmployer.logo,
      isVerified: updatedEmployer.isVerified,
      isFlagged: updatedEmployer.isFlagged,
      flagReason: updatedEmployer.flagReason,
      createdAt: updatedEmployer.user.createdAt,
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error updating employer profile:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the employer profile" },
      { status: 500 }
    )
  }
}

export type EmployerProfileStatsResponse = {
  profile: {
    id: string
    name: string
    email: string
    companyName: string
    industry?: string | null
    website?: string | null
    description?: string | null
    logo?: string | null
    isVerified: boolean
    isFlagged: boolean
    flagReason?: string | null
    createdAt: Date
  }
  totalJobs: number
  totalApplications: number
} 