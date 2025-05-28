import { db } from "@/lib/db"

// Get jobs with filtering
export async function getJobs(filters: any = {}) {
  const { search, location, minWage = 0, maxHours = 100, country, page = 1, limit = 10 } = filters

  // Build filter object
  const filter: any = {
    isActive: true,
    hourlyRate: {
      gte: Number(minWage),
    },
    hoursPerWeek: {
      lte: Number(maxHours),
    },
  }

  // Add text search conditions
  if (search) {
    filter.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  // Add location filter
  if (location) {
    filter.location = { contains: location, mode: "insensitive" }
  }

  // Add country filter
  if (country) {
    filter.country = country
  }

  // Calculate pagination
  const skip = (page - 1) * limit

  // Get jobs with employer info
  const jobs = await db.job.findMany({
    where: filter,
    include: {
      employer: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      applications: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: Number(limit),
  })

  // Get total count for pagination
  const totalCount = await db.job.count({
    where: filter,
  })

  // Format the response
  const formattedJobs = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    hourlyRate: job.hourlyRate,
    hoursPerWeek: job.hoursPerWeek,
    shiftTimes: job.shiftTimes,
    createdAt: job.createdAt,
    employerId: job.employerId,
    employerName: job.employer.user.name,
    isVerified: job.employer.isVerified,
    isPremium: job.isPremium,
    applicantsCount: job.applications.length,
    country: job.country,
  }))

  return {
    jobs: formattedJobs,
    pagination: {
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      page,
      limit,
    },
  }
}

// Get job by ID
export async function getJobById(id: string) {
  const job = await db.job.findUnique({
    where: {
      id,
    },
    include: {
      employer: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      applications: {
        select: {
          id: true,
          studentId: true,
          status: true,
          appliedAt: true,
        },
      },
    },
  })

  if (!job) {
    return null
  }

  // Format the response
  return {
    id: job.id,
    title: job.title,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    hourlyRate: job.hourlyRate,
    hoursPerWeek: job.hoursPerWeek,
    shiftTimes: job.shiftTimes,
    createdAt: job.createdAt,
    employerId: job.employerId,
    employerName: job.employer.user.name,
    isVerified: job.employer.isVerified,
    isPremium: job.isPremium,
    applicantsCount: job.applications.length,
    country: job.country,
  }
}

// Get applications for a student
export async function getStudentApplications(studentId: string) {
  const applications = await db.application.findMany({
    where: {
      studentId,
    },
    include: {
      job: {
        include: {
          employer: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      review: true,
    },
    orderBy: {
      appliedAt: "desc",
    },
  })

  // Format the response
  return applications.map((app) => ({
    id: app.id,
    jobId: app.jobId,
    studentId: app.studentId,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    notes: app.notes,
    isCompleted: app.isCompleted,
    completedAt: app.completedAt,
    job: {
      id: app.job.id,
      title: app.job.title,
      location: app.job.location,
      hourlyRate: app.job.hourlyRate,
      hoursPerWeek: app.job.hoursPerWeek,
      shiftTimes: app.job.shiftTimes,
      employerId: app.job.employerId,
      employerName: app.job.employer.user.name,
      isVerified: app.job.employer.isVerified,
    },
    hasReview: !!app.review,
  }))
}

// Get applications for an employer's jobs
export async function getEmployerApplications(employerId: string) {
  const employerJobs = await db.job.findMany({
    where: {
      employerId,
    },
    select: {
      id: true,
    },
  })

  const jobIds = employerJobs.map((job) => job.id)

  const applications = await db.application.findMany({
    where: {
      jobId: { in: jobIds },
    },
    include: {
      job: true,
      student: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      review: true,
    },
    orderBy: {
      appliedAt: "desc",
    },
  })

  // Format the response
  return applications.map((app) => ({
    id: app.id,
    jobId: app.jobId,
    studentId: app.studentId,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt,
    notes: app.notes,
    isCompleted: app.isCompleted,
    completedAt: app.completedAt,
    job: {
      id: app.job.id,
      title: app.job.title,
    },
    student: {
      id: app.student.id,
      name: app.student.user.name,
      email: app.student.user.email,
    },
    hasReview: !!app.review,
  }))
}

// Get employer jobs
export async function getEmployerJobs(employerId: string) {
  const jobs = await db.job.findMany({
    where: {
      employerId,
    },
    include: {
      applications: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Format the response
  return jobs.map((job) => ({
    id: job.id,
    title: job.title,
    location: job.location,
    description: job.description,
    requirements: job.requirements,
    hourlyRate: job.hourlyRate,
    hoursPerWeek: job.hoursPerWeek,
    shiftTimes: job.shiftTimes,
    createdAt: job.createdAt,
    isPremium: job.isPremium,
    isActive: job.isActive,
    applicantsCount: job.applications.length,
    pendingApplications: job.applications.filter((app) => app.status === "PENDING").length,
    approvedApplications: job.applications.filter((app) => app.status === "APPROVED").length,
    country: job.country,
  }))
}

// Get reviews for a student
export async function getStudentReviews(studentId: string) {
  const reviews = await db.review.findMany({
    where: {
      studentId,
      employerRating: { not: null },
    },
    include: {
      application: {
        include: {
          job: {
            select: {
              title: true,
            },
          },
        },
      },
      employer: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      employerReviewedAt: "desc",
    },
  })

  // Format the response
  return reviews.map((review) => ({
    id: review.id,
    applicationId: review.applicationId,
    jobTitle: review.application.job.title,
    employerId: review.employerId,
    employerName: review.employer.user.name,
    rating: review.employerRating,
    comment: review.employerComment,
    reviewedAt: review.employerReviewedAt,
  }))
}

// Get reviews for an employer
export async function getEmployerReviews(employerId: string) {
  const reviews = await db.review.findMany({
    where: {
      employerId,
      studentRating: { not: null },
    },
    include: {
      application: {
        include: {
          job: {
            select: {
              title: true,
            },
          },
        },
      },
      student: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      studentReviewedAt: "desc",
    },
  })

  // Format the response
  return reviews.map((review) => ({
    id: review.id,
    applicationId: review.applicationId,
    jobTitle: review.application.job.title,
    studentId: review.studentId,
    studentName: review.student.user.name,
    rating: review.studentRating,
    comment: review.studentComment,
    reviewedAt: review.studentReviewedAt,
  }))
}

// Calculate average rating for a student
export async function getStudentAverageRating(studentId: string) {
  const reviews = await db.review.findMany({
    where: {
      studentId,
      employerRating: { not: null },
    },
    select: {
      employerRating: true,
    },
  })

  if (reviews.length === 0) {
    return 0
  }

  const sum = reviews.reduce((total, review) => total + (review.employerRating || 0), 0)
  return Number((sum / reviews.length).toFixed(1))
}

// Calculate average rating for an employer
export async function getEmployerAverageRating(employerId: string) {
  const reviews = await db.review.findMany({
    where: {
      employerId,
      studentRating: { not: null },
    },
    select: {
      studentRating: true,
    },
  })

  if (reviews.length === 0) {
    return 0
  }

  const sum = reviews.reduce((total, review) => total + (review.studentRating || 0), 0)
  return Number((sum / reviews.length).toFixed(1))
}

// Get verification request for an employer
export async function getEmployerVerificationRequest(employerId: string) {
  const request = await db.verificationRequest.findFirst({
    where: {
      employerId,
    },
  })

  return request
}

// Get flagged employers for admin
export async function getFlaggedEmployers() {
  const employers = await db.employer.findMany({
    where: {
      isFlagged: true,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          createdAt: true,
        },
      },
      jobs: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      user: {
        createdAt: "desc",
      },
    },
  })

  // Format the response
  return employers.map((employer) => ({
    id: employer.id,
    userId: employer.userId,
    name: employer.user.name,
    email: employer.user.email,
    companyName: employer.companyName,
    industry: employer.industry,
    website: employer.website,
    description: employer.description,
    logo: employer.logo,
    isVerified: employer.isVerified,
    isFlagged: employer.isFlagged,
    flagReason: employer.flagReason,
    createdAt: employer.user.createdAt,
    jobCount: employer.jobs.length,
  }))
}

// Get pending verification requests for admin
export async function getPendingVerificationRequests() {
  const requests = await db.verificationRequest.findMany({
    where: {
      status: "PENDING",
    },
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
  return requests.map((request) => ({
    id: request.id,
    employerId: request.employerId,
    employerName: request.employer.user.name,
    employerEmail: request.employer.user.email,
    companyName: request.employer.companyName,
    status: request.status,
    submittedAt: request.submittedAt,
    businessLicense: request.businessLicense,
    taxId: request.taxId,
    verificationDocuments: request.verificationDocuments,
  }))
}

// Get analytics data for admin
export async function getAnalyticsData(period = "week", country = "global") {
  // Calculate date range based on period
  const now = new Date()
  const startDate = new Date()

  switch (period) {
    case "day":
      startDate.setDate(now.getDate() - 1)
      break
    case "week":
      startDate.setDate(now.getDate() - 7)
      break
    case "month":
      startDate.setMonth(now.getMonth() - 1)
      break
    case "year":
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setDate(now.getDate() - 7) // Default to week
  }

  // Get analytics data
  const analyticsData = await db.analytics.findMany({
    where: {
      date: {
        gte: startDate,
      },
      country: country === "global" ? undefined : country,
    },
    orderBy: {
      date: "asc",
    },
  })

  // Get user counts
  const studentCount = await db.student.count()
  const employerCount = await db.employer.count()
  const jobCount = await db.job.count()
  const applicationCount = await db.application.count()
  const completedJobCount = await db.application.count({
    where: {
      isCompleted: true,
    },
  })

  // Get country distribution
  const countryDistribution = await db.user.groupBy({
    by: ["country"],
    _count: {
      id: true,
    },
  })

  // Format country distribution
  const formattedCountryDistribution = countryDistribution.map((item) => ({
    country: item.country,
    count: item._count.id,
  }))

  // Get job category distribution
  const jobCategoryDistribution = await db.job.groupBy({
    by: ["title"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  })

  // Format job category distribution
  const formattedJobCategoryDistribution = jobCategoryDistribution.map((item) => ({
    category: item.title,
    count: item._count.id,
  }))

  // Compile response
  return {
    timeSeries: analyticsData,
    summary: {
      studentCount,
      employerCount,
      jobCount,
      applicationCount,
      completedJobCount,
    },
    countryDistribution: formattedCountryDistribution,
    jobCategoryDistribution: formattedJobCategoryDistribution,
  }
}
