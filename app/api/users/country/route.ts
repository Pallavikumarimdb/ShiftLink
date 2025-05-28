import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

//  update user country preference
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { country } = body

    if (!country) {
      return NextResponse.json({ error: "Country is required" }, { status: 400 })
    }

    // Update user country
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        country,
      },
    })

    return NextResponse.json({
      success: true,
      country: updatedUser.country,
    })
  } catch (error) {
    console.error("Error updating user country:", error)
    return NextResponse.json({ error: "An error occurred while updating the user country" }, { status: 500 })
  }
}
