'use client'
import { useState } from 'react'
import { CheckCircle, Users, MapPin, Mail, Phone, Briefcase } from 'lucide-react'

interface FormData {
  userType: string
  location: string
  country: string
  email: string
  mobile: string
  interests: string[]
}

const WaitlistForm = () => {
  const [formData, setFormData] = useState<FormData>({
    userType: '',
    location: '',
    country: '',
    email: '',
    mobile: '',
    interests: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const interestOptions = [
    'Retail',
    'Cafes/Restaurants',
    'Delivery',
    'Front Desk / Hospitality',
    'Cleaning / Housekeeping',
    'Other Odd Jobs',
    'Accommodation Only',
    'I want to hire workers',
  ]

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Thank you!</h2>
        <p className="text-gray-600">
          You're now on the early access list. We'll notify you with job matches,
          new features, and early launch rewards.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Join the ShiftLink Early Access List
        </h1>
        <p className="text-gray-600">
          Be the first to know when we launch and get exclusive benefits!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Users className="w-4 h-4 inline mr-2" />
            I am a:
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value="JOB_SEEKER"
                checked={formData.userType === 'JOB_SEEKER'}
                onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <span className="ml-2 text-sm text-gray-700">
                Job Seeker (looking for part-time/odd jobs)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="userType"
                value="EMPLOYER"
                checked={formData.userType === 'EMPLOYER'}
                onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                required
              />
              <span className="ml-2 text-sm text-gray-700">
                Employer / Business Owner (want to hire workers)
              </span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Location
          </label>
         <div className="flex flex-row items-center space-x-2 grid grid-cols-2">
           <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, Region"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />

          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            placeholder="Country"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
         </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Mobile (Optional)
          </label>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Interest Areas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Briefcase className="w-4 h-4 inline mr-2" />
            Interest Area (select all that apply):
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {interestOptions.map(interest => (
              <label key={interest} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={() => handleInterestChange(interest)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Get Early Access'}
        </button>
      </form>
    </div>
  )
}

export default WaitlistForm