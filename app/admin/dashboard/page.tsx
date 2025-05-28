"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, Briefcase, FileText, CheckCircle, Star, Globe, Flag, ShieldAlert } from "lucide-react"
import {
  getPlatformStats,
  getUserGrowthData,
  getJobPostingsData,
  getApplicationsData,
  getJobCompletionsData,
  getRatingsData,
  getUsersByCountryData,
  getFlaggedEmployers,
} from "@/lib/admin"

export default function AdminDashboard() {
  // const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [userGrowth, setUserGrowth] = useState([])
  const [jobPostings, setJobPostings] = useState([])
  const [applications, setApplications] = useState([])
  const [completions, setCompletions] = useState([])
  const [ratings, setRatings] = useState([])
  const [usersByCountry, setUsersByCountry] = useState([])
  const [flaggedEmployers, setFlaggedEmployers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      try {
        // In a real app, these would be API calls
        const platformStats = getPlatformStats()
        const userGrowthData = getUserGrowthData()
        const jobPostingsData = getJobPostingsData()
        const applicationsData = getApplicationsData()
        const completionsData = getJobCompletionsData()
        const ratingsData = getRatingsData()
        const usersByCountryData = getUsersByCountryData()
        const flaggedEmployersData = getFlaggedEmployers()

        //@ts-ignore
        setStats(platformStats)
        setUserGrowth(userGrowthData)
        setJobPostings(jobPostingsData)
        setApplications(applicationsData)
        setCompletions(completionsData)
        setRatings(ratingsData)
        setUsersByCountry(usersByCountryData)
        setFlaggedEmployers(flaggedEmployersData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Title</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
          <div className="mt-8 h-80 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Title</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/employers">
                <Flag className="mr-2 h-4 w-4" />
                Flagged Employers
                {flaggedEmployers.filter((e) => e.status === "pending").length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                    {flaggedEmployers.filter((e) => e.status === "pending").length}
                  </span>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</CardTitle>
                <CardDescription>Total Users</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Briefcase className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-bold">{stats?.totalJobs.toLocaleString()}</CardTitle>
                <CardDescription>Total Jobs</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-bold">{stats?.totalApplications.toLocaleString()}</CardTitle>
                <CardDescription>Applications</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-bold">{stats?.completedJobs.toLocaleString()}</CardTitle>
                <CardDescription>Completed Jobs</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-bold">{stats?.averageRating}</CardTitle>
                <CardDescription>Avg. Rating</CardDescription>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-2xl font-bold">{stats?.activeCountries}</CardTitle>
                <CardDescription>Countries</CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <Briefcase className="mr-2 h-4 w-4" />
             Jobs
            </TabsTrigger>
            <TabsTrigger value="applications">
              <FileText className="mr-2 h-4 w-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="ratings">
              <Star className="mr-2 h-4 w-4" />
              Ratings
            </TabsTrigger>
            <TabsTrigger value="countries">
              <Globe className="mr-2 h-4 w-4" />
             Countries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Asers</CardTitle>
                <CardDescription>Monthly growth of students and employers on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="students"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        name="Students"
                      />
                      <Area
                        type="monotone"
                        dataKey="employers"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        name="Employers"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Jobs</CardTitle>
                <CardDescription>Monthly job postings and completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={jobPostings.map((item, index) => ({
                        ...item,
                        completions: completions[index]?.count || 0,
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Job Postings" fill="#3b82f6" />
                      <Bar dataKey="completions" name="Completed Jobs" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Applications</CardTitle>
                <CardDescription>Monthly job applications submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={applications} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" name="Applications" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <Card>
              <CardHeader>
                <CardTitle>Ratings</CardTitle>
                <CardDescription>Average monthly ratings for employers and students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratings} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[3, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="employers"
                        name="Employer Ratings"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="students"
                        name="Student Ratings"
                        stroke="#10b981"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="countries">
            <Card>
              <CardHeader>
                <CardTitle>Countries</CardTitle>
                <CardDescription>Users by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={usersByCountry}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="country" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" name="Students" fill="#3b82f6" />
                      <Bar dataKey="employers" name="Employers" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <ShieldAlert className="mr-2 h-5 w-5 text-destructive" />
                  Flagged Employers
                </CardTitle>
                <CardDescription>Recent employer reports that need attention</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/employers">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {flaggedEmployers.filter((e) => e.status === "pending").length > 0 ? (
                <div className="space-y-4">
                  {flaggedEmployers
                    .filter((e) => e.status === "pending")
                    .slice(0, 3)
                    .map((employer) => (
                      <div key={employer.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">{employer.employerName}</h3>
                          <p className="text-sm text-muted-foreground">{employer.reason}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(employer.reportedAt).toLocaleDateString()}
                            </span>
                            <span className="mx-2 text-xs text-muted-foreground">•</span>
                            <span className="text-xs font-medium text-destructive">
                              {employer.reportCount} report{employer.reportCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/admin/employers?id=${employer.id}`}>Review</Link>
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No pending reports</h3>
                  <p className="mt-2 text-muted-foreground">All employer reports have been addressed.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
