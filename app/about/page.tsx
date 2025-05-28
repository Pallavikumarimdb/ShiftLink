import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import img1 from "@/public/food.jpeg"
import img2 from "@/public/shop.jpeg"
import img3 from "@/public/craft.jpeg"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#FF0A0A]">About ShiftLink</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connecting international students with flexible part-time jobs that fit around their studies
        </p>
      </section>

      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg mb-4">
              At ShiftLink, we understand the unique challenges international students face when looking for part-time
              work while studying abroad. Our mission is to bridge the gap between talented international students and
              local businesses looking for flexible, motivated employees.
            </p>
            <p className="text-lg mb-4">
              We believe that international students bring valuable skills, perspectives, and work ethic to the
              workplace. By connecting them with quality employment opportunities, we help students gain valuable work
              experience, improve their language skills, and support themselves financially during their studies.
            </p>
            <p className="text-lg">
              For employers, we provide access to a diverse pool of talented, motivated individuals who can bring fresh
              perspectives to their businesses while filling crucial part-time roles.
            </p>
          </div>
          <div className="z-10 flex flex-col gap-6">
        <div className="flex gap-6 justify-center">
          <Image
            src={img1}
            alt="Chart 1"
            className="rounded-3xl shadow-lg w-60 h-80 object-cover"
          />
          <Image
            src={img2}
            alt="Chart 2"
            className="rounded-3xl shadow-lg w-60 h-80 object-cover"
          />
        </div>
        <div className="w-full flex justify-center">
          <Image
            src={img3}
            alt="Chart 3"
            className="rounded-3xl shadow-lg w-full max-w-3xl h-64 object-cover"
          />
        </div>
      </div>
        </div>
      </section>

  
      <section className="py-12">
        <h2 className="text-3xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-lime-400"
                  >
                    <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7 6 13 6 13s6-6 6-13Z" />
                    <circle cx="12" cy="8" r="2" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Accessibility</h3>
                <p className="text-muted-foreground">
                  We believe everyone deserves equal access to opportunities, regardless of background or nationality.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-lime-400"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m7 10 2 2 6-6" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Quality</h3>
                <p className="text-muted-foreground">
                  We're committed to providing high-quality job opportunities and excellent service to both students and
                  employers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-lime-400"
                  >
                    <path d="M12 22v-5" />
                    <path d="M9 8V2" />
                    <path d="M15 8V2" />
                    <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Community</h3>
                <p className="text-muted-foreground">
                  We foster a supportive community that helps international students thrive in their new environments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/10 rounded-lg px-8 my-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Join the ShiftLink Community</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Whether you're an international student looking for work or an employer seeking talented staff, ShiftLink is
          here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register/student">Sign Up as Student</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register/employer">Sign Up as Employer</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
