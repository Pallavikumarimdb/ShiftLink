"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, Briefcase, FileText, CheckCircle, Star, Globe } from "lucide-react"
import {
  getPlatformStats,
  getUserGrowthData,
  getJobPostingsData,
  getApplicationsData,
  getJobCompletionsData,
  getRatingsData,
  getUsersByCountryData,
} from "@/lib/admin"

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [userGrowth, setUserGrowth] = useState([])
  const [jobPostings, setJobPostings] = useState([])
  const [applications, setApplications] = useState([])
  const [completions, setCompletions] = useState([])
  const [ratings, setRatings] = useState([])
  const [usersByCountry, setUsersByCountry] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Colors for charts
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

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

        setStats(platformStats)
        setUserGrowth(userGrowthData)
        setJobPostings(jobPostingsData)
        setApplications(applicationsData)
        setCompletions(completionsData)
        setRatings(ratingsData)
        setUsersByCountry(usersByCountryData)
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for pie chart
  const pieData = usersByCountry
    .slice(0, 5)
    .map((item) => ({ name: item.country, value: item.students + item.employers }))

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Title</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Monthly growth of students and employers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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

          {/* Job Postings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
              <CardDescription>Monthly job postings and completions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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

          {/* Applications Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Monthly job applications submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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

          {/* Ratings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Ratings</CardTitle>
              <CardDescription>Average monthly ratings for employers and students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
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
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users by Country Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Top 5 countries by user count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Users by Country Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users by Country (Detailed)</CardTitle>
              <CardDescription>Breakdown of users by country</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Country</th>
                      <th className="text-right py-2 px-4">Students</th>
                      <th className="text-right py-2 px-4">Employers</th>
                      <th className="text-right py-2 px-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersByCountry.map((country, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{country.country}</td>
                        <td className="text-right py-2 px-4">{country.students.toLocaleString()}</td>
                        <td className="text-right py-2 px-4">{country.employers.toLocaleString()}</td>
                        <td className="text-right py-2 px-4 font-medium">
                          {(country.students + country.employers).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
