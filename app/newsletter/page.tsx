import Head from 'next/head'
import WaitlistForm from './WaitlistForm'

export default function Home() {
  return (
    <>
      <Head>
        <title>ShiftLink - Join Early Access</title>
        <meta name="description" content="Join ShiftLink early access for part-time jobs and hiring opportunities" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <WaitlistForm />
      </main>
    </>
  )
}