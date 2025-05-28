import React from 'react'
import AdminReviewsPage from './reviews/page'
import AdminDashboard from './dashboard/page'
import AdminAnalyticsPage from './analytics/page'
import AdminEmployersPage from './employers/page'

export default function page() {
  return (
    <div>
        {/* <AdminEmployersPage/> */}
        {/* <AdminAnalyticsPage/> */}
        <AdminDashboard/>
      {/* <AdminReviewsPage/> */}
    </div>
  )
}
