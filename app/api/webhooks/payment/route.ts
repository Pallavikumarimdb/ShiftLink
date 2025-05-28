import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// This is a mock payment webhook handler
// In production, Will integrate with a payment provider like Stripe
export async function POST(req: Request) {
  try {
    // Verify webhook signature (in production)
    // const signature = req.headers.get("stripe-signature")

    const body = await req.json()
    const { event, data } = body

    // Handle different payment events
    switch (event) {
      case "payment.succeeded":
        // Process successful payment
        if (data.type === "premium_job") {
          // Update job to premium
          await prisma.job.update({
            where: {
              id: data.jobId,
            },
            data: {
              isPremium: true,
            },
          })
        } else if (data.type === "subscription") {
          // Create or update subscription
          const existingSubscription = await prisma.subscription.findFirst({
            where: {
              userId: data.userId,
            },
          })

          if (existingSubscription) {
            // Update existing subscription
            await prisma.subscription.update({
              where: {
                id: existingSubscription.id,
              },
              data: {
                plan: data.plan,
                startDate: new Date(),
                endDate: new Date(data.endDate),
                isActive: true,
                paymentId: data.paymentId,
                paymentMethod: data.paymentMethod,
              },
            })
          } else {
            // Create new subscription
            await prisma.subscription.create({
              data: {
                userId: data.userId,
                plan: data.plan,
                startDate: new Date(),
                endDate: new Date(data.endDate),
                isActive: true,
                paymentId: data.paymentId,
                paymentMethod: data.paymentMethod,
              },
            })
          }
        }
        break

      case "payment.failed":
        // Handle failed payment
        if (data.type === "subscription") {
          // Update subscription status
          const subscription = await prisma.subscription.findFirst({
            where: {
              userId: data.userId,
              paymentId: data.paymentId,
            },
          })

          if (subscription) {
            await prisma.subscription.update({
              where: {
                id: subscription.id,
              },
              data: {
                isActive: false,
              },
            })
          }
        }
        break

      case "subscription.canceled":
        // Handle subscription cancellation
        await prisma.subscription.updateMany({
          where: {
            userId: data.userId,
            paymentId: data.paymentId,
          },
          data: {
            isActive: false,
          },
        })
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing payment webhook:", error)
    return NextResponse.json({ error: "An error occurred while processing the payment webhook" }, { status: 500 })
  }
}
