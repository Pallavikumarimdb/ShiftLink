"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Flag, Search, ThumbsDown, ThumbsUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StarRating } from "@/components/star-rating"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/components/locale-provider"

// Mock sentiment analysis data
const mockSentimentData = {
  rev1: {
    sentiment: "positive",
    score: 0.85,
    positivePoints: ["Great team environment", "Flexible schedule", "Supportive management"],
    negativePoints: [],
    actionableFeedback: "Continue providing flexible scheduling options",
  },
  rev2: {
    sentiment: "negative",
    score: -0.65,
    positivePoints: ["Good pay"],
    negativePoints: ["Poor communication", "Unpredictable hours", "Stressful environment"],
    actionableFeedback: "Improve communication with employees and provide more consistent schedules",
  },
  rev3: {
    sentiment: "neutral",
    score: 0.1,
    positivePoints: ["Decent workplace", "Fair compensation"],
    negativePoints: ["Limited growth opportunities", "Repetitive tasks"],
    actionableFeedback: "Consider implementing skill development programs",
  },
}

export default function AdminReviewsPage() {
  const { user } = useAuth()
  const { t } = useLocale()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReview, setSelectedReview] = useState(null)
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null)
  const [analyzingReview, setAnalyzingReview] = useState(false)

  useEffect(() => {
    // In a real app, this would fetch from the API
    // Simulating API call with mock data
    setTimeout(() => {
      setReviews([
        {
          id: "rev1",
          studentName: "John Doe",
          employerName: "Coffee House",
          jobTitle: "Barista",
          studentRating: 4.5,
          employerRating: 5,
          studentComment: "Great place to work! The team was very supportive and the schedule was flexible.",
          employerComment: "John was a great server. Very punctual and professional. Customers loved him.",
          createdAt: "2023-06-20T10:30:00Z",
          isFlagged: false,
        },
        {
          id: "rev2",
          studentName: "Alice Smith",
          employerName: "Quick Mart",
          jobTitle: "Cashier",
          studentRating: 2,
          employerRating: 3.5,
          studentComment:
            "Poor communication from management. Hours were unpredictable and the environment was stressful. The pay was good though.",
          employerComment: "Alice was reliable but sometimes struggled with customer service.",
          createdAt: "2023-06-15T14:20:00Z",
          isFlagged: true,
          flagReason: "Contains inappropriate language",
        },
        {
          id: "rev3",
          studentName: "Michael Johnson",
          employerName: "City Library",
          jobTitle: "Library Assistant",
          studentRating: 3.5,
          employerRating: 4,
          studentComment:
            "Decent workplace with fair compensation. Tasks were repetitive and there weren't many opportunities for growth.",
          employerComment: "Michael was organized and punctual. Good attention to detail.",
          createdAt: "2023-06-10T09:15:00Z",
          isFlagged: false,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const filteredReviews = reviews.filter(
    (review) =>
      review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.employerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.studentComment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.employerComment?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectReview = (review) => {
    setSelectedReview(review)
    setSentimentAnalysis(null)
  }

  const handleAnalyzeSentiment = async () => {
    if (!selectedReview) return

    setAnalyzingReview(true)

    try {
      // In a real app, this would call the API
      // Simulating API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Get mock sentiment data for this review
      const sentimentData = mockSentimentData[selectedReview.id]

      if (sentimentData) {
        setSentimentAnalysis(sentimentData)
      } else {
        // Generate random sentiment if no mock data exists
        const randomScore = Math.random() * 2 - 1 // Between -1 and 1
        setSentimentAnalysis({
          sentiment: randomScore > 0.3 ? "positive" : randomScore < -0.3 ? "negative" : "neutral",
          score: randomScore,
          positivePoints: ["Generated positive point"],
          negativePoints: randomScore < 0 ? ["Generated negative point"] : [],
          actionableFeedback: "Generated actionable feedback",
        })
      }
    } catch (err) {
      setError("Failed to analyze sentiment. Please try again.")
    } finally {
      setAnalyzingReview(false)
    }
  }

  const getSentimentColor = (score) => {
    if (score > 0.3) return "text-green-600 dark:text-green-400"
    if (score < -0.3) return "text-red-600 dark:text-red-400"
    return "text-amber-600 dark:text-amber-400"
  }

  const getSentimentIcon = (sentiment) => {
    if (sentiment === "positive") return <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
    if (sentiment === "negative") return <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
    return <div className="h-5 w-5 rounded-full bg-amber-500" />
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t("admin.unauthorized")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("admin.reviewManagement")}</h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("admin.searchReviews")}
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t("admin.reviews")}</CardTitle>
              <CardDescription>{t("admin.reviewsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? t("admin.noReviewsFound") : t("admin.noReviews")}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedReview?.id === review.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleSelectReview(review)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{review.jobTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {review.studentName} • {review.employerName}
                          </p>
                        </div>
                        {review.isFlagged && (
                          <Badge variant="destructive" className="flex items-center">
                            <Flag className="h-3 w-3 mr-1" />
                            {t("admin.flagged")}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("admin.studentRating")}</p>
                          <StarRating rating={review.studentRating} size="sm" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("admin.employerRating")}</p>
                          <StarRating rating={review.employerRating} size="sm" />
                        </div>
                      </div>

                      <p className="text-sm line-clamp-2">{review.studentComment || t("admin.noComment")}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t("admin.reviewDetails")}</CardTitle>
              <CardDescription>{t("admin.reviewDetailsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedReview ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-medium">{selectedReview.jobTitle}</h3>
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("admin.student")}: {selectedReview.studentName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("admin.employer")}: {selectedReview.employerName}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.reviewDate")}: {new Date(selectedReview.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <Tabs defaultValue="student">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="student">{t("admin.studentReview")}</TabsTrigger>
                      <TabsTrigger value="employer">{t("admin.employerReview")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="student" className="space-y-4 pt-4">
                      <div>
                        <p className="text-sm font-medium mb-1">{t("admin.rating")}</p>
                        <StarRating rating={selectedReview.studentRating} size="md" />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">{t("admin.comment")}</p>
                        <div className="border rounded-md p-3 whitespace-pre-wrap">
                          {selectedReview.studentComment || t("admin.noComment")}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="employer" className="space-y-4 pt-4">
                      <div>
                        <p className="text-sm font-medium mb-1">{t("admin.rating")}</p>
                        <StarRating rating={selectedReview.employerRating} size="md" />
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">{t("admin.comment")}</p>
                        <div className="border rounded-md p-3 whitespace-pre-wrap">
                          {selectedReview.employerComment || t("admin.noComment")}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">{t("admin.sentimentAnalysis")}</h3>
                      <Button size="sm" onClick={handleAnalyzeSentiment} disabled={analyzingReview}>
                        {analyzingReview ? t("admin.analyzing") : t("admin.analyze")}
                      </Button>
                    </div>

                    {sentimentAnalysis ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSentimentIcon(sentimentAnalysis.sentiment)}
                            <span className="font-medium capitalize">
                              {sentimentAnalysis.sentiment} {t("admin.sentiment")}
                            </span>
                          </div>
                          <span className={`font-mono ${getSentimentColor(sentimentAnalysis.score)}`}>
                            {sentimentAnalysis.score.toFixed(2)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">{t("admin.keyPoints")}</h4>

                          {sentimentAnalysis.positivePoints.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                                {t("admin.positive")}
                              </p>
                              <ul className="text-sm space-y-1 pl-5 list-disc">
                                {sentimentAnalysis.positivePoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {sentimentAnalysis.negativePoints.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                                {t("admin.negative")}
                              </p>
                              <ul className="text-sm space-y-1 pl-5 list-disc">
                                {sentimentAnalysis.negativePoints.map((point, i) => (
                                  <li key={i}>{point}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">{t("admin.actionableFeedback")}</h4>
                          <div className="border rounded-md p-3 text-sm">{sentimentAnalysis.actionableFeedback}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-md p-4 text-center text-muted-foreground">
                        {t("admin.clickAnalyze")}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                  <p>{t("admin.selectReview")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
