"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, XCircle, ShieldAlert, Clock, Flag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getFlaggedEmployers, updateFlaggedEmployerStatus } from "@/lib/admin"
import { formatDate } from "@/lib/utils"

export default function AdminEmployersPage() {

  const searchParams = useSearchParams()
  const [flaggedEmployers, setFlaggedEmployers] = useState([])
  const [selectedEmployer, setSelectedEmployer] = useState(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch flagged employers
    const fetchData = async () => {
      try {
        const data = getFlaggedEmployers()
        setFlaggedEmployers(data)

        // Check if there's an employer ID in the URL
        const employerId = searchParams.get("id")
        if (employerId) {
          const employer = data.find((e) => e.id === employerId)
          if (employer) {
            setSelectedEmployer(employer)
            setIsReviewDialogOpen(true)
          }
        }
      } catch (err) {
        console.error("Error fetching flagged employers:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleReviewEmployer = (employer) => {
    setSelectedEmployer(employer)
    setAdminNotes("")
    setIsReviewDialogOpen(true)
  }

  const handleUpdateStatus = async (status) => {
    setError("")
    setSuccess("")
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      updateFlaggedEmployerStatus(selectedEmployer.id, status)

      // Update local state
      setFlaggedEmployers((prev) => prev.map((e) => (e.id === selectedEmployer.id ? { ...e, status } : e)))

      setSuccess(
        `Employer ${status === "approved" ? "approved" : "rejected"} successfully. ${
          status === "rejected" ? "The employer has been notified." : ""
        }`,
      )

      // Close dialog after a delay
      setTimeout(() => {
        setIsReviewDialogOpen(false)
        setSelectedEmployer(null)
      }, 2000)
    } catch (err) {
      setError("Failed to update employer status. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Rejected</Badge>
      case "pending":
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t("admin.employers.title")}</h1>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t("admin.employers.title")}</h1>
        </div>

        <Tabs defaultValue="flagged" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="flagged">
              <Flag className="mr-2 h-4 w-4" />
              {t("admin.employers.flagged")}
              {flaggedEmployers.filter((e) => e.status === "pending").length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                  {flaggedEmployers.filter((e) => e.status === "pending").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="verification">
              <ShieldAlert className="mr-2 h-4 w-4" />
              {t("admin.employers.verification")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flagged">
            <Card>
              <CardHeader>
                <CardTitle>Flagged Employers</CardTitle>
                <CardDescription>Review and manage employers that have been reported by students</CardDescription>
              </CardHeader>
              <CardContent>
                {flaggedEmployers.length > 0 ? (
                  <div className="space-y-6">
                    {flaggedEmployers.map((employer) => (
                      <div
                        key={employer.id}
                        className="border rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{employer.employerName}</h3>
                            {getStatusBadge(employer.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{employer.reason}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            <span>Reported on {formatDate(employer.reportedAt)}</span>
                            <span className="mx-2">•</span>
                            <Flag className="mr-1 h-3 w-3" />
                            <span>
                              {employer.reportCount} report{employer.reportCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {employer.status === "pending" ? (
                            <Button onClick={() => handleReviewEmployer(employer)}>Review</Button>
                          ) : (
                            <Button variant="outline" onClick={() => handleReviewEmployer(employer)}>
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-4 text-lg font-medium">No flagged employers</h3>
                    <p className="mt-2 text-muted-foreground">
                      There are currently no employers that have been reported by students.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle>Verification Requests</CardTitle>
                <CardDescription>Review and manage employer verification requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No pending verification requests</h3>
                  <p className="mt-2 text-muted-foreground">
                    There are currently no employer verification requests pending review.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Flagged Employer</DialogTitle>
              <DialogDescription>
                Review the report and take appropriate action for {selectedEmployer?.employerName}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive" className="my-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="my-4 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Employer</h3>
                  <p>{selectedEmployer?.employerName}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Reason for Report</h3>
                  <p className="text-sm">{selectedEmployer?.reason}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Report Details</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>Reported on {selectedEmployer && formatDate(selectedEmployer.reportedAt)}</span>
                    <span className="mx-2">•</span>
                    <Flag className="mr-1 h-3 w-3" />
                    <span>
                      {selectedEmployer?.reportCount} report{selectedEmployer?.reportCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Admin Notes</h3>
                  <Textarea
                    placeholder="Add notes about this review..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={selectedEmployer?.status !== "pending" || isSubmitting}
                  />
                </div>

                {selectedEmployer?.status !== "pending" && (
                  <Alert
                    className={`${
                      selectedEmployer?.status === "approved"
                        ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {selectedEmployer?.status === "approved" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      This employer has been {selectedEmployer?.status}. No further action is required.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <DialogFooter>
              {selectedEmployer?.status === "pending" ? (
                <>
                  <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={() => handleUpdateStatus("rejected")} disabled={isSubmitting}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Employer
                  </Button>
                  <Button onClick={() => handleUpdateStatus("approved")} disabled={isSubmitting}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve Employer
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsReviewDialogOpen(false)}>Close</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
