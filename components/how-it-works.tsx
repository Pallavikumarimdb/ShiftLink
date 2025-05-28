import { UserPlus, Search, Send, MessageSquare, Calendar, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and fill in your details, skills, and availability",
  },
  {
    icon: Search,
    title: "Browse Jobs",
    description: "Explore jobs that match your skills and schedule",
  },
  {
    icon: Send,
    title: "Apply Quickly",
    description: "One-click applications to jobs you're interested in",
  },
  {
    icon: MessageSquare,
    title: "Get Contacted",
    description: "Employers review your profile and reach out",
  },
  {
    icon: Calendar,
    title: "Schedule Interview",
    description: "Arrange a time to meet or talk with the employer",
  },
  {
    icon: CheckCircle,
    title: "Start Working",
    description: "Begin your new job and start earning",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 px-8 md:px-32">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How ShiftLink Works</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Finding a part-time job has never been easier</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <step.icon className="h-8 w-8 text-lime-400" />
              </div>
              <div className="absolute top-0 -right-4 h-8 w-8 rounded-full bg-lime-400 flex items-center justify-center text-primary-foreground font-medium">
                {index + 1}
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
