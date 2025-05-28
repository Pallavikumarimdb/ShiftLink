"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PremiumSubscription() {
  const { user, upgradeToPremium } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleUpgrade = async () => {
    setIsProcessing(true)
    setError("")

    try {
      // Simulate payment processing for now later implement real payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update user status
      const result = upgradeToPremium()

      if (result) {
        setSuccess(true)
      } else {
        setError("Failed to upgrade. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during payment processing.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (user?.isPremium) {
    return (
      <Card className="border-2 border-green-500 dark:border-green-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Premium Student</CardTitle>
            <Badge className="bg-green-500 text-white">Active</Badge>
          </div>
          <CardDescription>You have access to all premium features</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>View employer contact information</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Priority application status</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Early access to new job postings</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Resume review service</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upgrade to Premium</CardTitle>
          <CardDescription>Get access to exclusive features and benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>View employer contact information</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Priority application status</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Early access to new job postings</span>
            </li>
            <li className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Resume review service</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
            Upgrade Now
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{success ? "Upgrade Successful!" : "Upgrade to Premium"}</DialogTitle>
            <DialogDescription>
              {success
                ? "Thank you for upgrading. You now have access to all premium features."
                : "Complete your payment to unlock premium features."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <div className="py-4">
              <div className="mb-6 p-4 border rounded-md">
                <p className="font-medium mb-1">Payment Summary</p>
                <div className="flex justify-between">
                  <span>Premium Subscription (Monthly)</span>
                  <span>$9.99</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">$9.99</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                For demo purposes, clicking "Complete Payment" will simulate a successful payment.
              </p>
            </div>
          )}

          <DialogFooter>
            {success ? (
              <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
                  Cancel
                </Button>
                <Button onClick={handleUpgrade} disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Complete Payment"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
