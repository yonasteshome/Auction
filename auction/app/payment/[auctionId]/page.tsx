"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentPage({ auction }: { auction: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async (paymentMethod: string) => {
    try {
      setLoading(true)

      const res = await fetch("https://auction-hyt6.onrender.com/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // keep cookies/session
        body: JSON.stringify({
          auction: auction?._id, // backend expects "auction"
          amount: auction?.currentPrice || auction?.finalPrice || 0, // amount required
          paymentMethod,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error("Payment error:", data)
        alert(`❌ Payment failed: ${data.message || "Unknown error"}`)
        return
      }

      alert("✅ Payment successful!")
      router.push("/profile") // redirect after success
    } catch (err: any) {
      console.error("Payment request error:", err)
      alert("❌ Payment request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Complete Your Payment</h1>
      <p className="mb-6 text-lg">
        Auction: <span className="font-semibold">{auction?.title}</span>
        <br />
        Amount: <span className="font-semibold">${auction?.currentPrice || auction?.finalPrice}</span>
      </p>

      <div className="flex gap-4">
        <Button onClick={() => handlePayment("paypal")} disabled={loading}>
          Pay with PayPal
        </Button>
        <Button onClick={() => handlePayment("credit-card")} disabled={loading}>
          Pay with Card
        </Button>
      </div>
    </div>
  )
}
