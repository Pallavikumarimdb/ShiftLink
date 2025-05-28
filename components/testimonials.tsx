import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StarIcon } from "lucide-react"

const testimonials = [
  {
    name: "Maria S.",
    role: "International Student, University of Toronto",
    content:
      "ShiftLink helped me find a part-time job at a local café that works perfectly with my class schedule. The application process was so simple!",
    avatar: "MS",
  },
  {
    name: "Ahmed K.",
    role: "MBA Student, London Business School",
    content:
      "As an international student, finding work was challenging until I discovered ShiftLink. Now I have a weekend retail job that helps with my expenses.",
    avatar: "AK",
  },
  {
    name: "Sarah Chen",
    role: "Computer Science Student, NYU",
    content:
      "I found a great tutoring opportunity through ShiftLink that not only pays well but also gives me relevant experience in my field of study.",
    avatar: "SC",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Student Success Stories</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hear from international students who found great part-time jobs through ShiftLink
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="border bg-[#f6f8f3] grid">
            <CardContent className="pt-10">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className="h-4 w-4 fill-[#fd0b08] text-[#fd0b08]" />
                ))}
              </div>
              <p className="mb-6 text-[#031d1c]">"{testimonial.content}"</p>
              <div className="flex items-center gap-4">
                <Avatar className="bg-[#031d1c]">
                  <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-[#031d1c]">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
