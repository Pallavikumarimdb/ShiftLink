import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

// Get the current session with role validation
export async function getSessionWithRole(requiredRole?: string | string[]) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    if (!roles.includes(session.user.role)) {
  
      switch (session.user.role) {
        case "STUDENT":
          redirect("/student/dashboard")
        case "EMPLOYER":
          redirect("/employer/dashboard")
        case "ADMIN":
          redirect("/admin/dashboard")
        default:
          redirect("/")
      }
    }
  }

  return session
}


export async function isAuthenticated() {
  const session = await getServerSession(authOptions)
  return !!session
}


export async function getUserRole() {
  const session = await getServerSession(authOptions)
  return session?.user.role || null
}
