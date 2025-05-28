
import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      studentId?: string
      employerId?: string
      adminId?: string
      isVerified?: boolean
      country?: string
      language?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
    studentId?: string
    employerId?: string
    adminId?: string
    isVerified?: boolean
    country?: string
    language?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    studentId?: string
    employerId?: string
    adminId?: string
    isVerified?: boolean
    country?: string
    language?: string
  }
}
