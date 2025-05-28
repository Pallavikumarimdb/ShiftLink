"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"

// Register a new user
export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const companyName = formData.get("companyName") as string | undefined

    if (!name || !email || !password || !role) {
      return {
        error: "Missing required fields",
      }
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return {
        error: "User with this email already exists",
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user transaction
    const result = await db.$transaction(async (tx) => {
      // Create base user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role.toUpperCase(),
        },
      })

      // Create role-specific profile
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

    return {
      success: true,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      },
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      error: "An error occurred during registration",
    }
  }
}

// Post a new job
export async function postJob(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const requirements = formData.get("requirements") as string
    const hourlyRate = Number.parseFloat(formData.get("hourlyRate") as string)
    const hoursPerWeek = Number.parseInt(formData.get("hoursPerWeek") as string)
    const shiftTimes = formData.get("shiftTimes") as string
    const employerId = formData.get("employerId") as string
    const isPremium = formData.get("isPremium") === "true"
    const country = (formData.get("country") as string) || "US"

    if (!title || !location || !description || !hourlyRate || !hoursPerWeek || !shiftTimes || !employerId) {
      return {
        error: "Missing required fields",
      }
    }

    // Create the job
    const job = await db.job.create({
      data: {
        title,
        location,
        description,
        requirements,
        hourlyRate,
        hoursPerWeek,
        shiftTimes,
        isPremium,
        employerId,
        country,
      },
    })

    revalidatePath("/employer/jobs")
    revalidatePath("/jobs")

    return {
      success: true,
      job,
    }
  } catch (error) {
    console.error("Error creating job:", error)
    return {
      error: "An error occurred while creating the job",
    }
  }
}

// Apply for a job
export async function applyForJob(formData: FormData) {
  try {
    const jobId = formData.get("jobId") as string
    const studentId = formData.get("studentId") as string
    const notes = formData.get("notes") as string

    if (!jobId || !studentId) {
      return {
        error: "Missing required fields",
      }
    }

    // Check if job exists
    const job = await db.job.findUnique({
      where: {
        id: jobId,
      },
    })

    if (!job) {
      return {
        error: "Job not found",
      }
    }

    // Check if student has already applied
    const existingApplication = await db.application.findFirst({
      where: {
        jobId,
        studentId,
      },
    })

    if (existingApplication) {
      return {
        error: "You have already applied for this job",
      }
    }

    // Create the application
    const application = await db.application.create({
      data: {
        jobId,
        studentId,
        notes,
      },
    })

    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/student/applications")

    return {
      success: true,
      application,
    }
  } catch (error) {
    console.error("Error creating application:", error)
    return {
      error: "An error occurred while applying for the job",
    }
  }
}

// Update application status
export async function updateApplicationStatus(formData: FormData) {
  try {
    const applicationId = formData.get("applicationId") as string
    const status = formData.get("status") as string

    if (!applicationId || !status) {
      return {
        error: "Missing required fields",
      }
    }

    // Update the application
    const application = await db.application.update({
      where: {
        id: applicationId,
      },
      data: {
        status: status.toUpperCase(),
      },
    })

    revalidatePath("/employer/jobs")
    revalidatePath("/student/applications")

    return {
      success: true,
      application,
    }
  } catch (error) {
    console.error("Error updating application:", error)
    return {
      error: "An error occurred while updating the application",
    }
  }
}

// Mark application as completed
export async function completeApplication(formData: FormData) {
  try {
    const applicationId = formData.get("applicationId") as string

    if (!applicationId) {
      return {
        error: "Missing required fields",
      }
    }

    // Update the application
    const application = await db.application.update({
      where: {
        id: applicationId,
      },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })

    revalidatePath("/employer/jobs")
    revalidatePath("/student/applications")

    return {
      success: true,
      application,
    }
  } catch (error) {
    console.error("Error completing application:", error)
    return {
      error: "An error occurred while completing the application",
    }
  }
}

// Submit a review
export async function submitReview(formData: FormData) {
  try {
    const applicationId = formData.get("applicationId") as string
    const rating = Number.parseFloat(formData.get("rating") as string)
    const comment = formData.get("comment") as string
    const type = formData.get("type") as string

    if (!applicationId || !rating || !type) {
      return {
        error: "Missing required fields",
      }
    }

    // Check if application exists and is completed
    const application = await db.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: true,
      },
    })

    if (!application) {
      return {
        error: "Application not found",
      }
    }

    if (!application.isCompleted) {
      return {
        error: "Only completed applications can be reviewed",
      }
    }

    // Check if review already exists
    const existingReview = await db.review.findUnique({
      where: {
        applicationId,
      },
    })

    if (existingReview) {
      // Update existing review
      const updateData: any = {}

      if (type === "student") {
        updateData.studentRating = rating
        updateData.studentComment = comment
        updateData.studentReviewedAt = new Date()
      } else {
        updateData.employerRating = rating
        updateData.employerComment = comment
        updateData.employerReviewedAt = new Date()
      }

      const updatedReview = await db.review.update({
        where: {
          id: existingReview.id,
        },
        data: updateData,
      })

      revalidatePath("/employer/jobs")
      revalidatePath("/student/applications")

      return {
        success: true,
        review: updatedReview,
      }
    } else {
      // Create new review
      const reviewData: any = {
        applicationId,
        studentId: application.studentId,
        employerId: application.job.employerId,
      }

      if (type === "student") {
        reviewData.studentRating = rating
        reviewData.studentComment = comment
        reviewData.studentReviewedAt = new Date()
      } else {
        reviewData.employerRating = rating
        reviewData.employerComment = comment
        reviewData.employerReviewedAt = new Date()
      }

      const newReview = await db.review.create({
        data: reviewData,
      })

      revalidatePath("/employer/jobs")
      revalidatePath("/student/applications")

      return {
        success: true,
        review: newReview,
      }
    }
  } catch (error) {
    console.error("Error submitting review:", error)
    return {
      error: "An error occurred while submitting the review",
    }
  }
}

// Submit verification request
export async function submitVerificationRequest(formData: FormData) {
  try {
    const employerId = formData.get("employerId") as string
    const businessLicense = formData.get("businessLicense") as string
    const taxId = formData.get("taxId") as string
    const verificationDocuments = formData.getAll("verificationDocuments") as string[]

    if (!employerId) {
      return {
        error: "Missing required fields",
      }
    }

    // Check if employer already has a verification request
    const existingRequest = await db.verificationRequest.findFirst({
      where: {
        employerId,
      },
    })

    if (existingRequest) {
      return {
        error: "You already have a verification request. Please wait for it to be processed.",
      }
    }

    // Create the verification request
    const request = await db.verificationRequest.create({
      data: {
        employerId,
        businessLicense,
        taxId,
        verificationDocuments: verificationDocuments || [],
      },
    })

    revalidatePath("/employer/verification")

    return {
      success: true,
      request,
    }
  } catch (error) {
    console.error("Error creating verification request:", error)
    return {
      error: "An error occurred while creating the verification request",
    }
  }
}

// Update verification request status (admin only)
export async function updateVerificationStatus(formData: FormData) {
  try {
    const requestId = formData.get("requestId") as string
    const status = formData.get("status") as string
    const adminId = formData.get("adminId") as string

    if (!requestId || !status || !adminId) {
      return {
        error: "Missing required fields",
      }
    }

    // Update the verification request in a transaction
    const result = await db.$transaction(async (tx) => {
      // Get the request
      const request = await tx.verificationRequest.findUnique({
        where: {
          id: requestId,
        },
      })

      if (!request) {
        throw new Error("Verification request not found")
      }

      // Update the request
      const updatedRequest = await tx.verificationRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: status.toUpperCase(),
          reviewedAt: new Date(),
          reviewedBy: adminId,
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

    revalidatePath("/admin/employers")

    return {
      success: true,
      request: result,
    }
  } catch (error) {
    console.error("Error updating verification request:", error)
    return {
      error: "An error occurred while updating the verification request",
    }
  }
}

// Flag an employer
export async function flagEmployer(formData: FormData) {
  try {
    const employerId = formData.get("employerId") as string
    const reason = formData.get("reason") as string

    if (!employerId || !reason) {
      return {
        error: "Missing required fields",
      }
    }

    // Update the employer
    const employer = await db.employer.update({
      where: {
        id: employerId,
      },
      data: {
        isFlagged: true,
        flagReason: reason,
      },
    })

    revalidatePath("/admin/employers")

    return {
      success: true,
      employer,
    }
  } catch (error) {
    console.error("Error flagging employer:", error)
    return {
      error: "An error occurred while flagging the employer",
    }
  }
}

// Unflag an employer (admin only)
export async function unflagEmployer(formData: FormData) {
  try {
    const employerId = formData.get("employerId") as string

    if (!employerId) {
      return {
        error: "Missing required fields",
      }
    }

    // Update the employer
    const employer = await db.employer.update({
      where: {
        id: employerId,
      },
      data: {
        isFlagged: false,
        flagReason: null,
      },
    })

    revalidatePath("/admin/employers")

    return {
      success: true,
      employer,
    }
  } catch (error) {
    console.error("Error unflagging employer:", error)
    return {
      error: "An error occurred while unflagging the employer",
    }
  }
}

// Update user language preference
export async function updateUserLanguage(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const language = formData.get("language") as string

    if (!userId || !language) {
      return {
        error: "Missing required fields",
      }
    }

    // Update user language
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        language,
      },
    })

    // Set cookie
    cookies().set("NEXT_LOCALE", language, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Redirect to refresh the page with new language
    redirect(new URL((formData.get("redirectUrl") as string) || "/").pathname)
  } catch (error) {
    console.error("Error updating user language:", error)
    return {
      error: "An error occurred while updating the user language",
    }
  }
}

// Update user country preference
export async function updateUserCountry(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const country = formData.get("country") as string

    if (!userId || !country) {
      return {
        error: "Missing required fields",
      }
    }

    // Update user country
    await db.user.update({
      where: {
        id: userId,
      },
      data: {
        country,
      },
    })

    // Set cookie
    cookies().set("NEXT_COUNTRY", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Redirect to refresh the page with new country
    redirect(new URL((formData.get("redirectUrl") as string) || "/").pathname)
  } catch (error) {
    console.error("Error updating user country:", error)
    return {
      error: "An error occurred while updating the user country",
    }
  }
}
