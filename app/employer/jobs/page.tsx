"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PostJobForm } from "@/components/post-job-form"
import { MapPin, Clock, Calendar, MoreVertical, Plus, Briefcase, Users, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  hourlyRate: number
  location: string
  hoursPerWeek: number
  shiftTimes: string
  createdAt: string
  employerId: string
  employerName: string
}

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

export default function EmployerJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPostJobDialogOpen, setIsPostJobDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?employerId=${user?.id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch jobs")
      }
      const data = await res.json()
      setJobs(data)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Failed to load jobs. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobPosted = (newJob: Job) => {
    setJobs((prev) => [newJob, ...prev])
    setIsPostJobDialogOpen(false)
    toast.success("Job posted successfully!")
  }

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return

    try {
      const res = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete job")
      }

      setJobs((prev) => prev.filter((job) => job.id !== jobToDelete.id))
      setIsDeleteDialogOpen(false)
      setJobToDelete(null)
      toast.success("Job deleted successfully")
    } catch (error) {
      console.error("Error deleting job:", error)
      toast.error("Failed to delete job. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Jobs</h1>
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">My Jobs</h1>
        <Button onClick={() => setIsPostJobDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Post a Job
        </Button>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-6">
          {jobs.map((job) => (
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
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/employer/jobs/${job.id}/applicants`}>
                        <Users className="mr-2 h-4 w-4" />
                        View Applicants
                      </Link>
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
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(job)}>
                          Delete Job
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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

      <Dialog open={isPostJobDialogOpen} onOpenChange={setIsPostJobDialogOpen}>
        <DialogContent className="max-w-[900px] max-h-[700px] overflow-y-auto space-y-6">
          <DialogHeader>
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>Fill out the form below to create a new job listing.</DialogDescription>
          </DialogHeader>
          {user?.id && user?.name && (
            <PostJobForm
              onJobPosted={handleJobPosted}
              employerId={user.id}
              employerName={user.name}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">
              This will permanently delete the job and remove all associated applications.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
