"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PostJobFormProps {
  onJobPosted: (job: Job) => void
  employerId: string
  employerName: string
}

interface Job {
  id: string
  title: string
  location: string
  description: string
  hourlyRate: number
  hoursPerWeek: number
  shiftTimes: string
  requirements: string
  employerId: string
  employerName: string
  createdAt: string
}

interface FormData {
  title: string
  location: string
  description: string
  hourlyRate: string
  hoursPerWeek: string
  shiftTimes: string
  requirements: string
}

export function PostJobForm({ onJobPosted, employerId, employerName }: PostJobFormProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [formData, setFormData] = useState<FormData>({
    title: "",
    location: "",
    description: "",
    hourlyRate: "",
    hoursPerWeek: "",
    shiftTimes: "",
    requirements: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (!formData.title || !formData.location || !formData.description || !formData.hourlyRate) {
        throw new Error("Please fill in all required fields")
      }

      const jobData = {
        ...formData,
        hourlyRate: Number.parseFloat(formData.hourlyRate),
        hoursPerWeek: Number.parseInt(formData.hoursPerWeek, 10),
        employerId,
        employerName,
      }

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to create job. Please try again.")
      }

      const newJob: Job = await res.json()
      onJobPosted(newJob)
    } catch (err: any) {
      setError(err.message || "Failed to create job. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          name="title"
          className="bg-slate-900"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Barista, Retail Assistant"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
        <Input
          id="location"
          name="location"
          className="bg-slate-900"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Downtown, University Area"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate ($) <span className="text-red-500">*</span></Label>
          <Input
            id="hourlyRate"
            name="hourlyRate"
            className="bg-slate-900"
            type="number"
            min="0"
            step="0.01"
            value={formData.hourlyRate}
            onChange={handleChange}
            placeholder="e.g., 15.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hoursPerWeek">Hours Per Week <span className="text-red-500">*</span></Label>
          <Input
            id="hoursPerWeek"
            name="hoursPerWeek"
            className="bg-slate-900"
            type="number"
            min="1"
            max="40"
            value={formData.hoursPerWeek}
            onChange={handleChange}
            placeholder="e.g., 20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shiftTimes">Shift Times <span className="text-red-500">*</span></Label>
          <Input
            id="shiftTimes"
            name="shiftTimes"
            className="bg-slate-900"
            value={formData.shiftTimes}
            onChange={handleChange}
            placeholder="e.g., Weekends 9am-5pm"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the job responsibilities, tasks, and what a typical day looks like..."
          className="min-h-[120px] bg-slate-900"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          placeholder="List any required skills, experience, or qualifications..."
          className="min-h-[100px] bg-slate-900"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Job Listing"}
        </Button>
      </div>
    </form>
  )
}
