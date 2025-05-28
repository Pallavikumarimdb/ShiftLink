import React from 'react'

export default function pricing() {
  return (
     <div className="min-h-screen text-white px-6 py-20 grid">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Choose the Right Plan for Your Business
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-16">
          Simple, transparent pricing that grows with you.
        </p>

        <div className="grid gap-16 md:grid-cols-3">
          <div className="bg-[#143d2b] rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Starter</h2>
            <p className="text-4xl font-bold mb-2">$0</p>
            <p className="text-gray-300 mb-6">Great for individuals just getting started.</p>
            <ul className="text-left text-sm space-y-3 mb-8">
              <li>✔️ 1 User</li>
              <li>✔️ Basic CRM Features</li>
              <li>✔️ Email Support</li>
            </ul>
            <button className="bg-white text-green-700 font-semibold px-6 py-2 rounded-full">
              Get Started
            </button>
          </div>

          <div className="bg-lime-500 text-green-900 rounded-3xl p-8 shadow-2xl scale-105 transform flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">Pro</h2>
            <p className="text-4xl font-bold mb-2">$29</p>
            <p className="text-green-900 mb-6">Perfect for growing teams and businesses.</p>
            <ul className="text-left text-sm text-green-900 space-y-3 mb-8">
              <li>✔️ 5 Users</li>
              <li>✔️ Advanced CRM Tools</li>
              <li>✔️ Priority Support</li>
              <li>✔️ Analytics Dashboard</li>
            </ul>
            <button className="bg-white text-green-700 font-semibold px-6 py-2 rounded-full">
              Start Free Trial
            </button>
          </div>

          <div className="bg-[#143d2b] rounded-3xl p-8 shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4">Enterprise</h2>
            <p className="text-4xl font-bold mb-2">Custom</p>
            <p className="text-gray-300 mb-6">Tailored solutions for large teams.</p>
            <ul className="text-left text-sm space-y-3 mb-8">
              <li>✔️ Unlimited Users</li>
              <li>✔️ Full CRM Suite</li>
              <li>✔️ Dedicated Support Manager</li>
              <li>✔️ Custom Integrations</li>
            </ul>
            <button className="border border-white px-6 py-2 rounded-full font-semibold">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
