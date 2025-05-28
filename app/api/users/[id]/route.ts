import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: userId } = await context.params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can only view their own profile unless they're an admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to view this profile" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        student: {
          select: {
            id: true,
            bio: true,
            school: true,
            major: true,
            graduationYear: true,
            skills: true,
            availability: true,
            resume: true,
            visaType: true,
            visaExpiryDate: true,
            workHoursLimit: true,
            studentIdCard: true,
            verifiedStatus: true,
          },
        },
        employer: {
          select: {
            id: true,
            companyName: true,
            industry: true,
            website: true,
            description: true,
            logo: true,
            isVerified: true,
          },
        },
        admin: {
          select: {
            id: true,
            level: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the user profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: userId } = await context.params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can only update their own profile unless they're an admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to update this profile" }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      email,
      password,
      image,
      country,
      language,
      // Student fields start.......
      bio,
      school,
      major,
      graduationYear,
      skills,
      availability,
      resume,
      // Employer fields start......
      companyName,
      industry,
      website,
      description,
      logo,
    } = body

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update base user data
      const updateData: any = {}

      if (name !== undefined) updateData.name = name
      if (email !== undefined) updateData.email = email
      if (password !== undefined) updateData.password = await hash(password, 10)
      if (image !== undefined) updateData.image = image
      if (country !== undefined) updateData.country = country
      if (language !== undefined) updateData.language = language

      const updatedUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: updateData,
        include: {
          student: true,
          employer: true,
        },
      })

      // Update role-specific profile
      if (updatedUser.role === "STUDENT" && updatedUser.student) {
        const studentUpdateData: any = {}

        if (bio !== undefined) studentUpdateData.bio = bio
        if (school !== undefined) studentUpdateData.school = school
        if (major !== undefined) studentUpdateData.major = major
        if (graduationYear !== undefined) studentUpdateData.graduationYear = Number.parseInt(graduationYear)
        if (skills !== undefined) studentUpdateData.skills = skills
        if (availability !== undefined) studentUpdateData.availability = availability
        if (resume !== undefined) studentUpdateData.resume = resume

        if (Object.keys(studentUpdateData).length > 0) {
          await tx.student.update({
            where: {
              id: updatedUser.student.id,
            },
            data: studentUpdateData,
          })
        }
      } else if (updatedUser.role === "EMPLOYER" && updatedUser.employer) {
        const employerUpdateData: any = {}

        if (companyName !== undefined) employerUpdateData.companyName = companyName
        if (industry !== undefined) employerUpdateData.industry = industry
        if (website !== undefined) employerUpdateData.website = website
        if (description !== undefined) employerUpdateData.description = description
        if (logo !== undefined) employerUpdateData.logo = logo

        if (Object.keys(employerUpdateData).length > 0) {
          await tx.employer.update({
            where: {
              id: updatedUser.employer.id,
            },
            data: employerUpdateData,
          })
        }
      }

      return updatedUser
    })

    // Remove sensitive information
    const { password: _, ...userWithoutPassword } = result

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "An error occurred while updating the user profile" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: userId } = await context.params

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Users can only delete their own account unless they're an admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You don't have permission to delete this account" }, { status: 403 })
    }

    // Delete the user (cascades to related profiles)
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user account:", error)
    return NextResponse.json({ error: "An error occurred while deleting the user account" }, { status: 500 })
  }
}
