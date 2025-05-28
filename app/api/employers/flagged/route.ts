import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET flagged employers (admin only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Only admins can view flagged employers." }, { status: 401 })
    }

    // Get flagged employers
    const employers = await prisma.employer.findMany({
      where: {
        isFlagged: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
        jobs: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
    })


    const formattedEmployers = employers.map((employer) => ({
      id: employer.id,
      userId: employer.userId,
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
      jobCount: employer.jobs.length,
    }))

    return NextResponse.json(formattedEmployers)
  } catch (error) {
    console.error("Error fetching flagged employers:", error)
    return NextResponse.json({ error: "An error occurred while fetching flagged employers" }, { status: 500 })
  }
}


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { employerId, reason } = body

    if (!employerId) {
      return NextResponse.json({ error: "Employer ID is required" }, { status: 400 })
    }

    if (!reason) {
      return NextResponse.json({ error: "Reason for flagging is required" }, { status: 400 })
    }


    const employer = await prisma.employer.findUnique({
      where: {
        id: employerId,
      },
    })

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 })
    }

    const updatedEmployer = await prisma.employer.update({
      where: {
        id: employerId,
      },
      data: {
        isFlagged: true,
        flagReason: reason,
      },
    })

    return NextResponse.json(updatedEmployer)
  } catch (error) {
    console.error("Error flagging employer:", error)
    return NextResponse.json({ error: "An error occurred while flagging the employer" }, { status: 500 })
  }
}
