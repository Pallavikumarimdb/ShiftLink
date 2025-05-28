"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StudentRegisterPage() {
  const { register, isLoading, user } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
    visaType: "",
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
    agreeTerms: false,
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search)
      const msg = searchParams.get("message")
      setMessage(msg)
    }
  }, [])

  useEffect(() => {
    if (user && user.role === "employer") {
      setError("You are already logged in as an employer. Please log out first to register as a student.")

      const timer = setTimeout(() => {
        router.push("/employer/dashboard")
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [user, router])

  //@ts-ignore
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      if (name === "agreeTerms") {
        setFormData((prev) => ({ ...prev, [name]: checked }))
      } else {
        setFormData((prev) => ({
          ...prev,
          availability: {
            ...prev.availability,
            [name]: checked,
          },
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    const dataToSend = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
    };

    try {
      await register(dataToSend, "student");
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
          <CardDescription>
            Create an account to find part-time jobs that fit your schedule
          </CardDescription>
          {message && (
            <Alert className="mt-4 bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="university">University/College</Label>
                <Input id="university" name="university" value={formData.university} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visaType">Visa Type</Label>
                <Select onValueChange={(value) => handleSelectChange("visaType", value)} value={formData.visaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student Visa</SelectItem>
                    <SelectItem value="work">Work Visa</SelectItem>
                    <SelectItem value="workHoliday">Working Holiday</SelectItem>
                    <SelectItem value="permanent">Permanent Resident</SelectItem>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="languages">Languages (comma separated)</Label>
              <Input
                id="languages"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="English, Spanish, Mandarin..."
              />
            </div>

            <div className="space-y-3">
              <Label>Availability</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekdayMornings"
                    name="weekdayMornings"
                    checked={formData.availability.weekdayMornings}
                    onCheckedChange={(checked) => {
                      handleChange({
                        target: {
                          name: "weekdayMornings",
                          type: "checkbox",
                          checked,
                        },
                      })
                    }}
                  />
                  <label
                    htmlFor="weekdayMornings"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weekday Mornings
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekdayAfternoons"
                    name="weekdayAfternoons"
                    checked={formData.availability.weekdayAfternoons}
                    onCheckedChange={(checked) => {
                      handleChange({
                        target: {
                          name: "weekdayAfternoons",
                          type: "checkbox",
                          checked,
                        },
                      })
                    }}
                  />
                  <label
                    htmlFor="weekdayAfternoons"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weekday Afternoons
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekdayEvenings"
                    name="weekdayEvenings"
                    checked={formData.availability.weekdayEvenings}
                    onCheckedChange={(checked) => {
                      handleChange({
                        target: {
                          name: "weekdayEvenings",
                          type: "checkbox",
                          checked,
                        },
                      })
                    }}
                  />
                  <label
                    htmlFor="weekdayEvenings"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weekday Evenings
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekendMornings"
                    name="weekendMornings"
                    checked={formData.availability.weekendMornings}
                    onCheckedChange={(checked) => {
                      handleChange({
                        target: {
                          name: "weekendMornings",
                          type: "checkbox",
                          checked,
                        },
                      })
                    }}
                  />
                  <label
                    htmlFor="weekendMornings"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weekend Mornings
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekendAfternoons"
                    name="weekendAfternoons"
                    checked={formData.availability.weekendAfternoons}
                    onCheckedChange={(checked) => {
                      handleChange({
                        target: {
                          name: "weekendAfternoons",
                          type: "checkbox",
                          checked,
                        },
                      })
                    }}
                  />
                  <label
                    htmlFor="weekendAfternoons"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weekend Afternoons
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="weekendEvenings"
                    name="weekendEvenings"
                    checked={formData.availability.weekendEvenings}
                    onCheckedChange={(checked) => {
                      handleChange({
                        target: {
                          name: "weekendEvenings",
                          type: "checkbox",
                          checked,
                        },
                      })
                    }}
                  />
                  <label
                    htmlFor="weekendEvenings"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Weekend Evenings
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Brief Bio (optional)</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell employers a bit about yourself, your skills, and what kind of work you're looking for..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => {
                  handleChange({
                    target: {
                      name: "agreeTerms",
                      type: "checkbox",
                      checked,
                    },
                  })
                }}
                required
              />
              <label
                htmlFor="agreeTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  terms and conditions
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (user && user.role === "employer") ? true : false}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
