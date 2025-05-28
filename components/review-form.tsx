"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewFormProps {
  applicationId: string
  jobId: string
  employerId: string
  studentId: string
  jobTitle: string
  entityName: string
  type: "employer" | "student"
  onReviewSubmitted?: () => void
}

export function ReviewForm({
  applicationId,
  jobId,
  employerId,
  studentId,
  jobTitle,
  entityName,
  type,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      // Create the review via API
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          jobId,
          employerId,
          studentId,
          type,
          rating,
          comment,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit review")
      }

      setSuccess(true)
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (err) {
      setError("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle>Review Submitted</CardTitle>
          </div>
          <CardDescription>Thank you for sharing your feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
            <AlertDescription>
              Your review has been submitted successfully. This helps build a trustworthy community on ShiftLink.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {type === "employer" ? "Rate Your Experience with the Student" : "Rate Your Experience with the Employer"}
        </CardTitle>
        <CardDescription>
          {type === "employer"
            ? `Share your feedback about working with the student for the "${jobTitle}" position`
            : `Share your feedback about working at ${entityName} for the "${jobTitle}" position`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`h-10 w-10 rounded-md flex items-center justify-center transition-colors ${
                    rating >= star
                      ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-400"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => handleRatingChange(star)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={rating >= star ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {rating === 1
                ? "Poor"
                : rating === 2
                  ? "Fair"
                  : rating === 3
                    ? "Good"
                    : rating === 4
                      ? "Very Good"
                      : rating === 5
                        ? "Excellent"
                        : "Select a rating"}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="block text-sm font-medium">
              Comments
            </label>
            <Textarea
              id="comment"
              placeholder={
                type === "employer"
                  ? "Share your experience working with this student..."
                  : "Share your experience working with this employer..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </CardFooter>
    </Card>
  )
}
