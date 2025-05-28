import {  Earth, HandCoins, CalendarCheck } from "lucide-react"

const features = [
  {
    icon: Earth,
    title: "International Friendly",
    description: "We specialize in job listings that are suitable for international students.All opportunities comply with visa regulations and work hour limitations.You can find roles that align with your academic schedule and goals.",
  },
  {
    icon: HandCoins,
    title: "Diverse Opportunities",
    description: "Explore a wide range of part-time jobs across industries like retail, hospitality, tutoring, and more. Whether you're looking to gain experience or earn extra income, there's something for you. We match roles to your skills and preferences.",
  },
  {
    icon: CalendarCheck,
    title: "Quick Application",
    description: "Our streamlined application process gets you in front of employers fast. No complicated steps—just a few clicks and you're ready to go. Spend less time applying and more time working.",
  },
]

export default function Features() {
  return (
  <section className="py-16 md:py-24 px-8 md:px-32 bg-[#f6f8f3] grid-bg-1">
  <div className="text-center mb-16">
    <h2 className="text-4xl font-bold mb-4 text-[#1c1c1c]">Why Choose ShiftLink?</h2>
    <p className="text-lg text-[#1c1c1c] max-w-2xl mx-auto">
      We understand the unique challenges international students face when looking for part-time work
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {features.map((feature, index) => (
      <div key={index} className="bg-white rounded-3xl shadow-md p-10 text-left min-h-[350px] transition hover:shadow-xl">
        <div className="h-20 w-20 flex items-center justify-center mb-6">
          <feature.icon className="h-16 w-16 text-[#031d1c]" />
        </div>
        <h3 className="text-xl font-bold text-[#1c1c1c] mb-3 leading-snug">
          {feature.title}
        </h3>
        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
      </div>
    ))}
  </div>
</section>

  )
}
