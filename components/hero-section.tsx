import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import chef from "../public/chef.jpeg"
import coffeeshop from "../public/coffeeshop.jpeg"
import supermarket from "../public/supermarket.jpeg"

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-dark text-white mix-h-screen grid grid-cols-1 lg:grid-cols-2 gap-4  items-center justify-between px-8 md:px-32 py-2 pb-4">
      <div className="z-10 max-w-2xl space-y-6">
        <h1 className="text-5xl font-bold leading-tight">
          Chasing dreams abroad?<br />
          Find your perfect <span className="text-lime-400 border-2 border-lime-400 px-6 bg-[#193538]">Gigs</span> <br />
          effortlessly.
        </h1>
        <p className="text-lg text-gray-300">
          ShiftLink connects international students with flexible part-time jobs that fit around your study schedule.
          Earn money, gain experience, and make the most of your time abroad.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <button className="bg-lime-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-lime-300">
            <Link href="/register/student">Sign Up as Student</Link>
          </button>
          <Button variant="secondary" className="px-6 py-6 rounded-full font-semibold hover:bg-lime-300">
            <Link href="/register/employer">Sign Up as Employer</Link>
          </Button>
        </div>

      </div>
      <div className="z-10 flex flex-col gap-6 lg:ml-20">
        <div className="flex gap-6 justify-center">
          <Image
            src={chef}
            alt="Chart 1"
            className="rounded-3xl shadow-lg w-60 h-80 object-cover"
          />
          <Image
            src={coffeeshop}
            alt="Chart 2"
            className="rounded-3xl shadow-lg w-60 h-80 object-cover"
          />
        </div>
        <div className="w-full flex justify-center">
          <Image
            src={supermarket}
            alt="Chart 3"
            className="rounded-3xl shadow-lg w-full max-w-3xl h-64 object-cover"
          />
        </div>
      </div>

    </section>
  )
}
