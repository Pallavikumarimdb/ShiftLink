"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PostJobForm } from "@/components/post-job-form"
import { toast } from "sonner"
import { use } from "react"

interface Job {
  id: string
  title: string
  location: string
  description: string
  requirements: string
  hourlyRate: number
  hoursPerWeek: number
  shiftTimes: string
  isPremium: boolean
  country: string
  employerId: string
  employerName: string
  createdAt: string
}

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const resolvedParams = use(params)

  useEffect(() => {
    if (user?.id) {
      fetchJob()
    }
  }, [user, resolvedParams.id])

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/jobs/${resolvedParams.id}`)
      if (!res.ok) {
        throw new Error("Failed to fetch job")
      }
      const data = await res.json()
      setJob(data)
    } catch (error) {
      console.error("Error fetching job:", error)
      toast.error("Failed to load job details")
      router.push("/employer/jobs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobUpdated = () => {
    toast.success("Job updated successfully!")
    router.push("/employer/jobs")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-[600px] bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Job</h1>
        <Card>
          <CardContent className="p-6">
            <PostJobForm
              onJobPosted={handleJobUpdated}
              employerId={user?.id as string}
              employerName={user?.name as string}
              initialData={job}
              isEditing={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 