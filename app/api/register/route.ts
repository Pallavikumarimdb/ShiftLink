import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, role, companyName } = body

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
        },
      })

      if (role.toUpperCase() === "STUDENT") {
        await tx.student.create({
          data: {
            userId: user.id,
          },
        })
      } else if (role.toUpperCase() === "EMPLOYER") {
        await tx.employer.create({
          data: {
            userId: user.id,
            companyName: companyName || name,
          },
        })
      }

      return user
    })

    return NextResponse.json({
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
