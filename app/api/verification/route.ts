import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET verification requests (admin only)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can view all verification requests." },
        { status: 401 },
      )
    }

    const url = new URL(req.url)
    const status = url.searchParams.get("status")

    // Build filter
    const filter: any = {}

    if (status) {
      filter.status = status.toUpperCase()
    }

    // Get verification requests with employer info
    const requests = await prisma.verificationRequest.findMany({
      where: filter,
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
      orderBy: {
        submittedAt: "desc",
      },
    })

    // Format the response
    const formattedRequests = requests.map((request) => ({
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
    }))

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error("Error fetching verification requests:", error)
    return NextResponse.json({ error: "An error occurred while fetching verification requests" }, { status: 500 })
  }
}

// POST a new verification request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "EMPLOYER") {
      return NextResponse.json(
        { error: "Unauthorized. Only employers can submit verification requests." },
        { status: 401 },
      )
    }

    // Check if employer already has a verification request
    const existingRequest = await prisma.verificationRequest.findFirst({
      where: {
        employerId: session.user.employerId,
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a verification request. Please wait for it to be processed." },
        { status: 400 },
      )
    }

    const body = await req.json()
    const { businessLicense, taxId, verificationDocuments } = body

    // Create the verification request
    const request = await prisma.verificationRequest.create({
      data: {
        employerId: session.user.employerId,
        businessLicense,
        taxId,
        verificationDocuments: verificationDocuments || [],
      },
    })

    return NextResponse.json(request)
  } catch (error) {
    console.error("Error creating verification request:", error)
    return NextResponse.json({ error: "An error occurred while creating the verification request" }, { status: 500 })
  }
}
