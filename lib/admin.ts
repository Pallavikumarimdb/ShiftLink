// Mock data for admin analytics
export const ANALYTICS_DATA = {
  userGrowth: [
    { month: "Jan", students: 120, employers: 45 },
    { month: "Feb", students: 150, employers: 55 },
    { month: "Mar", students: 200, employers: 65 },
    { month: "Apr", students: 250, employers: 75 },
    { month: "May", students: 300, employers: 85 },
    { month: "Jun", students: 350, employers: 95 },
  ],
  jobPostings: [
    { month: "Jan", count: 80 },
    { month: "Feb", count: 100 },
    { month: "Mar", count: 130 },
    { month: "Apr", count: 150 },
    { month: "May", count: 180 },
    { month: "Jun", count: 210 },
  ],
  applications: [
    { month: "Jan", count: 320 },
    { month: "Feb", count: 380 },
    { month: "Mar", count: 450 },
    { month: "Apr", count: 520 },
    { month: "May", count: 580 },
    { month: "Jun", count: 650 },
  ],
  completions: [
    { month: "Jan", count: 65 },
    { month: "Feb", count: 85 },
    { month: "Mar", count: 110 },
    { month: "Apr", count: 130 },
    { month: "May", count: 150 },
    { month: "Jun", count: 175 },
  ],
  ratings: [
    { month: "Jan", employers: 4.2, students: 4.5 },
    { month: "Feb", employers: 4.3, students: 4.5 },
    { month: "Mar", employers: 4.4, students: 4.6 },
    { month: "Apr", employers: 4.5, students: 4.7 },
    { month: "May", employers: 4.6, students: 4.7 },
    { month: "Jun", employers: 4.7, students: 4.8 },
  ],
  usersByCountry: [
    { country: "United States", students: 450, employers: 120 },
    { country: "United Kingdom", students: 320, employers: 85 },
    { country: "Canada", students: 280, employers: 65 },
    { country: "Australia", students: 210, employers: 55 },
    { country: "Germany", students: 180, employers: 45 },
    { country: "France", students: 150, employers: 35 },
    { country: "Spain", students: 120, employers: 30 },
    { country: "Japan", students: 100, employers: 25 },
    { country: "China", students: 90, employers: 20 },
    { country: "Singapore", students: 80, employers: 15 },
  ],
  platformStats: {
    totalUsers: 2350,
    totalJobs: 850,
    totalApplications: 3200,
    completedJobs: 715,
    averageRating: 4.6,
    activeCountries: 25,
  },
}

// Get flagged employers from auth provider
import { MOCK_FLAGGED_EMPLOYERS } from "@/components/auth-provider"

export function getFlaggedEmployers() {
  return MOCK_FLAGGED_EMPLOYERS
}

export function updateFlaggedEmployerStatus(id: string, status: string) {
  const employer = MOCK_FLAGGED_EMPLOYERS.find((e) => e.id === id)
  if (employer) {
    employer.status = status
    return employer
  }
  return null
}

// Get platform statistics
export function getPlatformStats() {
  return ANALYTICS_DATA.platformStats
}

// Get user growth data
export function getUserGrowthData() {
  return ANALYTICS_DATA.userGrowth
}

// Get job postings data
export function getJobPostingsData() {
  return ANALYTICS_DATA.jobPostings
}

// Get applications data
export function getApplicationsData() {
  return ANALYTICS_DATA.applications
}

// Get job completions data
export function getJobCompletionsData() {
  return ANALYTICS_DATA.completions
}

// Get ratings data
export function getRatingsData() {
  return ANALYTICS_DATA.ratings
}

// Get users by country data
export function getUsersByCountryData() {
  return ANALYTICS_DATA.usersByCountry
}
