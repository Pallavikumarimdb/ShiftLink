import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create admin user
  const adminPassword = await hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "admin@shiftlink.com" },
    update: {},
    create: {
      email: "admin@shiftlink.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      admin: {
        create: {
          level: 1,
        },
      },
    },
  })
  console.log(`Created admin user: ${admin.email}`)

  // Create student users
  const studentPassword = await hash("student123", 10)
  const student1 = await prisma.user.upsert({
    where: { email: "john@student.com" },
    update: {},
    create: {
      email: "john@student.com",
      name: "John Smith",
      password: studentPassword,
      role: "STUDENT",
      student: {
        create: {
          bio: "Computer Science student looking for part-time work",
          school: "University of Technology",
          major: "Computer Science",
          graduationYear: 2025,
          skills: "Programming, Web Development, Customer Service",
          availability: "Evenings and weekends",
        },
      },
    },
  })
  console.log(`Created student user: ${student1.email}`)

  const student2 = await prisma.user.upsert({
    where: { email: "emma@student.com" },
    update: {},
    create: {
      email: "emma@student.com",
      name: "Emma Johnson",
      password: studentPassword,
      role: "STUDENT",
      student: {
        create: {
          bio: "Business student with retail experience",
          school: "Business Academy",
          major: "Business Administration",
          graduationYear: 2024,
          skills: "Customer Service, Sales, Microsoft Office",
          availability: "Weekdays 2pm-8pm",
        },
      },
    },
  })
  console.log(`Created student user: ${student2.email}`)

  // Create employer users
  const employerPassword = await hash("employer123", 10)
  const employer1 = await prisma.user.upsert({
    where: { email: "coffee@employer.com" },
    update: {},
    create: {
      email: "coffee@employer.com",
      name: "Coffee House Manager",
      password: employerPassword,
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Coffee House",
          industry: "Food & Beverage",
          website: "https://coffeehouse.example.com",
          description: "Local coffee shop with multiple locations",
          isVerified: true,
        },
      },
    },
  })
  console.log(`Created employer user: ${employer1.email}`)

  const employer2 = await prisma.user.upsert({
    where: { email: "fashion@employer.com" },
    update: {},
    create: {
      email: "fashion@employer.com",
      name: "Fashion Outlet Manager",
      password: employerPassword,
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Fashion Outlet",
          industry: "Retail",
          website: "https://fashionoutlet.example.com",
          description: "Clothing retailer with locations in major shopping centers",
          isVerified: true,
        },
      },
    },
  })
  console.log(`Created employer user: ${employer2.email}`)

  const employer3 = await prisma.user.upsert({
    where: { email: "restaurant@employer.com" },
    update: {},
    create: {
      email: "restaurant@employer.com",
      name: "Italian Bistro Manager",
      password: employerPassword,
      role: "EMPLOYER",
      employer: {
        create: {
          companyName: "Italian Bistro",
          industry: "Food & Beverage",
          website: "https://italianbistro.example.com",
          description: "Authentic Italian restaurant in the city center",
          isVerified: false,
        },
      },
    },
  })
  console.log(`Created employer user: ${employer3.email}`)

  // Create verification request
  const verificationRequest = await prisma.verificationRequest.upsert({
    where: { employerId: (await prisma.employer.findUnique({ where: { userId: employer3.id } }))!.id },
    update: {},
    create: {
      employerId: (await prisma.employer.findUnique({ where: { userId: employer3.id } }))!.id,
      status: "PENDING",
      businessLicense: "BL12345678",
      taxId: "TX987654321",
      verificationDocuments: ["business_license.pdf", "tax_id.pdf"],
    },
  })
  console.log(`Created verification request for: ${employer3.email}`)

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      title: "Barista",
      location: "Downtown",
      description:
        "Looking for a friendly barista to work weekends. Experience preferred but not required. Training provided.",
      requirements: "Good communication skills, ability to work in a fast-paced environment",
      hourlyRate: 15,
      hoursPerWeek: 15,
      shiftTimes: "Weekends 8am-4pm",
      employerId: (await prisma.employer.findUnique({ where: { userId: employer1.id } }))!.id,
    },
  })
  console.log(`Created job: ${job1.title}`)

  const job2 = await prisma.job.create({
    data: {
      title: "Retail Assistant",
      location: "Shopping Mall",
      description:
        "Part-time retail assistant needed for busy clothing store. Responsibilities include customer service, stock management, and sales.",
      requirements: "Previous retail experience preferred, fashion knowledge a plus",
      hourlyRate: 14,
      hoursPerWeek: 20,
      shiftTimes: "Evenings and weekends",
      employerId: (await prisma.employer.findUnique({ where: { userId: employer2.id } }))!.id,
    },
  })
  console.log(`Created job: ${job2.title}`)

  const job3 = await prisma.job.create({
    data: {
      title: "Restaurant Server",
      location: "City Center",
      description: "Server needed for busy Italian restaurant. Must be able to work evenings and weekends.",
      requirements: "Previous serving experience, knowledge of Italian cuisine a plus",
      hourlyRate: 12,
      hoursPerWeek: 25,
      shiftTimes: "Tue-Sat 5pm-11pm",
      employerId: (await prisma.employer.findUnique({ where: { userId: employer3.id } }))!.id,
    },
  })
  console.log(`Created job: ${job3.title}`)

  // Create applications
  const application1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      studentId: (await prisma.student.findUnique({ where: { userId: student1.id } }))!.id,
      status: "PENDING",
      notes: "I have previous experience as a barista and am available all weekends.",
    },
  })
  console.log(`Created application for job: ${job1.title}`)

  const application2 = await prisma.application.create({
    data: {
      jobId: job3.id,
      studentId: (await prisma.student.findUnique({ where: { userId: student1.id } }))!.id,
      status: "APPROVED",
      notes: "I worked as a server for 1 year and have flexible availability.",
      isCompleted: true,
      completedAt: new Date(),
    },
  })
  console.log(`Created application for job: ${job3.title}`)

  const application3 = await prisma.application.create({
    data: {
      jobId: job2.id,
      studentId: (await prisma.student.findUnique({ where: { userId: student2.id } }))!.id,
      status: "PENDING",
      notes: "I have retail experience and am available for the listed hours.",
    },
  })
  console.log(`Created application for job: ${job2.title}`)

  // Create reviews
  const review1 = await prisma.review.create({
    data: {
      applicationId: application2.id,
      studentId: (await prisma.student.findUnique({ where: { userId: student1.id } }))!.id,
      employerId: (await prisma.employer.findUnique({ where: { userId: employer3.id } }))!.id,
      studentRating: 5,
      studentComment: "Great place to work! The team was very supportive and the schedule was flexible.",
      studentReviewedAt: new Date(),
      employerRating: 4.5,
      employerComment: "John was a great server. Very punctual and professional. Customers loved him.",
      employerReviewedAt: new Date(),
    },
  })
  console.log(`Created review for completed job`)

  // Create analytics data
  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    await prisma.analytics.create({
      data: {
        date,
        newStudents: Math.floor(Math.random() * 10),
        newEmployers: Math.floor(Math.random() * 5),
        newJobs: Math.floor(Math.random() * 15),
        applications: Math.floor(Math.random() * 25),
        completedJobs: Math.floor(Math.random() * 8),
      },
    })
  }
  console.log(`Created analytics data for the last 30 days`)

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
