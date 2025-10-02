
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HistoryPage() {
  const [history, setHistory] = useState<any>({ payments: [], unpaidWins: [] })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("https://auction-hyt6.onrender.com/api/payments/me", {
          credentials: "include",
        })
        const data = await res.json()
        setHistory(data)
      } catch (err) {
        console.error("Failed to load history:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  // 🔹 Pay now button
  const handlePayNow = (auctionId: string, amount: number) => {
    router.push(`/payment/${auctionId}`) // redirect to payment page
  }

  if (loading) return <p className="text-center mt-20">Loading history...</p>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Payment History</h1>

      {/* ✅ Paid Auctions */}
      <h2 className="text-lg font-semibold mb-2">Completed Payments</h2>
      {history.payments.length === 0 ? (
        <p className="text-gray-500 mb-6">No payments yet.</p>
      ) : (
        <ul className="space-y-3 mb-6">
          {history.payments.map((p: any) => (
            <li key={p._id} className="border rounded-lg p-3">
              <p className="font-semibold">{p.auction?.title}</p>
              <p className="text-sm text-gray-600">Method: {p.paymentMethod}</p>
              <p className="text-sm text-gray-600">Amount: ${p.amount}</p>
              <p className="text-sm text-green-600">✅ Paid</p>
            </li>
          ))}
        </ul>
      )}

      {/* ❌ Unpaid Wins */}
      <h2 className="text-lg font-semibold mb-2">Unpaid Wins</h2>
      {history.unpaidWins.length === 0 ? (
        <p className="text-gray-500">No unpaid auctions 🎉</p>
      ) : (
        <ul className="space-y-3">
          {history.unpaidWins.map((a: any) => (
            <li key={a._id} className="border rounded-lg p-3">
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-gray-600">Final Price: ${a.finalPrice}</p>
              <Button
                onClick={() => handlePayNow(a._id, a.finalPrice)}
                className="mt-2 bg-green-600 text-white"
              >
                Pay Now
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
