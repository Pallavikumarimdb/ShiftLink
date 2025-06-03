import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { UserType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userType, location, country, email, mobile, interests } = body

    // Validate required fields
    if (!userType || !location || !email) {
      return NextResponse.json(
        { message: 'Missing required fields: userType, location, and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate userType
    if (!Object.values(UserType).includes(userType)) {
      return NextResponse.json(
        { message: 'Invalid user type' },
        { status: 400 }
      )
    }

    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        userType: userType as UserType,
        location,
        country,
        email,
        mobile: mobile || null,
        interests: interests || [],
      },
    })

    return NextResponse.json(
      {
        message: 'Successfully added to waitlist!',
        id: waitlistEntry.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Waitlist submission error:', error)

    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { message: 'This email is already registered for early access!' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
