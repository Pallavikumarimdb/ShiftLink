import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (!auth) return NextResponse.json({ error: 'No token' }, { status: 401 })

  const token = auth.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    return NextResponse.json({ user })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}