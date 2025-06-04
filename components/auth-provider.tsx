"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signIn, signOut, getSession } from "next-auth/react"

type UserRole = "student" | "employer" | "admin"
type VerificationStatus = "none" | "pending" | "approved" | "rejected"

interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  isPremium?: boolean
  isVerified?: boolean
  verificationStatus?: VerificationStatus
  rating?: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: any, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
  upgradeToPremium: () => boolean
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const user = session?.user as User | undefined
const isAuthLoading = status === "loading"
const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const pathname = usePathname()


  const isRegistering = useRef(false)
  const lastUserRef = useRef<User | null | undefined>(undefined)
  const justLoggedIn = useRef(false)

  useEffect(() => {
    if (isAuthLoading || isRegistering.current) return

    const userChanged = lastUserRef.current !== user
    const wasUndefined = lastUserRef.current === undefined
    lastUserRef.current = user

    const studentProtectedRoutes = ["/student"]
    const employerProtectedRoutes = ["/employer"]
    const adminProtectedRoutes = ["/admin"]
    const authRoutes = ["/login", "/register"]
    const publicRoutes = ["/employers", "/jobs", "/about"]

    const isStudentProtected = studentProtectedRoutes.some((route) => pathname?.startsWith(route))
    const isEmployerProtected = employerProtectedRoutes.some((route) => pathname?.startsWith(route))
    const isAdminProtected = adminProtectedRoutes.some((route) => pathname?.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route))
    const isPublicRoute = publicRoutes.some((route) => pathname?.startsWith(route))

    if (!user && (isStudentProtected || isEmployerProtected || isAdminProtected) && !isPublicRoute) {
      router.push("/login")
      return
    }

    if (user && (userChanged || justLoggedIn.current)) {
      justLoggedIn.current = false

      const userRole = user?.role?.toLowerCase()

      if (isStudentProtected && userRole !== "student") {
        router.push("/register/student?message=Please sign up or login as a student")
      } else if (isEmployerProtected && userRole !== "employer") {
        router.push("/register/employer?message=Please sign up or login as an employer")
      } else if (isAdminProtected && userRole !== "admin") {
        router.push("/login")
      } else if (isAuthRoute) {
        if (userRole === "student") {
          router.push("/student/dashboard")
        } else if (userRole === "employer") {
          router.push("/employer/dashboard")
        } else if (userRole === "admin") {
          router.push("/admin/dashboard")
        }
      }

    }
  }, [user, isAuthLoading, pathname, router])

  const login = async (email: string, password: string) => {
  setIsSubmitting(true)
  try {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (!res || res.error) {
      throw new Error(res?.error || "Login failed")
    }

    justLoggedIn.current = true

    setTimeout(async () => {
      await router.refresh()
      const updatedSession = await getSession()
      const updatedUser = updatedSession?.user as User | undefined

      if (updatedUser) {
        const userRole = updatedUser?.role?.toLowerCase()
        if (userRole === "student") router.push("/student/dashboard")
        else if (userRole === "employer") router.push("/employer/dashboard")
        else if (userRole === "admin") router.push("/admin/dashboard")
      }
    }, 800)
  } finally {
    setIsSubmitting(false)
  }
}



 const register = async (data: any, role: UserRole) => {
  setIsSubmitting(true)
  isRegistering.current = true

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, role }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message || "Registration failed")
    }

    router.push("/login?message=Registration successful, please login")
  } finally {
    setIsSubmitting(false)
    isRegistering.current = false
  }
}

  const logout = () => {
    signOut({ callbackUrl: "/" })
  }

  const upgradeToPremium = () => {
    if (user?.role === "student") {
      return true
    }
    return false
  }

  const updateUser = (userData: Partial<User>) => {
    console.warn("Use backend API to update user")
  }

  const contextValue: AuthContextType = {
    user: user || null,
    login,
    register,
    logout,
    isLoading: isSubmitting,
    upgradeToPremium,
    updateUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}