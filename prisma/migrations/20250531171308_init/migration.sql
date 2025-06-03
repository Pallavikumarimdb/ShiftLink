-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('JOB_SEEKER', 'EMPLOYER');

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "location" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT,
    "interests" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_entries_email_key" ON "waitlist_entries"("email");
