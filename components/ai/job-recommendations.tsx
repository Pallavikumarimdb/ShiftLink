"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function JobRecommendations() {
  const [recommendations, setRecommendations] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/ai/job-recommendations")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job recommendations")
      }

      setRecommendations(data.recommendations)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [])

  return (
    <Card >
      <CardHeader>
        <div className="flex items-center justify-between ">
          <div>
            <CardTitle>AI Job Recommendations</CardTitle>
            <CardDescription>Personalized job matches based on your profile and preferences</CardDescription>
          </div>
          {lastUpdated && !isLoading && (
            <Button variant="outline" size="icon" onClick={fetchRecommendations} title="Refresh recommendations">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="max-h-[500px] overflow-y-scroll">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{recommendations}</div>
        )}

        {lastUpdated && !isLoading && (
          <p className="text-xs text-muted-foreground mt-4">Last updated: {lastUpdated.toLocaleString()}</p>
        )}
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/jobs">
            Browse All Jobs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
