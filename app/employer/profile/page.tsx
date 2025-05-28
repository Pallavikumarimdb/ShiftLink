"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { getEmployerReviews, getEmployerAverageRating } from "@/lib/utils/data-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VerificationBadge } from "@/components/verification-badge"
import { StarRating } from "@/components/star-rating"
import { ReviewsList } from "@/components/reviews-list"

interface EmployerProfile {
  id: string
  name: string
  email: string
  companyName: string
  industry?: string | null
  website?: string | null
  description?: string | null
  logo?: string | null
  isVerified: boolean
  isFlagged: boolean
  flagReason?: string | null
  createdAt: string
}

interface Review {
  id: string
  applicationId: string
  jobTitle: string
  studentId: string
  studentName: string
  rating: number
  comment: string
  reviewedAt: string
  createdAt: string
  reviewerName: string
}

interface User {
  id: string
  name: string
  email: string
  employerId: string
  isVerified: boolean
}

export default function EmployerProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [profile, setProfile] = useState<EmployerProfile | null>(null)
  const [totalJobs, setTotalJobs] = useState(0)
  const [totalApplications, setTotalApplications] = useState(0)


  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    description: "",
    logo: null as File | null,
  })

  useEffect(() => {
    if (user?.id) {
      setIsLoading(true)
      Promise.all([
        fetch(`/api/employers/${user.id}`).then((res) => res.json()),
        getEmployerReviews(user.id),
        getEmployerAverageRating(user.id),
      ])
        .then(([profileStats, reviewsData, avgRating]) => {
          if (profileStats.error) {
            throw new Error(profileStats.error)
          }
          
          setProfile(profileStats.profile)
          setTotalJobs(profileStats.totalJobs)
          setTotalApplications(profileStats.totalApplications)
          
          // Transform reviews data to match Review interface
          const transformedReviews: Review[] = reviewsData.map((review: any) => ({
            id: review.id,
            applicationId: review.applicationId,
            jobTitle: review.jobTitle,
            studentId: review.studentId,
            studentName: review.studentName || "Anonymous Student",
            rating: review.rating || 0,
            comment: review.comment || "",
            reviewedAt: review.reviewedAt ? new Date(review.reviewedAt).toISOString() : new Date().toISOString(),
            createdAt: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
            reviewerName: review.studentName || "Anonymous Student"
          }))
          
          setReviews(transformedReviews)
          setAverageRating(avgRating || 0)
          setFormData((prev) => ({
            ...prev,
            businessName: profileStats.profile.companyName || "",
            businessType: profileStats.profile.industry || "",
            location: "",
            email: profileStats.profile.email || "",
            website: profileStats.profile.website || "",
            description: profileStats.profile.description || "",
          }))
        })
        .catch((err) => {
          console.error("Error loading profile data:", err)
          setError("Failed to load profile data. Please try again later.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [user])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          formDataToSend.append(key, value)
        }
      })

      const response = await fetch(`/api/employers/${user?.id}`, {
        method: "PATCH",
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setSuccess("Profile updated successfully!")
      setProfile((prev) => prev ? { ...prev, ...data.profile } : null)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Company Profile</h1>
            {profile?.isVerified && <VerificationBadge />}
          </div>
          {!profile?.isVerified && (
            <Button asChild variant="outline">
              <Link href="/employer/verification">Get Verified</Link>
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex gap-8">
          <div>
            <div className="font-semibold">Total Jobs</div>
            <div>{totalJobs}</div>
          </div>
          <div>
            <div className="font-semibold">Total Applications</div>
            <div>{totalApplications}</div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="reviews">Reviews {reviews.length > 0 && `(${reviews.length})`}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>Update your company details and contact information</CardDescription>
                  </div>
                  {averageRating > 0 && <StarRating rating={averageRating} size="lg" />}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("businessType", value)}
                        value={formData.businessType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="hospitality">Hospitality</SelectItem>
                          <SelectItem value="food">Food & Beverage</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, State"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" name="website" type="url" value={formData.website} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Tell students about your business, work environment, and what makes your company a great place to work..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Reviews</CardTitle>
                    <CardDescription>See what students are saying about working with you</CardDescription>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={averageRating} size="lg" />
                      <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ReviewsList
                  reviews={reviews}
                  emptyMessage="No reviews yet. Reviews will appear here after students complete jobs and leave feedback."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
