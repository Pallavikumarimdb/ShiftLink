import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST to flag a specific employer
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const employerId = params.id

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if employer exists
    const employer = await prisma.employer.findUnique({
      where: {
        id: employerId,
      },
    })

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 })
    }

    const body = await req.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({ error: "Reason for flagging is required" }, { status: 400 })
    }

    // Update the employer
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

// DELETE to unflag a specific employer (admin only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const employerId = params.id

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Only admins can unflag employers." }, { status: 401 })
    }

    // Check if employer exists
    const employer = await prisma.employer.findUnique({
      where: {
        id: employerId,
      },
    })

    if (!employer) {
      return NextResponse.json({ error: "Employer not found" }, { status: 404 })
    }

    // Update the employer
    const updatedEmployer = await prisma.employer.update({
      where: {
        id: employerId,
      },
      data: {
        isFlagged: false,
        flagReason: null,
      },
    })

    return NextResponse.json(updatedEmployer)
  } catch (error) {
    console.error("Error unflagging employer:", error)
    return NextResponse.json({ error: "An error occurred while unflagging the employer" }, { status: 500 })
  }
}
