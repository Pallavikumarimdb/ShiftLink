"use client"

import { ResumeBuilder } from "@/components/ai/resume-builder"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ResumeBuilderPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button asChild variant="outline" size="sm">
            <Link href="/student/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back To Dashboard
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Title</h1>
          <p className="text-muted-foreground mt-2">Description</p>
        </div>

        <ResumeBuilder />
      </div>
    </div>
  )
}
