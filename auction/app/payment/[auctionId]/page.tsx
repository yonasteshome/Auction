"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function PaymentPage() {
  const [auction, setAuction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const router = useRouter()
  const params = useParams() // Next.js app router

  // 🔹 Load auction details from backend
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const res = await fetch(`https://auction-hyt6.onrender.com/api/auctions/${params.auctionId}`, {
          credentials: "include",
        })
        const data = await res.json()
        setAuction(data)
      } catch (err) {
        console.error("Failed to load auction:", err)
      } finally {
        setFetching(false)
      }
    }

    if (params?.auctionId) {
      fetchAuction()
    }
  }, [params.auctionId])

  // 🔹 Handle payment
  const handlePayment = async (paymentMethod: string) => {
    if (!auction?._id) {
      alert("❌ Auction not loaded yet.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch("https://auction-hyt6.onrender.com/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auction: auction._id,
          amount: auction?.currentPrice || auction?.finalPrice || 0,
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
      router.push("/profile")
    } catch (err: any) {
      console.error("Payment request error:", err)
      alert("❌ Payment request failed")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <p className="text-center mt-20">Loading auction details...</p>
  }

  if (!auction) {
    return <p className="text-center mt-20 text-red-500">Auction not found</p>
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
