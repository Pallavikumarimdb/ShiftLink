"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { formatDate, getStatusColor } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, DollarSign, Clock, Briefcase } from "lucide-react"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  location: string
  hourlyRate: number
  hoursPerWeek: number
  shiftTimes: string
  employerId: string
  employerName: string
  isVerified: boolean
}

interface Application {
  id: string
  jobId: string
  studentId: string
  status: string
  appliedAt: string
  updatedAt: string
  notes: string | null
  isCompleted: boolean
  completedAt: string | null
  job: Job
}

interface User {
  id: string
  name: string
  email: string
  isVerified: boolean
}

export default function StudentApplicationsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchApplications()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching applications for student:", user?.id)
      
      const res = await fetch(`/api/applications?studentId=${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "Failed to fetch applications")
      }

      const data = await res.json()
      console.log("Received applications:", data)
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data)
        throw new Error("Invalid response format from server")
      }

      setApplications(data)
    } catch (error) {
      console.error("Error fetching applications:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load applications. Please try again.")
      setApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Applications</h1>
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Applications</h1>

        {applications.length > 0 ? (
          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">{application.job.title}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{application.job.employerName}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{application.job.location}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>${application.job.hourlyRate}/hr</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{application.job.hoursPerWeek} hrs/week</span>
                        </div>
                      </div>
                      {application.notes && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-md">
                          <p className="text-sm font-medium mb-1">Your Application Note:</p>
                          <p className="text-sm">{application.notes}</p>
                        </div>
                      )}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
            <p className="mt-2 text-muted-foreground">Start applying to jobs to see your applications here.</p>
            <Button asChild className="mt-4">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
