"use client"

import { useAuth } from "@/components/auth-provider"
import { EmployerVerificationForm } from "@/components/employer-verification-form"

export default function EmployerVerificationPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Business Verification</h1>
        <p className="text-muted-foreground mb-8">
          Verify your business to build trust with applicants and gain access to premium features. Verified businesses
          receive a verification badge that appears on their profile and job listings.
        </p>

        <EmployerVerificationForm />
      </div>
    </div>
  )
}
