
"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Navbar from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PaymentPage() {
  const { auctionId } = useParams()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("paypal")
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      const res = await fetch("https://auction-hyt6.onrender.com/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auctionId,
          paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Payment failed")

      alert("✅ Payment successful!")
      router.push("/orders") // Redirect to orders page after success
    } catch (err: any) {
      alert("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-16 px-4 pb-8 max-w-md mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Complete Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="paypal">PayPal</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
