"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ResumeBuilder() {
  const [formData, setFormData] = useState({
    name: "",
    education: "",
    experience: "",
    skills: "",
    languages: "",
    additionalInfo: "",
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [generatedResume, setGeneratedResume] = useState("")
  const [activeTab, setActiveTab] = useState("form")

  //@ts-ignore
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  //@ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate resume")
      }

      setGeneratedResume(data.resume)
      setActiveTab("preview")
    } catch (err) {
        //@ts-ignore
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedResume], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${formData.name.replace(/\s+/g, "_")}_Resume.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>AI Resume Builder</CardTitle>
        <CardDescription>Create a professional resume tailored for part-time job applications</CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">Information</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedResume}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="University name, degree, graduation year, GPA, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Work Experience</Label>
                <Textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Previous jobs, internships, volunteer work, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Technical skills, soft skills, certifications, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="English, Spanish, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Hobbies, interests, achievements, etc."
                />
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <Button onClick={handleSubmit} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Resume...
                </>
              ) : (
                "Generate Resume"
              )}
            </Button>
          </CardFooter>
        </TabsContent>

        <TabsContent value="preview">
          <CardContent>
            {generatedResume && (
              <div className="space-y-4">
                <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Your resume has been generated successfully!</AlertDescription>
                </Alert>

                <div className="border rounded-md p-4 whitespace-pre-wrap font-mono text-sm">{generatedResume}</div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setActiveTab("form")} variant="outline" className="w-full sm:w-auto">
              Edit Information
            </Button>

            <Button onClick={handleDownload} className="w-full sm:w-auto">
              Download Resume
            </Button>
          </CardFooter>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
