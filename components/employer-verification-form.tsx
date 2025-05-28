"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { createVerificationRequest } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EmployerVerificationForm() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formData, setFormData] = useState({
    businessLicense: "",
    taxId: "",
    businessAddress: "",
    contactPerson: "",
    contactPhone: "",
    additionalInfo: "",
    documents: [] as File[],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }))
  }

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validate form
      if (!formData.businessLicense || !formData.taxId || formData.documents.length === 0) {
        throw new Error("Please fill in all required fields and upload at least one document")
      }

      // In a real app, we would upload the documents to a storage service
      // and then create the verification request with the document URLs
      const documentNames = formData.documents.map((file) => file.name)

      // Create verification request
      const verificationRequest = createVerificationRequest({
        employerId: user?.id,
        businessLicense: formData.businessLicense,
        taxId: formData.taxId,
        businessAddress: formData.businessAddress,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
        additionalInfo: formData.additionalInfo,
        verificationDocuments: documentNames,
      })

      // Update user verification status
      updateUser({
        verificationStatus: "pending",
      })

      setSuccess(
        "Verification request submitted successfully! We will review your information and get back to you soon.",
      )
    } catch (err) {
      setError(err.message || "Failed to submit verification request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // If already verified, show success message
  if (user?.isVerified) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle>Verification Complete</CardTitle>
          </div>
          <CardDescription>Your business has been successfully verified</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Congratulations! Your business is now verified. The verification badge will appear on your profile and job
              listings, helping you build trust with potential applicants.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // If verification is pending, show pending message
  if (user?.verificationStatus === "pending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Pending</CardTitle>
          <CardDescription>Your verification request is being reviewed</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your verification request has been submitted and is currently under review. This process typically takes
              1-3 business days. We'll notify you once the review is complete.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Verification</CardTitle>
        <CardDescription>
          Verify your business to build trust with applicants and gain access to premium features
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessLicense">Business License Number *</Label>
              <Input
                id="businessLicense"
                name="businessLicense"
                value={formData.businessLicense}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">Tax ID / EIN *</Label>
              <Input id="taxId" name="taxId" value={formData.taxId} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              placeholder="Street address, city, state, zip code"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Full name of authorized representative"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Upload Verification Documents *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Upload business license, tax documents, or other proof of business
              </p>
              <Input
                id="documents"
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById("documents").click()}>
                Select Files
              </Button>
            </div>
            {formData.documents.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Selected Files:</p>
                <ul className="space-y-2">
                  {formData.documents.map((file, index) => (
                    <li key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                      <span className="truncate max-w-[250px]">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => removeFile(index)}
                      >
                        &times;
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Additional Information</Label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Any additional information that might help with verification..."
              className="min-h-[100px]"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Verification Request"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col text-sm text-muted-foreground">
        <p>
          * Verification typically takes 1-3 business days. Once verified, your business will receive a verification
          badge that appears on your profile and job listings.
        </p>
      </CardFooter>
    </Card>
  )
}
