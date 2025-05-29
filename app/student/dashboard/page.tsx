"use client"

import { CardFooter } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ReviewForm } from "@/components/review-form"
import { VerificationBadge } from "@/components/verification-badge"
import { MapPin, Clock, DollarSign, Search, Briefcase, Calendar } from "lucide-react"
import { JobRecommendations } from "@/components/ai/job-recommendations"
import { Chatbot } from "@/components/ai/chatbot"
import { useSearchParams } from "next/navigation"

interface Job {
  id: string
  title: string
  employerName: string
  employerId: string
  location: string
  description: string
  requirements?: string
  hourlyRate: number
  hoursPerWeek: number
  shiftTimes: string
  createdAt: string
  isVerified?: boolean
  isPremium?: boolean
  applicantsCount?: number
  country?: string
}

interface Application {
  id: string
  jobId: string
  studentId: string
  status: string
  appliedAt: string
  updatedAt?: string
  notes?: string
  isCompleted?: boolean
  completedAt?: string
  job: Job
  hasReview?: boolean
}

export default function StudentDashboardPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "overview")
  const [jobs, setJobs] = useState<Job[]>([])
  const [appliedJobs, setAppliedJobs] = useState<Application[]>([])
  const [completedJobs, setCompletedJobs] = useState<Application[]>([])
  const [filters, setFilters] = useState<{ location: string; minWage: number; maxHours: number; search: string }>({
    location: "",
    minWage: 10,
    maxHours: 30,
    search: "",
  })
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      const params = new URLSearchParams()
      if (filters.location) params.append("location", filters.location)
      if (filters.minWage) params.append("minWage", filters.minWage.toString())
      if (filters.maxHours) params.append("maxHours", filters.maxHours.toString())
      if (filters.search) params.append("search", filters.search)

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data: Job[] = await res.json()
        setJobs(data)
      } else {
        setJobs([])
      }
    }

    fetchJobs()

    if (user) {
      const fetchApplications = async () => {
        const res = await fetch(`/api/applications?studentId=${user?.id}`)
        if (res.ok) {
          const data: Application[] = await res.json()
          setAppliedJobs(data)
          setCompletedJobs(data.filter(app => app.isCompleted))
        } else {
          setAppliedJobs([])
          setCompletedJobs([])
        }
      }
      fetchApplications()
    }
  }, [filters, user])

  const handleFilterChange = (name: keyof typeof filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    }
  }

  const handleReviewClick = (job: Job) => {
    setSelectedJob(job)
    setIsReviewDialogOpen(true)
  }

  const handleReviewSubmitted = () => {
    setIsReviewDialogOpen(false)
    // Refresh completed jobs
    if (user) {
      const fetchApplications = async () => {
        const res = await fetch(`/api/applications?studentId=${user.id}`)
        if (res.ok) {
          const data: Application[] = await res.json()
          setCompletedJobs(data.filter(app => app.isCompleted))
        }
      }
      fetchApplications()
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {"welcome"}, {user?.name}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="jobs">{"Jobs"}</TabsTrigger>
            <TabsTrigger value="applications">{"Applications"}</TabsTrigger>
            <TabsTrigger value="recommendations">{"Recommendations"}</TabsTrigger>
          </TabsList>


          <TabsContent value="jobs" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Job Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Job title or keyword"
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        placeholder="City or area"
                        className="pl-8"
                        value={filters.location}
                        onChange={(e) => handleFilterChange("location", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minWage">Minimum Hourly Rate: ${filters.minWage}</Label>
                    <Slider
                      id="minWage"
                      min={8}
                      max={30}
                      step={1}
                      value={[filters.minWage]}
                      onValueChange={(value) => handleFilterChange("minWage", value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxHours">Maximum Hours/Week: {filters.maxHours}</Label>
                    <Slider
                      id="maxHours"
                      min={5}
                      max={40}
                      step={5}
                      value={[filters.maxHours]}
                      onValueChange={(value) => handleFilterChange("maxHours", value[0])}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            {job.isVerified && <VerificationBadge size="sm" />}
                          </div>
                          <p className="text-muted-foreground">{job.employerName}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {formatCurrency(job.hourlyRate)}/hr
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.hoursPerWeek} hours/week</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.shiftTimes}</span>
                        </div>
                        <p className="text-sm line-clamp-2 mt-2">{job.description}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button asChild className="w-full">
                        <Link href={`/jobs/${job.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
                  <p className="mt-2 text-muted-foreground">Try adjusting your filters to find more opportunities.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            {appliedJobs.length > 0 ? (
              appliedJobs.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium">{application.job.title}</h3>
                          <Badge className={getStatusBadgeColor(application.status)}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-muted-foreground">{application.job.employerName}</p>
                          {application.job.isVerified && <VerificationBadge size="sm" />}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm">
                          <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{application.job.location}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{formatCurrency(application.job.hourlyRate)}/hr</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                            <span>{application.job.hoursPerWeek} hrs/week</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <div className="text-sm text-muted-foreground">
                          Applied on {formatDate(application.appliedAt)}
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/jobs/${application.jobId}`}>View Job</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                <p className="mt-2 text-muted-foreground">Start applying to jobs to see your applications here.</p>
                <Button asChild className="mt-4">
                  <Link href="/student/dashboard?tab=jobs">Browse Jobs</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <JobRecommendations />

              <Card>
                <CardHeader>
                  <CardTitle>Ai Tools</CardTitle>
                  <CardDescription>Ai Tools Description</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Resume Builder</h3>
                    <p className="text-sm text-muted-foreground mb-4">Resume Builder Description</p>
                    <a href="/student/resume-builder" className="text-sm font-medium text-primary hover:underline">
                      Create Resume →
                    </a>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">Job Summarizer</h3>
                    <p className="text-sm text-muted-foreground mb-4">Job Summarizer Description</p>
                    <p className="text-sm text-muted-foreground">Available On Job Pages</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <ReviewForm
            applicationId={selectedJob?.id || ""}
            jobId={selectedJob?.id || ""}
            employerId={selectedJob?.employerId || ""}
            studentId={user?.id || ""}
            jobTitle={selectedJob?.title || ""}
            entityName={selectedJob?.employerName || ""}
            type="student"
            onReviewSubmitted={handleReviewSubmitted}
          />
        </DialogContent>
      </Dialog>

      <Chatbot />
    </div>
  )
}
