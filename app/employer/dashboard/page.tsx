"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PostJobForm } from "@/components/post-job-form"
import { ReviewForm } from "@/components/review-form"
import { VerificationBadge } from "@/components/verification-badge"
import { MapPin, Clock, Calendar, MoreVertical, Plus, Briefcase, Users, CheckCircle, XCircle, Star } from "lucide-react"
import { useSession } from "next-auth/react"

interface Job {
  id: string
  title: string
  hourlyRate: number
  location: string
  hoursPerWeek: number
  shiftTimes: string
  createdAt: string
}

type ApplicationStatus = "pending" | "approved" | "rejected"

interface Application {
  id: string
  jobId: string
  studentId: string
  studentName?: string
  status: ApplicationStatus
  appliedAt: string
  notes?: string
  isCompleted?: boolean
  completedAt?: string
}

interface RecentApplication extends Application {
  jobTitle?: string
}

interface CompletedApplication extends Application {
  jobTitle?: string
  hasEmployerReview?: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isVerified: boolean
  employerId?: string
  studentId?: string
  adminId?: string
  country?: string
  language?: string
  image?: string | null
}

export default function EmployerDashboard() {
  const { data: session } = useSession()
  const user = session?.user as User
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [completedApplications, setCompletedApplications] = useState<CompletedApplication[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | RecentApplication | CompletedApplication | null>(null)
  const [isPostJobDialogOpen, setIsPostJobDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isViewApplicantsDialogOpen, setIsViewApplicantsDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    if (session?.user?.employerId) {
      fetchJobs()
      fetchCompletedApplications()
      fetchRecentApplications()
    }
  }, [session])

  const fetchJobs = async () => {
    if (!session?.user?.employerId) return
    const res = await fetch(`/api/jobs?employerId=${session.user.employerId}`)
    if (res.ok) {
      const data: Job[] = await res.json()
      setJobs(data)
    }
  }

  const fetchCompletedApplications = async () => {
    if (!session?.user?.employerId) return

    const res = await fetch(`/api/applications?isCompleted=true&employerId=${session.user.employerId}`)
    if (res.ok) {
      const data: CompletedApplication[] = await res.json()

      setCompletedApplications(data)
    } else {
      console.error("Failed to fetch completed applications:", await res.text())
    }
  }

  const fetchRecentApplications = async () => {
    if (!session?.user?.employerId) return

    const res = await fetch(`/api/applications?employerId=${session.user.employerId}`)
    if (res.ok) {
      const data: RecentApplication[] = await res.json()

      setRecentApplications(data)
    } else {
      console.error("Failed to fetch recent applications:", await res.text())
    }
  }

  const fetchApplications = async (jobId: string) => {
    const res = await fetch(`/api/applications?jobId=${jobId}`)
    if (res.ok) {
      const data: Application[] = await res.json()
      setApplications(data)

    }
  }

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job)
    fetchApplications(job.id)
    setIsViewApplicantsDialogOpen(true)
  }

  const handleUpdateApplicationStatus = async (applicationId: string, status: ApplicationStatus) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        throw new Error("Failed to update application status")
      }

      // Update both applications and recentApplications state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: status as ApplicationStatus }
            : app
        )
      )
      
      setRecentApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: status as ApplicationStatus }
            : app
        )
      )
    } catch (error) {
      console.error("Error updating application status:", error)
      // show an error toast here
    }
  }

  const handleCompleteApplication = async (application: Application | RecentApplication) => {
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      })

      if (!res.ok) {
        throw new Error("Failed to complete application")
      }

      setSelectedApplication(application)
      setIsReviewDialogOpen(true)
      
      // Update both applications and recentApplications state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === application.id ? { ...app, isCompleted: true } : app
        )
      )
      
      setRecentApplications((prev) =>
        prev.filter((app) => app.id !== application.id)
      )
      
      // Refresh completed applications
      if (session?.user?.id) {
        fetchCompletedApplications()
      }
    } catch (error) {
      console.error("Error completing application:", error)
      //  Implement an error toast here
    }
  }

  const handleJobPosted = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev])
    setIsPostJobDialogOpen(false)
  }

  const handleReviewSubmitted = () => {
    setIsReviewDialogOpen(false)
    if (session?.user?.id) {
      fetchCompletedApplications()
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "Employer"}</h1>
          {user?.isVerified && <VerificationBadge />}
        </div>
        <div className="flex gap-2">
          {!user?.isVerified && (
            <Button asChild variant="outline">
              <Link href="/employer/verification">Get Verified</Link>
            </Button>
          )}
          <Button onClick={() => setIsPostJobDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Post a Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applicants">Recent Applicants</TabsTrigger>
          <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          {jobs.length > 0 ? (
            jobs.map((job: Job) => (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{job.title}</h3>
                        <Badge variant="outline">{formatCurrency(job.hourlyRate)}/hr</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{job.hoursPerWeek} hrs/week</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{job.shiftTimes}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">Posted on {formatDate(job.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewApplicants(job)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Applicants
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/employer/jobs/${job.id}/edit`}>Edit Job</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete Job</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No jobs posted yet</h3>
              <p className="mt-2 text-muted-foreground">Post your first job to start receiving applications.</p>
              <Button className="mt-4" onClick={() => setIsPostJobDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Post a Job
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="applicants" className="space-y-6">
          {recentApplications.length > 0 ? (
            recentApplications.map(application => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {application.studentName ? application.studentName.charAt(0) : "S"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{application.studentName || "Student Applicant"}</h4>
                        <p className="text-sm font-medium text-blue-600">{application.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          Applied on {formatDate(application.appliedAt)}
                        </p>
                        <Badge className={`mt-2 ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        {application.notes && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-1">Applicant Note:</h5>
                            <p className="text-sm">{application.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {application.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => handleUpdateApplicationStatus(application.id, "approved")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {application.status === "approved" && !application.isCompleted && (
                        <Button size="sm" variant="outline" onClick={() => handleCompleteApplication(application)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No recent applications</h3>
              <p className="mt-2 text-muted-foreground">When students apply to your jobs, they will appear here.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedApplications.length > 0 ? (
            completedApplications.map((application: CompletedApplication) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{application.jobTitle || "Job"}</h3>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Completed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Completed on {application.completedAt ? formatDate(application.completedAt) : "N/A"}
                      </p>
                      <p className="text-sm">Student: {application.studentName || "Student"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application)
                          setIsReviewDialogOpen(true)
                        }}
                      >
                        <Star className="mr-2 h-4 w-4" />
                        {application.hasEmployerReview ? "Edit Review" : "Leave Review"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No completed jobs yet</h3>
              <p className="mt-2 text-muted-foreground">
                When you mark a job as completed, it will appear here for you to review.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Job Dialog */}
      <Dialog open={isPostJobDialogOpen} onOpenChange={setIsPostJobDialogOpen}>
        <DialogContent className="max-w-[900px] max-h-[700px] overflow-y-auto grid-bg-2">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>Fill out the form below to create a new job listing.</DialogDescription>
          </DialogHeader>
          {session?.user?.id && session?.user?.name && (
            <PostJobForm
              onJobPosted={handleJobPosted}
              employerId={session.user.id}
              employerName={session.user.name}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Applicants Dialog */}
      <Dialog open={isViewApplicantsDialogOpen} onOpenChange={setIsViewApplicantsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Applicants for {selectedJob?.title}</DialogTitle>
            <DialogDescription>Review and manage applications for this position.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {applications.length > 0 ? (
              <div className="space-y-6">
                {applications.map((application: Application) => (
                  <div key={application.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {application.studentName ? application.studentName.charAt(0) : "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{application.studentName || "Student Applicant"}</h4>
                          <p className="text-sm text-muted-foreground">
                            Applied on {formatDate(application.appliedAt)}
                          </p>
                          <Badge className={`mt-2 ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                          {application.notes && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium mb-1">Applicant Note:</h5>
                              <p className="text-sm">{application.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {application.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600"
                              onClick={() => handleUpdateApplicationStatus(application.id, "approved")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === "approved" && !application.isCompleted && (
                          <Button size="sm" variant="outline" onClick={() => handleCompleteApplication(application)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No applicants yet</h3>
                <p className="mt-2 text-muted-foreground">When students apply for this job, they will appear here.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedApplication && session?.user?.id && (
            <ReviewForm
              applicationId={selectedApplication.id}
              jobId={selectedApplication.jobId}
              employerId={session.user.id}
              studentId={selectedApplication.studentId}
              jobTitle={selectedJob?.title || ""}
              entityName={selectedApplication.studentName || "Student"}
              type="employer"
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}