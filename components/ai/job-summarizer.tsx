"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function JobSummarizer({ initialDescription = "" }) {
  const [jobDescription, setJobDescription] = useState(initialDescription)
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSummarize = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description to summarize")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai/job-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize job description")
      }

      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-transparent text-black">
      <CardHeader>
        <CardTitle>Job Description Summarizer</CardTitle>
        <CardDescription>
          Get a concise summary of the job description to quickly understand key requirements
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Job Description</h3>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="min-h-[150px] bg-slate-300"
          />
        </div>

        {summary && (
          <div className="space-y-2">
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Summary generated successfully!</AlertDescription>
            </Alert>

            <div className="border rounded-md p-4 whitespace-pre-wrap">
              <h3 className="font-medium mb-2">Summary</h3>
              {summary}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleSummarize} disabled={isLoading || !jobDescription.trim()} className="p-4">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Summarizing...
            </>
          ) : (
            "Summarize Job Description"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
