"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PremiumSubscription } from "@/components/premium-subscription"
import { StarRating } from "@/components/star-rating"
import { ReviewsList } from "@/components/reviews-list"
import { Button } from "@/components/ui/button"

interface FormData {
  firstName: string
  lastName: string
  email: string
  university: string
  visaType: string
  languages: string
  availability: {
    weekdayMornings: boolean
    weekdayAfternoons: boolean
    weekdayEvenings: boolean
    weekendMornings: boolean
    weekendAfternoons: boolean
    weekendEvenings: boolean
  }
  bio: string
  skills: string
  education: string
  experience: string
}

interface Review {
  id: string
  employerRating: number | null
  employerComment: string | null
  employerReviewedAt: Date | null
  createdAt: Date
}

interface FormattedReview {
  id: string
  rating: number
  comment: string
  createdAt: string
  reviewerName: string
  jobTitle: string
}

export default function StudentProfilePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [reviews, setReviews] = useState<FormattedReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [resumeData, setResumeData] = useState<any>(null)
  const [jobRecommendations, setJobRecommendations] = useState<any[]>([])
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    jobAlerts: true,
  })
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    university: "",
    visaType: "student",
    languages: "",
    availability: {
      weekdayMornings: false,
      weekdayAfternoons: false,
      weekdayEvenings: false,
      weekendMornings: false,
      weekendAfternoons: false,
      weekendEvenings: false,
    },
    bio: "",
    skills: "",
    education: "",
    experience: "",
  })


  // Add this useEffect to fetch resume data and job recommendations
  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (!user?.id) return

      try {
        const resume = await fetchUserResume()
        if (resume) {
          setResumeData(resume)
          setFormData(prev => ({ ...prev, resumeUrl: resume.url }))
        }

        const recommendations = await fetchJobRecommendations()
        setJobRecommendations(recommendations)

        // Fetch notification preferences
        const notifResponse = await fetch(`/api/users/${user.id}/notifications`)
        if (notifResponse.ok) {
          const notifData = await notifResponse.json()
          setNotificationPreferences(notifData)
        }
      } catch (err) {
        console.error('Error fetching additional data:', err)
      }
    }

    fetchAdditionalData()
  }, [user])


  // Resume upload handler with API call
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, or DOCX file')
      return
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('userId', user?.id || '')

      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload resume')
      }

      const result = await response.json()
      setSuccess('Resume uploaded successfully!')

      // Update form data with resume URL if returned
      if (result.resumeUrl) {
        setFormData(prev => ({ ...prev, resumeUrl: result.resumeUrl }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload resume')
      console.error('Resume upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationPreferences = async (emailNotifications: boolean) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/users/${user.id}/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailNotifications,
          jobAlerts: emailNotifications,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update notification preferences')
      }

      setSuccess('Notification preferences updated!')
    } catch (err) {
      setError('Failed to update notification preferences')
      console.error('Notification preferences error:', err)
    }
  }

  const fetchUserResume = async () => {
    if (!user?.id) return null

    try {
      const response = await fetch(`/api/users/${user.id}/resume`)
      if (!response.ok) return null

      const result = await response.json()
      return result
    } catch (err) {
      console.error('Error fetching resume:', err)
      return null
    }
  }

  const handleResumeDelete = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/users/${user.id}/resume`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete resume')
      }

      setSuccess('Resume deleted successfully!')
      setFormData(prev => ({ ...prev, resumeUrl: '' }))
    } catch (err) {
      setError('Failed to delete resume')
      console.error('Resume delete error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const validateFormData = (data: FormData): string[] => {
    const errors: string[] = []

    if (!data.firstName.trim()) errors.push('First name is required')
    if (!data.lastName.trim()) errors.push('Last name is required')
    if (!data.email.trim()) errors.push('Email is required')
    if (!data.university.trim()) errors.push('University is required')
    if (!data.education.trim()) errors.push('Major/Field of study is required')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address')
    }

    // Check if at least one availability slot is selected
    const hasAvailability = Object.values(data.availability).some(slot => slot)
    if (!hasAvailability) {
      errors.push('Please select at least one availability time slot')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const validationErrors = validateFormData(formData)
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          language: formData.languages.trim(),
          bio: formData.bio.trim(),
          school: formData.university.trim(),
          major: formData.education.trim(),
          skills: formData.skills.trim(),
          experience: formData.experience.trim(),
          availability: formData.availability,
          visaType: formData.visaType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const updatedUser = await response.json()
      setSuccess('Profile updated successfully!')

      setTimeout(() => setSuccess(''), 5000) // Clear success message after 5 seconds
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchJobRecommendations = async () => {
    if (!user?.id) return []

    try {
      const response = await fetch(`/api/jobs/recommendations/${user.id}`)
      if (!response.ok) return []

      const recommendations = await response.json()
      return recommendations
    } catch (err) {
      console.error('Error fetching job recommendations:', err)
      return []
    }
  }

  const handleAvailabilityChange = async (availabilityData: typeof formData.availability) => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/users/${user.id}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availability: availabilityData }),
      })

      if (!response.ok) {
        throw new Error('Failed to update availability')
      }

    } catch (err) {
      console.error('Availability update error:', err)
    }
  }


  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return

      try {

        const response = await fetch(`/api/users/${user.id}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch profile")
        }
        const userData = await response.json()

        if (!userData) {
          throw new Error("No user data received")
        }

        setFormData({
          firstName: userData.name?.split(" ")[0] || "",
          lastName: userData.name?.split(" ")[1] || "",
          email: userData.email || "",
          university: userData.student?.school || "",
          visaType: "student",
          languages: userData.language || "",
          availability: userData.student?.availability || {
            weekdayMornings: false,
            weekdayAfternoons: false,
            weekdayEvenings: false,
            weekendMornings: false,
            weekendAfternoons: false,
            weekendEvenings: false,
          },
          bio: userData.student?.bio || "",
          skills: userData.student?.skills || "",
          education: userData.student?.major || "",
          experience: "",
        })

        if (userData.student?.id) {
          try {
            const reviewsResponse = await fetch(`/api/reviews/student/${userData.student.id}`)
            if (!reviewsResponse.ok) {
              throw new Error("Failed to fetch reviews")
            }
            const { reviews: studentReviews, averageRating: avgRating } = await reviewsResponse.json()

            const formattedReviews = studentReviews
              .filter((review: Review) => review.employerRating !== null)
              .map((review: Review) => ({
                id: review.id,
                rating: review.employerRating!,
                comment: review.employerComment || "",
                createdAt: review.employerReviewedAt?.toISOString() || review.createdAt.toISOString(),
                reviewerName: "Employer",
                jobTitle: "Job Title",
              }))

            setReviews(formattedReviews)
            setAverageRating(avgRating)
          } catch (reviewError) {
            console.error("Error fetching reviews:", reviewError)
            // Don't throw here, just log the error and continue
          }
        }
      } catch (err) {
        console.error("Error in fetchProfileData:", err)
        setError(err instanceof Error ? err.message : "Failed to load profile data")
      }
    }

    fetchProfileData()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [name]: checked,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }



  // const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0]
  //   if (file) {
  //     setSuccess("Resume uploaded successfully!")
  //   }
  // }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          {averageRating > 0 && <StarRating rating={averageRating} size="lg" />}
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

        {/* Add a new tab for premium subscription */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="resume">Resume & Skills</TabsTrigger>
            <TabsTrigger value="preferences">Job Preferences</TabsTrigger>
            <TabsTrigger value="reviews">Reviews {reviews.length > 0 && `(${reviews.length})`}</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>


          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your basic personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium">
                        First Name *
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium">
                        Last Name *
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="university" className="text-sm font-medium">
                      University/School *
                    </label>
                    <input
                      id="university"
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="e.g., University of California, Berkeley"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="visaType" className="text-sm font-medium">
                      Visa Status *
                    </label>
                    <select
                      id="visaType"
                      name="visaType"
                      value={formData.visaType}
                      onChange={(e) => handleSelectChange("visaType", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="student">Student Visa (F-1)</option>
                      <option value="citizen">US Citizen</option>
                      <option value="permanent">Permanent Resident</option>
                      <option value="work">Work Visa (H-1B, etc.)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="languages" className="text-sm font-medium">
                      Languages Spoken
                    </label>
                    <input
                      id="languages"
                      name="languages"
                      type="text"
                      value={formData.languages}
                      onChange={handleChange}
                      placeholder="e.g., English (Native), Spanish (Fluent), French (Basic)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Professional Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell employers about yourself, your interests, and what makes you a great candidate..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    />
                    <p className="text-xs text-gray-500">This will be visible to potential employers</p>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="default" 
                      type="submit"
                      disabled={isLoading}
                      >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume & Skills Tab */}
          <TabsContent value="resume">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Upload</CardTitle>
                  <CardDescription>Upload your latest resume (PDF format recommended)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="resume"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Click to upload resume</span>
                        <span className="text-xs text-gray-500">PDF, DOC, or DOCX up to 10MB</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Education & Skills</CardTitle>
                  <CardDescription>Tell employers about your academic background and key skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="education" className="text-sm font-medium">
                        Major/Field of Study *
                      </label>
                      <input
                        id="education"
                        name="education"
                        type="text"
                        value={formData.education}
                        onChange={handleChange}
                        placeholder="e.g., Computer Science, Business Administration, Marketing"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="skills" className="text-sm font-medium">
                        Skills & Competencies
                      </label>
                      <textarea
                        id="skills"
                        name="skills"
                        rows={4}
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="List your technical skills, software proficiency, certifications, and other relevant abilities (e.g., Python, Excel, Adobe Creative Suite, Project Management, etc.)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      />
                      <p className="text-xs text-gray-500">Separate skills with commas or line breaks</p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="experience" className="text-sm font-medium">
                        Work Experience & Projects
                      </label>
                      <textarea
                        id="experience"
                        name="experience"
                        rows={5}
                        value={formData.experience}
                        onChange={handleChange}
                        placeholder="Describe any relevant work experience, internships, projects, or volunteer work that showcases your abilities..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button variant="default" 
                        type="submit"
                        disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Job Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Job Preferences</CardTitle>
                <CardDescription>Set your availability and job preferences to help employers find you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Availability Schedule</h3>
                    <p className="text-sm text-gray-400">Select when you're available to work</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-200">Weekdays</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="weekdayMornings"
                              checked={formData.availability.weekdayMornings}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm">Mornings (6:00 AM - 12:00 PM)</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="weekdayAfternoons"
                              checked={formData.availability.weekdayAfternoons}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm">Afternoons (12:00 PM - 6:00 PM)</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="weekdayEvenings"
                              checked={formData.availability.weekdayEvenings}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm">Evenings (6:00 PM - 11:00 PM)</span>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-200">Weekends</h4>
                        <div className="space-y-2">
                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="weekendMornings"
                              checked={formData.availability.weekendMornings}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm">Mornings (6:00 AM - 12:00 PM)</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="weekendAfternoons"
                              checked={formData.availability.weekendAfternoons}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm">Afternoons (12:00 PM - 6:00 PM)</span>
                          </label>

                          <label className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              name="weekendEvenings"
                              checked={formData.availability.weekendEvenings}
                              onChange={handleChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm">Evenings (6:00 PM - 11:00 PM)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Job Type Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-[#f50a0a] mb-2">Part-time Jobs</h4>
                          <p className="text-sm text-gray-400">Flexible hours, perfect for students</p>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-[#f50a0a] mb-2">Project-based Work</h4>
                          <p className="text-sm text-gray-400">Short-term assignments and gigs</p>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-[#f50a0a] mb-2">Remote Work</h4>
                          <p className="text-sm text-gray-400">Work from anywhere opportunities</p>
                        </div>

                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-[#f50a0a] mb-2">Internships</h4>
                          <p className="text-sm text-gray-400">Gain experience in your field</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Notification Preferences</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                        Get notified when jobs matching your preferences become available
                      </p>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-blue-900 dark:text-blue-100">
                          Email me about new job opportunities
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="default" 
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Employer Reviews</CardTitle>
                <CardDescription>See what employers are saying about your work</CardDescription>
              </CardHeader>
              <CardContent>
                <ReviewsList
                  reviews={reviews}
                  emptyMessage="No reviews yet. Reviews will appear here after employers rate your performance on completed jobs."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add the Premium tab content */}
          <TabsContent value="premium">
            <div className="max-w-md mx-auto">
              <PremiumSubscription />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
