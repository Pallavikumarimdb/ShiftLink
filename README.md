# ShiftLink - Student Job Platform

ShiftLink is a comprehensive platform connecting students with part-time job opportunities. This application includes features for students, employers, and administrators, with internationalization support.

## Features

- **For Students**:
  - Browse and search for jobs
  - Apply to jobs
  - Track application status
  - Complete job reviews
  - Profile management

- **For Employers**:
  - Post job listings
  - Review applications
  - Verify business credentials
  - Rate student performance
  - Premium job listings

- **For Administrators**:
  - Review flagged employers
  - Approve verification requests
  - View analytics dashboard
  - Manage platform content

- **General Features**:
  - Internationalization English language support
  - Country-specific job listings
  - User authentication
  - Responsive design

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Internationalization**: next-intl

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/shiftlink.git
   cd shiftlink
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   Edit `.env.local` with your database connection string and other required variables.

4. Set up the database:
   \`\`\`bash
   npx prisma migrate dev
   npx prisma db seed
   \`\`\`

5. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`


## License

This project is licensed under the MIT License - see the LICENSE file for details.
