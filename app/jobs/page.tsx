"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Search, Briefcase, Calendar } from "lucide-react"
import { FaSearch, FaBriefcase } from "react-icons/fa";
import Warehouse from "@/public/Warehouse.jpeg"
import Image from "next/image"

interface Job {
  id: string
  title: string
  employerName: string
  hourlyRate: number
  location: string
  description: string
  hoursPerWeek: number
  shiftTimes: string
}

interface Filters {
  location: string
  minWage: number
  maxHours: number
  search: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filters, setFilters] = useState<Filters>({
    location: "",
    minWage: 10,
    maxHours: 30,
    search: "",
  })

  useEffect(() => {
    const fetchJobs = async () => {
      const params = new URLSearchParams()
      if (filters.location) params.append("location", filters.location)
      if (filters.minWage) params.append("minWage", filters.minWage.toString())
      if (filters.maxHours) params.append("maxHours", filters.maxHours.toString())
      if (filters.search) params.append("search", filters.search)

      const res = await fetch(`/api/jobs?${params.toString()}`)
      if (res.ok) {
        const data: Job[] = await res.json()
        setJobs(data)
      } else {
        setJobs([])
      }
    }
    fetchJobs()
  }, [filters])

  const handleFilterChange = (name: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className=" bg-[#d8e6e6] grid-bg-1">
      <div className="bg-[#d8e6e6] w-full flex items-center justify-center px-8 md:px-32">
        <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl gap-10 mt-20">
          <div className="flex flex-col gap-6 max-w-xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Finding The Job <br />
              <span className="text-gray-800">Beyond Borders</span>
            </h1>
            <p className="text-gray-600 text-lg">
              A job portal provides a platform for employers to post job vacancies & for job seekers to browse and apply for available positions.
            </p>
          </div>
          <div className="relative w-full flex justify-center items-center">
            <Image
              src={Warehouse}
              alt="hero"
              className="w-full max-w-2xl rounded-lg object-cover z-10"
            />
            <div className="absolute -top-10 -left-16 bg-white rounded-xl shadow-lg p-4 z-20">
              <p className="text-gray-900 font-bold text-lg">
                20k+ <FaBriefcase className="inline ml-1 text-gray-600" />
              </p>
              <div className="w-full h-16 flex items-end gap-1 mt-1">
                {[30, 50, 40, 60, 35, 55].map((h, idx) => (
                  <div
                    key={idx}
                    style={{ height: `${h}px` }}
                    className="w-2 bg-green-600 rounded-sm"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">People got hired</p>
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <div className="mt-20 px-8 md:px-32">
          <Card className="mb-8 !rounded-2xl !bg-[#d8e6e6] text-black">
            <CardHeader>
              <CardTitle>Filter Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Job title or keyword"
                      className="pl-8 bg-slate-800"
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City or area"
                      className="pl-8 bg-slate-800"
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <Label htmlFor="minWage">Minimum Hourly Rate: ${filters.minWage}</Label>
                  <Slider
                    id="minWage"
                    min={8}
                    max={30}
                    step={1}
                    value={[filters.minWage]}
                    onValueChange={(value) => handleFilterChange("minWage", value[0])}
                  />
                </div>

                <div className="space-y-6">
                  <Label htmlFor="maxHours">Maximum Hours/Week: {filters.maxHours}</Label>
                  <Slider
                    id="maxHours"
                    min={5}
                    max={40}
                    step={5}
                    value={[filters.maxHours]}
                    onValueChange={(value) => handleFilterChange("maxHours", value[0])}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="px-8 md:px-32 pb-20">
          <div className="">
            <p className="text-sm text-muted-foreground">
              {jobs.length} job{jobs.length > 1 ? "s" : ""} found
            </p>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Card key={job.id} className="overflow-hidden !bg-[#d4e2e3] text-black mt-4">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.title}</CardTitle>
                        <p className="text-muted-foreground">{job.employerName}</p>
                      </div>
                      <Badge variant="destructive" className="ml-2">
                        {formatCurrency(job.hourlyRate)}/hr
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="space-y-3">
                      <div className="flex flex-col md:flex-row gap-2 justify-between mb-6">
                        <div className="flex items-center text-sm">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.hoursPerWeek} hours/week</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{job.shiftTimes}</span>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2 mt-2">{job.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild className="w-auto !bg-lime-600">
                      <Link href={`/jobs/${job.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
                <p className="mt-2 text-muted-foreground">Try adjusting your filters to find more opportunities.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
