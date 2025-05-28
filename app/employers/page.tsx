import Link from "next/link"
import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Users, Clock, Globe, Search } from "lucide-react"
import backgroundArc from "@/public/home.png"


export default function EmployersPage() {
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative min-h-screen flex justify-center px-4">
        <Image
          src={backgroundArc}
          alt="Background Design"
          className="absolute inset-0 w-full h-full  opacity-30 pointer-events-none top-20"
          priority
        />
        <div className="relative z-10 max-w-5xl text-center mt-20">
          <h1 className="text-6xl font-bold text-slate-200 leading-tight mb-4">
            Easily Post Jobs and <span className="text-[#FF0A0A] border-2 border-[#FF0A0A] px-4 ">Hire</span><br />
             Workers for Your Business
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            ShiftLink connects your business with motivated international students looking for part-time work. Post
              jobs, review applications, and find the perfect match for your needs.
          </p>

          <div className="flex justify-center gap-4">
            <button className="bg-[#FF0A0A] hover:bg-[#e5404a] border border-lime-400 text-white font-semibold py-2 px-6 rounded-full shadow-md transition">
              Get Started Now
            </button>
            <button className="border border-[#FF0A0A] text-slate-800 bg-lime-400 hover:bg-[#f64f5910] font-semibold py-2 px-6 rounded-full shadow-md transition">
              Learn More
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
        </div>
      </section>
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Hire International Students?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            International students bring unique perspectives, skills, and dedication to your workplace
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="overflow-hidden !bg-[#d4e2e3] text-black !border-[#FF0A0A] ">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#031d1d] flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-lime-400" />
              </div>
              <CardTitle>Cultural Diversity</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                International students bring diverse perspectives and language skills that can help your business
                connect with a broader customer base.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden !bg-[#d4e2e3] text-black !border-[#FF0A0A] ">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#031d1d] flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-lime-400" />
              </div>
              <CardTitle>Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Students often have flexible schedules that can fill gaps in your staffing needs, especially during
                evenings, weekends, and holidays.
              </p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden !bg-[#d4e2e3] text-black !border-[#FF0A0A] ">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-[#031d1d] flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-lime-400" />
              </div>
              <CardTitle>Motivated Workers</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                International students are typically highly motivated, eager to gain experience, and committed to making
                a positive impression in a new country.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30 rounded-lg px-6 my-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How ShiftLink Works for Employers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple process to find the perfect student for your job opening
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-[#031d1d] flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-lime-400" />
              </div>
              <div className="absolute top-0 -right-4 h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center text-primary-foreground font-medium">
                1
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">Post a Job</h3>
            <p className="text-muted-foreground">
              Create a detailed job listing with requirements, hours, and compensation
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-[#031d1d] flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-lime-400" />
              </div>
              <div className="absolute top-0 -right-4 h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center text-primary-foreground font-medium">
                2
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">Review Applicants</h3>
            <p className="text-muted-foreground">Browse student profiles and applications that match your needs</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-[#031d1d] flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-lime-400" />
              </div>
              <div className="absolute top-0 -right-4 h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center text-primary-foreground font-medium">
                3
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">Hire & Onboard</h3>
            <p className="text-muted-foreground">Select the best candidate and bring them onto your team</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Find the perfect plan for your hiring needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border border-slate-500 !bg-[#092733]/10">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                Free
                <span className="ml-1 text-lg font-medium text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>1 active job posting</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic applicant tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full ">
                <Link href="/register/employer">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-[#FF0A0A] relative !bg-[#133A29]">
            <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-[#FF0A0A] text-primary-foreground text-sm font-medium rounded-full">
              Popular
            </div>
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                $49
                <span className="ml-1 text-lg font-medium text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>5 active job postings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced applicant tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Featured job listings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full !bg-[#FF0A0A]">
                <Link href="/register/employer">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border border-slate-500 !bg-[#092733]/10">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <div className="mt-4 flex items-baseline text-5xl font-bold">
                $99
                <span className="ml-1 text-lg font-medium text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited job postings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Premium applicant tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Featured job listings</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>API access</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/register/employer">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10 rounded-lg px-8 my-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Student Employee?</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of businesses that have found reliable, motivated student workers through ShiftLink
        </p>
        <Button asChild size="lg">
          <Link href="/register/employer">Create Your Employer Account</Link>
        </Button>
      </section>
    </div>
  )
}
