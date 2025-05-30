"use client"

import { useState, useEffect } from "react"
import { ExternalLinkIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, MapPin, Clock, Calendar, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VerificationBadge } from "@/components/verification-badge"
import { StarRating } from "@/components/star-rating"
import { JobSummarizer } from "@/components/ai/job-summarizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Job {
  id: string
  title: string
  externallink?: string
  employerName: string
  employerEmail?: string
  employerPhone?: string
  isVerified?: boolean
  rating?: number
  hourlyRate: number
  location: string
  description: string
  requirements: string
  hoursPerWeek: number
  shiftTimes: string
  createdAt: string
}

interface User {
  id: string
  isPremium?: boolean
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth() as { user: User | null }
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState<boolean>(false)
  const [applicationNotes, setApplicationNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("details")
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
  const checkIfApplied = async () => {
    if (!user || !job?.id) return;

    try {
      const res = await fetch(`/api/applications/check?jobId=${job.id}&studentId=${user.id}`);
      const data = await res.json();
      if (res.ok && data.hasApplied) {
        setHasApplied(true);
      }
    } catch (err) {
      console.error("Error checking application status:", err);
    }
  };

  checkIfApplied();
}, [user, job?.id]);



  const fetchJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`)
      if (!res.ok) throw new Error("Job not found")
      const data: Job = await res.json()
      setJob(data)
      console.log("external", data.externallink)
    } catch (err) {
      setError("Job not found")
      console.error("Error fetching job:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id
      fetchJob(id)
    }
  }, [params.id])

 const handleApply = async () => {
  if (!user) {
    router.push("/login");
    return;
  }

  if (job?.externallink) {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job?.id || "",
          studentId: user.id,
          notes: "applied via external link",
        }),
      });

      const data = await res.json();
      if (!res.ok && data.error !== "Already applied") {
        throw new Error(data.error || "Failed to submit application");
      } 

    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please try again.";
      setError(errorMessage);
    } finally {
      toast.success("Application submitted successfully!");
    }
  } else {
    // Internal job logic
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job?.id || "",
          studentId: user.id,
          notes: applicationNotes,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      setIsApplyDialogOpen(false);
      setIsSuccessDialogOpen(true);
      setApplicationNotes(""); // Reset form
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }
};

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild className="mt-6">
          <Link href="/student/dashboard">Back To Dashboard</Link>
        </Button>
      </div>
    )
  }

  if (!job) return null

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button asChild variant="outline" className="mb-6">
          <Link href="/student/dashboard">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back To Jobs
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  {job.isVerified && <VerificationBadge />}
                </div>
                <div className="flex items-center gap-2">
                  <CardDescription className="text-lg">{job.employerName}</CardDescription>
                  {job.rating && <StarRating rating={job.rating} size="sm" />}
                </div>
              </div>
              <Badge className="text-lg px-3 py-1 h-auto bg-lime-500 hover:bg-lime-400">{formatCurrency(job.hourlyRate)}/hr</Badge>
            </div>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Location</div>
                      <div>{job.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Hours Per Week</div>
                      <div>{job.hoursPerWeek} Hours</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Shift Times</div>
                      <div>{job.shiftTimes}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                  {user?.isPremium ? (
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-5 w-5 text-muted-foreground"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span>
                          {job.employerEmail || `${job.employerName.toLowerCase().replace(/\s+/g, "")}@example.com`}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2 h-5 w-5 text-muted-foreground"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>
                          {job.employerPhone ||
                            "555-" +
                            Math.floor(100 + Math.random() * 900) +
                            "-" +
                            Math.floor(1000 + Math.random() * 9000)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <div className="filter blur-sm select-none pointer-events-none">
                          <p className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-5 w-5 text-muted-foreground"
                            >
                              <rect width="20" height="16" x="2" y="4" rx="2" />
                              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <span>employer@example.com</span>
                          </p>
                          <p className="flex items-center mt-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-5 w-5 text-muted-foreground"
                            >
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            <span>555-123-4567</span>
                          </p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                          <div className="text-center p-4">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-6 w-6 mx-auto mb-2 text-primary"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                              <line x1="9" x2="9.01" y1="9" y2="9" />
                              <line x1="15" x2="15.01" y1="9" y2="9" />
                            </svg>
                            <p className="text-sm font-medium mb-2">Contact Information Blurred</p>
                            <Button asChild size="sm" variant="outline">
                              <Link href="/student/profile?tab=premium">Upgrade To Premium</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Requirements</h3>
                  <p className="whitespace-pre-line">{job.requirements}</p>
                </div>

                <div className="text-sm text-muted-foreground">
                  Posted on {formatDate(job.createdAt)}
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="summary">
              <CardContent>
                <JobSummarizer initialDescription={job.description} />
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter>
            {job?.externallink ? (
              <a
                href={job.externallink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant={hasApplied ? "outline" : "default"}  className="w-full" onClick={handleApply}>
                  {hasApplied ? "Has clicked apply" : "Apply For Job"} <ExternalLinkIcon className="ml-2 h-4 w-4" />
                </Button>
              </a>
            ) : (
              <Button variant={hasApplied ? "outline" : "default"}  className="w-full" onClick={() => setIsApplyDialogOpen(true)}>
                {hasApplied ? "Already Applied" : "Apply For Job"}
              </Button>
            )}
          </CardFooter>

        </Card>

        {/* Apply Dialog */}
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply For {job.title}</DialogTitle>
              <DialogDescription>
                Submit your application to {job.employerName} for this position.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Why are you interested in this position?</h4>
                <Textarea
                  placeholder="Tell the employer why you're interested in this job and what makes you a good fit..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Application Submitted Successfully!
              </DialogTitle>
              <DialogDescription>
                Your application for {job.title} has been submitted to {job.employerName}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>The employer will review your application and get back to you soon.</p>
              <p className="mt-2">You can check the status of your application in your dashboard.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => router.push("/student/dashboard?tab=applications")}>
                View My Applications
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}