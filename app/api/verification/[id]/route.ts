import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET a specific verification request
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const requestId = params.id

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const request = await prisma.verificationRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        employer: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Verification request not found" }, { status: 404 })
    }

    // Check permissions
    if (
      session.user.role === "EMPLOYER" &&
      request.employerId !== session.user.employerId
      // session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to view this verification request" },
        { status: 403 },
      )
    }

    // Format the response
    const formattedRequest = {
      id: request.id,
      employerId: request.employerId,
      employerName: request.employer.user.name,
      employerEmail: request.employer.user.email,
      companyName: request.employer.companyName,
      status: request.status,
      submittedAt: request.submittedAt,
      reviewedAt: request.reviewedAt,
      reviewedBy: request.reviewedBy,
      businessLicense: request.businessLicense,
      taxId: request.taxId,
      verificationDocuments: request.verificationDocuments,
    }

    return NextResponse.json(formattedRequest)
  } catch (error) {
    console.error("Error fetching verification request:", error)
    return NextResponse.json({ error: "An error occurred while fetching the verification request" }, { status: 500 })
  }
}

// PATCH to update verification request status (admin only)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const requestId = params.id

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can update verification requests." },
        { status: 401 },
      )
    }

    const request = await prisma.verificationRequest.findUnique({
      where: {
        id: requestId,
      },
    })

    if (!request) {
      return NextResponse.json({ error: "Verification request not found" }, { status: 404 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !["APPROVED", "REJECTED"].includes(status.toUpperCase())) {
      return NextResponse.json({ error: "Invalid status. Must be APPROVED or REJECTED." }, { status: 400 })
    }

    // Update the verification request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the request
      const updatedRequest = await tx.verificationRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: status.toUpperCase(),
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })

      // If approved, update the employer's verification status
      if (status.toUpperCase() === "APPROVED") {
        await tx.employer.update({
          where: {
            id: request.employerId,
          },
          data: {
            isVerified: true,
          },
        })
      }

      return updatedRequest
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating verification request:", error)
    return NextResponse.json({ error: "An error occurred while updating the verification request" }, { status: 500 })
  }
}
